import { getAllUsers, updateUser } from "../../firebase.js";

// Get user ID from URL
const params = new URLSearchParams(window.location.search);
const id = params.get("id");

// DOM Elements
const emailInput = document.getElementById("emailInput");
const userNameInput = document.getElementById("usernameInput");
const updateBtn = document.getElementById("updateButton");

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

document.addEventListener("DOMContentLoaded", async () => {
  const editProfileBtn = document.getElementById("editProfileBtn");
  const signOutBtn = document.getElementById("signOutBtn");
  const content = document.getElementById("content");

  if (editProfileBtn) {
    editProfileBtn.addEventListener("click", (e) => {
      e.preventDefault();
      content.classList.add("loaded");
    });
  }

  if (signOutBtn) {
    signOutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      sessionStorage.clear();
      localStorage.clear();
      window.location.replace("../../index.html");
    });
  }

  try {
    const allUsers = await getAllUsers();
    const currentUser = allUsers.find((user) => user.uid === id);
    if (currentUser) {
      emailInput.value = currentUser.email;
      userNameInput.value = currentUser.name;
      updateBtn.addEventListener("click", async (e) => {
        e.preventDefault();
        const newEmail = emailInput.value.trim();
        const newName = userNameInput.value.trim();
        if (!isValidEmail(newEmail)) {
          alert("Please enter a valid email address.");
          return;
        }
        const emailExists = allUsers.some(
          (user) => user.email === newEmail && user.uid !== id
        );
        if (emailExists) {
          alert("This email is already used by another account.");
          return;
        }
        await updateUser(currentUser.id, {
          email: newEmail,
          name: newName,
        });
        alert("Profile updated!");
      });
    }
  } catch (error) {
  }
});

//navbar buttons
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
        window.location.href = `${path}?id=${id}`;
      }
      if (page === "signOut") {
        sessionStorage.clear();
        localStorage.clear();
        window.location.replace("../../index.html");
      }
    }
  });
}
navBarButton();