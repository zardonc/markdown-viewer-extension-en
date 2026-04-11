/**
 * #slidev/styles shim
 *
 * Replicates the CSS import chain that the Slidev Vite plugin generates
 * for the `#slidev/styles` virtual module.
 *
 * Order matters — reset first, then base vars, core styles,
 * layout base, transitions, and finally UnoCSS utilities.
 */

// 1. UnoCSS reset (Tailwind v3 compatible)
import '@unocss/reset/tailwind.css'

// 2. Core client styles
import '@slidev/client/styles/vars.css'
import '@slidev/client/styles/index.css'
import '@slidev/client/styles/code.css'
import '@slidev/client/styles/transitions.css'

// 3. KaTeX math rendering styles
import 'katex/dist/katex.min.css'

// 3. Layout base (normally imported by the theme's styles/index.ts)
import '@slidev/client/styles/layouts-base.css'

// Note: UnoCSS utilities (`uno.css`) are imported in bootstrap.ts
