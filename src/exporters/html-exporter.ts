/**
 * HTML Exporter for Markdown Viewer Extension
 * Exports rendered Markdown content to a standalone HTML file.
 */

import type {
  HtmlExportOptions,
  HtmlExportResult,
  HtmlProgressCallback,
} from '../types/html';

/**
 * Download a blob as a file
 */
async function downloadBlob(blob: Blob, filename: string): Promise<void> {
 const url = URL.createObjectURL(blob);
 try {
 if (globalThis.platform?.file) {
 await globalThis.platform.file.download(url, filename);
 } else {
 // Fallback: create a download link
 const a = document.createElement('a');
 a.href = url;
 a.download = filename;
 document.body.appendChild(a);
 a.click();
 document.body.removeChild(a);
 }
 } finally {
 URL.revokeObjectURL(url);
 }
}

/**
 * Main class for exporting rendered content to HTML
 */
class HtmlExporter {
  private baseUrl: string | null = null;

  setBaseUrl(url: string): void {
    this.baseUrl = url;
  }

  /**
   * Export content to HTML file
   */
  async exportToHtml(
    container: HTMLElement,
    options: HtmlExportOptions = {},
    onProgress: HtmlProgressCallback | null = null
  ): Promise<HtmlExportResult> {
    try {
      const {
        embedImages = true,
        inlineStyles = true,
        filename = 'document.html',
        skipDownload = false,
      } = options;

      if (onProgress) {
        onProgress(0, 100);
      }

      // Clone the container to avoid modifying the original
      const clone = container.cloneNode(true) as HTMLElement;

      if (onProgress) {
        onProgress(10, 100);
      }

      // Process images if embedding
      if (embedImages) {
        await this.embedImagesAsBase64(clone);
      }

      if (onProgress) {
        onProgress(50, 100);
      }

      // Get computed styles
      const styles = inlineStyles ? this.extractStyles(container) : '';

      if (onProgress) {
        onProgress(60, 100);
      }

      // Build complete HTML document
      const html = this.buildHtmlDocument(clone, styles, embedImages);

      if (onProgress) {
        onProgress(80, 100);
      }

      // Download or return HTML content
      if (!skipDownload) {
        // Original behavior: download via platform.download()
        const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
        await downloadBlob(blob, filename);
      }

      if (onProgress) {
        onProgress(100, 100);
      }

      return { success: true, filename, htmlContent: skipDownload ? html : undefined };
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error);
      console.error('HTML export error:', errMsg);
      return { success: false, error: errMsg };
    }
  }

  /**
   * Embed images as base64 data URLs
   */
  private async embedImagesAsBase64(container: HTMLElement): Promise<void> {
    const images = container.querySelectorAll('img[src]');
    const promises: Promise<void>[] = [];

    images.forEach((img) => {
      const src = img.getAttribute('src');
      if (src && !src.startsWith('data:')) {
        promises.push(this.convertImageToBase64(img as HTMLImageElement, src));
      }
    });

    await Promise.all(promises);
  }

  /**
   * Convert a single image to base64
   */
  private async convertImageToBase64(
    img: HTMLImageElement,
    src: string
  ): Promise<void> {
    try {
      // Use platform.fetch for network URLs, platform.file for local
      const isNetworkUrl = src.startsWith('http://') || src.startsWith('https://');
      
      let dataUrl: string;
      
      if (isNetworkUrl) {
        // Fetch from network
        const response = await fetch(src);
        const blob = await response.blob();
        dataUrl = await this.blobToDataUrl(blob);
      } else {
        // Use platform.document for local files
        const doc = (globalThis as any).platform?.document;
        if (doc && typeof doc.readRelativeFile === 'function') {
          const base64 = await doc.readRelativeFile(src, { binary: true });
          const mimeType = this.guessMimeType(src);
          dataUrl = `data:${mimeType};base64,${base64}`;
        } else {
          // Fallback: try fetch
          try {
            const response = await fetch(src);
            const blob = await response.blob();
            dataUrl = await this.blobToDataUrl(blob);
          } catch {
            // Keep original src if conversion fails
            return;
          }
        }
      }
      
      img.setAttribute('src', dataUrl);
    } catch (error) {
      console.warn(`Failed to embed image: ${src}`, error);
      // Keep original src
    }
  }

  /**
   * Convert blob to data URL
   */
  private async blobToDataUrl(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  /**
   * Guess MIME type from file extension
   */
  private guessMimeType(path: string): string {
    const ext = path.split('.').pop()?.toLowerCase().split('?')[0] || '';
    const map: Record<string, string> = {
      png: 'image/png',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      gif: 'image/gif',
      webp: 'image/webp',
      svg: 'image/svg+xml',
      bmp: 'image/bmp',
    };
    return map[ext] || 'image/png';
  }

  /**
   * Extract CSS styles from the document
   */
  private extractStyles(container: HTMLElement): string {
    const styles: string[] = [];
    
    // Get all style sheets
    const styleSheets = document.styleSheets;
    
    for (let i = 0; i < styleSheets.length; i++) {
      try {
        const sheet = styleSheets[i];
        const rules = sheet.cssRules || sheet.rules;
        
        for (let j = 0; j < rules.length; j++) {
          const rule = rules[j];
          if (rule.cssText) {
            styles.push(rule.cssText);
          }
        }
      } catch (e) {
        // Cross-origin stylesheets may throw security errors
        // Skip them silently
      }
    }

    // Also get VSCode CSS variables from :root
    const rootStyles = document.documentElement.style;
    const cssVars: string[] = [];
    for (let i = 0; i < rootStyles.length; i++) {
      const prop = rootStyles[i];
      if (prop.startsWith('--')) {
        const value = rootStyles.getPropertyValue(prop);
        cssVars.push(`${prop}: ${value};`);
      }
    }

    let result = '';
    
    if (cssVars.length > 0) {
      result += `:root { ${cssVars.join(' ')} }\n`;
    }
    
    if (styles.length > 0) {
      result += styles.join('\n');
    }

    return result;
  }

  /**
   * Build a complete HTML document
   */
  private buildHtmlDocument(
    content: HTMLElement,
    styles: string,
    embedImages: boolean
  ): string {
  const title = this.extractTitle(content) || 'Markdown Export';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${this.escapeHtml(title)}</title>
 <style>
/* KaTeX CSS - Critical styles for math formula rendering */
.katex {text-rendering: auto; font: normal 1.21em KaTeX_Main, Times New Roman, serif; line-height: 1.2; text-indent: 0;}
.katex * {-ms-high-contrast-adjust: none !important; border-color: currentColor;}
.katex .katex-mathml {clip: rect(1px,1px,1px,1px); border: 0; height: 1px; overflow: hidden; padding: 0; position: absolute; width: 1px;}
.katex .katex-html > .newline {display: block;}
.katex .base {position: relative; display: inline-block; white-space: nowrap; width: min-content;}
.katex .strut {display: inline-block;}
.katex .vlist-t {border-collapse: collapse; display: inline-table; table-layout: fixed;}
.katex .vlist-r {display: table-row;}
.katex .vlist {display: table-cell; position: relative; vertical-align: bottom;}
.katex .vlist > span {display: block; height: 0; position: relative;}
.katex .vlist > span > span {display: inline-block;}
.katex .vlist > span > .pstrut {overflow: hidden; width: 0;}
.katex .vlist-t2 {margin-right: -2px;}
.katex .vlist-s {display: table-cell; font-size: 1px; min-width: 2px; vertical-align: bottom; width: 2px;}
.katex .msupsub {text-align: left;}
.katex .mfrac > span > span {text-align: center;}
.katex .mfrac .frac-line {border-bottom-style: solid; display: inline-block; width: 100%; min-height: 1px;}
.katex .overline .overline-line, .katex .underline .underline-line, .katex .hline {border-bottom-style: solid; display: inline-block; width: 100%; min-height: 1px;}
.katex .hdashline {border-bottom-style: dashed; display: inline-block; width: 100%; min-height: 1px;}
.katex .mspace {display: inline-block;}
.katex .llap, .katex .rlap, .katex .clap {position: relative; width: 0;}
.katex .llap > .inner, .katex .rlap > .inner, .katex .clap > .inner {position: absolute;}
.katex .llap > .fix, .katex .rlap > .fix, .katex .clap > .fix {display: inline-block;}
.katex .llap > .inner {right: 0;}
.katex .clap > .inner, .katex .rlap > .inner {left: 0;}
.katex .clap > .inner > span {margin-left: -50%; margin-right: 50%;}
.katex .rule {border: 0 solid; display: inline-block; position: relative;}
.katex .sqrt > .root {margin-left: 0.27777778em; margin-right: -0.55555556em;}
.katex .mtable {display: inline-table; table-layout: fixed;}
.katex .mfrac, .katex .mover, .katex .munder, .katex .munderover {display: inline-flex; flex-direction: column; text-align: center;}
.katex .mfrac > span, .katex .mover > span, .katex .munder > span, .katex .munderover > span {justify-content: center;}
.katex .munder, .katex .mover {position: relative;}
.katex .munder .base, .katex .mover .base {width: 100%;}
.katex .munder .bottom, .katex .mover .top {position: absolute; width: 100%;}
.katex .munder .bottom {bottom: 0;}
.katex .mover .top {top: 0;}
.katex .munder > .vlist, .katex .mover > .vlist {display: flex; flex-direction: column;}
.katex .munder > .vlist > span, .katex .mover > .vlist > span {display: flex; justify-content: center;}

/* CRITICAL: SVG styling - prevents horizontal lines in underbrace/overbrace */
.katex svg {fill: currentColor; stroke: currentColor; fill-rule: nonzero; fill-opacity: 1; stroke-width: 1; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 4; stroke-dasharray: none; stroke-dashoffset: 0; stroke-opacity: 1; display: block; height: inherit; position: absolute; width: 100%;}
.katex svg path {stroke: none !important;}

.katex img {border-style: none; max-height: none; max-width: none; min-height: 0; min-width: 0;}

/* CRITICAL: Stretchy elements for braces and arrows */
.katex .stretchy {display: block; overflow: hidden; position: relative; width: 100%;}
.katex .stretchy:before, .katex .stretchy:after {content: "";}
.katex .hide-tail {overflow: hidden; position: relative; width: 100%;}
.katex .halfarrow-left {left: 0; overflow: hidden; position: absolute; width: 50.2%;}
.katex .halfarrow-right {overflow: hidden; position: absolute; right: 0; width: 50.2%;}
.katex .brace-left {left: 0; overflow: hidden; position: absolute; width: 25.1%;}
.katex .brace-center {left: 25%; overflow: hidden; position: absolute; width: 50%;}
.katex .brace-right {overflow: hidden; position: absolute; right: 0; width: 25.1%;}
.katex .x-arrow-pad {padding: 0 0.5em;}
.katex .x-arrow {text-align: center;}

.katex .mord, .katex .mbin, .katex .mrel, .katex .mopen, .katex .mclose, .katex .mpunct, .katex .mop {display: inline-block;}
.katex .mop-limits {display: inline-flex; flex-direction: column; text-align: center;}
.katex .msubsup {display: inline-flex; flex-direction: column; text-align: left; position: relative;}
.katex .msubsup > .sup {position: absolute; top: 0; left: 0;}
.katex .msubsup > .sub {position: absolute; bottom: 0; left: 0;}
.katex .mtext {font-family: KaTeX_Main;}
.katex .mathnormal {font-family: KaTeX_Math; font-style: italic;}
.katex .mathit {font-family: KaTeX_Math; font-style: italic;}
.katex .mathrm {font-style: normal;}
.katex .mathbf {font-family: KaTeX_Main; font-weight: bold;}
.katex .boldsymbol {font-family: KaTeX_Math; font-style: italic; font-weight: bold;}
.katex .mtable .vertical-separator {display: inline-block; min-width: 1px;}
.katex .mtable .arraycolsep {display: inline-block;}
.katex .mtable .col-align-c > .vlist-t {text-align: center;}
.katex .mtable .col-align-l > .vlist-t {text-align: left;}
.katex .mtable .col-align-r > .vlist-t {text-align: right;}
.katex .svg-align {text-align: left;}
.katex .accent > .vlist-t {text-align: center;}
.katex .accent .accent-body {position: relative;}
.katex .accent .accent-body:not(.accent-full) {width: 0;}
.katex .overlay {display: block;}
.katex .op-symbol {position: relative;}
.katex .op-symbol.small-op {font-family: KaTeX_Size1;}
.katex .op-symbol.large-op {font-family: KaTeX_Size2;}
.katex .op-limits > .vlist-t {text-align: center;}
.katex .delimsizing {position: relative;}
.katex .delimsizing.size1 {font-family: KaTeX_Size1;}
.katex .delimsizing.size2 {font-family: KaTeX_Size2;}
.katex .delimsizing.size3 {font-family: KaTeX_Size3;}
.katex .delimsizing.size4 {font-family: KaTeX_Size4;}
.katex .nulldelimiter {display: inline-block; width: 0.12em;}
.katex .delimcenter {position: relative;}
.katex .sout {border-bottom-style: solid; border-bottom-width: 0.08em;}

/* Reset and base styles */
/* Reset and base styles */
* {
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  font-size: 16px;
  line-height: 1.6;
  color: #333;
  background-color: #fff;
  padding: 40px 20px;
  max-width: 900px;
  margin: 0 auto;
}

/* Content container */
#markdown-wrapper, #markdown-page, #markdown-content {
  max-width: none;
  margin: 0;
}

/* Highlight mark */
mark {
  background-color: rgba(255, 255, 0, 0.8);
  color: #000;
  padding: 0 2px;
  border-radius: 2px;
}

/* Code blocks - light theme */
pre, code {
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  border-radius: 4px;
}
pre {
  background-color: #f6f8fa;
  border: 1px solid #e1e4e8;
  padding: 16px;
  overflow-x: auto;
  font-size: 14px;
}
code {
  background-color: rgba(27, 31, 35, 0.05);
  padding: 0.2em 0.4em;
  font-size: 85%;
}
pre code {
  background-color: transparent;
  padding: 0;
  font-size: inherit;
}

/* Headers */
h1, h2, h3, h4, h5, h6 {
  margin-top: 24px;
  margin-bottom: 16px;
  font-weight: 600;
  line-height: 1.25;
}
h1 { font-size: 2em; border-bottom: 1px solid #e1e4e8; padding-bottom: 0.3em; }
h2 { font-size: 1.5em; border-bottom: 1px solid #e1e4e8; padding-bottom: 0.3em; }
h3 { font-size: 1.25em; }
h4 { font-size: 1em; }

/* Links */
a {
  color: #0366d6;
  text-decoration: none;
}
a:hover {
  text-decoration: underline;
}

/* Images */
img {
  max-width: 100%;
  height: auto;
  display: block;
  margin: 16px auto;
}

/* Tables - light theme */
table {
  border-collapse: collapse;
  width: 100%;
  margin: 16px 0;
  display: block;
  overflow-x: auto;
}
th, td {
  border: 1px solid #dfe2e5;
  padding: 12px 16px;
  text-align: left;
}
th {
  background-color: #f6f8fa;
  font-weight: 600;
}
tr:nth-child(2n) {
  background-color: #f6f8fa;
}

/* Blockquotes */
blockquote {
  border-left: 4px solid #dfe2e5;
  padding: 0 16px;
  margin: 0 0 16px 0;
  color: #6a737d;
}

/* Lists */
ul, ol {
  padding-left: 2em;
  margin: 0 0 16px 0;
}
li {
  margin: 0.25em 0;
}

/* Horizontal rule */
hr {
  border: 0;
  border-top: 1px solid #e1e4e8;
  margin: 24px 0;
}

/* Paragraph */
p {
  margin: 0 0 16px 0;
}
</style>
</head>
<body>
${content.innerHTML}
</body>
</html>`;
  }

  /**
   * Extract title from content (first h1)
   */
  private extractTitle(content: HTMLElement): string | null {
    const h1 = content.querySelector('h1');
    return h1?.textContent?.trim() || null;
  }
  /**
   * Escape HTML special characters
   */
  private escapeHtml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}

export default HtmlExporter;
