const TopicsPage = (() => {
  const buildListHTML = (items) => {
    const rows = items
      .map((item) => {
        const subHTML = item.subchapters.length
          ? `<ul>
            ${item.subchapters
              .map(
                (sub) => `
              <li>
                <a href="../${sub.path}">${sub.title}</a>
              </li>
            `,
              )
              .join("")}
          </ul>`
          : "";
        return `
        <li>
          <a href="../${item.path}">${item.title}</a>
          ${subHTML}
        </li>`;
      })
      .join("");
    return `<ul class="topics">${rows}</ul>`;
  };

  const buildHTMLForContext = (items, is_parent = false) => {
    const html = buildListHTML(items);
    return is_parent ? html.replaceAll('href="../', 'href="') : html;
  };

  return {
    load: async (placeholderId, is_parent = false) => {
      const container = document.getElementById(placeholderId);
      if (!container) return;
      try {
        // Real fetch prefix depends on where this page actually is:
        // root page -> '', topics/ page -> '../'
        const fetchPrefix = is_parent ? '' : '../';

        const manifest = await ManifestNav.getManifest(fetchPrefix);
        const items = await ManifestNav.buildTopicsList(manifest, fetchPrefix);

        // buildListHTML always assumes '../' for the rendered links,
        // then buildHTMLForContext strips it back down for root
        container.innerHTML = buildHTMLForContext(items, is_parent);
      } catch (error) {
        console.error("Error building topics list:", error);
        container.innerHTML = "<p>Error loading topics.</p>";
      }
    },
  };
})();
