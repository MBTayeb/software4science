async function loadSubpageNavigation() {
  // Target links specifically inside the .subpage-navigation container
  const links = {
    prev: {
      el: document.querySelector('.subpage-navigation > .nav-link.prev'),
      format: (text) => `<div>${text}</div>`
    },
    parent: {
      el: document.querySelector('.subpage-navigation > .nav-link.parent'),
      format: (text) => `<div>${text}</div>`
    },
    next: {
      el: document.querySelector('.subpage-navigation > .nav-link.next'),
      format: (text) => `<div>${text}</div>`
    }
  };

  // Process all three links dynamically
  for (const [key, config] of Object.entries(links)) {
    if (!config.el) continue;

    // Grab the path specified in the data-folder attribute
    const folderPath = config.el.getAttribute('data-folder');

    try {
      // Ensure the path ends with a slash for safety
      const baseFolder = folderPath.endsWith('/') ? folderPath : `${folderPath}/`;
      
      // Fetch the text file from the target subchapter folder
      const response = await fetch(`${baseFolder}title.txt`);
      
      if (response.ok) {
        const titleText = await response.text();
        
        // Update href to target the loader.html inside that subchapter folder
        config.el.href = `${baseFolder}loader.html`;
        
        // Inject the structured HTML format
        config.el.innerHTML = config.format(titleText.trim());
        
        // Make sure it's visible in case CSS or previous logic hid it
        config.el.style.visibility = 'visible';
        
      } else {
        console.warn(`Could not load subchapter title from: ${baseFolder}title.txt (Status: ${response.status})`);
      }
    } catch (error) {
      console.error(`Network error attempting to load subchapter navigation for ${key}:`, error);
    }
  }
}

// Attach to window object
window.loadSubpageNavigation = loadSubpageNavigation;

// Trigger automatically when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  window.loadSubpageNavigation();
});