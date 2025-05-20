// Firebase SDK imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { navBarButton } from "../../navBar/script/navBar.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCxY-KJ8H1m-9DO2_fs5qLo9MEwb7PiHVY",
  authDomain: "book-me-a6d98.firebaseapp.com",
  projectId: "book-me-a6d98",
  storageBucket: "book-me-a6d98.appspot.com",
  messagingSenderId: "162115788301",
  appId: "1:162115788301:web:fe46d6ed06f95fc2f87f44",
  measurementId: "G-DEXMQ2FKFM",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Dynamically fetch wishlist for logged-in user
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("User is logged in:", user);
    fetchWishlist(user.uid);
  } else {
    console.warn("User not logged in");
    // Optionally redirect to login page
    // window.location.href = "/login.html";
  }
});

document.addEventListener("DOMContentLoaded", () => {
  fetch("../navBar/navbar.html")
    .then((response) => response.text())
    .then((html) => {
      // Fix CSS link path inside navbar.html before inserting
      const fixedHtml = html.replace(
        /href="([^"]*\/style\/navBar.css)"/,
        'href="../navBar/style/navBar.css"'
      );

      document.getElementById("navbar-container").innerHTML = fixedHtml;

      if (typeof navBarButton === "function") navBarButton();
    })
    .catch((err) => {});
});



async function fetchWishlist(userId) {
  const wishlistContainer = document.getElementById("wishlist-container");
  const wishlistCount = document.getElementById("wishlist-count");

  wishlistContainer.innerHTML = "<p>Loading wishlist...</p>";
  let count = 0;

  try {
    const q = query(collection(db, "wishlist"), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);

    wishlistContainer.innerHTML = ""; // Clear loading text

    if (querySnapshot.empty) {
      wishlistContainer.innerHTML = "<p class='text-muted'>Your wishlist is empty.</p>";
    }

    querySnapshot.forEach((doc) => {
      const item = doc.data();
      console.log(item);
      wishlistContainer.innerHTML += `
        <div class="col">
          <div class="card h-100 shadow-sm">
          <a href="../productDetails/product.html?bookId=${item.bookId}" class="text-decoration-none">
            <img src="${item.imageUrl || "https://via.placeholder.com/150"}" class="card-img-top" alt="${item.title}">
            <div class="card-body">
              <h5 class="card-title">${item.title}</h5>
              </a>
            </div>
          </div>
        </div>
      `;
      count++;
    });

    wishlistCount.textContent = count;
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    wishlistContainer.innerHTML = `<p class="text-danger">Failed to load wishlist.</p>`;
  }
}

navBarButton(auth);