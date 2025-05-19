export function navBarButton() {
  document.addEventListener("click", (e) => {
    const target = e.target.closest("[data-target]");

    if (target) {
      e.preventDefault();
      const page = target.getAttribute("data-target");
      const routes = {
        Home: "../Home/home.html",
        wishList: "../wishlist/wishlist.html",
        cart: "../cart/cart.html",
        aboutUs: "../aboutUs/aboutUs.html",
        contactUs: "../contactUs/contactUs.html",
        signOut: "../index.html",
        profileHTML: "../profile/profile.html",
      };

      const path = routes[page];
      if (path) {
        window.location.href = path;
      }

      if (page === "signOut") {
        sessionStorage.clear();
        localStorage.clear();
        window.location.replace("../../index.html");
      }
    }
  });
}
