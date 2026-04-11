import extractorMdc from '@unocss/extractor-mdc'
import { variantMatcher } from '@unocss/preset-mini/utils'
import {
  defineConfig,
  presetAttributify,
  presetTypography,
  presetWind3,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss'

// Slide user content is injected at runtime via postMessage, so UnoCSS cannot
// scan it at build time.  We safelist commonly used Tailwind utilities here.
function generateSafelist(): string[] {
  const list: string[] = [
    '!opacity-0',
    'prose',
    'grid-rows-[1fr_max-content]',
    'grid-cols-[1fr_max-content]',
  ]

  // ── Positioning shortcuts (Slidev-specific) ──
  list.push('abs-tl', 'abs-tr', 'abs-bl', 'abs-br', 'abs-b')
  list.push('absolute', 'relative', 'fixed', 'sticky')

  // ── Spacing: m/p with common values ──
  const spacingValues = [0, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 16, 20, 24]
  for (const prefix of ['m', 'mx', 'my', 'mt', 'mb', 'ml', 'mr', 'p', 'px', 'py', 'pt', 'pb', 'pl', 'pr']) {
    for (const v of spacingValues) list.push(`${prefix}-${v}`)
  }
  list.push('m-auto', 'mx-auto', 'my-auto', 'ml-auto', 'mr-auto')

  // ── Gap ──
  for (const v of spacingValues) list.push(`gap-${v}`)

  // ── Width / Height ──
  list.push('w-full', 'h-full', 'w-auto', 'h-auto', 'w-screen', 'h-screen')
  for (const v of [0, 4, 5, 6, 8, 10, 12, 16, 20, 24, 32, 40, 48, 64]) {
    list.push(`w-${v}`, `h-${v}`)
  }

  // ── Typography ──
  for (const s of ['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl', '7xl']) {
    list.push(`text-${s}`)
  }
  list.push('font-bold', 'font-semibold', 'font-medium', 'font-light', 'font-mono', 'font-sans', 'font-serif')
  list.push('font-100', 'font-200', 'font-300', 'font-400', 'font-500', 'font-600', 'font-700', 'font-800', 'font-900')
  list.push('text-left', 'text-center', 'text-right', 'text-justify')
  list.push('uppercase', 'lowercase', 'capitalize', 'normal-case')
  list.push('underline', 'line-through', 'no-underline')
  list.push('italic', 'not-italic')
  list.push('tracking-tight', 'tracking-wide', 'tracking-wider', 'tracking-widest')
  list.push('leading-none', 'leading-tight', 'leading-snug', 'leading-normal', 'leading-relaxed', 'leading-loose')

  // ── Opacity ──
  for (let i = 0; i <= 100; i += 5) list.push(`opacity-${i}`)

  // ── Display / Flex / Grid ──
  list.push('block', 'inline-block', 'inline', 'hidden', 'contents')
  list.push('flex', 'inline-flex', 'flex-col', 'flex-row', 'flex-wrap', 'flex-nowrap', 'flex-1', 'flex-auto', 'flex-none')
  list.push('items-start', 'items-center', 'items-end', 'items-stretch', 'items-baseline')
  list.push('justify-start', 'justify-center', 'justify-end', 'justify-between', 'justify-around', 'justify-evenly')
  list.push('self-start', 'self-center', 'self-end', 'self-stretch')
  list.push('grid', 'inline-grid')
  for (let i = 1; i <= 12; i++) list.push(`grid-cols-${i}`)
  for (let i = 1; i <= 6; i++) list.push(`grid-rows-${i}`)

  // ── Border / Rounded ──
  list.push('border', 'border-0', 'border-2', 'border-4')
  list.push('border-t', 'border-b', 'border-l', 'border-r')
  list.push('rounded', 'rounded-sm', 'rounded-md', 'rounded-lg', 'rounded-xl', 'rounded-2xl', 'rounded-full', 'rounded-none')

  // ── Shadow ──
  list.push('shadow', 'shadow-sm', 'shadow-md', 'shadow-lg', 'shadow-xl', 'shadow-2xl', 'shadow-none')

  // ── Overflow ──
  list.push('overflow-hidden', 'overflow-auto', 'overflow-scroll', 'overflow-visible')

  // ── Colors (text / bg / border — common palette) ──
  const colors = ['white', 'black', 'transparent', 'current']
  const namedColors = ['gray', 'red', 'orange', 'amber', 'yellow', 'lime', 'green', 'emerald', 'teal', 'cyan', 'sky', 'blue', 'indigo', 'violet', 'purple', 'fuchsia', 'pink', 'rose']
  const shades = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900]
  for (const c of colors) {
    list.push(`text-${c}`, `bg-${c}`)
  }
  for (const c of namedColors) {
    for (const s of shades) {
      list.push(`text-${c}-${s}`, `bg-${c}-${s}`, `border-${c}-${s}`)
    }
  }

  // ── Inset (top/bottom/left/right) ──
  for (const v of [0, 1, 2, 4, 8]) {
    list.push(`top-${v}`, `bottom-${v}`, `left-${v}`, `right-${v}`)
    list.push(`inset-${v}`)
  }

  // ── Z-index ──
  for (const v of [0, 10, 20, 30, 40, 50]) list.push(`z-${v}`)

  // ── Object / Aspect ──
  list.push('object-cover', 'object-contain', 'object-fill', 'object-none')
  list.push('aspect-auto', 'aspect-square', 'aspect-video')

  // ── Transitions ──
  list.push('transition', 'transition-all', 'transition-colors', 'transition-opacity', 'transition-transform')
  list.push('duration-200', 'duration-300', 'duration-500')

  return list
}

// Replicate @slidev/client/uno.config.ts so all utility classes work correctly
export default defineConfig({
  content: {
    pipeline: {
      include: [
        /\.(vue|ts|tsx|css)($|\?)/,
        // Scan @slidev/client layouts + styles for UnoCSS utility classes
        /node_modules\/@slidev\/client\/layouts\/.*\.vue$/,
        /node_modules\/@slidev\/client\/styles\/.*\.css$/,
        // Theme packages are NOT scanned here — they are built separately
        // (see build-themes.ts) to avoid global CSS conflicts.
      ],
      exclude: [
        // Exclude theme entry files from main build scanning
        /slidev-shell\/themes\//,
      ],
    },
  },
  safelist: generateSafelist(),
  shortcuts: {
    'bg-main': 'bg-white dark:bg-[#121212]',
    'bg-active': 'bg-gray-400/10',
    'border-main': 'border-gray/20',
    'text-main': 'text-[#181818] dark:text-[#ddd]',
    'text-primary': 'color-$slidev-theme-primary',
    'bg-primary': 'bg-$slidev-theme-primary',
    'border-primary': 'border-$slidev-theme-primary',
    'abs-tl': 'absolute top-0 left-0',
    'abs-tr': 'absolute top-0 right-0',
    'abs-b': 'absolute bottom-0 left-0 right-0',
    'abs-bl': 'absolute bottom-0 left-0',
    'abs-br': 'absolute bottom-0 right-0',
    'z-drawing': 'z-10',
    'z-camera': 'z-15',
    'z-dragging': 'z-18',
    'z-menu': 'z-20',
    'z-label': 'z-40',
    'z-nav': 'z-50',
    'z-context-menu': 'z-60',
    'z-modal': 'z-70',
    'z-focus-indicator': 'z-200',
    'slidev-glass-effect': 'shadow-xl backdrop-blur-8 border border-main bg-main bg-opacity-75!',
  },
  variants: [
    variantMatcher('forward', input => ({ prefix: `.slidev-nav-go-forward ${input.prefix}` })),
    variantMatcher('backward', input => ({ prefix: `.slidev-nav-go-backward ${input.prefix}` })),
  ],
  theme: {
    fontFamily: {
      sans: '"Avenir Next","Nunito Sans",ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,"Noto Sans",sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol","Noto Color Emoji"',
      serif: 'ui-serif,Georgia,Cambria,"Times New Roman",Times,serif',
      mono: '"Fira Code",ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,"Liberation Mono","Courier New",monospace',
    },
  },
  presets: [
    presetWind3(),
    presetAttributify(),
    presetTypography(),
  ],
  transformers: [
    transformerDirectives({ enforce: 'pre' }),
    transformerVariantGroup(),
  ],
  extractors: [
    extractorMdc(),
  ],
})
