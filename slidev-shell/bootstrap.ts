/**
 * Slidev Shell bootstrap
 *
 * Separated from main.ts so that all @slidev/client imports
 * (and the shims that read window.__SLIDEV__) are deferred
 * until after data is injected via postMessage.
 */

/// <reference types="@slidev/types/client" />

import { createApp } from 'vue'
import App from '@slidev/client/App.vue'
import setupMain from '@slidev/client/setup/main'

import 'uno.css'

export async function bootstrap() {
  const app = createApp(App)
  await setupMain(app)
  app.mount('#app')
}
