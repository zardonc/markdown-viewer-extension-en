/**
 * #slidev/slides shim
 *
 * Provides `slides: ShallowRef<SlideRoute[]>` built from window.__SLIDEV__ data
 * injected by the host extension before the shell loads.
 *
 * Must use shallowRef (matching the real Slidev virtual module) so that
 * setting route.meta.__preloaded does NOT reactively expand loadedRoutes
 * in SlidesShow.vue — otherwise all slides enter the TransitionGroup
 * immediately and subsequent page transitions lose their animation.
 */
import type { ClicksContext, SlideRoute } from '@slidev/types'
import type { Ref } from 'vue'
import { defineComponent, h, inject, onMounted, watchEffect, type Component } from 'vue'
import { shallowRef } from 'vue'
import { injectionClicksContext } from '@slidev/client/constants'

// Layout registry — all 21 built-in layouts imported directly.
// These components have zero virtual-module dependencies.
import Layout404      from '@slidev/client/layouts/404.vue'
import Center         from '@slidev/client/layouts/center.vue'
import Cover          from '@slidev/client/layouts/cover.vue'
import Default        from '@slidev/client/layouts/default.vue'
import End            from '@slidev/client/layouts/end.vue'
import ErrorLayout    from '@slidev/client/layouts/error.vue'
import Fact           from '@slidev/client/layouts/fact.vue'
import Full           from '@slidev/client/layouts/full.vue'
import IframeLeft     from '@slidev/client/layouts/iframe-left.vue'
import IframeRight    from '@slidev/client/layouts/iframe-right.vue'
import Iframe         from '@slidev/client/layouts/iframe.vue'
import ImageLeft      from '@slidev/client/layouts/image-left.vue'
import ImageRight     from '@slidev/client/layouts/image-right.vue'
import Image          from '@slidev/client/layouts/image.vue'
import Intro          from '@slidev/client/layouts/intro.vue'
import None           from '@slidev/client/layouts/none.vue'
import Quote          from '@slidev/client/layouts/quote.vue'
import Section        from '@slidev/client/layouts/section.vue'
import Statement      from '@slidev/client/layouts/statement.vue'
import TwoColsHeader  from '@slidev/client/layouts/two-cols-header.vue'
import TwoCols        from '@slidev/client/layouts/two-cols.vue'

const LAYOUTS: Record<string, Component> = {
  '404':             Layout404,
  center:            Center,
  cover:             Cover,
  default:           Default,
  end:               End,
  error:             ErrorLayout,
  fact:              Fact,
  full:              Full,
  'iframe-left':     IframeLeft,
  'iframe-right':    IframeRight,
  iframe:            Iframe,
  'image-left':      ImageLeft,
  'image-right':     ImageRight,
  image:             Image,
  intro:             Intro,
  none:              None,
  quote:             Quote,
  section:           Section,
  statement:         Statement,
  'two-cols-header': TwoColsHeader,
  'two-cols':        TwoCols,
  // Theme layout overrides are merged at runtime via mergeThemeLayouts()
}

/** Merge theme layouts into the registry (theme overrides built-in) */
export function mergeThemeLayouts(themeLayouts: Record<string, Component>) {
  Object.assign(LAYOUTS, themeLayouts)
}

/** Data shape injected by the host extension */
export interface SlidevShellSlide {
  no: number
  index: number
  frontmatter: Record<string, any>
  /** Pre-rendered HTML from the extension's remark/rehype pipeline */
  html: string
  /** Named slot HTML (e.g. { default: '...', right: '...' }) */
  slots?: Record<string, string>
  note?: string
  title?: string
  level?: number
  /** Total number of v-click steps on this slide */
  clicksTotal?: number
}

/** Create a Vue component that renders this slide inside its layout */
function createSlideComponent(slide: SlidevShellSlide): Component {
  const layoutName: string = slide.frontmatter?.layout || 'default'
  const Layout = LAYOUTS[layoutName] ?? LAYOUTS.default
  const slots = slide.slots || { default: slide.html }
  const hasClicks = (slide.clicksTotal ?? 0) > 0

  return defineComponent({
    name: `Slide${slide.no}`,
    setup() {
      // Wire up v-click animations if this slide has click steps
      if (hasClicks) {
        // injectionClicksContext provides Ref<ClicksContext>, must unwrap via .value
        const clicksCtxRef = inject(injectionClicksContext, undefined) as Ref<ClicksContext> | undefined
        onMounted(() => {
          if (!clicksCtxRef) return
          const container = document.querySelector(`[data-slidev-no="${slide.no}"]`)
          if (!container) return
          const clickEls = container.querySelectorAll('[data-v-click-at]')
          if (clickEls.length === 0) return
          watchEffect(() => {
            const ctx = clicksCtxRef.value
            if (!ctx) return
            const current = ctx.current
            clickEls.forEach((el: Element) => {
              const at = parseInt(el.getAttribute('data-v-click-at') || '0', 10)
              el.classList.toggle('slidev-vclick-hidden', current < at)
            })
          })
        })
      }

      return () => {
        const slotFns: Record<string, () => any> = {}
        for (const [name, html] of Object.entries(slots)) {
          if (html) {
            slotFns[name] = () =>
              h('div', {
                class: name === 'default' ? 'slidev-slot-default' : `slidev-slot-${name}`,
                innerHTML: html,
              })
          }
        }
        return h(Layout, null, slotFns)
      }
    },
  })
}

/** Build SlideRoute[] from injected window.__SLIDEV__.slides */
function buildSlideRoutes(): SlideRoute[] {
  const slidevData = (window as any).__SLIDEV__
  const rawSlides: SlidevShellSlide[] = slidevData?.slides ?? []

  // Merge theme layouts if available (set before bootstrap imports this module)
  if (slidevData?.themeLayouts) {
    mergeThemeLayouts(slidevData.themeLayouts)
  }

  return rawSlides.map((raw): SlideRoute => {
    const component = createSlideComponent(raw)

    const sourceInfo = {
      filepath: 'presentation.slide.md',
      index: raw.index,
      start: 0,
      contentStart: 0,
      end: 0,
      raw: raw.html,
      contentRaw: raw.html,
      frontmatter: raw.frontmatter,
      content: raw.html,
      revision: String(raw.no),
    }

    const slideInfo = {
      index: raw.index,
      frontmatter: raw.frontmatter,
      content: raw.html,
      title: raw.title,
      level: raw.level,
      note: raw.note,
      noteHTML: raw.note ?? '',
      revision: String(raw.no),
      source: sourceInfo,
    }

    return {
      no: raw.no,
      meta: {
        slide: slideInfo,
        __preloaded: false,
        // Per-slide transition from frontmatter
        transition: raw.frontmatter?.transition,
        // Total click steps — used by navigation to advance clicks before page change
        clicks: raw.clicksTotal || undefined,
      } as any,
      load: async () => ({ default: component }),
      component,
    }
  })
}

export const slides = shallowRef<SlideRoute[]>([])

/** Populate slides from window.__SLIDEV__ (called after data injection) */
export function initSlides() {
  slides.value = buildSlideRoutes()
}
