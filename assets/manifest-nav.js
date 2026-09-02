const ManifestNav = (() => {
  const utils = {
    fetchJSON: async (url) => {
      const res = await fetch(url);
      if (!res.ok)
        throw new Error(`Failed to load ${url} (Status: ${res.status})`);
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

    matchesCurrent: (path) => {
      const current = utils.currentPath();
      return current.endsWith(`/${path}`) || current.endsWith(path);
    },
  };

  const core = {
    flattenChapters: (manifest) => manifest.map((ch) => ch.path),

    findChapterIndex: (manifest) => {
      const chapters = core.flattenChapters(manifest);
      return chapters.findIndex(utils.matchesCurrent);
    },

    getPrevNext: (manifest) => {
      const chapters = core.flattenChapters(manifest);
      const idx = core.findChapterIndex(manifest);
      if (idx === -1) return {prev: null, next: null};
      return {
        prev: idx > 0 ? chapters[idx - 1] : null,
        next: idx < chapters.length - 1 ? chapters[idx + 1] : null,
      };
    },

    getSubPrevNext: (manifest) => {
      for (const entry of manifest) {
        const subs = entry.subchapters || [];
        const idx = subs.findIndex(utils.matchesCurrent);
        if (idx !== -1) {
          return {
            parentPath: entry.path,
            prev: idx > 0 ? subs[idx - 1] : null,
            next: idx < subs.length - 1 ? subs[idx + 1] : null,
          };
        }
      }
      return {parentPath: null, prev: null, next: null};
    },

    getParentChapterNav: (manifest, parentPath) => {
      const chapters = core.flattenChapters(manifest);
      const idx = chapters.indexOf(parentPath);
      if (idx === -1) return {prev: null, next: null};
      return {
        prev: idx > 0 ? chapters[idx - 1] : null,
        next: idx < chapters.length - 1 ? chapters[idx + 1] : null,
      };
    },

    // rootPrefix: relative path back to site root from the calling page
    // (e.g. '' at root, '../' from a chapter, '../../' from a subchapter)
    buildTopicsList: async (manifest, rootPrefix) => {
      const items = await Promise.all(
        manifest.map(async (entry) => {
          const [title, subs] = await Promise.all([
            utils.fetchText(`${rootPrefix}${entry.path}title.txt`, true),
            Promise.all(
              (entry.subchapters || []).map(async (sub) => {
                const subTitle = await utils.fetchText(
                  `${rootPrefix}${entry.path}${sub}title.txt`,
                  true,
                );
                return {path: `${entry.path}${sub}`, title: subTitle || sub};
              }),
            ),
          ]);
          return {
            path: entry.path,
            title: title || entry.path,
            subchapters: subs,
          };
        }),
      );
      return items;
    },
  };

  return {
    // rootPrefix: relative path back to site root from the calling page
    getManifest: (rootPrefix) => utils.fetchJSON(`${rootPrefix}manifest.json`),
    fetchText: utils.fetchText,
    getPrevNext: core.getPrevNext,
    getSubPrevNext: core.getSubPrevNext,
    getParentChapterNav: core.getParentChapterNav,
    buildTopicsList: core.buildTopicsList,
  };
})();
