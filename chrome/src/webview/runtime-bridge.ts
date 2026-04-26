// Runtime bridge for web integration protocol.
// This content script exposes extension runtime capabilities to page scripts via window.postMessage.

const NS = 'MV_RUNTIME';

interface RuntimeRequestEnvelope {
  ns: string;
  requestId?: string;
  type?: string;
  payload?: unknown;
}

function postResponse(requestId: string | undefined, ok: boolean, data?: unknown, error?: string): void {
  window.postMessage({
    ns: NS,
    requestId,
    ok,
    data,
    error,
  }, '*');
}

function getCapabilities() {
  return {
    version: chrome.runtime.getManifest().version,
    viewerEntry: chrome.runtime.getURL('core/main.js'),
    styles: [chrome.runtime.getURL('ui/styles.css')],
    scripts: [
      chrome.runtime.getURL('libs/mermaid.min.js'),
      chrome.runtime.getURL('core/drawio2svg.js'),
      chrome.runtime.getURL('core/draw-uml.js'),
    ],
    renderModes: ['inline', 'iframe'],
  };
}

window.addEventListener('message', async (event: MessageEvent<RuntimeRequestEnvelope>) => {
  if (event.source !== window) return;

  const message = event.data;
  if (!message || message.ns !== NS || typeof message.type !== 'string') {
    return;
  }

  try {
    if (message.type === 'RUNTIME_IS_AVAILABLE') {
      postResponse(message.requestId, true, {
        version: chrome.runtime.getManifest().version,
      });
      return;
    }

    if (message.type === 'RUNTIME_GET_CAPABILITIES') {
      postResponse(message.requestId, true, getCapabilities());
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
