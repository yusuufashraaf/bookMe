import { navBarButton } from "../../navBar/script/navBar.js";

document.addEventListener("DOMContentLoaded", () => {
  fetch("../navBar/navbar.html")
    .then((res) => {
      return res.text();
    })
    .then((html) => {
      document.getElementById("navbar-container").innerHTML = html;
      navBarButton();
    })
    .catch((err) => console.error("Navbar load error:", err));
});
