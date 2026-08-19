const TopicsPage = (() => {
  // Builds the nested list HTML with paths relative to topics/
  // (i.e. every link prefixed with "../", since topics/ is one level deep)
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

  // is_parent = true when embedding at root index.html (depth 0),
  // which needs paths one level shallower than topics/ itself (depth 1)
  const buildHTMLForContext = (items, is_parent = false) => {
    const html = buildListHTML(items);
    return is_parent ? html.replaceAll('href="../', 'href="') : html;
  };

  return {
    // placeholderId: id of the element to inject into
    // is_parent: true when calling from root index.html, false from topics/index.html
    load: async (placeholderId, is_parent = false) => {
      const container = document.getElementById(placeholderId);
      if (!container) return;

      try {
        const manifest = await ManifestNav.getManifest();
        const items = await ManifestNav.buildTopicsList(manifest);
        container.innerHTML = buildHTMLForContext(items, is_parent);
      } catch (error) {
        console.error("Error building topics list:", error);
        container.innerHTML = "<p>Error loading topics.</p>";
      }
    },
  };
})();
