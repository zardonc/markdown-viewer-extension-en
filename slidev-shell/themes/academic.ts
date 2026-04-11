/**
 * Theme entry: slidev-theme-academic
 *
 * Exports layout overrides + imports theme CSS.
 * Loaded dynamically by the shell based on frontmatter `theme` field.
 */
import type { Component } from 'vue'

// Theme styles as inline string
import css from './css/academic.css?inline'

// Theme layout overrides
import Cover from 'slidev-theme-academic/layouts/cover.vue'
import Figure from 'slidev-theme-academic/layouts/figure.vue'
import FigureSide from 'slidev-theme-academic/layouts/figure-side.vue'
import Index from 'slidev-theme-academic/layouts/index.vue'
import Intro from 'slidev-theme-academic/layouts/intro.vue'
import TableOfContents from 'slidev-theme-academic/layouts/table-of-contents.vue'

export const layouts: Record<string, Component> = {
  cover: Cover,
  figure: Figure,
  'figure-side': FigureSide,
  index: Index,
  intro: Intro,
  'table-of-contents': TableOfContents,
}

export { css }

export const fonts = {
  sans: 'Montserrat',
  serif: 'Roboto Slab',
  mono: 'Roboto Mono',
}
