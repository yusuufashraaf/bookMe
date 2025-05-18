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
import { navBarButton } from "../../profile/script/profile.js";


document.addEventListener("DOMContentLoaded", () => {
  fetch("../navBar/navbar.html")
    .then((res) => {
      return res.text();
    })
    .then((html) => {
      document.getElementById("navbar-container").innerHTML = html;
      navBarButton();
    })
    .catch((err) => console.error("Navbar load error:", err));
});

const auth = getAuth();
let currentUserId = null;

const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get("bookId");
let currentBook = null;

async function loadBookDetails() {
  // get bookId from URL params
  if (!productId) return;

  try {
    const book = await findBookByBookId(productId);
    if (!book) {
      alert("Book not found!");
      return;
    }

    currentBook = book;
    document.querySelector("h2").innerText = book.title;
    document.querySelector("h5").innerText = `${book.price} EGP`;

    const paragraphs = document.querySelectorAll("p");
    paragraphs[0].innerHTML = `<strong>Category:</strong> ${book.category}`;
    paragraphs[1].innerHTML = `<strong>Description:</strong> ${book.description}`;

    // Remove old author paragraph if exists (optional)
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

onAuthStateChanged(auth, (user) => {
  if (user) {
    currentUserId = user.uid;
    console.log("User ID:", currentUserId);
    
    // Add to Cart function
    async function addToCartInFirestore(item) {
      if (!currentUserId || !item || !item.bookId) {
        console.error("User ID or item details are missing.");
        return;
      }

      const cartDocId = `${currentUserId}_${item.bookId}`;
      const cartDocRef = doc(db, "cart", cartDocId);
      const cartDocSnap = await getDoc(cartDocRef);

      if (cartDocSnap.exists()) {
        // If item exists, increment quantity
        const currentQty = cartDocSnap.data().quantity || 0;
        await updateDoc(cartDocRef, {
          quantity: currentQty + 1,
          updatedAt: new Date(),
        });
        alert("Book quantity updated in cart!");
      } else {
        // If item doesn't exist, create with quantity 1
        await setDoc(cartDocRef, {
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
        alert("Book added to cart!");
      }
    }

    // Add to Cart event listener
    document.getElementById("addtocart").addEventListener("click", async () => {
      if (!currentBook) {
        alert("No book selected.");
        return;
      }

      try {
        // Update Firestore
        await addToCartInFirestore(currentBook);

        // Update localStorage
        let localCart = JSON.parse(localStorage.getItem("cart")) || [];

        const itemIndexInLocalCart = localCart.findIndex(
          (cartItem) =>
            cartItem.bookId === currentBook.bookId &&
            cartItem.userId === currentUserId
        );

        if (itemIndexInLocalCart !== -1) {
          // Item exists in local cart, increment quantity
          localCart[itemIndexInLocalCart].quantity =
            (localCart[itemIndexInLocalCart].quantity || 0) + 1;
        } else {
          localCart.push({
            ...currentBook,
            userId: currentUserId,
            quantity: 1,
            bookId: currentBook.bookId,
          });
        }

        localStorage.setItem("cart", JSON.stringify(localCart));

        // Show popup
        await showPopup(currentBook);
      } catch (error) {
        console.error("Error adding to cart:", error);
        alert("Failed to add book to cart. Please try again.");
      }
    });

    // Add to Wishlist

    const wishlistBtn = document.getElementById("wishlistBtn");
    const wishlistToast = document.getElementById("wishlistToast");

    wishlistBtn.addEventListener("click", async () => {
      if (!currentBook) return;
      let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
      if (wishlistBtn.classList.contains("active")) {
        const wishlistRef = collection(db, "wishlist");
        const q = query(
          wishlistRef,
          where("userId", "==", currentUserId),
          where("title", "==", currentBook.title)
        );

        const querySnapshot = await getDocs(q);

        querySnapshot.forEach(async (docSnap) => {
          console.log("Deleting doc with ID:", docSnap.id);
          await deleteDoc(doc(db, "wishlist", docSnap.id));
        });

        //remove from localstorage
        wishlist = wishlist.filter(
          (item) =>
            !(item.title === currentBook.title && item.userId === currentUserId)
        );
        localStorage.setItem("wishlist", JSON.stringify(wishlist));

        wishlistBtn.classList.remove("active");
        wishlistBtn.innerHTML = '<i class="fa-regular fa-heart"></i>';
        wishlistToast.innerText = "The book has been removed from wishlist.";
        wishlistToast.style.display = "flex";

        setTimeout(() => {
          wishlistToast.style.display = "none";
        }, 3000);
      } else {
        await addDoc(collection(db, "wishlist"), {
          userId: currentUserId,
          title: currentBook.title,
          author: currentBook.author,
          category: currentBook.category,
          price: currentBook.price,
          addedAt: new Date(),
        });

        //localstorage

        const exists = wishlist.some(
          (item) =>
            item.title === currentBook.title && item.userId === currentUserId
        );

        if (!exists) {
          wishlist.push({
            ...currentBook,
            userId: currentUserId,
          });

          localStorage.setItem("wishlist", JSON.stringify(wishlist));
        }

        wishlistBtn.classList.add("active");
        wishlistBtn.innerHTML = '<i class="fa-solid fa-heart"></i>';

        document.querySelector(".heart-icon").style.display = "inline";
        wishlistToast.style.display = "flex";

        setTimeout(() => {
          wishlistToast.style.display = "none";
        }, 3000);
      }
    });
  } else {
    console.log("User not logged in");
  }
});

async function loadRelatedBooks(category, currentId) {
  const booksRef = collection(db, "books");
  const q = query(booksRef, where("category", "==", category));
  const querySnapshot = await getDocs(q);

  const relatedBooksContainer = document.querySelector(".related-books");
  relatedBooksContainer.innerHTML = "";

  querySnapshot.forEach((docSnap) => {
    if (docSnap.id !== currentId) {
      const book = docSnap.data();
      const card = document.createElement("div");
      card.className = "card shadow-sm related-book-card";

      card.innerHTML = `<img alt="img" src="../Home/imgs/Screenshot 2025-03-29 152147.png">
                         <h5 class="card-title text-truncate mb-0">${book.title}</h5>
                         <h6> ${book.author}</h6>
                         <p>${book.price} EGP</p>`;

      card.addEventListener("click", () => {
        window.location.href = `product.html?bookId=${docSnap.id}`;
      });

      relatedBooksContainer.appendChild(card);
    }
  });
}

loadBookDetails();

// Scroll functionality
document.getElementById("scrollLeft").addEventListener("click", () => {
  document.querySelector(".related-books-container").scrollBy({
    left: -200,
    behavior: "smooth",
  });
});

document.getElementById("scrollRight").addEventListener("click", () => {
  document.querySelector(".related-books-container").scrollBy({
    left: 200,
    behavior: "smooth",
  });
});

//calculate total price in cart
async function calculateTotalPrice() {
  const cartRef = collection(db, "cart");
  const q = query(cartRef, where("userId", "==", currentUserId));
  const cartSnapshot = await getDocs(q);
  let total = 0;
  cartSnapshot.forEach((doc) => {
    const data = doc.data();
    if (data.price) {
      total += Number(data.price);
    }
  });
  return total;
}

async function showPopup(book) {
  // document.getElementById("popupBookImage").src = book.imageUrl ;
  document.getElementById("popupBookTitle").innerText = book.title;

  const totalPrice = await calculateTotalPrice();
  document.getElementById(
    "popupTotalPrice"
  ).innerText = `Total Price in Cart: ${totalPrice} EGP`;

  document.getElementById("actionPopup").style.display = "flex";
}

document.getElementById("continueShopping").addEventListener("click", () => {
  document.getElementById("actionPopup").style.display = "none";
});

document.getElementById("goToCheckout").addEventListener("click", () => {
  console.log("clicked");
  window.location.href = "../payment/payment.html";
});
