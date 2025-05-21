// Import Firebase functions and nav bar utility
import { getAllUsers, updateUser, getAllOrders } from "../../firebase.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/11.7.3/firebase-auth.js";
import { navBarButton } from "../../navBar/script/navBar.js";

// Initialize Firebase auth
const auth = getAuth();

// Get references to DOM elements
const emailInput = document.getElementById("emailInput");
const userNameInput = document.getElementById("usernameInput");
const updateBtn = document.getElementById("updateButton");
const profileSection = document.getElementById("edit-profile-section");
const ordersSection = document.getElementById("view-order-section");
const tableBody = document.getElementById("orders-table-body");

const editProfileBtn = document.getElementById("editProfileBtn");
const ordersBtn = document.getElementById("orders");
const signOutBtn = document.getElementById("signOutBtn");

// Validate email to end in .com
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.(com)$/.test(email);

// Returns currently authenticated user's UID
const getUserId = () =>
  new Promise((resolve) =>
    onAuthStateChanged(auth, (user) => resolve(user?.uid || null))
  );

// Main script runs after DOM content is loaded
document.addEventListener("DOMContentLoaded", async () => {
  try {
    // Load and insert navbar HTML, adjust CSS path
    const res = await fetch("../navBar/navbar.html");
    const html = await res.text();
    document.getElementById("navbar-container").innerHTML = html.replace(
      /href="([^"]*\/style\/navBar.css)"/,
      'href="../navBar/style/navBar.css"'
    );
    navBarButton(auth); // Attach navbar logic
  } catch (err) {
    console.error("Navbar load error:", err);
  }

  // Get current authenticated user's ID
  const userId = await getUserId();
  if (!userId) return (window.location.href = "../../index.html");

  // Get user info from DB
  const allUsers = await getAllUsers();
  const currentUser = allUsers.find((user) => user.uid === userId);
  if (!currentUser) return;

  // Populate form with current user's data
  emailInput.value = currentUser.email;
  userNameInput.value = currentUser.name;

  // Handle "Profile" button click
  editProfileBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    profileSection.style.display = "block";
    ordersSection.style.display = "none";
  });

  // Handle "Orders" button click
  ordersBtn?.addEventListener("click", async (e) => {
    e.preventDefault();
    profileSection.style.display = "none";
    ordersSection.style.display = "block";
    tableBody.innerHTML = "";

    try {
      const { orders } = await getAllOrders();
      const userOrders = orders.filter((order) => order.userId === userId);

      // Show message if no orders
      if (userOrders.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="3" class="text-center">No orders found.</td></tr>`;
        return;
      }

      // Insert order rows
      userOrders.forEach(({ id, items, total }) => {
        const itemsList = items.itemsName
          .map((item, i) => `${i + 1}. ${item || "-"}`)
          .join("<br>");
        tableBody.innerHTML += `
          <tr>
            <td>${id}</td>
            <td>${itemsList}</td>
            <td>${total || "0.00"}</td>
          </tr>`;
      });
    } catch (err) {
      console.error("Error loading orders:", err);
    }
  });

  // Handle sign out button
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

  // Handle profile update form submit
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

    // Update user in database
    await updateUser(currentUser.id, { email: newEmail, name: newName });
    alert("Profile updated!");
  });
});
