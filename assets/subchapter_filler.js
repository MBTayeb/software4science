const PageInitializer = (() => {
  const CONFIG = {
    CRITICAL_RESOURCES: [
      { name: 'pageContent', url: 'page.html' },
      { name: 'parentTitle', url: '../title.txt' }
    ],
    SELECTORS: {
      contentPlaceholder: '#content-placeholder',
      printedTitle: '#printed-title',
      printedSubTitle: '#printed-title-subchapter',
      parentNavContainer: '#parent-nav-container',
      subpageNavigation: '.subpage-navigation'
    },
    ERROR_MESSAGES: {
      loadFailed: 'Failed to load resource: ',
      initFailed: 'Error loading content. Please try refreshing the page.'
    }
  };

  const utils = {
    fetchResource: async (url, errorMsg) => {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`${errorMsg}${url}`);
      return response.text();
    },

    // Replaces a placeholder <div class="nav-link ...">
    // with a real <a> when a target + title exist; leaves it as-is otherwise
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
    /**
     * Builds and injects the parent chapter's own prev/next/toc nav
     * into #parent-nav-container, using the manifest instead of
     * fetching and parsing the parent's raw index.html
     */
    processParentNavigation: async (manifest, parentPath, parentTitleRaw) => {
      const container = document.querySelector(CONFIG.SELECTORS.parentNavContainer);
      if (!container || !parentPath) return;

      const { prev, next } = ManifestNav.getParentChapterNav(manifest, parentPath);

      const [prevTitle, nextTitle] = await Promise.all([
        prev ? ManifestNav.fetchText(`/${prev}title.txt`, true) : Promise.resolve(null),
        next ? ManifestNav.fetchText(`/${next}title.txt`, true) : Promise.resolve(null)
      ]);

      const prevHTML = prev && prevTitle
        ? `<a href="../../${prev}" class="nav-link prev"><div>${prevTitle}</div></a>`
        : `<div class="nav-link prev"></div>`;

      const nextHTML = next && nextTitle
        ? `<a href="../../${next}" class="nav-link next"><div>${nextTitle}</div></a>`
        : `<div class="nav-link next"></div>`;

      container.innerHTML = `
        <nav class="page-navigation">
          ${prevHTML}
          <a href="../../topics/" class="nav-link toc"><div>Table of Contents</div></a>
          ${nextHTML}
        </nav>`;
    },

    /**
     * Fills the subchapter's own prev/next (siblings within the same
     * parent) and the static parent link, using the manifest.
     */
    loadSubpageNavigation: async (manifest, parentPath, parentTitleRaw) => {
      const subpageNav = document.querySelector(CONFIG.SELECTORS.subpageNavigation);
      if (!subpageNav) return;

      const prevEl = subpageNav.querySelector('.nav-link.prev');
      const nextEl = subpageNav.querySelector('.nav-link.next');
      const parentEl = subpageNav.querySelector('.nav-link.parent');

      const { prev, next } = ManifestNav.getSubPrevNext(manifest);

      const [prevTitle, nextTitle] = await Promise.all([
        prev ? ManifestNav.fetchText(`/${parentPath}${prev}title.txt`, true) : Promise.resolve(null),
        next ? ManifestNav.fetchText(`/${parentPath}${next}title.txt`, true) : Promise.resolve(null)
      ]);

      if (prev) utils.replaceWithLink(prevEl, `../${prev}`, prevTitle);
      if (next) utils.replaceWithLink(nextEl, `../${next}`, nextTitle);

      // parent link already has href="../" statically in the HTML;
      // just fill its title, reusing the parentTitle we already fetched
      if (parentEl && parentTitleRaw) {
        const div = document.createElement('div');
        div.textContent = parentTitleRaw.trim();
        parentEl.appendChild(div);
      }
    },

    populateCurrentTitle: async () => {
      try {
        const title = await utils.fetchResource('title.txt', CONFIG.ERROR_MESSAGES.loadFailed);
        const trimmed = title.trim();
        document.title = trimmed;
        const h2 = document.querySelector(CONFIG.SELECTORS.printedSubTitle);
        if (h2) h2.textContent = trimmed;
      } catch (error) {
        console.error('Error fetching current title:', error);
      }
    }
  };

  return {
    initializePage: async () => {
      try {
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
    
        const h1 = document.querySelector(CONFIG.SELECTORS.printedTitle);
        if (h1) h1.innerHTML = `<a href="../">${resources.parentTitle.trim()}</a>`;
    
        const manifest = await ManifestNav.getManifest('../../');
        const { parentPath } = ManifestNav.getSubPrevNext(manifest);
    
        await core.processParentNavigation(manifest, parentPath, resources.parentTitle);
    
        await Promise.all([
          core.loadSubpageNavigation(manifest, parentPath, resources.parentTitle),
          core.populateCurrentTitle()
        ]);
    
        if (typeof hljs !== 'undefined') hljs.highlightAll();
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

document.addEventListener('DOMContentLoaded', PageInitializer.initializePage);