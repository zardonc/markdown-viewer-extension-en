/**
 * Shim for @markdown-viewer/draw-uml.
 * 
 * In browser extension builds, the real library is loaded as a separate
 * <script> via draw-uml-global.ts. This shim re-exports from globalThis.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mod = (globalThis as any).__drawUml;

export const textToDrawioXml = mod.textToDrawioXml;
