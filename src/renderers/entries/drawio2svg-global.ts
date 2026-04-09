/**
 * Standalone drawio2svg bundle.
 * Loaded as a separate <script> tag to keep render-worker under 5MB.
 * Exposes the library on globalThis so renderers can access it via the shim.
 */
import * as drawio2svg from '@markdown-viewer/drawio2svg';

(globalThis as unknown as Record<string, unknown>).__drawio2svg = drawio2svg;
