/**
 * Shim for @markdown-viewer/drawio2svg.
 * 
 * In browser extension builds, the real library is loaded as a separate
 * <script> via drawio2svg-global.ts. This shim re-exports from globalThis.
 * 
 * esbuild alias maps '@markdown-viewer/drawio2svg' → this file so that
 * renderers (plantuml, drawio) get the shared global instance.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mod = (globalThis as any).__drawio2svg;

export const convert = mod.convert;
export const createStencilBundle = mod.createStencilBundle;
export const createStencilBundleFromCompressedGroups = mod.createStencilBundleFromCompressedGroups;
export const convertStencilXmlToShapes = mod.convertStencilXmlToShapes;
export const parseInlineStencil = mod.parseInlineStencil;
export const decompress = mod.decompress;
export const parse = mod.parse;
export const DrawioParser = mod.DrawioParser;
export const SvgRenderer = mod.SvgRenderer;
export const SvgBuilder = mod.SvgBuilder;
export const SvgAttrs = mod.SvgAttrs;
export const lineIntersection = mod.lineIntersection;
export const finalizeAbsolutePoints = mod.finalizeAbsolutePoints;
export const normalizeImageUrl = mod.normalizeImageUrl;
export const setTextMeasureProvider = mod.setTextMeasureProvider;
export const getTextMeasureProvider = mod.getTextMeasureProvider;
export const resetTextMeasureProvider = mod.resetTextMeasureProvider;
