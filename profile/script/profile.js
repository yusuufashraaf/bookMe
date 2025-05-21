// Import Firebase functions and navbar utility
import { getAllUsers, updateUser, getAllOrders } from "../../firebase.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/11.7.3/firebase-auth.js";
import { navBarButton } from "../../navBar/script/navBar.js";

// Initialize Firebase Auth
const auth = getAuth();

// DOM elements references
const emailInput = document.getElementById("emailInput");
const userNameInput = document.getElementById("usernameInput");
const updateBtn = document.getElementById("updateButton");
const profileSection = document.getElementById("edit-profile-section");
const ordersSection = document.getElementById("view-order-section");
const tableBody = document.getElementById("orders-table-body");

const editProfileBtn = document.getElementById("editProfileBtn");
const ordersBtn = document.getElementById("orders");
const signOutBtn = document.getElementById("signOutBtn");

// Validate email ends with .com
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.(com)$/.test(email);

// Get current authenticated user's UID
const getUserId = () =>
  new Promise((resolve) =>
    onAuthStateChanged(auth, (user) => resolve(user?.uid || null))
  );

// Main function after DOM loaded
document.addEventListener("DOMContentLoaded", async () => {
  try {
    // Load and inject navbar HTML, fix CSS path
    const res = await fetch("../navBar/navbar.html");
    const html = await res.text();
    document.getElementById("navbar-container").innerHTML = html.replace(
      /href="([^"]*\/style\/navBar.css)"/,
      'href="../navBar/style/navBar.css"'
    );
    navBarButton(auth);
  } catch (err) {
    console.error("Navbar load error:", err);
  }

  // Get authenticated user ID
  const userId = await getUserId();
  if (!userId) {
    window.location.href = "../../index.html";
    return;
  }

  // Fetch all users and find current user data
  const allUsers = await getAllUsers();
  const currentUser = allUsers.find((user) => user.uid === userId);
  if (!currentUser) return;

  // Populate form inputs with user data
  emailInput.value = currentUser.email;
  userNameInput.value = currentUser.name;

  // Sidebar button: Show Edit Profile section
  editProfileBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    profileSection.style.display = "block";
    ordersSection.style.display = "none";
  });

  // Sidebar button: Show Orders section and load orders
  ordersBtn?.addEventListener("click", async (e) => {
    e.preventDefault();
    profileSection.style.display = "none";
    ordersSection.style.display = "block";
    tableBody.innerHTML = "";

    try {
      const { orders } = await getAllOrders();
      const userOrders = orders.filter((order) => order.userId === userId);

      if (userOrders.length === 0) {
        tableBody.innerHTML =
          '<tr><td colspan="3" class="text-center">No orders found.</td></tr>';
        return;
      }

      userOrders.forEach(({ id, items, total }) => {
        const itemsList = items.itemsName
          .map((item, i) => `${i + 1}. ${item || "-"}`)
          .join("<br>");
        tableBody.innerHTML += `
          <tr>
            <td>${id}</td>
            <td>${itemsList}</td>
            <td>${total ?? "0.00"}</td>
          </tr>`;
      });
    } catch (err) {
      console.error("Error loading orders:", err);
    }
  });

  // Sign out button handler
  signOutBtn?.addEventListener("click", async (e) => {
    e.preventDefault();
    try {
      await signOut(auth);
      sessionStorage.clear();
      localStorage.clear();
      window.location.replace("../../index.html");
    } catch (err) {
      console.error("Error signing out:", err);
    }
  });

  // Update profile handler
  updateBtn?.addEventListener("click", async (e) => {
    e.preventDefault();

    const newEmail = emailInput.value.trim();
    const newName = userNameInput.value.trim();

    if (!isValidEmail(newEmail)) {
      alert("Please enter a valid .com email address.");
      return;
    }

    const emailTaken = allUsers.some(
      (user) => user.email === newEmail && user.uid !== userId
    );
    if (emailTaken) {
      alert("This email is already used by another account.");
      return;
    }

    try {
      await updateUser(currentUser.id, { email: newEmail, name: newName });
      alert("Profile updated!");
    } catch (err) {
      console.error("Error updating profile:", err);
      alert("Failed to update profile. Please try again.");
    }
  });
});

// Tooltip hover effect with 600ms hide delay
const navItems = document.querySelectorAll(".sidebar .nav-item");
let tooltipTimeout;

navItems.forEach((item) => {
  item.addEventListener("mouseenter", () => {
    clearTimeout(tooltipTimeout);
    navItems.forEach((i) => i.classList.remove("show-tooltip"));

    item.classList.add("show-tooltip");

    tooltipTimeout = setTimeout(() => {
      item.classList.remove("show-tooltip");
    }, 600);
  });
});
