/**
 * Theme entry: @slidev/theme-default
 *
 * Exports layout overrides + imports theme CSS.
 * Loaded dynamically by the shell based on frontmatter `theme` field.
 */
import type { Component } from 'vue'

// Theme styles as inline string (injected on demand by theme-loader)
import css from './css/default.css?inline'

// Theme layout overrides
import Cover from '@slidev/theme-default/layouts/cover.vue'
import Fact from '@slidev/theme-default/layouts/fact.vue'
import Intro from '@slidev/theme-default/layouts/intro.vue'
import Quote from '@slidev/theme-default/layouts/quote.vue'
import Section from '@slidev/theme-default/layouts/section.vue'
import Statement from '@slidev/theme-default/layouts/statement.vue'

export const layouts: Record<string, Component> = {
  cover: Cover,
  fact: Fact,
  intro: Intro,
  quote: Quote,
  section: Section,
  statement: Statement,
}

export { css }

export const fonts = {
  mono: 'Fira Code',
  sans: 'Avenir Next,Nunito Sans',
  local: 'Avenir Next',
}
