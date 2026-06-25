/**
 * Page Initialization Module
 * Handles all aspects of page loading and navigation setup
 */
const PageInitializer = (() => {
  // Configuration constants
  const CONFIG = {
    CRITICAL_RESOURCES: [
      { name: 'pageContent', url: 'page.html' },
      { name: 'parentLoader', url: '../index.html' },
      { name: 'parentTitle', url: '../title.txt' }
    ],
    SELECTORS: {
      contentPlaceholder: '#content-placeholder',
      printedTitle: '#printed-title',
      parentNavContainer: '#parent-nav-container',
      subpageNavigation: '.subpage-navigation'
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
    // fetch() only rejects on network failure, not 404/500 — response.ok bridges that gap
    fetchResource: async (url, errorMsg) => {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`${errorMsg}${url}`);
      return response.text();
    },

    /**
     * Creates a temporary DOM element from HTML string
     */
    createTempElement: (html) => {
      const temp = document.createElement('div');
      temp.innerHTML = html;
      return temp;
    },

    /**
     * Rewrites a single raw relative href/data-folder value one level up
     */
    rewritePath: (raw) => raw.replace(/\.\.\//g, '../../'),

    /**
     * Updates relative paths in navigation elements.
     * Uses getAttribute/setAttribute to avoid browser-resolved absolute URLs.
     */
    updateNavigationPaths: (element) => {
      element.querySelectorAll('[href], [data-folder]').forEach(el => {
        const href = el.getAttribute('href');
        if (href?.includes('../')) el.setAttribute('href', utils.rewritePath(href));

        const folder = el.dataset.folder;
        if (folder?.includes('../')) el.dataset.folder = utils.rewritePath(folder);
      });
      return element;
    },

    /**
     * Loads navigation titles for links
     */
    loadNavigationTitles: async (links, basePath = '') => {
      for (const [key, link] of Object.entries(links)) {
        if (!link) continue;

        // toc only needs its path rewritten — no title to fetch
        if (key === 'toc') {
          // Use getAttribute to get the raw href before browser resolution
          //const raw = link.getAttribute('href') ?? '';
          //link.setAttribute('href', utils.rewritePath(raw));
          link.style.visibility = 'visible';
          continue;
        }

        const folderPath = link.getAttribute('data-folder');
        if (!folderPath) continue;

        try {
          const baseFolder = folderPath.endsWith('/') ? folderPath : `${folderPath}/`;
          const title = await utils.fetchResource(
            `${basePath}${baseFolder}title.txt`,
            CONFIG.ERROR_MESSAGES.loadFailed
          );

        // Append title as a child div rather than overwriting textContent,
        // in case the link element already has other content or structure
        link.setAttribute('href', `${baseFolder}`);
          const div = document.createElement('div');
          div.textContent = title.trim();
          link.appendChild(div);
        } catch (error) {
          console.error(`Error loading ${key} navigation:`, error);
        }
      }
    }
  };

  // Core functions
  const core = {
    /**
     * Processes parent navigation
     */
    processParentNavigation: async (parentLoader) => {
      try {
        const temp = utils.createTempElement(parentLoader);
        const nav = temp.querySelector('nav.page-navigation');

        if (nav) {
          const updatedNav = utils.updateNavigationPaths(nav);
          const parentNavContainer = document.querySelector(CONFIG.SELECTORS.parentNavContainer);

          if (parentNavContainer) {
            parentNavContainer.innerHTML = '';
            parentNavContainer.appendChild(updatedNav);

            // Defensive: source HTML may use <div class="nav-link"> instead of <a>,
            // which wouldn't be clickable — replace any non-anchor nav-links with <a>
            parentNavContainer.querySelectorAll('.nav-link').forEach(link => {
              if (link.tagName !== 'A') {
                const a = document.createElement('a');
                a.className = link.className;
                a.setAttribute('href', link.getAttribute('href') ?? '#');
                a.innerHTML = link.innerHTML;
                link.replaceWith(a);
              }
            });

            await core.loadDynamicNavigation();
          }
        }
      } catch (error) {
        console.error("Error processing parent navigation:", error);
      }
    },

    /**
     * Loads dynamic navigation for parent nav
     */
    loadDynamicNavigation: async () => {
      const parentNavContainer = document.querySelector(CONFIG.SELECTORS.parentNavContainer);
      if (!parentNavContainer) return;

      const links = {
        prev: parentNavContainer.querySelector('.nav-link.prev'),
        toc: parentNavContainer.querySelector('.nav-link.toc'),
        next: parentNavContainer.querySelector('.nav-link.next')
      };

      await utils.loadNavigationTitles(links);
    },

    /**
     * Loads subpage navigation
     */
    loadSubpageNavigation: async () => {
      const subpageNav = document.querySelector(CONFIG.SELECTORS.subpageNavigation);
      if (!subpageNav) return;

      const links = {
        prev: subpageNav.querySelector('.nav-link.prev'),
        parent: subpageNav.querySelector('.nav-link.parent'),
        next: subpageNav.querySelector('.nav-link.next')
      };

      await utils.loadNavigationTitles(links);
    },

    /**
     * Loads current page title
     */
    populateCurrentTitle: async () => {
      try {
        const title = await utils.fetchResource(
          'title.txt',
          CONFIG.ERROR_MESSAGES.loadFailed
        );
        document.title = title.trim();
      } catch (error) {
        console.error('Error fetching current title:', error);
      }
    }
  };

  // Main initialization function
  return {
    initializePage: async () => {
      try {
        // Each fetch resolves to a single-key object e.g. { pageContent: '...' }.
        // Object.assign merges the array of results into one flat lookup object,
        // avoiding brittle index access like results[0], results[1]
        const resources = await Promise.all(
          CONFIG.CRITICAL_RESOURCES.map(resource =>
            utils.fetchResource(resource.url, CONFIG.ERROR_MESSAGES.loadFailed)
              .then(content => ({ [resource.name]: content }))
          )
        ).then(results => Object.assign({}, ...results));

        const contentPlaceholder = document.querySelector(CONFIG.SELECTORS.contentPlaceholder);
        if (contentPlaceholder) {
          contentPlaceholder.insertAdjacentHTML('afterbegin', resources.pageContent);
        }

        const h1Element = document.querySelector(CONFIG.SELECTORS.printedTitle);
        if (h1Element) {
          h1Element.innerHTML = `<a href="../">${resources.parentTitle.trim()}</a>`;
        }

        // Order matters: content must be in the DOM before loadSubpageNavigation
        // queries it, but subpage nav and title don't depend on each other so run in parallel
        await core.processParentNavigation(resources.parentLoader);

        await Promise.all([
          core.loadSubpageNavigation(),
          core.populateCurrentTitle()
        ]);

        if (typeof hljs !== 'undefined') {
          hljs.highlightAll();
        }
      } catch (error) {
        console.error("Error initializing page:", error);
        const contentPlaceholder = document.querySelector(CONFIG.SELECTORS.contentPlaceholder);
        if (contentPlaceholder) {
          contentPlaceholder.innerHTML = `<p>${CONFIG.ERROR_MESSAGES.initFailed}</p>`;
        }
      }
    }
  };
})();

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', PageInitializer.initializePage);