// navBar.js
import {
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/11.7.3/firebase-auth.js";

export function navBarButton(auth) {
  onAuthStateChanged(auth, (user) => {
    if (!user) {
      window.location.replace("../../index.html");
    }
  });

  document.addEventListener("click", async (e) => {
    const target = e.target.closest("[data-target]");
    if (!target) return;

    e.preventDefault();
    const page = target.getAttribute("data-target");
    if (page === "signOut") {
      await signOut(auth);
      sessionStorage.clear();
      window.location.replace("../../index.html");
      return;
    }

    const routes = {
      Home: "../Home/home.html",
      wishList: "../wishlist/wishlist.html",
      cart: "../cart/cart.html",
      aboutUs: "../aboutUs/aboutUs.html",
      contactUs: "../contactUs/contactUs.html",
      profileHTML: "../profile/profile.html",
    };

    if (routes[page]) window.location.href = routes[page];
  });
}

export async function loadNavbar(auth) {
  try {
    const res = await fetch("../navBar/navbar.html");
    let html = await res.text();
    html = html.replace(
      /href="([^"]*\/style\/navBar.css)"/,
      'href="../navBar/style/navBar.css"'
    );

    document.getElementById("navbar-container").innerHTML = html;

    setTimeout(() => {
      navBarButton(auth);
    }, 0);
  } catch (e) {
    console.error("Navbar load error:", e);
  }
}

export async function loadHomeNavbar(auth) {
  try {
    const res = await fetch("../navBar/navbar.html");
    let html = await res.text();    
    // Correct the relative path to navbar CSS
    html = html.replace(
      /href="([^"]*\/style\/navBar.css)"/,
      'href="../navBar/style/navBar.css"'
    );
    
    // Inject search input and button into navbar
    html = html.replace(
      '<ul class="navbar-nav ms-auto">',
      `
        <input class="search" type="search" id="searchInput" placeholder="Search" aria-label="Search" />
        <button class="btnn" id="searchBtn" type="submit">Search</button>
        <ul class="navbar-nav ms-auto">
      `
    );

    // Set the final navbar HTML
    document.getElementById("navbar-container").innerHTML = html;

    // Initialize navbar button and search functionality
    navBarButton(auth);
    setupSearch();
  } catch (error) {
    console.error("Navbar load error:", error);
  }
};

