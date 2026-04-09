/**
 * Standalone draw-uml bundle.
 * Loaded as a separate <script> tag to keep render-worker under 5MB.
 * Exposes the library on globalThis so plantuml-renderer can access it via the shim.
 */
import * as drawUml from '@markdown-viewer/draw-uml';

(globalThis as unknown as Record<string, unknown>).__drawUml = drawUml;
