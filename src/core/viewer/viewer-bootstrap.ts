import Localization from '../../utils/localization';
import { defineMarkdownViewerElement } from '../../integration/element';
import type { MarkdownViewerElementFactoryOptions } from '../../integration/element';
import type { PlatformAPI, PluginRenderer } from '../../types';
import { createPluginRenderer } from './viewer-host';

export async function initializeViewerCore(platform: PlatformAPI): Promise<MarkdownViewerElementFactoryOptions> {
  await Localization.init();

  const renderer = createPluginRenderer(platform);

  return {
    platform,
    renderer,
    translate: (key, subs) => Localization.translate(key, subs),
  };
}

export async function initializeViewerBase(platform: PlatformAPI): Promise<PluginRenderer> {
  const options = await initializeViewerCore(platform);

  defineMarkdownViewerElement('markdown-viewer', options);

  return options.renderer;
}