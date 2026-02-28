/**
 * HTML Export Type Definitions
 *
 * Types for HTML export functionality.
 */

/**
 * Export format options
 */
export type ExportFormat = 'docx' | 'html';

/**
 * HTML export options
 */
export interface HtmlExportOptions {
 /** Whether to embed images as base64 (default: true) */
 embedImages?: boolean;
 /** Include all CSS styles inline (default: true) */
 inlineStyles?: boolean;
 /** Filename for the exported HTML file */
 filename?: string;
 /** Skip automatic download and return HTML content (for VSCode) */
 skipDownload?: boolean;
}

/**
 * HTML export result
 */
export interface HtmlExportResult {
 success: boolean;
 error?: string;
 filename?: string;
 /** HTML content (only when skipDownload is true) */
 htmlContent?: string;
}

/**
 * Progress callback type for HTML export
 */
export type HtmlProgressCallback = (processed: number, total: number) => void;

/**
 * Public HTML exporter interface
 */
export interface HtmlExporter {
  exportToHtml(
    content: HTMLElement,
    options?: HtmlExportOptions,
    onProgress?: HtmlProgressCallback | null
  ): Promise<HtmlExportResult>;
  setBaseUrl?(url: string): void;
}
