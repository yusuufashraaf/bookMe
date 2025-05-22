// home.js
import { getAllBooks, auth } from "../../firebase.js";
import { navBarButton } from "../../navBar/script/navBar.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-auth.js";

const DOM = {
  productList: document.getElementById("productList"),
  filterSelect: document.getElementById("filterOption"),
  sortSelect: document.getElementById("sortOption"),
  loader: document.getElementById("loader"),
  paginationContainer: document.getElementById("pagination"),
};

const CONFIG = {
  itemsPerPage: 8,
};

let currentPage = 1;
let allProducts = [];

onAuthStateChanged(auth, (user) => {
  if (!user) window.location.replace("../../index.html");
});

async function loadNavbar() {
  try {
    const res = await fetch("../navBar/navbar.html");
    let html = await res.text();

    html = html.replace(
      /href="([^"]*\/style\/navBar.css)"/,
      'href="../navBar/style/navBar.css"'
    );

    html = html.replace(
      '<ul class="navbar-nav ms-auto">',
      `
        <input class="search" type="search" id="searchInput" placeholder="Search" aria-label="Search" />
        <button class="btnn" id="searchBtn" type="submit">Search</button>
        <ul class="navbar-nav ms-auto">
      `
    );

    document.getElementById("navbar-container").innerHTML = html;
    navBarButton(auth);
    setupSearch();
  } catch (error) {
    console.error("Navbar load error:", error);
  }
}

function setupSearch() {
  const searchBtn = document.getElementById("searchBtn");
  const searchInput = document.getElementById("searchInput");

  if (!searchBtn || !searchInput) return;

  const triggerSearch = (e) => {
    e.preventDefault();
    applyFiltersAndRender(true, searchInput.value);
  };

  searchBtn.addEventListener("click", triggerSearch);
  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") triggerSearch(e);
  });
}

async function initializeProducts() {
  try {
    allProducts = await getAllBooks();
  } catch (error) {
    console.error("Failed to fetch products:", error);
  }
}

function renderProducts(products) {
  DOM.productList.innerHTML = "";

  if (!products.length) {
    DOM.productList.innerHTML = `<p style="color:black; font-size:1.7rem;">No products found.</p>`;
    DOM.paginationContainer.innerHTML = "";
    return;
  }

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

  renderPaginationControls(totalPages);
}

function generateProductHTML(product) {
  return `
    <div class="card h-100">
      <a class="productLink" href="../productDetails/product.html?bookId=${
        product.bookId
      }">
        <img 
src="${product.imageUrl}" class="card-img-top product-img imgContain" alt="${escapeHTML(
    product.name
  )}" />
        <div class="card-body d-flex flex-column justify-content-between">
          <div>
            <h5 class="card-title mb-1">${toPascalCase(product.title)}</h5>
            <p class="mb-2 ellipsis">${escapeHTML(
              toPascalCase(product.description)
            )}</p>
          </div>
          <span class="price mt-2">EGP ${product.price}</span>
        </div>
      </a>
    </div>
  `;
}

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

function sortProducts(products, sortOption) {
  if (sortOption === "Low to High") {
    return [...products].sort((a, b) => a.price - b.price);
  } else if (sortOption === "High to Low") {
    return [...products].sort((a, b) => b.price - a.price);
  }
  return products;
}

function paginateItems(items, page, perPage) {
  const totalPages = Math.ceil(items.length / perPage);
  const start = (page - 1) * perPage;
  const paginatedItems = items.slice(start, start + perPage);
  return { items: paginatedItems, totalPages };
}

function toPascalCase(str = "") {
  return str
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

function escapeHTML(str = "") {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

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

DOM.filterSelect.addEventListener("change", () => applyFiltersAndRender(true));
DOM.sortSelect.addEventListener("change", () => applyFiltersAndRender(true));

async function main() {
  DOM.loader.style.display = "block";

  try {
    await initializeProducts();
    applyFiltersAndRender();
  } catch (error) {
    console.error("Error loading data", error);
  } finally {
    DOM.loader.style.display = "none";
  }
}

loadNavbar();
main();
