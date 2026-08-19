const ManifestNav = (() => {
  const MANIFEST_URL = '/manifest.json';

  // --- utils ---
  const utils = {
    fetchJSON: async (url) => {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Failed to load ${url} (Status: ${res.status})`);
      return res.json();
    },

    fetchText: async (url, optional = false) => {
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error();
        return (await res.text()).trim();
      } catch {
        if (!optional) throw new Error(`Failed to load ${url}`);
        return null;
      }
    },

    currentPath: () => window.location.pathname,

    // matches a manifest path (e.g. "recipes/") against the current URL
    matchesCurrent: (path) => {
      const current = utils.currentPath();
      return current.endsWith(`/${path}`) || current.endsWith(path);
    }
  };

  // --- core lookups ---
  const core = {
    flattenChapters: (manifest) => manifest.map(ch => ch.path),

    findChapterIndex: (manifest) => {
      const chapters = core.flattenChapters(manifest);
      return chapters.findIndex(utils.matchesCurrent);
    },

    // chapter-level prev/next (top-level chapters only)
    getPrevNext: (manifest) => {
      const chapters = core.flattenChapters(manifest);
      const idx = core.findChapterIndex(manifest);
      if (idx === -1) return { prev: null, next: null };
      return {
        prev: idx > 0 ? chapters[idx - 1] : null,
        next: idx < chapters.length - 1 ? chapters[idx + 1] : null
      };
    },

    // subchapter-level prev/next, scoped within its parent chapter
    getSubPrevNext: (manifest) => {
      for (const entry of manifest) {
        const subs = entry.subchapters || [];
        const idx = subs.findIndex(utils.matchesCurrent);
        if (idx !== -1) {
          return {
            parentPath: entry.path,
            prev: idx > 0 ? subs[idx - 1] : null,
            next: idx < subs.length - 1 ? subs[idx + 1] : null
          };
        }
      }
      return { parentPath: null, prev: null, next: null };
    },

    // the parent chapter's own prev/next (for a subchapter's #parent-nav-container)
    getParentChapterNav: (manifest, parentPath) => {
      const chapters = core.flattenChapters(manifest);
      const idx = chapters.indexOf(parentPath);
      if (idx === -1) return { prev: null, next: null };
      return {
        prev: idx > 0 ? chapters[idx - 1] : null,
        next: idx < chapters.length - 1 ? chapters[idx + 1] : null
      };
    },

    // full nested structure with titles, for the topics page
    buildTopicsList: async (manifest) => {
      const items = [];
      for (const entry of manifest) {
        const title = await utils.fetchText(`/${entry.path}title.txt`, true);
        const subs = [];
        for (const sub of entry.subchapters || []) {
          const subTitle = await utils.fetchText(`/${entry.path}${sub}title.txt`, true);
          subs.push({ path: `${entry.path}${sub}`, title: subTitle || sub });
        }
        items.push({ path: entry.path, title: title || entry.path, subchapters: subs });
      }
      return items;
    }
  };

  return {
    getManifest: () => utils.fetchJSON(MANIFEST_URL),
    fetchText: utils.fetchText,
    getPrevNext: core.getPrevNext,
    getSubPrevNext: core.getSubPrevNext,
    getParentChapterNav: core.getParentChapterNav,
    buildTopicsList: core.buildTopicsList
  };
})();