/**
 * Slidev Shell list-mode bootstrap
 *
 * Mounts ListApp.vue instead of Slidev's App.vue.
 * All slides are rendered stacked vertically with theme styles applied.
 */

/// <reference types="@slidev/types/client" />

import { createApp } from 'vue'
import ListApp from './ListApp.vue'
import { createVClickDirectives } from '@slidev/client/modules/v-click'

import '#slidev/styles'
import 'uno.css'

export async function bootstrapList() {
  const app = createApp(ListApp)
  app.use(createVClickDirectives())
  app.mount('#app')
}
