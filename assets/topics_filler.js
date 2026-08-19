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
        // Always fetch as if running from topics/ (one level deep) —
        // buildHTMLForContext corrects the paths afterward for root
        const manifest = await ManifestNav.getManifest('../');
        const items = await ManifestNav.buildTopicsList(manifest, '../');
        container.innerHTML = buildHTMLForContext(items, is_parent);
      } catch (error) {
        console.error("Error building topics list:", error);
        container.innerHTML = "<p>Error loading topics.</p>";
      }
    },
  };
})();
