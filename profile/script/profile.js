// Import functions and modules from Firebase and local files
import { getAllUsers, updateUser, getAllOrders } from "../../firebase.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/11.7.3/firebase-auth.js";
import { navBarButton } from "../../navBar/script/navBar.js";

// Initialize Firebase Auth
const auth = getAuth();

// DOM element references grouped in an object
const DOM = {
  emailInput: document.getElementById("emailInput"),
  userNameInput: document.getElementById("usernameInput"),
  updateBtn: document.getElementById("updateButton"),
  profileSection: document.getElementById("edit-profile-section"),
  ordersSection: document.getElementById("view-order-section"),
  tableBody: document.getElementById("orders-table-body"),
  editProfileBtn: document.getElementById("editProfileBtn"),
  ordersBtn: document.getElementById("orders"),
  signOutBtn: document.getElementById("signOutBtn"),
};

// Email validation function (checks for .com domain)
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.com$/.test(email);

// Get currently logged-in user's UID
const getUserId = () =>
  new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      resolve(user?.uid || null);
      unsubscribe();
    });
  });

// Load navbar HTML and insert it into the page
async function loadNavbar() {
  try {
    const res = await fetch("../navBar/navbar.html");
    let html = await res.text();
    html = html.replace(
      /href="([^"]*\/style\/navBar.css)"/,
      'href="../navBar/style/navBar.css"'
    );
    document.getElementById("navbar-container").innerHTML = html;
    navBarButton(auth);
  } catch (e) {
    console.error("Navbar load error:", e);
  }
}

// Render order data into the orders table
function renderOrders(orders) {
  if (!orders.length) {
    DOM.tableBody.innerHTML = `<tr><td colspan="3" class="text-center">No orders found.</td></tr>`;
    return;
  }
  DOM.tableBody.innerHTML = orders
    .map(({ id, items, total }) => {
      const list = items.itemsName
        .map((it, i) => `${i + 1}. ${it || "-"}`)
        .join("<br>");
      return `<tr><td>${id}</td><td>${list}</td><td>${
        total ?? "0.00"
      }</td></tr>`;
    })
    .join("");
}

// Toggle between profile editing section and order viewing section
function toggleSections(showProfile) {
  DOM.profileSection.style.display = showProfile ? "block" : "none";
  DOM.ordersSection.style.display = showProfile ? "none" : "block";
}

// Initialize tooltip hover effect for sidebar navigation
(function initTooltipHover() {
  const navItems = document.querySelectorAll(".sidebar .nav-item");
  let timeout;
  navItems.forEach((item) => {
    item.addEventListener("mouseenter", () => {
      clearTimeout(timeout);
      navItems.forEach((i) => i.classList.remove("show-tooltip"));
      item.classList.add("show-tooltip");
      timeout = setTimeout(() => item.classList.remove("show-tooltip"), 600);
    });
  });
})()

// Main script execution after DOM is fully loaded
document.addEventListener("DOMContentLoaded", async () => {
  // Load the navigation bar
  await loadNavbar();

  // Get current user's ID and redirect if not logged in
  const userId = await getUserId();
  if (!userId) return window.location.replace("../../index.html");

  // Get all users and find the current user
  const allUsers = await getAllUsers();
  const currentUser = allUsers.find((u) => u.uid === userId);
  if (!currentUser) return;

  // Prefill the profile form with current user's data
  DOM.emailInput.value = currentUser.email;
  DOM.userNameInput.value = currentUser.name;

  // Event listener to show profile edit section
  DOM.editProfileBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    toggleSections(true);
  });

  // Event listener to show order history section and fetch orders
  DOM.ordersBtn?.addEventListener("click", async (e) => {
    e.preventDefault();
    toggleSections(false);
    DOM.tableBody.innerHTML = "";
    try {
      const { orders } = await getAllOrders();
      renderOrders(orders.filter((o) => o.userId === userId));
    } catch (e) {
      console.error("Error loading orders:", e);
    }
  });

  // Event listener to handle sign-out functionality
  DOM.signOutBtn?.addEventListener("click", async (e) => {
    e.preventDefault();
    try {
      await signOut(auth);
      sessionStorage.clear();
      window.location.replace("../../index.html");
    } catch (e) {
      console.error("Error signing out:", e);
    }
  });

  // Event listener for updating user profile
  DOM.updateBtn?.addEventListener("click", async (e) => {
    e.preventDefault();
    const newEmail = DOM.emailInput.value.trim();
    const newName = DOM.userNameInput.value.trim();

    if (!isValidEmail(newEmail))
      return alert("Please enter a valid .com email address.");
    if (allUsers.some((u) => u.email === newEmail && u.uid !== userId))
      return alert("Email already used.");

    try {
      await updateUser(currentUser.id, { email: newEmail, name: newName });
      alert("Profile updated!");
    } catch (e) {
      console.error("Error updating profile:", e);
      alert("Failed to update profile.");
    }
  });

});
