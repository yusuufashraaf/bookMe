import { loadNavbar } from "../../navBar/script/navBar.js";
import { getAllUsers } from "../../firebase.js";
import {
  getAuth,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/11.7.3/firebase-auth.js";

const nameId = document.getElementById("name");
const emailId = document.getElementById("email");



// Wait for Firebase Auth to get current user
const auth = getAuth();
onAuthStateChanged(auth, async (user) => {
  if (user) {
    const uid = user.uid;
    try {
      const users = await getAllUsers();
      const currentUser = users.find((u) => u.uid === uid);
      if (currentUser) {
        nameId.value = currentUser.name;
        emailId.value = currentUser.email;
        nameId.disabled = true;
        nameId.addEventListener("keydown", (e) => e.preventDefault());
        nameId.addEventListener("focus", (e) => e.target.blur());
        emailId.disabled = true;
        emailId.addEventListener("keydown", (e) => e.preventDefault());
        emailId.addEventListener("focus", (e) => e.target.blur());
      }
    } catch (error) {
      console.error("Failed to get users:", error);
    }
  } else {
    console.log("No user logged in");
    window.location.href = "../../index.html";
  }
});

loadNavbar(auth);
