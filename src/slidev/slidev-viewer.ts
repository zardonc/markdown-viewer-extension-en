/**
 * Slidev Viewer — Shared integration module
 *
 * Embeds the Slidev shell inside the main viewer HTML,
 * sharing the platform API for rendering, caching, and storage.
 * Used by both Chrome and VS Code viewer entry points.
 */

import { parseSlides } from './slidev-core'
import type { DiagramJob } from './slidev-core'

// ── Types ──────────────────────────────────────────────────────────────

export interface SlidevViewerOptions {
  /** Raw markdown content of the .slides.md file */
  rawContent: string
  /** Container element to place the Slidev iframe in */
  container: HTMLElement
  /** Render a diagram via the platform renderer (with built-in caching) */
  renderDiagram: (type: string, code: string) => Promise<{ base64: string; width: number; height: number }>
  /** Provide the shell iframe source */
  getShellSource: () => Promise<string>
  /** Provide theme IIFE code by name (for eval — works in blob-URL contexts like VSCode) */
  getThemeCode?: (name: string) => Promise<string | undefined>
  /** Provide theme IIFE URL by name (for <script src> — works under strict CSP like Chrome) */
  getThemeUrl?: (name: string) => Promise<string | undefined>
  /** Called after slides are parsed with the presentation title */
  onParsed?: (info: { title: string; slideCount: number }) => void
  /** Called with theme name before diagram rendering, allows setting renderer font config */
  onThemeReady?: (themeName: string) => Promise<void>
  /** Display mode: 'presentation' (single slide with nav) or 'list' (all slides scrollable) */
  mode?: 'presentation' | 'list'
}

// ── Public API ─────────────────────────────────────────────────────────

/**
 * Initialize Slidev presentation viewer inside the given container.
 * Parses slides, creates iframe, and renders diagrams asynchronously.
 */
export async function initSlidevViewer(options: SlidevViewerOptions): Promise<void> {
  const { rawContent, container, renderDiagram, getShellSource, getThemeCode, getThemeUrl, onParsed, onThemeReady, mode = 'presentation' } = options

  if (!rawContent.trim()) return

  // Parse slides with async diagram placeholders
  const { slides, configs, diagramJobs } = parseSlides(
    rawContent,
    (id) =>
      `<div data-diagram-id="${id}" style="display:flex;align-items:center;justify-content:center;padding:20px;opacity:.5;font-size:13px">\u23F3 Loading diagram\u2026</div>`,
  )

  // Notify caller about parsed slides
  const title =
    slides[0]?.frontmatter?.title || configs.slidesTitle || 'Untitled'
  onParsed?.({ title, slideCount: slides.length })

  // Prepare container for full-screen iframe
  container.innerHTML = ''
  container.style.cssText =
    'margin:0;padding:0;width:100%;height:100%;overflow:hidden'

  // Create iframe
  const shellUrl = await getShellSource()
  const iframe = document.createElement('iframe')
  iframe.id = 'slidev-frame'
  iframe.allow = 'fullscreen'
  iframe.style.cssText = 'width:100%;height:100%;border:none'
  iframe.src = shellUrl
  container.appendChild(iframe)

  // Resolve theme (code or URL) AND wait for shell ready in parallel
  // (must register listener before awaiting theme fetch to avoid missing SLIDEV_SHELL_READY)
  const themeName = configs.theme || 'default'
  const themePromise = getThemeCode
    ? getThemeCode(themeName).then(code => ({ themeCode: code, themeUrl: undefined as string | undefined }))
    : getThemeUrl
      ? getThemeUrl(themeName).then(url => ({ themeCode: undefined as string | undefined, themeUrl: url }))
      : Promise.resolve({ themeCode: undefined as string | undefined, themeUrl: undefined as string | undefined })

  const [themeResult] = await Promise.all([
    themePromise,
    new Promise<void>((resolve) => {
      const onMessage = (event: MessageEvent) => {
        if (event.data?.type === 'SLIDEV_SHELL_READY') {
          window.removeEventListener('message', onMessage)
          resolve()
        }
      }
      window.addEventListener('message', onMessage)
    }),
  ])

  // Both ready — send init data (themeCode for eval, themeUrl for <script src>)
  iframe.contentWindow?.postMessage(
    { type: 'SLIDEV_INIT', slides, configs, mode, ...themeResult },
    '*',
  )
  iframe.focus()

  // Let caller configure diagram renderer with theme fonts before rendering
  if (onThemeReady && diagramJobs.length > 0) {
    await onThemeReady(themeName)
  }

  // Render diagrams asynchronously — results streamed to shell via postMessage
  renderDiagramsAsync(iframe, diagramJobs, renderDiagram)
}

// ── Helpers ────────────────────────────────────────────────────────────

function renderDiagramsAsync(
  iframe: HTMLIFrameElement,
  diagramJobs: DiagramJob[],
  renderDiagram: (type: string, code: string) => Promise<{ base64: string; width: number; height: number }>,
) {
  for (const job of diagramJobs) {
    renderDiagram(job.renderType, job.code)
      .then(({ base64, width, height }) => {
        // Renderers produce 4x PNG for high-DPI; scale display size back to original
        const displayWidth = Math.round(width / 4)
        const displayHeight = Math.round(height / 4)
        const html = `<div class="slidev-diagram" style="display:flex;justify-content:center;margin:8px 0"><img src="data:image/png;base64,${base64}" width="${displayWidth}" height="${displayHeight}" style="max-width:100%;height:auto" /></div>`
        iframe.contentWindow?.postMessage(
          { type: 'SLIDEV_UPDATE_DIAGRAM', id: job.id, html },
          '*',
        )
      })
      .catch(() => {
        const html = `<div class="slidev-diagram-error" style="padding:8px;border:1px solid #e53e3e;border-radius:4px;color:#e53e3e;font-size:12px">Diagram unavailable</div>`
        iframe.contentWindow?.postMessage(
          { type: 'SLIDEV_UPDATE_DIAGRAM', id: job.id, html },
          '*',
        )
      })
  }
}
