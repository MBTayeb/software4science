fetch("../loader.html")
  .then(response => response.text())
  .then(html => {
    const temp = document.createElement('div');
    temp.innerHTML = html;
    const nav = temp.querySelector('nav.page-navigation');

    if (nav) {
      // Simple path replacement
      const navHtml = nav.outerHTML.replaceAll('="../', '="../../');
      document.getElementById('parent-nav-container').innerHTML = navHtml;

      // Only load dynamic navigation after the nav is inserted
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadDynamicNavigation);
      } else {
        loadDynamicNavigation();
      }
    }
  })
  .catch(error => console.error("Error loading navigation:", error));

// Dynamic navigation function
async function loadDynamicNavigation() {
  const links = {
    prev: {
      el: document.querySelector('.page-navigation > .nav-link.prev'),
      format: (text) => `<div>${text}</div>`
    },
    next: {
      el: document.querySelector('.page-navigation > .nav-link.next'),
      format: (text) => `<div>${text}</div>`
    }
  };

  for (const [key, config] of Object.entries(links)) {
    if (!config.el) continue;

    const folderPath = config.el.getAttribute('data-folder');
    if (!folderPath) continue;

    try {
      const baseFolder = folderPath.endsWith('/') ? folderPath : `${folderPath}/`;
      const response = await fetch(`${baseFolder}title.txt`);

      if (response.ok) {
        const titleText = await response.text();
        config.el.href = `${baseFolder}loader.html`;
        config.el.innerHTML = config.format(titleText.trim());
      }
    } catch (error) {
      console.error(`Error loading ${key} navigation:`, error);
    }
  }
}