// Markdown Viewer Main - Chrome Extension Entry Point
import { platform } from './index';
import { startViewer } from './viewer-main';
import { initializeViewerBase } from '../../../src/core/viewer/viewer-bootstrap';

void initializeViewerBase(platform).then((pluginRenderer) => {
  startViewer({
    platform,
    pluginRenderer,
    themeConfigRenderer: platform.renderer,
  });
}).catch((error) => {
  console.error('[main] viewer base init failed', error);
});
