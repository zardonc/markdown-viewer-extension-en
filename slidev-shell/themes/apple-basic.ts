/**
 * Theme entry: @slidev/theme-apple-basic
 *
 * Exports layout overrides + imports theme CSS.
 * Loaded dynamically by the shell based on frontmatter `theme` field.
 */
import type { Component } from 'vue'

// Theme styles as inline string
import css from './css/apple-basic.css?inline'

// Theme layout overrides
import ThreeImages from '@slidev/theme-apple-basic/layouts/3-images.vue'
import Bullets from '@slidev/theme-apple-basic/layouts/bullets.vue'
import Fact from '@slidev/theme-apple-basic/layouts/fact.vue'
import ImageRight from '@slidev/theme-apple-basic/layouts/image-right.vue'
import IntroImageRight from '@slidev/theme-apple-basic/layouts/intro-image-right.vue'
import IntroImage from '@slidev/theme-apple-basic/layouts/intro-image.vue'
import Intro from '@slidev/theme-apple-basic/layouts/intro.vue'
import Quote from '@slidev/theme-apple-basic/layouts/quote.vue'
import Section from '@slidev/theme-apple-basic/layouts/section.vue'
import Statement from '@slidev/theme-apple-basic/layouts/statement.vue'

export const layouts: Record<string, Component> = {
  '3-images': ThreeImages,
  bullets: Bullets,
  fact: Fact,
  'image-right': ImageRight,
  'intro-image-right': IntroImageRight,
  'intro-image': IntroImage,
  intro: Intro,
  quote: Quote,
  section: Section,
  statement: Statement,
}

export { css }

export const fonts = {
  sans: 'Helvetica Neue',
  local: 'Helvetica Neue',
}
