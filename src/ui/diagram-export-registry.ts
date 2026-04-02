/**
 * Diagram Export Registry
 *
 * Global registry for diagram intermediate formats (SVG, DrawIO XML).
 * Populated during render, consumed by image context menu for export options.
 * Keyed by sourceHash (content-hash used for DOM diff matching).
 */

export interface DiagramExportData {
  pluginType: string;
  svg?: string;
  drawioXml?: string;
}

const registry = new Map<string, DiagramExportData>();

/**
 * Register export data for a rendered diagram
 */
export function registerDiagramExport(sourceHash: string, data: DiagramExportData): void {
  registry.set(sourceHash, data);
}

/**
 * Get export data for a diagram by sourceHash
 */
export function getDiagramExport(sourceHash: string): DiagramExportData | undefined {
  return registry.get(sourceHash);
}

/**
 * Clear all export data (e.g., on document change)
 */
export function clearDiagramExports(): void {
  registry.clear();
}
