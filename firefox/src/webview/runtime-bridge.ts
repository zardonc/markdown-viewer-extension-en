// Runtime bridge for web integration protocol.
// This content script exposes extension runtime capabilities to page scripts via window.postMessage.

const NS = 'MV_RUNTIME';

type RuntimeApi = {
  getManifest: () => { version: string };
  getURL: (path: string) => string;
};

interface RuntimeRequestEnvelope {
  ns: string;
  requestId?: string;
  type?: string;
  payload?: unknown;
}

function resolveRuntimeApi(): RuntimeApi {
  const browserRuntime = (globalThis as typeof globalThis & { browser?: { runtime?: RuntimeApi } }).browser?.runtime;
  if (browserRuntime) {
    return browserRuntime;
  }

  const chromeRuntime = (globalThis as typeof globalThis & { chrome?: { runtime?: RuntimeApi } }).chrome?.runtime;
  if (!chromeRuntime) {
    throw new Error('Extension runtime API is unavailable');
  }

  return chromeRuntime;
}

function postResponse(requestId: string | undefined, ok: boolean, data?: unknown, error?: string): void {
  window.postMessage(
    {
      ns: NS,
      requestId,
      ok,
      data,
      error,
    },
    '*'
  );
}

function getCapabilities(runtimeApi: RuntimeApi) {
  return {
    version: runtimeApi.getManifest().version,
    viewerEntry: runtimeApi.getURL('core/main.js'),
    styles: [runtimeApi.getURL('ui/styles.css')],
    scripts: [
      runtimeApi.getURL('libs/mermaid.min.js'),
      runtimeApi.getURL('core/drawio2svg.js'),
      runtimeApi.getURL('core/draw-uml.js'),
    ],
    renderModes: ['inline', 'iframe'],
  };
}

window.addEventListener('message', (event: MessageEvent<RuntimeRequestEnvelope>) => {
  if (event.source !== window) return;

  const message = event.data;
  if (!message || message.ns !== NS || typeof message.type !== 'string') {
    return;
  }

  try {
    const runtimeApi = resolveRuntimeApi();

    if (message.type === 'RUNTIME_IS_AVAILABLE') {
      postResponse(message.requestId, true, {
        version: runtimeApi.getManifest().version,
      });
      return;
    }

    if (message.type === 'RUNTIME_GET_CAPABILITIES') {
      postResponse(message.requestId, true, getCapabilities(runtimeApi));
      return;
    }

    // Keep protocol strict: unknown requests are explicit errors.
    postResponse(message.requestId, false, undefined, `Unsupported runtime request: ${message.type}`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    postResponse(message.requestId, false, undefined, errorMessage);
  }
});

window.postMessage({ ns: NS, type: 'RUNTIME_BRIDGE_READY' }, '*');

export {};
