import { getAllUsers, updateUser, getAllOrders } from "../../firebase.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/11.7.3/firebase-auth.js";
import { navBarButton } from "../../navBar/script/navBar.js";

const auth = getAuth();

// DOM refs
const emailInput = document.getElementById("emailInput");
const userNameInput = document.getElementById("usernameInput");
const updateBtn = document.getElementById("updateButton");
const profileSection = document.getElementById("edit-profile-section");
const ordersSection = document.getElementById("view-order-section");
const tableBody = document.getElementById("orders-table-body");
const editProfileBtn = document.getElementById("editProfileBtn");
const ordersBtn = document.getElementById("orders");
const signOutBtn = document.getElementById("signOutBtn");

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.com$/.test(email);

const getUserId = () =>
  new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      resolve(user?.uid || null);
      unsubscribe();
    });
  });

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

function renderOrders(orders) {
  if (!orders.length) {
    tableBody.innerHTML = `<tr><td colspan="3" class="text-center">No orders found.</td></tr>`;
    return;
  }
  tableBody.innerHTML = orders
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

function toggleSections(showProfile) {
  profileSection.style.display = showProfile ? "block" : "none";
  ordersSection.style.display = showProfile ? "none" : "block";
}

function initTooltipHover() {
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
}

document.addEventListener("DOMContentLoaded", async () => {
  await loadNavbar();

  const userId = await getUserId();
  if (!userId) return window.location.replace("../../index.html");

  const allUsers = await getAllUsers();
  const currentUser = allUsers.find((u) => u.uid === userId);
  if (!currentUser) return;

  emailInput.value = currentUser.email;
  userNameInput.value = currentUser.name;

  editProfileBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    toggleSections(true);
  });

  ordersBtn?.addEventListener("click", async (e) => {
    e.preventDefault();
    toggleSections(false);
    tableBody.innerHTML = "";
    try {
      const { orders } = await getAllOrders();
      renderOrders(orders.filter((o) => o.userId === userId));
    } catch (e) {
      console.error("Error loading orders:", e);
    }
  });

  signOutBtn?.addEventListener("click", async (e) => {
    e.preventDefault();
    try {
      await signOut(auth);
      sessionStorage.clear();
      localStorage.clear();
      window.location.replace("../../index.html");
    } catch (e) {
      console.error("Error signing out:", e);
    }
  });

  updateBtn?.addEventListener("click", async (e) => {
    e.preventDefault();
    const newEmail = emailInput.value.trim();
    const newName = userNameInput.value.trim();

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

  initTooltipHover();
});
