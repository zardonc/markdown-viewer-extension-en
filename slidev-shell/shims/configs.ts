/**
 * #slidev/configs shim
 *
 * Provides the SlidevConfig object built from window.__SLIDEV__.configs
 * injected by the host extension. Uses lazy evaluation so the module
 * can be statically imported before data is injected.
 */
import type { SlidevConfig } from '@slidev/types'

function parseAspectRatio(val: unknown): number {
  if (typeof val === 'number' && isFinite(val)) return val
  if (typeof val === 'string') {
    // Handle "16/9" style fraction strings
    const parts = val.split('/')
    if (parts.length === 2) {
      const num = parseFloat(parts[0])
      const den = parseFloat(parts[1])
      if (isFinite(num) && isFinite(den) && den !== 0) return num / den
    }
    const num = parseFloat(val)
    if (isFinite(num)) return num
  }
  return 16 / 9
}

function buildConfigs() {
  const raw = (window as any).__SLIDEV__?.configs ?? {}
  return {
    // Core layout
    aspectRatio:   parseAspectRatio(raw.aspectRatio),
    canvasWidth:   raw.canvasWidth   ?? 980,
    slidesTitle:   raw.slidesTitle   ?? 'Slides',

    // Theme
    themeConfig:   raw.themeConfig   ?? {},
    colorSchema:   raw.colorSchema   ?? 'auto',
    htmlAttrs:     raw.htmlAttrs     ?? {},

    // Required fields with safe defaults
    title:          raw.slidesTitle ?? 'Slides',
    titleTemplate:  '%s - Slidev',
    theme:          'none',
    addons:         [],
    remote:         '',
    record:         'never',
    info:           false,
    selectable:     false,
    routerMode:     'hash',
    lineNumbers:    false,
    css:            'unocss',
    drawings: {
      enabled:      false,
      persist:      false,
      presenterOnly: false,
      syncAll:      true,
    },
    export: {
      format:       'pdf',
      timeout:      30000,
      dark:         false,
      withClicks:   false,
      withToc:      false,
    },
    fonts: {
      sans:         [],
      mono:         [],
      serif:        [],
      weights:      ['200', '400', '600'],
      italic:       false,
      provider:     'none',
      webfonts:     [],
      local:        [],
    },
    seoMeta: {},
    transition: raw.transition || undefined,
    favicon: '',
    plantUmlServer: '',
    monaco: 'dev',
    monacoTypesSource: 'cdn',
    monacoTypesAdditionalPackages: [],
    monacoRunAdditionalDeps: {},
    wakeLock: 'off',
    defaults: {},
  }
}

// No-cache proxy: always reads fresh from window.__SLIDEV__.configs.
// Must NOT cache because env.ts evaluates `configs.slidesTitle` at module
// load time (before SLIDEV_INIT injects data), which would poison a cache.
const configs = new Proxy({} as SlidevConfig & { slidesTitle: string }, {
  get(_target, prop, receiver) {
    return Reflect.get(buildConfigs(), prop, receiver)
  },
  ownKeys() {
    return Reflect.ownKeys(buildConfigs())
  },
  getOwnPropertyDescriptor(_target, prop) {
    return Object.getOwnPropertyDescriptor(buildConfigs(), prop)
  },
})

export default configs
