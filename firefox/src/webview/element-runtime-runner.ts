// Entry point for standalone injection into HTML pages.
// Background injects this file; it auto-invokes initializeElementRuntime.
import { initializeElementRuntime } from './element-runtime';

void initializeElementRuntime().catch((error) => {
  console.error('[ElementRuntime] initialize failed', error);
});
