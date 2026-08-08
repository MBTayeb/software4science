function loadTopics(placeholderId, topicsPath = "topics/page.html", is_parent = false) {
    fetch(topicsPath)
        .then((response) => response.text())
        .then((data) => {
            let fixedData = is_parent ? data.replaceAll('href="../', 'href="') : data;
            document.getElementById(placeholderId).innerHTML = fixedData;

            // Links are in the DOM now — safe to fill in titles
            fillTitlesFromFiles();
        })
        .catch((error) => console.error("Error loading the HTML:", error));
}

function fillTitlesFromFiles() {
    const links = document.querySelectorAll('ul.topics > li > a[href]');
    links.forEach((link) => {
        const href = link.getAttribute('href');
        if (!href) return;

        const base = href.endsWith('/') ? href : href + '/';
        const titleUrl = base + 'title.txt';

        fetch(titleUrl)
            .then((response) => {
                if (!response.ok) {
                    console.warn(`Could not load ${titleUrl}: ${response.status}`);
                    return null;
                }
                return response.text();
            })
            .then((text) => {
                if (text && text.trim()) {
                    link.textContent = text.trim();
                }
            })
            .catch((error) => console.warn(`Error fetching ${titleUrl}:`, error));
    });
}