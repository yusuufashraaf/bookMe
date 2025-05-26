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

export async function loadNavbar(auth, isHome = false) {
  try {
    let res = await fetch("../navBar/navbar.html");
    let html = await res.text();

    // Fix relative path to navBar CSS
    html = html.replace(
      /href="([^"]*\/style\/navBar.css)"/,
      'href="../navBar/style/navBar.css"'
    );

    // If it's the Home page, add search input + button
    if (isHome) {
      html = html.replace(
        '<ul class="navbar-nav ms-auto">',
        `
          <input class="search" type="search" id="searchInput" placeholder="Search" aria-label="Search" />
          <button class="btnn" id="searchBtn" type="submit">Search</button>
          <ul class="navbar-nav ms-auto">
        `
      );
    }

    document.getElementById("navbar-container").innerHTML = html;
    navBarButton(auth);
    
    if (isHome) setupSearch();
  } catch (error) {
    console.error("Navbar load error:", error);
  }
}

