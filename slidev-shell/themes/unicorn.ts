/**
 * Theme entry: slidev-theme-unicorn
 *
 * Exports layout overrides + imports theme CSS.
 * Loaded dynamically by the shell based on frontmatter `theme` field.
 */
import type { Component } from 'vue'

// Theme styles as inline string
import css from './css/unicorn.css?inline'

// Theme layout overrides
import Center from 'slidev-theme-unicorn/layouts/center.vue'
import Cover from 'slidev-theme-unicorn/layouts/cover.vue'
import CoverLogos from 'slidev-theme-unicorn/layouts/cover-logos.vue'
import Default from 'slidev-theme-unicorn/layouts/default.vue'
import ImageCenter from 'slidev-theme-unicorn/layouts/image-center.vue'
import Intro from 'slidev-theme-unicorn/layouts/intro.vue'
import NewSection from 'slidev-theme-unicorn/layouts/new-section.vue'
import TableContents from 'slidev-theme-unicorn/layouts/table-contents.vue'

export const layouts: Record<string, Component> = {
  center: Center,
  cover: Cover,
  'cover-logos': CoverLogos,
  default: Default,
  'image-center': ImageCenter,
  intro: Intro,
  'new-section': NewSection,
  'table-contents': TableContents,
}

export { css }
