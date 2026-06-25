const PageInitializer = (() => {
  // Configuration constants
  const CONFIG = {
    RESOURCES: [
      { name: 'pageContent', url: 'page.html' },
      { name: 'title', url: 'title.txt' },
      { name: 'prevTitle', url: '../prev/title.txt', optional: true },
      { name: 'nextTitle', url: '../next/title.txt', optional: true },
      { name: 'subchapterTitles', selector: '.subchapter-button', attribute: 'data-folder', urlPattern: '{folder}/title.txt' }
    ],
    SELECTORS: {
      contentPlaceholder: '#content-placeholder',
      printedTitle: '#printed-title',
      pageNavigation: '.page-navigation',
      navLinkPrev: '.page-navigation > .nav-link.prev',
      navLinkNext: '.page-navigation > .nav-link.next',
      subchapterButtons: '.subchapter-button'
    },
    ERROR_MESSAGES: {
      loadFailed: 'Failed to load resource: ',
      initFailed: 'Error loading content. Please try refreshing the page.'
    }
  };

  // Utility functions
  const utils = {
    /**
     * Fetches a resource with error handling
     */
    fetchResource: async (url, errorMsg, optional = false) => {
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`${errorMsg}${url} (Status: ${response.status})`);
        return response.text();
      } catch (error) {
        if (!optional) throw error;
        console.warn(error.message);
        return null;
      }
    },

    /**
     * Updates navigation link with title and href
     */
    updateNavLink: (link, title, folderPath) => {
      if (!link) return;

      link.href = `${folderPath}`;
      link.innerHTML = `<div>${title.trim()}</div>`;
    },

    /**
     * Processes subchapter buttons
     */
    processSubchapterButtons: async (buttons) => {
      for (const button of buttons) {
        const folderPath = button.getAttribute('data-folder');
        if (!folderPath) continue;

        const baseFolder = folderPath.endsWith('/') ? folderPath : `${folderPath}/`;
        const title = await utils.fetchResource(
          `${baseFolder}title.txt`,
          CONFIG.ERROR_MESSAGES.loadFailed,
          true
        );

        if (title) {
          button.href = `${baseFolder}`;
          button.textContent = title.trim();
        }
      }
    }
  };

  // Core functions
  const core = {
    /**
     * Loads and injects page content
     */
    loadPageContent: async () => {
      const content = await utils.fetchResource(
        CONFIG.RESOURCES.find(r => r.name === 'pageContent').url,
        CONFIG.ERROR_MESSAGES.loadFailed
      );

      const placeholder = document.querySelector(CONFIG.SELECTORS.contentPlaceholder);
      if (placeholder) {
        placeholder.insertAdjacentHTML('afterbegin', content);
      }
    },

    /**
     * Loads and sets page title
     */
    setPageTitle: async () => {
      const title = await utils.fetchResource(
        CONFIG.RESOURCES.find(r => r.name === 'title').url,
        CONFIG.ERROR_MESSAGES.loadFailed
      );

      document.title = title.trim();
      const heading = document.querySelector(CONFIG.SELECTORS.printedTitle);
      if (heading) {
        heading.textContent = title.trim();
      }
    },

    /**
     * Loads navigation titles
     */
    loadNavigation: async () => {
      const [prevLink, nextLink] = [
        document.querySelector(CONFIG.SELECTORS.navLinkPrev),
        document.querySelector(CONFIG.SELECTORS.navLinkNext)
      ];

      const prevFolder = prevLink?.getAttribute('data-folder');
      const nextFolder = nextLink?.getAttribute('data-folder');

      const [prevTitle, nextTitle] = await Promise.all([
        prevFolder ? utils.fetchResource(
          `${prevFolder.endsWith('/') ? prevFolder : prevFolder + '/'}title.txt`,
          CONFIG.ERROR_MESSAGES.loadFailed,
          true
        ) : Promise.resolve(null),
        nextFolder ? utils.fetchResource(
          `${nextFolder.endsWith('/') ? nextFolder : nextFolder + '/'}title.txt`,
          CONFIG.ERROR_MESSAGES.loadFailed,
          true
        ) : Promise.resolve(null)
      ]);

      if (prevTitle) utils.updateNavLink(prevLink, prevTitle, prevFolder);
      if (nextTitle) utils.updateNavLink(nextLink, nextTitle, nextFolder);
    },

    /**
     * Loads subchapter navigation
     */
    loadSubchapterNavigation: async () => {
      const buttons = document.querySelectorAll(CONFIG.SELECTORS.subchapterButtons);
      if (buttons.length > 0) {
        await utils.processSubchapterButtons(buttons);
      }
    },

    /**
     * Highlights code blocks if hljs is available
     */
    highlightCode: () => {
      if (typeof hljs !== 'undefined') {
        hljs.highlightAll();
      }
    }
  };

  // Main initialization function
  return {
    initializePage: async () => {
      try {
        // Single DOM read for all selectors we'll need
        const elements = {
          contentPlaceholder: document.querySelector(CONFIG.SELECTORS.contentPlaceholder),
          printedTitle: document.querySelector(CONFIG.SELECTORS.printedTitle),
          navLinks: {
            prev: document.querySelector(CONFIG.SELECTORS.navLinkPrev),
            next: document.querySelector(CONFIG.SELECTORS.navLinkNext)
          },
          subchapterButtons: document.querySelectorAll(CONFIG.SELECTORS.subchapterButtons)
        };

        // Step 1: Load and inject content
        await core.loadPageContent();

        // Step 2: Load and set title
        await core.setPageTitle();

        // Step 3: Load navigation (can run in parallel with subchapter nav)
        const navigationPromises = [
          core.loadNavigation(),
          core.loadSubchapterNavigation()
        ];

        await Promise.all(navigationPromises);

        // Step 4: Highlight code blocks
        core.highlightCode();

      } catch (error) {
        console.error("Error initializing page:", error);
        const placeholder = document.querySelector(CONFIG.SELECTORS.contentPlaceholder);
        if (placeholder) {
          placeholder.innerHTML = `<p>${CONFIG.ERROR_MESSAGES.initFailed}</p>`;
        }
      }
    }
  };
})();

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', PageInitializer.initializePage);
} else {
  PageInitializer.initializePage();
}