/**
 * Theme entry: slidev-theme-geist
 *
 * Exports layout overrides + imports theme CSS.
 * Loaded dynamically by the shell based on frontmatter `theme` field.
 */
import type { Component } from 'vue'

// Theme styles as inline string
import css from './css/geist.css?inline'

// Theme layout overrides
import Cover from 'slidev-theme-geist/layouts/cover.vue'
import Split from 'slidev-theme-geist/layouts/split.vue'

export const layouts: Record<string, Component> = {
  cover: Cover,
  split: Split,
}

export { css }

export const fonts = {
  sans: 'Inter',
  mono: 'Menlo',
  local: 'Menlo',
}
