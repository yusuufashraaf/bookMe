// Firebase imports and other external modules
import { db, findBookByBookId } from "../../firebase.js";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  deleteDoc,
  setDoc,
  updateDoc,
} from "https://www.gstatic.com/firebasejs/11.7.3/firebase-firestore.js";
import {
  getAuth,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/11.7.3/firebase-auth.js";
import { navBarButton } from  "../../navBar/script/navBar.js";

// Global variables
const auth = getAuth();
let currentUserId = null;
const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get("bookId");
let currentBook = null;

// DOM loaded handler
document.addEventListener("DOMContentLoaded", () => {
  fetch("../navBar/navbar.html")
    .then((res) => res.text())
    .then((html) => {
      document.getElementById("navbar-container").innerHTML = html;
    })
    .catch((err) => console.error("Navbar load error:", err));
});

onAuthStateChanged(auth, async (user) => {
  if (user) {
    currentUserId = user.uid;
    await loadBookDetails();
    await initializeWishlistButton();
    setupCartButton();
  } else {
    console.log("User not logged in");
    await loadBookDetails();
  }
});

// Load book details and show related books
async function loadBookDetails() {
  if (!productId) return;

  try {
    const book = await findBookByBookId(productId);
    if (!book) {
      alert("Book not found!");
      return;
    }
    document.getElementsByClassName("book-image")[0].src = book.imageUrl;
    currentBook = book;
    document.querySelector("h2").innerText = book.title;
    document.querySelector("h5").innerText = `${book.price} EGP`;

    const paragraphs = document.querySelectorAll("p");
    paragraphs[0].innerHTML = `<strong>Category:</strong> ${book.category}`;
    paragraphs[1].innerHTML = `<strong>Description:</strong> ${book.description}`;

    const bookDetails = document.querySelector(".book-details");
    const oldAuthor = bookDetails.querySelector(".author-info");
    if (oldAuthor) oldAuthor.remove();

    if (book.author) {
      const authorParagraph = document.createElement("p");
      authorParagraph.classList.add("author-info");
      authorParagraph.innerHTML = `<strong>Author:</strong> ${book.author}`;
      bookDetails.insertBefore(authorParagraph, bookDetails.children[2]);
    }

    loadRelatedBooks(book.category, book.bookId);
  } catch (error) {
    console.error("Error loading book details:", error);
    alert("Failed to load book details.");
  }
}

// Check and initialize wishlist button
async function initializeWishlistButton() {
  const wishlistBtn = document.getElementById("wishlistBtn");
  const wishlistToast = document.getElementById("wishlistToast");

  const wishlistRef = collection(db, "wishlist");
  const q = query(
    wishlistRef,
    where("userId", "==", currentUserId),
    where("title", "==", currentBook.title)
  );
  const querySnapshot = await getDocs(q);
  if (!querySnapshot.empty) {
    wishlistBtn.classList.add("active");
    wishlistBtn.innerHTML = '<i class="fa-solid fa-heart"></i>';
  }

  wishlistBtn.addEventListener("click", async () => {
    if (!currentBook) return;

    let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
    const alreadyInWishlist = wishlist.some(
      (item) => item.title === currentBook.title && item.userId === currentUserId
    );

    if (wishlistBtn.classList.contains("active")) {
      const q = query(
        wishlistRef,
        where("userId", "==", currentUserId),
        where("title", "==", currentBook.title)
      );
      const querySnapshot = await getDocs(q);
      for (const docSnap of querySnapshot.docs) {
        await deleteDoc(doc(db, "wishlist", docSnap.id));
      }

      wishlist = wishlist.filter(
        (item) => !(item.title === currentBook.title && item.userId === currentUserId)
      );
      localStorage.setItem("wishlist", JSON.stringify(wishlist));

      wishlistBtn.classList.remove("active");
      wishlistBtn.innerHTML = '<i class="fa-regular fa-heart"></i>';
      wishlistToast.innerText = "The book has been removed from wishlist.";
    } else {
      if (querySnapshot.empty && !alreadyInWishlist) {
        await addDoc(collection(db, "wishlist"), {
          userId: currentUserId,
          title: currentBook.title,
          author: currentBook.author,
          category: currentBook.category,
          price: currentBook.price,
          bookId: currentBook.bookId,
          imageUrl: currentBook.imageUrl,
          addedAt: new Date(),
        });

        wishlist.push({ ...currentBook, userId: currentUserId });
        localStorage.setItem("wishlist", JSON.stringify(wishlist));

        wishlistBtn.classList.add("active");
        wishlistBtn.innerHTML = '<i class="fa-solid fa-heart"></i>';
        wishlistToast.innerText = "Book added to wishlist!";
      }
    }

    wishlistToast.style.display = "flex";
    setTimeout(() => {
      wishlistToast.style.display = "none";
    }, 3000);
  });
}

// Setup cart button handler
function setupCartButton() {
  const addToCartBtn = document.getElementById("addtocart");
  addToCartBtn.addEventListener("click", async () => {
    if (!currentBook) {
      alert("No book selected.");
      return;
    }

    try {
      await addToCartInFirestore(currentBook);

      let localCart = JSON.parse(localStorage.getItem("cart")) || [];
      const itemIndex = localCart.findIndex(
        (item) => item.bookId === currentBook.bookId && item.userId === currentUserId
      );

      if (itemIndex !== -1) {
        localCart[itemIndex].quantity += 1;
      } else {
        localCart.push({ ...currentBook, userId: currentUserId, quantity: 1 });
      }

      localStorage.setItem("cart", JSON.stringify(localCart));
      await showPopup(currentBook);
    } catch (error) {
      console.error("Add to cart failed:", error);
    }
  });
}

// Add to cart in Firestore
async function addToCartInFirestore(item) {
  const cartDocId = `${currentUserId}_${item.bookId}`;
  const cartRef = doc(db, "cart", cartDocId);
  const snap = await getDoc(cartRef);

  if (snap.exists()) {
    const currentQty = snap.data().quantity || 0;
    await updateDoc(cartRef, {
      quantity: currentQty + 1,
      updatedAt: new Date(),
    });
  } else {
    await setDoc(cartRef, {
      userId: currentUserId,
      bookId: item.bookId,
      title: item.title,
      description: item.description,
      author: item.author,
      category: item.category,
      price: item.price,
      imageUrl: item.imageUrl,
      quantity: 1,
      addedAt: new Date(),
    });
  }
}

// Load related books by category
async function loadRelatedBooks(category, currentId) {
  const booksRef = collection(db, "books");
  const q = query(booksRef, where("category", "==", category));
  const snapshot = await getDocs(q);

  const container = document.querySelector(".related-books");
  container.innerHTML = "";

  snapshot.forEach((docSnap) => {
    if (docSnap.id !== currentId) {
      const book = docSnap.data();
      const card = document.createElement("div");
      card.className = "card shadow-sm related-book-card";
      card.innerHTML = `<img alt="img" src="${book.imageUrl}" class="card-img-top" />
                         <h5 class="card-title text-truncate mb-0">${book.title}</h5>
                         <h6>${book.author}</h6>
                         <p>${book.price} EGP</p>`;
      card.addEventListener("click", () => {
        window.location.href = `product.html?bookId=${docSnap.id}`;
      });
      container.appendChild(card);
    }
  });
}

// Show popup
async function showPopup(book) {
  document.getElementById("popupBookTitle").innerText = book.title;
  const totalPrice = await calculateTotalPrice();
  document.getElementById("popupTotalPrice").innerText = `Total Price in Cart: ${totalPrice} EGP`;
  document.getElementById("actionPopup").style.display = "flex";
}

document.getElementById("continueShopping").addEventListener("click", () => {
  document.getElementById("actionPopup").style.display = "none";
});

document.getElementById("goToCheckout").addEventListener("click", () => {
  window.location.href = "../payment/payment.html";
});

// Total price calculator
async function calculateTotalPrice() {
  const q = query(collection(db, "cart"), where("userId", "==", currentUserId));
  const snapshot = await getDocs(q);
  let total = 0;
  snapshot.forEach((doc) => {
    const data = doc.data();
    total += Number(data.price || 0);
  });
  return total;
}
navBarButton();