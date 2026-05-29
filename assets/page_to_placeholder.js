// Use JavaScript to fetch the external file and inject it at the beginning
fetch("page.html")
  .then((response) => response.text())
  .then((data) => {
    // 'afterbegin' inserts the HTML just inside the element, before its first child
    document.getElementById("content-placeholder").insertAdjacentHTML('afterbegin', data);
  })
  .catch((error) => console.error("Error loading the HTML:", error));