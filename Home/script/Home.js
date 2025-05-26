// Import functions and modules
import { getAllBooks, auth } from "../../firebase.js";
import { loadNavbar } from "../../navBar/script/navBar.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-auth.js";


const DOM = {
  productList: document.getElementById("productList"),
  filterSelect: document.getElementById("filterOption"),
  sortSelect: document.getElementById("sortOption"),
  loader: document.getElementById("loader"),
  paginationContainer: document.getElementById("pagination"),
};

// Configuration for pagination
const CONFIG = {
  itemsPerPage: 8,
};

let currentPage = 1;
let allProducts = [];

// Redirect to login if user is not authenticated
onAuthStateChanged(auth, (user) => {
  if (!user) window.location.replace("../../index.html");
});

// Load the navbar dynamically and enhance it with search bar
loadNavbar(auth,true).then(() => {
  setupSearch();
})

// Setup search functionality for navbar
function setupSearch() {
  const searchBtn = document.getElementById("searchBtn");
  const searchInput = document.getElementById("searchInput");

  if (!searchBtn || !searchInput) return;

  const triggerSearch = (e) => {
    e.preventDefault();
    applyFiltersAndRender(true, searchInput.value);
  };

  // Handle button click and "Enter" key press
  searchBtn.addEventListener("click", triggerSearch);
  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") triggerSearch(e);
  });
}

// Fetch all product data from Firebase
async function initializeProducts() {
  try {
    allProducts = await getAllBooks();
  } catch (error) {
    console.error("Failed to fetch products:", error);
  }
}

// Render list of products into the DOM
function renderProducts(products) {
  DOM.productList.innerHTML = "";

  // Show "No products found" if empty
  if (!products.length) {
    DOM.productList.innerHTML = `<p style="color:black; font-size:1.7rem;">No products found.</p>`;
    DOM.paginationContainer.innerHTML = "";
    return;
  }

  // Paginate and render product items
  const { items, totalPages } = paginateItems(
    products,
    currentPage,
    CONFIG.itemsPerPage
  );

  items.forEach((product) => {
    const productItem = document.createElement("div");
    productItem.classList.add("col");
    productItem.innerHTML = generateProductHTML(product);
    DOM.productList.appendChild(productItem);
  });

  // Render pagination buttons
  renderPaginationControls(totalPages);
}

// Generate HTML structure for a single product
function generateProductHTML(product) {
  return `
    <div class="card h-100">
      <a class="productLink" href="../productDetails/product.html?bookId=${
        product.bookId
      }">
        <img 
          src="${product.imageUrl}" 
          class="card-img-top product-img imgContain" 
          alt="${escapeHTML(product.name)}" 
        />
        <div class="card-body d-flex flex-column justify-content-between">
          <div>
            <h5 class="card-title mb-1">${toPascalCase(product.title)}</h5>
            <p class="mb-2 ellipsis">${escapeHTML(toPascalCase(product.description))}</p>
          </div>
          <span class="price mt-2">EGP ${product.price}</span>
        </div>
      </a>
    </div>
  `;
}

// Render pagination controls/buttons
function renderPaginationControls(totalPages) {
  DOM.paginationContainer.innerHTML = "";

  if (totalPages <= 1) return;

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    btn.className = `btnn btn-sm mx-1 ${
      i === currentPage ? "btn-primary" : "btn-outline-primary"
    }`;
    btn.addEventListener("click", () => {
      currentPage = i;
      applyFiltersAndRender();
    });
    DOM.paginationContainer.appendChild(btn);
  }
}

// Filter products based on category and search input
function filterProducts(products, category, searchText) {
  let filtered = [...products];

  if (category && category !== "None") {
    filtered = filtered.filter((p) => p.category === category);
  }

  if (searchText) {
    const lower = searchText.toLowerCase();
    filtered = filtered.filter((p) => p.title.toLowerCase().includes(lower));
  }

  return filtered;
}

// Sort products by selected option
function sortProducts(products, sortOption) {
  if (sortOption === "Low to High") {
    return [...products].sort((a, b) => a.price - b.price);
  } else if (sortOption === "High to Low") {
    return [...products].sort((a, b) => b.price - a.price);
  }
  return products;
}

// Paginate the product array
function paginateItems(items, page, perPage) {
  const totalPages = Math.ceil(items.length / perPage);
  const start = (page - 1) * perPage;
  const paginatedItems = items.slice(start, start + perPage);
  return { items: paginatedItems, totalPages };
}

// Convert string to PascalCase  (youssef ashraf) ==> (Youssef Ashraf)
function toPascalCase(str = "") {
  return str
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

// Escape HTML for safety
function escapeHTML(str = "") {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

// Apply selected filters and sorting, then render products
function applyFiltersAndRender(resetPage = false, searchVal = "") {
  if (resetPage) currentPage = 1;

  const filterValue = DOM.filterSelect.value;
  const sortValue = DOM.sortSelect.value;
  const searchValue =
    searchVal || document.getElementById("searchInput")?.value || "";

  const filtered = filterProducts(allProducts, filterValue, searchValue);
  const sorted = sortProducts(filtered, sortValue);

  renderProducts(sorted);
}

// Attach filter/sort change events
DOM.filterSelect.addEventListener("change", () => applyFiltersAndRender(true));
DOM.sortSelect.addEventListener("change", () => applyFiltersAndRender(true));

// Main execution block: fetch products and render on page load
(async function main() {
  DOM.loader.style.display = "block";

  try {
    await initializeProducts();
    applyFiltersAndRender();
  } catch (error) {
    console.error("Error loading data", error);
  } finally {
    DOM.loader.style.display = "none";
  }
})();

