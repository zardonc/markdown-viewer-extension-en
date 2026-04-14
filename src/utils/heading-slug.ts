/**
 * Heading slug utilities for anchor/fragment navigation.
 *
 * Uses GithubSlugger to match the same slug algorithm used by
 * rehype-slug-shared for rendering heading IDs.
 */
import GithubSlugger from 'github-slugger';

/**
 * Find the 0-based line number of a heading whose slug matches the given fragment.
 * Walks all headings in order with GithubSlugger so duplicate headings
 * (e.g., second "Test" → "test-1") are handled correctly.
 *
 * @param markdown - Raw markdown source text
 * @param fragment - URL fragment (already decoded, e.g., "业务流程图" or "test-1")
 * @returns 0-based line number, or undefined if not found
 */
export function findHeadingLine(markdown: string, fragment: string): number | undefined {
  const slugger = new GithubSlugger();
  const lines = markdown.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(/^#{1,6}\s+(.+)$/);
    if (match) {
      const slug = slugger.slug(match[1].trim());
      if (slug === fragment) {
        return i;
      }
    }
  }
  return undefined;
}
