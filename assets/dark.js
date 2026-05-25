const toggleButton = document.getElementById("theme-toggle");

// 1. Check if the user has a saved preference from a previous visit
const savedTheme = localStorage.getItem("theme");

// 2. Check if their OS/system is set to dark mode
const systemPrefersDark = window.matchMedia(
  "(prefers-color-scheme: dark)"
).matches;

// 3. Determine the starting theme & set initial button text
// Priority: Saved Preference > System Preference > Default (Light)
if (savedTheme === "dark" || (!savedTheme && systemPrefersDark)) {
  document.body.classList.add("dark-mode");
  toggleButton.textContent = "Switch to Light Mode"; // Set correct text on load
} else {
  toggleButton.textContent = "Switch to Dark Mode";  // Set correct text on load
}

// 4. Handle the button click (Combined Logic)
toggleButton.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");

  // Check the actual state of the body to update localStorage AND text
  if (document.body.classList.contains("dark-mode")) {
    localStorage.setItem("theme", "dark");
    toggleButton.textContent = "Switch to Light Mode";
  } else {
    localStorage.setItem("theme", "light");
    toggleButton.textContent = "Switch to Dark Mode";
  }
});