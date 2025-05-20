import { navBarButton } from "../../navBar/script/navBar.js";
import { auth } from "../../firebase.js"; // import shared auth instance
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.7.0/firebase-auth.js";

document.addEventListener("DOMContentLoaded", () => {
  fetch("../navBar/navbar.html")
    .then((res) => res.text())
    .then((html) => {
      const processedHtml = html.replace(
        /href="([^"]*\/style\/navBar.css)"/,
        'href="../navBar/style/navBar.css"'
      );

      document.getElementById("navbar-container").innerHTML = processedHtml;

      navBarButton(auth);

      onAuthStateChanged(auth, (user) => {
        if (!user) {
          window.location.href = "../index.html";
        }
      });
    })
    .catch((err) => console.error("Navbar load error:", err));
});
