async function loadSubchapterNavigation() {
  // Select ALL elements with the class
  const navLinks = document.querySelectorAll('.subchapter-button');
  
  if (navLinks.length === 0) {
    console.warn('No elements with class ".subchapter-button" were found on the page.');
    return;
  }

  // Use a for...of loop to properly handle async/await per item
  for (const navLink of navLinks) {
    const folderPath = navLink.getAttribute('data-folder');

    if (!folderPath) {
      console.warn('A subchapter button is missing the "data-folder" attribute.', navLink);
      continue; // Skip this one and move to the next button
    }

    try {
      const baseFolder = folderPath.endsWith('/') ? folderPath : `${folderPath}/`;
      
      // Fetch the text file
      const response = await fetch(`${baseFolder}title.txt`);
      
      if (response.ok) {
        const titleText = await response.text();
        
        // Update the link and the text
        navLink.href = `${baseFolder}loader.html`;
        navLink.innerHTML = titleText.trim();
      } else {
        console.warn(`Could not load title from: ${baseFolder}title.txt (Status: ${response.status})`);
      }
    } catch (error) {
      console.error('Network error attempting to load subchapter navigation:', error);
    }
  }
}

// Expose and trigger
window.loadSubchapterNavigation = loadSubchapterNavigation;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => window.loadSubchapterNavigation());
} else {
  // If DOMContentLoaded already fired, run it immediately
  window.loadSubchapterNavigation();
}