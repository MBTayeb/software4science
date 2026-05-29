async function populateTitles() {
    try {
        // 1. Fetch and set the document <title> from the current directory
        const currentTitleResponse = await fetch('title.txt');
        if (currentTitleResponse.ok) {
            const pageTitle = await currentTitleResponse.text();
            document.title = pageTitle.trim();
        }

        // 2. Fetch the parent title from '../title.txt'
        const parentTitleResponse = await fetch('../title.txt');
        if (parentTitleResponse.ok) {
            const parentTitle = await parentTitleResponse.text();

            // 3. Find your H1 element by ID
            const h1Element = document.getElementById('printed-title');
            
            if (h1Element) {
                // 4. Clear "Loading ..." and inject the anchor tag
                h1Element.innerHTML = `<a href="../loader.html">${parentTitle.trim()}</a>`;
            }
        }
    } catch (error) {
        console.error('Error fetching title files:', error);
    }
}

// Run the function as soon as the DOM is ready
document.addEventListener('DOMContentLoaded', populateTitles);