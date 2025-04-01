  // Wait for the DOM to load
  document.addEventListener("DOMContentLoaded", function () {
    const navToggle = document.getElementById("nav-toggle"); // Hamburger button
    const navMenu = document.getElementById("nav-menu"); // Navigation menu

    // Add click event listener to the hamburger button
    navToggle.addEventListener("click", function () {
      // Toggle the "show-menu" class on the navigation menu
      navMenu.classList.toggle("show-menu");
    });

    // Optional: Close the menu when a link is clicked (for single-page navigation)
    const navLinks = document.querySelectorAll(".nav__link");
    navLinks.forEach((link) => {
      link.addEventListener("click", function () {
        navMenu.classList.remove("show-menu");
      });
    });
  });