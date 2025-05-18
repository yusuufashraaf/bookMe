import { navBarButton } from "../../profile/script/profile.js";
import { db } from "../../firebase.js";
import { 
  getDoc, updateDoc, doc, collection, query, where, onSnapshot, deleteDoc
} from "https://www.gstatic.com/firebasejs/11.7.3/firebase-firestore.js";
import { 
  getAuth, onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/11.7.3/firebase-auth.js";

const auth = getAuth();
let currentUserId = null;


// CONTROLLERS
function decreaseCount(id) {
  const cartRef = doc(db, "cart", id);

  getDoc(cartRef).then((doc) => {
    if (doc.exists()) {
      const data = doc.data();
      if (data.quantity > 1) {
        updateDoc(cartRef, {
          quantity: data.quantity - 1,
        });
      } else {
        removeItem(id);
      }
    }
  }).catch((error) => {
    console.error("Error decreasing quantity:", error);
    })
}

function increaseCount(id) {
  const cartRef = doc(db, "cart", id);
  
  getDoc(cartRef).then((doc) => {
    if (doc.exists()) {
      const data = doc.data();
      updateDoc(cartRef, {
        quantity: data.quantity + 1,
      });
    }
  }).catch((error) => {
    console.error("Error increasing quantity:", error);
  })
}

function removeItem(id) {
  const cartRef = doc(db, "cart", id);
  deleteDoc(cartRef)
  .then(() => {
    console.log("Item removed successfully");
  }).catch((error) => {
    console.error("Error removing item:", error);
  });
}

function getSubTotalCost(cartItems) {
  let totalCost = 0;
  cartItems.forEach((item) => {
    totalCost += item.price * item.quantity;
  });
  document.querySelector(".subtotal-cost").innerText = `${numeral(totalCost).format('0,0.00')} EGP`;
}

function getTotalCost(cartItems) {
  let totalCost = 0;
  cartItems.forEach((item) => {
    totalCost += item.price * item.quantity;
  });
  document.querySelector(".total-cost").innerText = `${numeral(totalCost).format('0,0.00')} EGP`;
}


// FETCHING NAV BAR TO CART PAGE
document.addEventListener("DOMContentLoaded", () => {
  fetch("../navBar/navbar.html")
    .then(res => res.text())
    .then(html => {
      document.getElementById("navbar-container").innerHTML = html;
      navBarButton();
    })
    .catch(err => console.error("Navbar load error:", err));

      document.querySelector(".checkout-btn")?.addEventListener("click", () => {
      window.location.href = "../payment/payment.html";
    });

    document.querySelector(".continue-btn")?.addEventListener("click", () => {
      window.location.href = `../Home/home.html?${currentUserId}`;
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
                  <img src="${item.imageUrl}" alt="Product Image" class="product-image">
              </div>
              <div class="col-md-4 col-8">
                  <h5 class="product-name mb-1">${item.title}</h5>
                  <p class="product-description text-muted mb-0">Category: ${item.category}</p>
                  <!-- <span class="discount-badge mt-2">20% OFF</span> -->
              </div>
              <div class="col-md-3 col-6">
                  <div class="d-flex align-items-center gap-2">
                      <button data-id="${item.id}" class="quantity-btn quantity-decrease-btn">-</button>
                      <input type="text" class="quantity-input" value="${item.quantity}" min="1" readonly>
                      <button data-id="${item.id}" class="quantity-btn quantity-increase-btn">+</button>
                  </div>
              </div>
              <div class="col-md-2 col-4">
                  <span class="fw-bold">${numeral(item.price * item.quantity).format('0,0.00')} EGP</span>
              </div>
              <div class="col-md-1 col-2 delete-btn" data-id="${item.id}">
                  <i class="bi bi-trash remove-btn"></i>
              </div>
          </div>
      </div>
    `
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
    })
  })

  increaseButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      increaseCount(btn.dataset.id);
    })
  })

  removeButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      removeItem(btn.dataset.id);
    })
  })
}