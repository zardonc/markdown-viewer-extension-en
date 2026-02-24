/**
 * Remark plugin to support highlight (==text==) syntax.
 * Compatible with unified 11 / remark-parse 11 / micromark architecture.
 *
 * Syntax:
 * - Highlight: ==text== → <mark>text</mark>
 *
 * Features:
 * - Supports nested content including math formulas: ==$x=1$== or ==$$x=1$$==
 * - Works seamlessly with remark-math plugin
 * - Generates semantic <mark> HTML elements
 *
 * Implementation:
 * This plugin runs AFTER remark-math, so it handles AST nodes that may already
 * contain inlineMath nodes. It looks for the pattern:
 *   text ending with "==" + [inlineMath or inlineLatex] + text starting with "=="
 * And converts them into a single highlight node containing the content.
 */

import { visit } from 'unist-util-visit';
import type { Plugin } from 'unified';
import type { Root, Text, Parent, Node } from 'mdast';

// Define custom node type
interface HighlightNode {
  type: 'highlight';
  children: Node[];
  data?: {
    hName: string;
  };
}

// Type guard for text nodes
function isTextNode(node: Node): node is Text {
  return node.type === 'text';
}

// Type guard for math nodes
function isMathNode(node: Node): boolean {
  return node.type === 'inlineMath' || node.type === 'inlineLatex';
}

/**
 * Check if text ends with highlight opener "=="
 */
function getHighlightOpener(text: string): { hasOpener: boolean; beforeOpener: string } {
  if (text.endsWith('==')) {
    return { hasOpener: true, beforeOpener: text.slice(0, -2) };
  }
  return { hasOpener: false, beforeOpener: text };
}

/**
 * Check if text starts with highlight closer "=="
 */
function getHighlightCloser(text: string): { hasCloser: boolean; afterCloser: string } {
  if (text.startsWith('==')) {
    return { hasCloser: true, afterCloser: text.slice(2) };
  }
  return { hasCloser: false, afterCloser: text };
}

/**
 * Check if text contains complete highlight pattern ==content==
 * Returns null if no pattern found, or array of nodes to replace
 */
function parseCompleteHighlightPattern(text: string): Array<Text | HighlightNode> | null {
  // Pattern to match ==content== but not ===content=== or more
  // Allows content to contain single = characters
  const pattern = /(?<!==)==([^=]+?(?:=[^=]+?)*)==(?!==)/g;

  const result: Array<Text | HighlightNode> = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let hasMatch = false;

  while ((match = pattern.exec(text)) !== null) {
    hasMatch = true;

    // Add text before match
    if (match.index > lastIndex) {
      result.push({
        type: 'text',
        value: text.slice(lastIndex, match.index)
      });
    }

    // Create highlight node
    const content = match[1];
    result.push({
      type: 'highlight',
      children: [{ type: 'text', value: content } as Text],
      data: { hName: 'mark' }
    });

    lastIndex = match.index + match[0].length;
  }

  if (!hasMatch) return null;

  // Add remaining text
  if (lastIndex < text.length) {
    result.push({
      type: 'text',
      value: text.slice(lastIndex)
    });
  }

  return result;
}

/**
 * Remark plugin to support highlight syntax.
 * Runs after remark-math to handle nested math formulas.
 */
const remarkHighlight: Plugin<[], Root> = function () {
  return (tree: Root) => {
    // First pass: handle complete highlight patterns in text nodes
    visit(tree, 'text', (node: Text, index: number | undefined, parent: Parent | undefined) => {
      if (index === undefined || !parent) return;

      const value = node.value;

      // Quick check: if no == in text, skip
      if (!value.includes('==')) return;

      // Check if this is a complete pattern (==...==)
      const parsed = parseCompleteHighlightPattern(value);
      if (!parsed) return;

      // Replace the text node with parsed nodes
      parent.children.splice(index, 1, ...parsed as typeof parent.children);
    });

    // Second pass: handle cross-node patterns for nested math
    // Look for: text ending with "==" + math node + text starting with "=="
    visit(tree, (node: Node) => {
      if (!('children' in node) || !Array.isArray(node.children)) return;

      const parent = node as Parent;
      const children = parent.children;

      // Scan for pattern: text with opener + math + text with closer
      for (let i = 0; i < children.length - 2; i++) {
        const firstNode = children[i];
        const middleNode = children[i + 1];
        const lastNode = children[i + 2];

        // Check if we have the pattern
        if (!isTextNode(firstNode) || !isTextNode(lastNode)) continue;
        if (!isMathNode(middleNode)) continue;

        const openerCheck = getHighlightOpener(firstNode.value);
        const closerCheck = getHighlightCloser(lastNode.value);

        if (!openerCheck.hasOpener || !closerCheck.hasCloser) continue;

        // We found a pattern: == + math + ==
        // Build the replacement nodes
        const newNodes: Node[] = [];

        // Text before opener (if any)
        if (openerCheck.beforeOpener) {
          newNodes.push({
            type: 'text',
            value: openerCheck.beforeOpener
          } as Text);
        }

        // Highlight node containing the math
        const highlightNode: HighlightNode = {
          type: 'highlight',
          children: [middleNode],
          data: { hName: 'mark' }
        };
        newNodes.push(highlightNode);

        // Text after closer (if any)
        if (closerCheck.afterCloser) {
          newNodes.push({
            type: 'text',
            value: closerCheck.afterCloser
          } as Text);
        }

        // Replace the three nodes
        children.splice(i, 3, ...(newNodes as typeof children));

        // Continue scanning from the current position
        i--;
      }
    });
  };
};

export default remarkHighlight;
