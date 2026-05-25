async function loadDynamicNavigation() {
  const links = {
    prev: {
      el: document.querySelector('.nav-link.prev'),
      format: (text) => `<div>${text}</div>`
    },
    next: {
      el: document.querySelector('.nav-link.next'),
      format: (text) => `<div>${text}</div>`
    }
  };

  // Process both links dynamically
  for (const [key, config] of Object.entries(links)) {
    if (!config.el) continue;

    // Grab the path specified in the data-folder attribute
    const folderPath = config.el.getAttribute('data-folder');

    // If the attribute isn't there, leave the link hidden and move on
    if (!folderPath) continue;

    try {
      // Ensure the path ends with a slash for safety
      const baseFolder = folderPath.endsWith('/') ? folderPath : `${folderPath}/`;
      
      // Fetch the text file from the folder
      const response = await fetch(`${baseFolder}title.txt`);
      
      if (response.ok) {
        const titleText = await response.text();
        
        // Update href to target the loader.html inside that folder
        config.el.href = `${baseFolder}loader.html`;
        
        // FIXED: Changed textContent to innerHTML so the browser parses the <div> tag
        config.el.innerHTML = config.format(titleText.trim());
        
      } else {
        console.warn(`Could not load title from: ${baseFolder}title.txt (Status: ${response.status})`);
      }
    } catch (error) {
      console.error(`Network error attempting to load navigation for ${key}:`, error);
    }
  }
}

window.loadDynamicNavigation = loadDynamicNavigation;
// ADD THIS: Automatically trigger the function when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  window.loadDynamicNavigation();
});