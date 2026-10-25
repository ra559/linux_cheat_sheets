
document.addEventListener("DOMContentLoaded", () => {
  const button = document.querySelector("#back-to-top");

  // Stop if the button does not exist in the HTML.
  if (!button) {
    console.error("Back-to-top button not found in the HTML.");
    return;
  }

  // Show the button after scrolling down 300 pixels.
  function updateButtonVisibility() {
    button.classList.toggle("is-visible", window.scrollY > 300);
  }

  // Update visibility when the user scrolls.
  window.addEventListener("scroll", updateButtonVisibility, {
    passive: true
  });

  // Scroll smoothly to the top when clicked.
  button.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  });

  // Set the correct visibility when the page loads.
  updateButtonVisibility();
});
