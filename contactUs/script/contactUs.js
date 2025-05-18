import { navBarButton } from "../../profile/script/profile.js";
import { getAllUsers } from "../../profile/script/index.js";

const params = new URLSearchParams(window.location.search);
const id = params.get("id");
const nameId = document.getElementById("name");
const emailId = document.getElementById("email");
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

getAllUsers().then((users) => {
  const currentUser = users.find((user) => user.uid === id);
  if (currentUser) {
    console.log(currentUser);
    nameId.value = currentUser.name;
    emailId.value = currentUser.email;
    nameId.disabled = true;
    nameId.addEventListener("keydown", (e) => e.preventDefault());
    nameId.addEventListener("focus", (e) => e.target.blur());
    emailId.disabled = true;
    emailId.addEventListener("keydown", (e) => e.preventDefault());
    emailId.addEventListener("focus", (e) => e.target.blur());
  }
});
