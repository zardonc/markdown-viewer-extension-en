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
    await platform.download(url, filename);
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
    
    // Get body classes from original document
    const bodyClasses = document.body.className;
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${this.escapeHtml(title)}</title>
  <style>
/* Reset and base styles */
* {
  box-sizing: border-box;
}
body {
  font-family: var(--vscode-font-family, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif);
  font-size: var(--vscode-font-size, 13px);
  line-height: 1.6;
  color: var(--vscode-foreground, #cccccc);
  background-color: var(--vscode-editor-background, #1e1e1e);
  padding: 20px;
  max-width: 1000px;
  margin: 0 auto;
}

/* Highlight mark */
mark {
  background-color: rgba(255, 255, 0, 0.8);
  color: #000;
  padding: 0 2px;
  border-radius: 2px;
}

/* Code blocks */
pre, code {
  font-family: var(--vscode-editor-font-family, 'Consolas', 'Courier New', monospace);
  background-color: var(--vscode-textCodeBlock-background, #1e1e1e);
  border-radius: 3px;
}
pre {
  padding: 12px;
  overflow-x: auto;
}
code {
  padding: 2px 4px;
}

/* Headers */
h1, h2, h3, h4, h5, h6 {
  margin-top: 24px;
  margin-bottom: 16px;
  font-weight: 600;
  line-height: 1.25;
}

/* Links */
a {
  color: var(--vscode-textLink-foreground, #3794ff);
  text-decoration: none;
}
a:hover {
  text-decoration: underline;
}

/* Images */
img {
  max-width: 100%;
  height: auto;
}

/* Tables */
table {
  border-collapse: collapse;
  width: 100%;
  margin: 16px 0;
}
th, td {
  border: 1px solid var(--vscode-panel-border, #454545);
  padding: 8px 12px;
  text-align: left;
}
th {
  background-color: var(--vscode-editor-background, #1e1e1e);
  font-weight: 600;
}

/* Blockquotes */
blockquote {
  border-left: 4px solid var(--vscode-textBlockQuote-border, #454545);
  padding-left: 16px;
  margin-left: 0;
  color: var(--vscode-textBlockQuote-foreground, #cccccc);
}

/* Lists */
ul, ol {
  padding-left: 2em;
}

/* Custom styles from theme */
${styles}
  </style>
</head>
<body class="${bodyClasses}">
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
