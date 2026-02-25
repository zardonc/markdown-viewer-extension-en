/**
 * VSCode TOC (Table of Contents) Sidebar Component
 *
 * A collapsible sidebar that displays the document outline
 * extracted from h1-h6 heading elements.
 */

import Localization from '../../../src/utils/localization';

/** TOC heading data structure */
export interface TOCHeading {
  /** Heading level (1-6) */
  level: number;
  /** Heading text content */
  text: string;
  /** Anchor ID for navigation */
  id: string;
  /** Optional source line number */
  line?: number;
}

/** TOC panel interface */
export interface TOCPanel {
  /** Show the sidebar */
  show: () => void;
  /** Hide the sidebar */
  hide: () => void;
  /** Toggle visibility */
  toggle: () => void;
  /** Check if panel is visible */
  isVisible: () => boolean;
  /** Update TOC content with headings */
  setHeadings: (headings: TOCHeading[]) => void;
  /** Get the panel root element */
  getElement: () => HTMLElement;
  /** Get the trigger button element */
  getTriggerElement: () => HTMLElement;
  /** Cleanup and remove listeners */
  dispose: () => void;
  /** Highlight active heading by ID */
  highlightActiveHeading: (id: string) => void;
  /** Scroll to specific heading */
  scrollToHeading: (id: string) => void;
  /** Extract headings from rendered HTML content */
  extractHeadingsFromContent: (container: HTMLElement) => TOCHeading[];
}

/** TOC panel options */
export interface TOCPanelOptions {
  /** Callback when a TOC item is clicked */
  onItemClick?: (heading: TOCHeading) => void;
  /** Callback when panel visibility changes */
  onVisibilityChange?: (visible: boolean) => void;
}

/**
 * Create TOC panel
 */
export function createTOCPanel(options: TOCPanelOptions = {}): TOCPanel {
  const { onItemClick, onVisibilityChange } = options;

  let visible = false;
  let headings: TOCHeading[] = [];
  let currentActiveId: string | null = null;
  let scrollListener: (() => void) | null = null;

  // Create sidebar container
  const sidebar = document.createElement('div');
  sidebar.className = 'vscode-toc-sidebar';
  sidebar.setAttribute('role', 'navigation');
  sidebar.setAttribute('aria-label', Localization.translate('toc_title') || 'Table of Contents');

  // Create trigger button
  const triggerBtn = document.createElement('button');
  triggerBtn.className = 'vscode-toc-trigger';
  triggerBtn.setAttribute('aria-label', Localization.translate('toc_toggle') || 'Toggle Table of Contents');
  triggerBtn.setAttribute('title', Localization.translate('toc_toggle') || 'Toggle Table of Contents');
  triggerBtn.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <path d="M2 3h12v1H2V3zm0 4.5h12v1H2v-1zm0 4.5h12v1H2v-1z"/>
    </svg>
  `;

  // Create sidebar header
  const header = document.createElement('div');
  header.className = 'vscode-toc-header';
  header.innerHTML = `
    <span class="vscode-toc-title">${Localization.translate('toc_title') || 'Table of Contents'}</span>
    <button class="vscode-toc-close" aria-label="${Localization.translate('close') || 'Close'}">×</button>
  `;

  // Create sidebar content
  const content = document.createElement('div');
  content.className = 'vscode-toc-content';

  // Create TOC list
  const tocList = document.createElement('ul');
  tocList.className = 'vscode-toc-list';

  // Assemble sidebar
  sidebar.appendChild(header);
  sidebar.appendChild(content);
  content.appendChild(tocList);

  // Add to document
  document.body.appendChild(triggerBtn);
  document.body.appendChild(sidebar);

  // Get header elements
  const closeBtn = header.querySelector('.vscode-toc-close') as HTMLButtonElement;
  const tocTitle = header.querySelector('.vscode-toc-title') as HTMLElement;

  // Update translations
  function updateLabels(): void {
    const tocTitleText = Localization.translate('toc_title') || 'Table of Contents';
    const toggleText = Localization.translate('toc_toggle') || 'Toggle Table of Contents';
    const closeText = Localization.translate('close') || 'Close';

    if (tocTitle) tocTitle.textContent = tocTitleText;
    sidebar.setAttribute('aria-label', tocTitleText);
    triggerBtn.setAttribute('aria-label', toggleText);
    triggerBtn.setAttribute('title', toggleText);
    if (closeBtn) closeBtn.setAttribute('aria-label', closeText);
  }

  // Build TOC items from headings
  function buildTOC(): void {
    tocList.innerHTML = '';

    if (headings.length === 0) {
      const emptyItem = document.createElement('li');
      emptyItem.className = 'vscode-toc-item vscode-toc-empty';
      emptyItem.textContent = Localization.translate('toc_empty') || 'No headings found';
      tocList.appendChild(emptyItem);
      return;
    }

    headings.forEach((heading) => {
      const item = document.createElement('li');
      item.className = `vscode-toc-item vscode-toc-level-${heading.level}`;
      item.setAttribute('data-id', heading.id);
      item.setAttribute('role', 'link');
      item.setAttribute('tabindex', '0');

      // Create link element
      const link = document.createElement('span');
      link.className = 'vscode-toc-link';
      link.textContent = heading.text;
      item.appendChild(link);

      // Click handler
      item.addEventListener('click', () => {
        onItemClick?.(heading);
        highlightActiveHeading(heading.id);
      });

      // Keyboard navigation
      item.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onItemClick?.(heading);
          highlightActiveHeading(heading.id);
        }
      });

      tocList.appendChild(item);
    });
  }

  // Extract headings from rendered HTML content
  function extractHeadingsFromContent(container: HTMLElement): TOCHeading[] {
    const extracted: TOCHeading[] = [];
    const headingElements = container.querySelectorAll('h1, h2, h3, h4, h5, h6');

    headingElements.forEach((el) => {
      const level = parseInt(el.tagName[1], 10);
      const text = el.textContent?.trim() || '';
      let id = el.id;

      // Generate ID if not present
      if (!id) {
        id = text
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-')
          .substring(0, 50);
        el.id = id;
      }

      // Try to get line number from data attribute
      const line = el.getAttribute('data-line');

      extracted.push({
        level,
        text,
        id,
        line: line ? parseInt(line, 10) : undefined
      });
    });

    return extracted;
  }

  // Highlight active heading
  function highlightActiveHeading(id: string): void {
    // Remove previous active state
    tocList.querySelectorAll('.vscode-toc-item').forEach((item) => {
      item.classList.remove('active');
    });

    // Add active state to current
    const activeItem = tocList.querySelector(`[data-id="${id}"]`);
    if (activeItem) {
      activeItem.classList.add('active');
      // Scroll item into view within the TOC
      activeItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    currentActiveId = id;
  }

  // Scroll to specific heading
  function scrollToHeading(id: string): void {
    // Use querySelector with CSS.escape to handle special characters in ID
    let targetEl: HTMLElement | null = null;
    
    try {
      // Try getElementById first (most efficient)
      targetEl = document.getElementById(id);
      
      // If not found, try querySelector with escaped ID
      if (!targetEl) {
        const escapedId = CSS.escape(id);
        targetEl = document.querySelector(`#${escapedId}`);
      }
      
      // If still not found, search in markdown-content container
      if (!targetEl) {
        const container = document.getElementById('markdown-content');
        if (container) {
          targetEl = container.querySelector(`[id="${CSS.escape(id)}"]`);
        }
      }
    } catch (e) {
      console.error('[TOC] Error finding element:', e);
    }
    
    if (targetEl) {
      // Use scrollIntoView with 'center' block to ensure element is in middle of viewport
      // This provides better visibility and avoids being cut off at edges
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      console.warn('[TOC] Target element not found for id:', id);
    }
  }

  // Setup scroll observer for auto-highlight
  function setupScrollObserver(): void {
    if (scrollListener) return;

    let ticking = false;
    scrollListener = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          updateActiveHeadingOnScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', scrollListener, { passive: true });
  }

  // Update active heading based on scroll position
  function updateActiveHeadingOnScroll(): void {
    const scrollY = window.scrollY;
    let currentHeading: TOCHeading | null = null;

    // Find the heading closest to but above current scroll position
    for (let i = headings.length - 1; i >= 0; i--) {
      const heading = headings[i];
      const element = document.getElementById(heading.id);
      if (element) {
        const rect = element.getBoundingClientRect();
        if (rect.top <= 100) { // 100px offset from top
          currentHeading = heading;
          break;
        }
      }
    }

    if (currentHeading && currentHeading.id !== currentActiveId) {
      highlightActiveHeading(currentHeading.id);
    }
  }

  // Show sidebar
  function show(): void {
    if (visible) return;

    sidebar.classList.add('visible');
    triggerBtn.classList.add('active');
    visible = true;

    // Setup scroll observer for auto-highlight
    setupScrollObserver();

    // Focus first item or close button
    setTimeout(() => {
      const firstItem = tocList.querySelector('.vscode-toc-item') as HTMLElement;
      if (firstItem) {
        firstItem.focus();
      }
    }, 100);

    onVisibilityChange?.(true);
  }

  // Hide sidebar
  function hide(): void {
    if (!visible) return;

    sidebar.classList.remove('visible');
    triggerBtn.classList.remove('active');
    visible = false;

    onVisibilityChange?.(false);
  }

  // Toggle visibility
  function toggle(): void {
    if (visible) {
      hide();
    } else {
      show();
    }
  }

  // Check visibility
  function isVisible(): boolean {
    return visible;
  }

  // Set headings
  function setHeadings(newHeadings: TOCHeading[]): void {
    headings = newHeadings;
    buildTOC();

    // Restore active state if exists
    if (currentActiveId) {
      highlightActiveHeading(currentActiveId);
    }
  }

  // Get root element
  function getElement(): HTMLElement {
    return sidebar;
  }

  // Get trigger element
  function getTriggerElement(): HTMLElement {
    return triggerBtn;
  }

  // Cleanup
  function dispose(): void {
    if (scrollListener) {
      window.removeEventListener('scroll', scrollListener);
      scrollListener = null;
    }

    triggerBtn.remove();
    sidebar.remove();
  }

  // Event listeners
  triggerBtn.addEventListener('click', toggle);
  closeBtn?.addEventListener('click', hide);

  // Keyboard shortcut: Escape to close
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && visible) {
      hide();
    }
  });

  // Click outside to close
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    if (visible && !sidebar.contains(target) && !triggerBtn.contains(target)) {
      hide();
    }
  });

  // Initial build with empty state
  buildTOC();

  return {
    show,
    hide,
    toggle,
    isVisible,
    setHeadings,
    getElement,
    getTriggerElement,
    dispose,
    highlightActiveHeading,
    scrollToHeading,
    extractHeadingsFromContent
  };
}
