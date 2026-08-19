const PageInitializer = (() => {
  const CONFIG = {
    RESOURCES: [
      { name: 'pageContent', url: 'page.html' },
      { name: 'title', url: 'title.txt' },
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

  const utils = {
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

    replaceWithLink: (el, href, title) => {
      if (!el || !title) return;
      const a = document.createElement('a');
      a.className = el.className;
      a.href = href;
      a.innerHTML = `<div>${title.trim()}</div>`;
      el.replaceWith(a);
    },

    processSubchapterButtons: async (buttons) => {
      for (const button of buttons) {
        const folderPath = button.getAttribute('href');
        if (!folderPath) continue;

        const baseFolder = folderPath.endsWith('/') ? folderPath : `${folderPath}/`;
        const title = await utils.fetchResource(
          `${baseFolder}title.txt`,
          CONFIG.ERROR_MESSAGES.loadFailed,
          true
        );

        if (title) {
          button.setAttribute('href', baseFolder);
          button.textContent = title.trim();
        }
      }
    }
  };

  const core = {
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

    loadNavigation: async () => {
      const [prevEl, nextEl] = [
        document.querySelector(CONFIG.SELECTORS.navLinkPrev),
        document.querySelector(CONFIG.SELECTORS.navLinkNext)
      ];

      const manifest = await ManifestNav.getManifest();
      const { prev, next } = ManifestNav.getPrevNext(manifest);

      const [prevTitle, nextTitle] = await Promise.all([
        prev ? ManifestNav.fetchText(`/${prev}title.txt`, true) : Promise.resolve(null),
        next ? ManifestNav.fetchText(`/${next}title.txt`, true) : Promise.resolve(null)
      ]);

      if (prev) utils.replaceWithLink(prevEl, `../${prev}`, prevTitle);
      if (next) utils.replaceWithLink(nextEl, `../${next}`, nextTitle);
    },

    loadSubchapterNavigation: async () => {
      const buttons = document.querySelectorAll(CONFIG.SELECTORS.subchapterButtons);
      if (buttons.length > 0) {
        await utils.processSubchapterButtons(buttons);
      }
    },

    highlightCode: () => {
      if (typeof hljs !== 'undefined') {
        hljs.highlightAll();
      }
    }
  };

  return {
    initializePage: async () => {
      try {
        await core.loadPageContent();
        await core.setPageTitle();

        await Promise.all([
          core.loadNavigation(),
          core.loadSubchapterNavigation()
        ]);

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

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', PageInitializer.initializePage);
} else {
  PageInitializer.initializePage();
}