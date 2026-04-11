/**
 * Theme entry: slidev-theme-purplin
 *
 * Exports layout overrides + imports theme CSS.
 * Loaded dynamically by the shell based on frontmatter `theme` field.
 */
import type { Component } from 'vue'

// Theme styles as inline string
import css from './css/purplin.css?inline'

// Theme layout overrides
import Cover from 'slidev-theme-purplin/layouts/cover.vue'
import ImageX from 'slidev-theme-purplin/layouts/image-x.vue'
import Intro from 'slidev-theme-purplin/layouts/intro.vue'
import Quote from 'slidev-theme-purplin/layouts/quote.vue'

export const layouts: Record<string, Component> = {
  cover: Cover,
  'image-x': ImageX,
  intro: Intro,
  quote: Quote,
}

export { css }

export const fonts = {}
