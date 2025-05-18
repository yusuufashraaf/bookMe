import { getAllBooks } from "../../firebase.js";
import { navBarButton } from "../../profile/script/profile.js";

const productList = document.getElementById("productList");
const filterSelect = document.getElementById("filterOption");
const sortSelect = document.getElementById("sortOption");
const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("searchForm");
const loader = document.getElementById("loader");
const paginationContainer = document.getElementById("pagination");
const params = new URLSearchParams(window.location.search);
const ids = params.get("id");
const itemsPerPage = 12;
let currentPage = 1;
let allProducts = [];

// --- Fetch and initialize product data ---
async function initializeProducts() {
  try {
    allProducts = await getAllBooks();
  } catch (error) {
    console.error("Failed to fetch products:", error);
  }
}

// --- Render products based on filters, sorting, and pagination ---
function renderProducts(products) {
  productList.innerHTML = "";

  if (!products.length) {
    productList.innerHTML = `<p>No products found.</p>`;
    return;
  }

  const { items: paginatedItems, totalPages } = getPaginatedItems(
    products,
    currentPage,
    itemsPerPage
  );

  paginatedItems.forEach((product) => {
    const productItem = document.createElement("div");
    productItem.classList.add("col");
    productItem.innerHTML = `
      <div class="card h-100">
        <a class="productLink" href=".././productDetails/product.html?bookId=${
          product.bookId
        }&id=${ids}" target="_blank">
          <img src="./imgs/Screenshot 2025-03-29 152147.png" class="card-img-top" alt="${escapeHTML(
            product.name
          )}" />
        </a>
        <div class="card-body d-flex flex-column">
          <h5 class="card-title mb-1">${pascalCase(product.title)}</h5>
          <p class="mb-2 ellipsis">${escapeHTML(
            pascalCase(product.description)
          )}</p>
          <span class="price mt-auto">EGP ${product.price}</span>
        </div>
      </div>
    `;
    productList.appendChild(productItem);
  });

  renderPaginationControls(totalPages);
}

// --- Pagination Helpers ---
function getPaginatedItems(items, page, perPage) {
  const totalPages = Math.ceil(items.length / perPage);
  const start = (page - 1) * perPage;
  const paginatedItems = items.slice(start, start + perPage);
  return { items: paginatedItems, totalPages };
}

function renderPaginationControls(totalPages) {
  paginationContainer.innerHTML = "";

  if (totalPages <= 1) return;

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    btn.className = `btn btn-sm mx-1 ${
      i === currentPage ? "btn-primary" : "btn-outline-primary"
    }`;
    btn.addEventListener("click", () => {
      currentPage = i;
      applyFiltersAndRender(); // Do not reset page on click
    });
    paginationContainer.appendChild(btn);
  }
}

// --- Filter logic ---
function filterProducts(products, filterValue, searchText) {
  let filtered = products;

  if (filterValue && filterValue !== "None") {
    filtered = filtered.filter((product) => product.category === filterValue);
  }

  if (searchText) {
    const lowerSearch = searchText.toLowerCase();
    filtered = filtered.filter((product) =>
      product.title.toLowerCase().includes(lowerSearch)
    );
  }

  return filtered;
}

// --- Sorting logic ---
function sortProducts(products, sortValue) {
  if (sortValue === "Low to High") {
    return [...products].sort((a, b) => a.price - b.price);
  } else if (sortValue === "High to Low") {
    return [...products].sort((a, b) => b.price - a.price);
  }
  return products;
}

// --- Utility ---
function pascalCase(str = "") {
  return str
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

function escapeHTML(str = "") {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

// --- Core ---
function applyFiltersAndRender(resetPage = false) {
  if (resetPage) {
    currentPage = 1;
  }

  const filterValue = filterSelect.value;
  const sortValue = sortSelect.value;
  const searchValue = searchInput.value;

  const filtered = filterProducts(allProducts, filterValue, searchValue);
  const sorted = sortProducts(filtered, sortValue);

  renderProducts(sorted);
}

// --- Events ---
filterSelect.addEventListener("change", () => applyFiltersAndRender(true));
sortSelect.addEventListener("change", () => applyFiltersAndRender(true));
searchButton.addEventListener("click", (e) => {
  e.preventDefault();
  applyFiltersAndRender(true);
});

// --- Initial Load ---
async function main() {
  loader.style.display = "block";

  try {
    await initializeProducts();
    applyFiltersAndRender();
  } catch (error) {
    console.error("Error loading data", error);
  } finally {
    loader.style.display = "none";
  }
}

main();
navBarButton();
