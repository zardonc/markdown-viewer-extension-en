/**
 * #slidev/global-layers shim
 *
 * Exports no-op components for GlobalTop, GlobalBottom, SlideTop, SlideBottom.
 * These are used by SlideWrapper and SlidesShow to inject global overlays.
 */
import { defineComponent } from 'vue'

const Noop = defineComponent({ name: 'Noop', render: () => null })

export const GlobalTop    = Noop
export const GlobalBottom = Noop
export const SlideTop     = Noop
export const SlideBottom  = Noop
