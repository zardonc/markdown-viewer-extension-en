/**
 * Vite plugin: resolve @apply directives in CSS ?inline imports.
 *
 * Problem: Vite's CSS pipeline resolves @import and wraps the result as
 * `export default "..."` in one step.  UnoCSS's transformerDirectives
 * only processes raw CSS files, not JS modules, so @apply in ?inline
 * CSS strings are never resolved.
 *
 * Solution: This plugin runs in the `post` phase, extracts the CSS
 * string from the JS module, uses UnoCSS's transformDirectives to
 * properly resolve @apply, then puts the processed CSS back.
 */
import type { Plugin } from 'vite'
import { createGenerator } from '@unocss/core'
import type { UnoGenerator } from '@unocss/core'
import MagicString from 'magic-string'
import unoConfig from './uno.config'

// transformDirectives is not exported from the public API, import from dist
// @ts-expect-error - internal module
import transformerDirectivesFn from '@unocss/transformer-directives'

export interface ResolveApplyOptions {
  /** Override theme fontFamily for @apply resolution */
  fontFamily?: Record<string, string>
}

export function resolveApplyPlugin(options?: ResolveApplyOptions): Plugin {
  let _uno: UnoGenerator | null = null

  async function getUno(): Promise<UnoGenerator> {
    if (!_uno) {
      const cfg = { ...unoConfig }
      if (options?.fontFamily) {
        cfg.theme = { ...cfg.theme, fontFamily: { ...(cfg.theme as any)?.fontFamily, ...options.fontFamily } }
      }
      _uno = await createGenerator(cfg)
    }
    return _uno
  }

  return {
    name: 'resolve-apply-inline',
    enforce: 'post',

    async transform(code, id) {
      // Only process CSS ?inline imports that contain @apply
      if (!id.includes('.css')) return
      if (!code.includes('@apply')) return
      if (!code.startsWith('export default "')) return

      // Extract CSS string from: export default "CSS_CONTENT"
      const cssMatch = code.match(/^export default "(.*)"$/s)
      if (!cssMatch) return

      // Unescape the JS string
      let css = cssMatch[1]
        .replace(/\\n/g, '\n')
        .replace(/\\t/g, '\t')
        .replace(/\\"/g, '"')
        .replace(/\\\\/g, '\\')

      if (!css.includes('@apply')) return

      // Use UnoCSS's transformDirectives to properly resolve @apply
      const uno = await getUno()
      const s = new MagicString(css)

      // Get the transformer instance and call its transform method
      const transformer = transformerDirectivesFn({ throwOnMissing: false })
      await transformer.transform(s, id, { uno, tokens: new Set() })

      const result = s.toString()

      // Re-escape and wrap as JS module
      const escaped = result
        .replace(/\\/g, '\\\\')
        .replace(/"/g, '\\"')
        .replace(/\n/g, '\\n')
        .replace(/\t/g, '\\t')

      return {
        code: `export default "${escaped}"`,
        map: null,
      }
    },
  }
}
