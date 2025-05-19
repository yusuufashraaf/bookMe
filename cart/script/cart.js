import { navBarButton } from "../../navBar/script/navBar.js";
import { db } from "../../firebase.js";
import {
  getDoc,
  getDocs,
  updateDoc,
  doc,
  collection,
  query,
  where,
  onSnapshot,
  deleteDoc,
} from "https://www.gstatic.com/firebasejs/11.7.3/firebase-firestore.js";
import {
  getAuth,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/11.7.3/firebase-auth.js";

const auth = getAuth();
let currentUserId = null;

// CONTROLLERS
async function decreaseCount(id) {
  const cartRef = doc(db, "cart", id);

  try {
    const cartDoc = await getDoc(cartRef);
    if (!cartDoc.exists()) return;

    const cartData = cartDoc.data();

    // Get book reference to update stock
    const booksRef = collection(db, "books");
    const q = query(booksRef, where("bookId", "==", cartData.bookId));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.error("Book not found");
      return;
    }

    const bookDoc = querySnapshot.docs[0];
    const bookRef = bookDoc.ref;
    const bookData = bookDoc.data();

    if (cartData.quantity > 1) {
      await updateDoc(cartRef, {
        quantity: cartData.quantity - 1,
      });

      // Increase stock when quantity is decreased
      await updateDoc(bookRef, {
        stock: bookData.stock + 1,
      });

      console.log("Quantity decreased successfully");
    } else {
      // If quantity becomes 0, remove item and restore stock
      await updateDoc(bookRef, {
        stock: bookData.stock + 1,
      });
      await removeItem(id, true); // Pass true to avoid double stock update
    }
  } catch (error) {
    console.error("Error decreasing quantity:", error);
  }
}

async function increaseCount(id) {
  const cartRef = doc(db, "cart", id);

  try {
    const cartDoc = await getDoc(cartRef);
    if (!cartDoc.exists()) return;

    const cartData = cartDoc.data();

    const booksRef = collection(db, "books");
    const q = query(booksRef, where("bookId", "==", cartData.bookId));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const bookDoc = querySnapshot.docs[0];
      const bookRef = bookDoc.ref;
      const bookData = bookDoc.data();

      console.log(
        "Before increase - quantity:",
        cartData.quantity,
        "stock:",
        bookData.stock
      );

      // Check if you can add 1 more without exceeding stock
      if (bookData.stock !== 0) {
        await updateDoc(cartRef, {
          quantity: cartData.quantity + 1,
        });

        await updateDoc(bookRef, {
          stock: bookData.stock - 1,
        });

        console.log("Quantity increased successfully");
      } else {
        alert("No more books available");
      }
    } else {
      console.error("Book not found");
    }
  } catch (error) {
    console.error("Error increasing quantity:", error);
  }
}

async function removeItem(id, stockAlreadyUpdated = false) {
  try {
    const cartRef = doc(db, "cart", id);
    const cartDoc = await getDoc(cartRef);

    if (!cartDoc.exists()) {
      console.error("Cart item not found");
      return;
    }

    const cartData = cartDoc.data();

    // Only update stock if it hasn't already been updated (for the case when called from decreaseCount)
    if (!stockAlreadyUpdated) {
      const booksRef = collection(db, "books");
      const q = query(booksRef, where("bookId", "==", cartData.bookId));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const bookDoc = querySnapshot.docs[0];
        const bookRef = bookDoc.ref;
        const bookData = bookDoc.data();

        // Return all items to stock
        await updateDoc(bookRef, {
          stock: bookData.stock + cartData.quantity,
        });

        console.log(`Returned ${cartData.quantity} items to stock`);
      }
    }

    await deleteDoc(cartRef);
    console.log("Item removed successfully");
  } catch (error) {
    console.error("Error removing item:", error);
  }
}

function getSubTotalCost(cartItems) {
  let totalCost = 0;
  cartItems.forEach((item) => {
    totalCost += item.price * item.quantity;
  });
  document.querySelector(".subtotal-cost").innerText = `${numeral(
    totalCost
  ).format("0,0.00")} EGP`;
}

function getTotalCost(cartItems) {
  let totalCost = 0;
  cartItems.forEach((item) => {
    totalCost += item.price * item.quantity;
  });
  document.querySelector(".total-cost").innerText = `${numeral(
    totalCost
  ).format("0,0.00")} EGP`;
}

function getTotalItems(cartItems) {
  let totalItems = 0;
  cartItems.forEach((item) => {
    totalItems += item.quantity;
  });
  document.querySelector(".total-cart-items").innerText = `${totalItems} items`;
}

// FETCHING NAV BAR TO CART PAGE
document.addEventListener("DOMContentLoaded", () => {
  fetch("../navBar/navbar.html")
    .then((res) => res.text())
    .then((html) => {
      const processedHtml = html.replace(
        /href="([^"]*\/style\/navBar.css)"/,
        'href="../navBar/style/navBar.css"'
      );

      document.getElementById("navbar-container").innerHTML = processedHtml;
      navBarButton();
    })
    .catch((err) => console.error("Navbar load error:", err));

  document.querySelector(".checkout-btn")?.addEventListener("click", () => {
    window.location.href = "../payment/payment.html";
  });

  document.querySelector(".continue-btn")?.addEventListener("click", () => {
    window.location.href = "../Home/home.html";
  });

  onAuthStateChanged(auth, (user) => {
    if (user) {
      currentUserId = user.uid;
      loadCartItems();
    } else {
      window.location.href = "../login/login.html";
    }
  });
});

// LOADING CART ITEMS FROM FIRESTORE AND DISPLAYING THEM
function loadCartItems() {
  try {
    if (!currentUserId) return;

    const cartRef = collection(db, "cart");
    const q = query(cartRef, where("userId", "==", currentUserId));
    onSnapshot(q, (snapshot) => {
      let cartItems = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        cartItems.push({
          id: doc.id,
          ...data,
        });
      });
      generateCartItems(cartItems);
      getSubTotalCost(cartItems);
      getTotalCost(cartItems);
      getTotalItems(cartItems);
    });
  } catch (error) {
    console.error("Error loading cart items:", error);
  }
}

function generateCartItems(cartItems) {
  let cartContent = "";
  cartItems.forEach((item) => {
    cartContent += `
        <div class="product-card p-3 shadow-sm">
          <div class="row align-items-center g-3">
              <div class="col-md-2 col-4">
                  <img src="${
                    item.imageUrl
                  }" alt="Product Image" class="product-image">
              </div>
              <div class="col-md-4 col-8">
                  <h5 class="product-name mb-1">${item.title}</h5>
                  <p class="product-description text-muted mb-0">Category: ${
                    item.category
                  }</p>
                  <!-- <span class="discount-badge mt-2">20% OFF</span> -->
              </div>
              <div class="col-md-3 col-6">
                  <div class="d-flex align-items-center gap-2">
                      <button data-id="${
                        item.id
                      }" class="quantity-btn quantity-decrease-btn">-</button>
                      <input type="text" class="quantity-input" value="${
                        item.quantity
                      }" min="1" readonly>
                      <button data-id="${
                        item.id
                      }" class="quantity-btn quantity-increase-btn">+</button>
                  </div>
              </div>
              <div class="col-md-2 col-4">
                  <span class="fw-bold">${numeral(
                    item.price * item.quantity
                  ).format("0,0.00")} EGP</span>
              </div>
              <div class="col-md-1 col-2 delete-btn" data-id="${item.id}">
                  <i class="bi bi-trash remove-btn"></i>
              </div>
          </div>
      </div>
    `;
  });
  document.querySelector(".product-list").innerHTML = cartContent;
  createEventListeners();
}

function createEventListeners() {
  let decreaseButtons = document.querySelectorAll(".quantity-decrease-btn");
  let increaseButtons = document.querySelectorAll(".quantity-increase-btn");
  let removeButtons = document.querySelectorAll(".delete-btn");

  decreaseButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      decreaseCount(btn.dataset.id);
    });
  });

  increaseButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      increaseCount(btn.dataset.id);
    });
  });

  removeButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      removeItem(btn.dataset.id);
    });
  });
}
