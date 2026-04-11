<script setup lang="ts">
/**
 * Single slide renderer for list mode.
 * Mirrors PrintSlideClick.vue — provides Slidev context and renders
 * SlideWrapper at fixed slideWidth × slideHeight dimensions.
 */
import type { SlideRoute } from '@slidev/types'
import { computed, reactive, useTemplateRef } from 'vue'
import { provideLocal } from '@vueuse/core'
import { createFixedClicks } from '@slidev/client/composables/useClicks'
import { useFixedNav } from '@slidev/client/composables/useNav'
import { CLICKS_MAX, injectionSlidevContext, injectionSlideElement } from '@slidev/client/constants'
import { configs, slideWidth, slideHeight } from '@slidev/client/env'
import { getSlideClass } from '@slidev/client/utils'
import SlideWrapper from '@slidev/client/internals/SlideWrapper.vue'

const props = defineProps<{ route: SlideRoute }>()

const clicks = createFixedClicks(props.route, CLICKS_MAX)
const nav = useFixedNav(props.route, clicks)

provideLocal(injectionSlidevContext, reactive({
  nav,
  configs,
  themeConfigs: computed(() => configs.themeConfig),
}))
provideLocal(injectionSlideElement, useTemplateRef('slide-el'))

const style = computed(() => ({
  width: `${slideWidth.value}px`,
  height: `${slideHeight.value}px`,
}))
</script>

<template>
  <div ref="slide-el" class="list-slide bg-main" :style="style">
    <SlideWrapper
      :clicks-context="clicks"
      :class="getSlideClass(route, 'disable-view-transition')"
      :route="route"
      render-context="print"
    />
  </div>
</template>

<style scoped>
.list-slide {
  position: relative;
  overflow: hidden;
  transform-origin: top left;
}
</style>
