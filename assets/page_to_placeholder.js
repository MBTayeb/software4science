// Use JavaScript to fetch the external file and inject it
fetch("page.html")
  .then((response) => response.text())
  .then((data) => {
    document.getElementById("content-placeholder").innerHTML = data
  })
  .catch((error) => console.error("Error loading the HTML:", error))