import { navBarButton } from "../../navBar/script/navBar.js";
const wishlistItems = [
  {
    title: "Book One",
    description: "Description of Book One",
    image: "",
  },
  {
    title: "Book Two",
    description: "Description of Book Two",
    image: "",
  },
  {
    title: "Book Three",
    description: "Description of Book Three",
    image: "",
  },
  {
    title: "Book Four",
    description: "Description of Book Four",
    image: "",
  },
];

const wishlistContainer = document.getElementById("wishlist-container");
const wishlistCount = document.getElementById("wishlist-count");

function renderWishlist() {
  wishlistContainer.innerHTML = "";
  wishlistItems.forEach((item) => {
    wishlistContainer.innerHTML += `
          <div class="col">
            <div class="card h-100 shadow-sm">
              <img src="${item.image}" class="card-img-top" alt="${item.title}">
              <div class="card-body">
                <h5 class="card-title">${item.title}</h5>
                <p class="card-text text-muted">${item.description}</p>
                <button class="btn custom-button w-100">Add to Cart</button>
              </div>
            </div>
          </div>
        `;
  });
  wishlistCount.textContent = wishlistItems.length;
}

document.addEventListener("DOMContentLoaded", renderWishlist);

navBarButton();