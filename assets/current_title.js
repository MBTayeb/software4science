fetch("title.txt")
  .then((response) => response.text())
  .then((text) => {
    const cleanText = text.trim()
    
    // 1. Update the browser tab title
    document.title = cleanText
    
    // 2. Update the H1 heading on the page
    const heading = document.getElementById("printed-title")
    if (heading) {
      heading.textContent = cleanText
    }
  })
  .catch((error) => {
    console.error("Error loading title:", error)
    
    // Fallbacks if the text file fails to load
    document.title = "Default Title"
    const heading = document.getElementById("page-title")
    if (heading) {
      heading.textContent = "Welcome"
    }
  })