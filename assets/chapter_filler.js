const PageInitializer = (() => {
  const CONFIG = {
    RESOURCES: [
      { name: 'pageContent', url: 'page.html' },
      { name: 'title', url: 'title.txt' },
    ],
    SELECTORS: {
      contentPlaceholder: '#content-placeholder',
      printedTitle: '#printed-title',
      navLinkPrev: '.page-navigation > .nav-link.prev',
      navLinkNext: '.page-navigation > .nav-link.next',
      subchapterList: '#subchapter-list'
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
    }
  };

  const core = {
    loadPageContent: async () => {
      const content = await utils.fetchResource(
        CONFIG.RESOURCES.find(r => r.name === 'pageContent').url,
        CONFIG.ERROR_MESSAGES.loadFailed
      );
      const placeholder = document.querySelector(CONFIG.SELECTORS.contentPlaceholder);
      if (placeholder) placeholder.insertAdjacentHTML('afterbegin', content);
    },

    setPageTitle: async () => {
      const title = await utils.fetchResource(
        CONFIG.RESOURCES.find(r => r.name === 'title').url,
        CONFIG.ERROR_MESSAGES.loadFailed
      );
      document.title = title.trim();
      const heading = document.querySelector(CONFIG.SELECTORS.printedTitle);
      if (heading) heading.textContent = title.trim();
    },

    loadNavigation: async (manifest) => {
      const [prevEl, nextEl] = [
        document.querySelector(CONFIG.SELECTORS.navLinkPrev),
        document.querySelector(CONFIG.SELECTORS.navLinkNext)
      ];

      const { prev, next } = ManifestNav.getPrevNext(manifest);

      const [prevTitle, nextTitle] = await Promise.all([
        prev ? ManifestNav.fetchText(`/${prev}title.txt`, true) : Promise.resolve(null),
        next ? ManifestNav.fetchText(`/${next}title.txt`, true) : Promise.resolve(null)
      ]);

      if (prev) utils.replaceWithLink(prevEl, `../${prev}`, prevTitle);
      if (next) utils.replaceWithLink(nextEl, `../${next}`, nextTitle);
    },

    loadSubchapterList: async (manifest) => {
      const container = document.querySelector(CONFIG.SELECTORS.subchapterList);
      if (!container) return;

      const currentEntry = manifest.find(entry => window.location.pathname.endsWith(`/${entry.path}`));
      const subchapters = currentEntry?.subchapters || [];
      if (subchapters.length === 0) return;

      const titles = await Promise.all(
        subchapters.map(sub => ManifestNav.fetchText(`${sub}title.txt`, true))
      );

      container.innerHTML = subchapters.map((sub, i) => `
        <div class="subchapter-container">
          <a href="./${sub}" class="subchapter-button">${titles[i] || sub}</a>
        </div>
      `).join('');
    },

    highlightCode: () => {
      if (typeof hljs !== 'undefined') hljs.highlightAll();
    }
  };

  return {
    initializePage: async () => {
      try {
        await core.loadPageContent();
        await core.setPageTitle();

        const manifest = await ManifestNav.getManifest();

        await Promise.all([
          core.loadNavigation(manifest),
          core.loadSubchapterList(manifest)
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