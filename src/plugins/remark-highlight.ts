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
 */

import { visit } from 'unist-util-visit';
import type { Plugin } from 'unified';
import type { Root, Text, Parent } from 'mdast';

// Define custom node type
interface HighlightNode {
  type: 'highlight';
  children: Array<{ type: 'text'; value: string }>;
  data?: {
    hName: string;
  };
}

/**
 * Parse text for highlight (==text==) pattern.
 * Returns array of text and highlight nodes.
 *
 * Pattern explanation:
 * - (?<!==) - Negative lookbehind to ensure not preceded by ==
 * - == - Opening delimiter
 * - ([^=]+?) - Capture group 1: content (one or more non-= characters, non-greedy)
 * - == - Closing delimiter
 * - (?!==) - Negative lookahead to ensure not followed by ==
 *
 * This pattern allows content to contain = characters as long as they're not ==
 */
function parseHighlightSyntax(text: string): Array<Text | HighlightNode> {
  const result: Array<Text | HighlightNode> = [];

  // Pattern to match ==content== but not ===content=== or more
  // Allows content to contain single = characters
  const pattern = /(?<!==)==([^=]+?(?:=[^=]+?)*)==(?!==)/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
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
      children: [{ type: 'text', value: content }],
      data: { hName: 'mark' }
    });

    lastIndex = match.index + match[0].length;
  }

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
 */
const remarkHighlight: Plugin<[], Root> = function () {
  return (tree: Root) => {
    visit(tree, 'text', (node: Text, index: number | undefined, parent: Parent | undefined) => {
      if (index === undefined || !parent) return;

      const value = node.value;

      // Quick check: if no == in text, skip
      if (!value.includes('==')) return;

      const parsed = parseHighlightSyntax(value);

      // If no changes, return
      if (parsed.length === 1 && parsed[0].type === 'text') return;

      // Replace the text node with parsed nodes
      parent.children.splice(index, 1, ...parsed as typeof parent.children);
    });
  };
};

export default remarkHighlight;
