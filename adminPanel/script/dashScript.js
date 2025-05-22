
import { addBook } from '../../firebase.js';
import {  getBooks } from '../../firebase.js';
import {  deleteBook } from '../../firebase.js';

import {  updateBook } from '../../firebase.js';
import { signOutUser } from '../../firebase.js'; 
import { getAllOrders } from '../../firebase.js'; 

import { getUserNameById } from '../../firebase.js'; 

document.addEventListener("DOMContentLoaded", () => {
const content = document.getElementById("content");
const addBookForm = document.getElementById("add-book-form");
const alertBox = document.getElementById("alert-box");

const tablealertBox = document.getElementById("books-table-alert");
const toggleBtn = document.getElementById("toggleBtn");
const imageInput = document.getElementById("book-image");
const imageUrlInput = document.getElementById("book-image-url");
const previewImg = document.getElementById("preview-img");
const categorySelect = document.getElementById("book-category");


const showAlert = (message, type = "success") => {
    alertBox.innerHTML = `
    <div class="alert alert-${type} alert-dismissible fade show" role="alert">
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>
    `;
};

const showAlertTable = (message, type = "success") => {
    tablealertBox.innerHTML = `
    <div class="alert alert-${type} alert-dismissible fade show" role="alert">
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>
    `;

    setTimeout(() => {
        tablealertBox.innerHTML = "";
    }, 2000);
};

window.addEventListener("load", () => content.classList.add("loaded"));
toggleBtn.addEventListener("click", () => {
    document.querySelector(".sidebar").classList.toggle("active");
});

//=======================================================================================
//image

imageInput.addEventListener("change", async () => {
    const file = imageInput.files[0];
    if (!file || !file.type.startsWith("image/")) {
        previewImg.style.display = "none";
        return alert("Please select a valid image file.");
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "book_images"); 
    const cloudName = "dnv8yatga";

    try {
        const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
            method: "POST",
            body: formData
        });
        const data = await response.json();

        if (!response.ok || !data.secure_url) {
            throw new Error("Upload failed.");
        }
        const imageUrl = data.secure_url;
        document.getElementById("uploaded-image-url").value = imageUrl;

        // previewImg.src = imageUrl;
        previewImg.src = URL.createObjectURL(file);
        previewImg.style.display = "block";
    } catch (err) {
        alert("Failed to upload image. Reason: " + (err.message || "Unknown error"));
    }
});



//=======================================================================================

    const insertSection = document.getElementById("insert-section");
    const viewSection = document.getElementById("view-section");
    const viewordersection=document.getElementById("view-order-section");

    const showInsertBtn = document.getElementById("show-insert");
    const showViewBtn = document.getElementById("show-view");
    const showOrderBtn = document.getElementById("show-orders");

    const navItems = document.querySelectorAll(".nav-item");
    function setActive(el) {
    navItems.forEach(item => item.classList.remove("active"));
    el.classList.add("active");
    }
setActive(showInsertBtn);
    showInsertBtn.addEventListener("click", (e) => {
    e.preventDefault();
    insertSection.style.display = "block";
    viewSection.style.display = "none";
    viewordersection.style.display = "none";
    setActive(showInsertBtn);
    });

    showViewBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    insertSection.style.display = "none";
    viewSection.style.display = "block";
    viewordersection.style.display = "none";
    setActive(showViewBtn);
    await renderBooksTable(); 
});

showOrderBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    insertSection.style.display = "none";
    viewSection.style.display = "none";
    viewordersection.style.display = "block";
    setActive(showOrderBtn);
    await renderOrdersTable(); 
});

//=======================================================================================
//  form 
addBookForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const title = document.getElementById("book-title").value.trim();
    const author = document.getElementById("book-author").value.trim();
    const price = parseFloat(document.getElementById("book-price").value);
    const stock = parseInt(document.getElementById("book-stock").value);
    const description = document.getElementById("book-description").value.trim();
    const category = categorySelect.value;
    // const imageFile = imageInput.files[0];
    // const imageUrl = document.getElementById("book-image");
    const imageUrl = document.getElementById("uploaded-image-url").value;
    const timestamp = Date.now();
    const bookId = `${title.toLowerCase().replace(/\s+/g, '-')}-${timestamp}`;

// Validate 
    if (!title || title.length < 5) return showAlert("Title must be at least 5 characters.", "danger");
    if (!author || author.length < 3) return showAlert("Author must be at least 3 characters.", "danger");
    if (isNaN(price) || price < 0) return showAlert("Price must be a valid positive number.", "danger");
    if (isNaN(stock) || stock < 0) return showAlert("Stock must be a valid positive number.", "danger");
    if (!description || description.length < 10) return showAlert("Description must be at least 10 characters.", "danger");
    if (!category) return showAlert("Please select a book category.", "danger");
/*     if (!imageUrl || !imageUrl.type.startsWith("image/")) return showAlert("Please select a valid image file.", "danger");
 */   
    if (!imageUrl || !(imageUrl.startsWith("http://") || imageUrl.startsWith("https://"))) {
    return showAlert("Please enter a valid image URL starting with http:// or https://", "danger");
    }
    

// book data
    const bookData = {
    bookId, 
    title,
    author,
    category,
    price,
    stock,
    description,
    imageUrl,
    };

    //add to Firebase
    const result = await addBook(bookData);
    if (result.success) {
    showAlert(`Book added successfully! ID: ${result.id}`, "success");
    addBookForm.reset();
    previewImg.src = "";
    previewImg.style.display = "none";
    } else {
    showAlert(`Error: ${result.error.message}`, "danger");
    }
});


// =====================================================================================================
// get books table
async function renderBooksTable() {
    const tableBody = document.getElementById("books-table-body");
    tableBody.innerHTML = "<tr><td colspan='8'>Loading...</td></tr>";
    const result = await getBooks();
    if (!result.success) {
        tableBody.innerHTML = `<tr><td colspan="8">Error loading books: ${result.error.message}</td></tr>`;
        return;
    }
    if (result.books.length === 0) {
        tableBody.innerHTML = `<tr><td colspan='8'>No books found.</td></tr>`;
        return;
    }
    const books = result.books;
    tableBody.innerHTML = "";
    books.forEach(book => {
        const row = createBookRow(book);
        tableBody.appendChild(row);
    });

    deletEditButtons(books);
}

// ====================================================================================================
// create row for each book
function createBookRow(book) {
    const row = document.createElement("tr");
    const description = book.description.length > 100 
        ? book.description.split(" ").slice(0, 30).join(" ") + '...' 
        : book.description;

    row.innerHTML = `
        <td>${book.title}</td>
        <td>${book.author}</td>
        <td>${book.category}</td>
        <td>EGP${book.price.toFixed(2)}</td>
        <td>${book.stock}</td>
        <td>${description}</td>
        <td>${book.imageUrl ? `<img src="${book.imageUrl}" alt="${book.title}" style="max-width: 60px;">` : 'None'}</td>
        <td>
            <button class="btn btn-sm btn-outline-primary edit-btn" data-id="${book.id}" title="Edit">
                <i class="bi bi-pencil-square"></i>
            </button>
            <button class="btn btn-sm btn-outline-danger delete-btn" data-id="${book.id}" data-title="${book.title}" title="Delete">
                <i class="bi bi-trash"></i>
            </button>
        </td>
    `;
    return row;
}

// ================================================================================================
// delete edit actions
function deletEditButtons(books) {
    const tableBody = document.getElementById("books-table-body");
    const deleteModal = new bootstrap.Modal(document.getElementById('deleteBookModal'), { backdrop: 'static', keyboard: false });

    tableBody.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const book = books.find(b => b.id === btn.dataset.id);
            if (book) editModal(book);
        });
    });
    tableBody.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.getElementById('delete-book-title').textContent = btn.dataset.title;
            document.getElementById('confirm-delete-book').dataset.id = btn.dataset.id;
            deleteModal.show();
        });
    });

    // Confirm delete
    document.getElementById('confirm-delete-book').onclick = async () => {
        const bookId = document.getElementById('confirm-delete-book').dataset.id;
        try {
            await deleteBook(bookId);
            deleteModal.hide();
            await renderBooksTable();
            showAlertTable("Book deleted successfully!", "success", "books-table-alert");
        } catch (error) {
            deleteModal.hide();
            showAlertTable("Error deleting book: " + error.message, "danger", "books-table-alert");
        }
    };

    // Cancel delete
    document.getElementById('cancel-delete-book').onclick = () => {
        deleteModal.hide();
    };
}

// ========================================================================================================
// Edit Modal

const editImageUrlInput = document.getElementById("edit-book-image-url");
const editPreviewImg = document.getElementById("edit-preview-img");

editImageUrlInput.addEventListener("input", () => {
const url = editImageUrlInput.value.trim();
if (url && (url.startsWith("http://") || url.startsWith("https://"))) {
    editPreviewImg.src = url;
    editPreviewImg.style.display = "block";
} else {
    editPreviewImg.src = "";
    editPreviewImg.style.display = "none";
}
});
function editModal(book) {
    document.getElementById('edit-book-id').value = book.id;
    document.getElementById('edit-book-title').value = book.title;
    document.getElementById('edit-book-author').value = book.author;
    document.getElementById('edit-book-category').value = book.category;
    document.getElementById('edit-book-price').value = book.price;
    document.getElementById('edit-book-stock').value = book.stock;
    document.getElementById('edit-book-description').value = book.description;
    document.getElementById('edit-book-image-url').value = book.imageUrl || "";

    if (book.imageUrl) {
    editPreviewImg.src = book.imageUrl;
    editPreviewImg.style.display = "block";
} else {
    editPreviewImg.src = "";
    editPreviewImg.style.display = "none";
}
    const modal = new bootstrap.Modal(document.getElementById('editBookModal'), { backdrop: 'static', keyboard: false });
    modal.show();
}



// =================================================================================================
// Cancel Edit
document.getElementById('edit-cancel').addEventListener('click', () => {
    const modal = bootstrap.Modal.getInstance(document.getElementById('editBookModal'));
    modal.hide();
});



// ==================================================================================================
// Save Edited Book
document.getElementById('save-book-changes').addEventListener('click', async () => {
    const bookId = document.getElementById('edit-book-id').value;
    const title = document.getElementById('edit-book-title').value.trim();
    const author = document.getElementById('edit-book-author').value.trim();
    const category = document.getElementById('edit-book-category').value.trim();
    const price = parseFloat(document.getElementById('edit-book-price').value);
    const stock = parseInt(document.getElementById('edit-book-stock').value);
    const description = document.getElementById('edit-book-description').value.trim();
    const imageUrl = document.getElementById('edit-book-image-url').value.trim();

    // Validation edit modal
    if (!title || title.length < 5) return showAlertTable("Title must be at least 5 characters.", "danger");
    if (!author || author.length < 3) return showAlertTable("Author must be at least 3 characters.", "danger");
    if (!category) return showAlertTable("Category is required.", "danger");
    if (isNaN(price) || price < 0) return showAlertTable("Price must be a valid positive number.", "danger");
    if (isNaN(stock) || stock < 0) return showAlertTable("Stock must be a valid positive number.", "danger");
    if (!description || description.length < 10) return showAlertTable("Description must be at least 10 characters.", "danger");
    if (!imageUrl || !(imageUrl.startsWith("http://") || imageUrl.startsWith("https://"))) {
        return showAlertTable("Please enter a valid image URL starting with http:// or https://", "danger");
    }
    const updatedBook = {
        title,
        author,
        category,
        price,
        stock,
        description,
        imageUrl
    };

    try {
        await updateBook(bookId, updatedBook);
        const modal = bootstrap.Modal.getInstance(document.getElementById('editBookModal'));
        modal.hide();
        await renderBooksTable();
        showAlertTable("Book updated successfully!", "success", "books-table-alert");
    } catch (error) {
        showAlertTable("Error updating book: " + error.message, "danger", "books-table-alert");
    }
});

//=======================================================================================
//signout
document.getElementById("sign-out-btn").addEventListener("click", async (e) => {
    e.preventDefault();
    try {
    await signOutUser();
    window.location.href = "../../index.html"; 
    } catch (error) {
    alert("Error signing out: " + error.message, "danger", "books-table-alert");
    }
});

});


//======================================================================================
//orders 
async function renderOrdersTable() {
    const tableBody = document.getElementById("orders-table-body");
    tableBody.innerHTML = "<tr><td colspan='5'>Loading...</td></tr>";

    const result = await getAllOrders();
    if (!result.success) {
        tableBody.innerHTML = `<tr><td colspan="5">Error loading orders: ${result.error.message}</td></tr>`;
        return;
    }

    if (result.orders.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="5">No orders found.</td></tr>`;
        return;
    }

    tableBody.innerHTML = "";

    for (const order of result.orders) {
        const userName = await getUserNameById(order.userId);
        const row = createOrderRow(order, userName);
        tableBody.appendChild(row);
    }
}
//order row
function createOrderRow(order, userName) {
    const row = document.createElement("tr");

    const itemsFormatted = Array.isArray(order.items?.itemsName)
? order.items.itemsName.join(", ")
: "No items";
    row.innerHTML = `
        <td>${order.orderId}</td>
        <td>${order.userId || "N/A"}</td>
        <td>${userName}</td>
        <td>${itemsFormatted}</td>
        <td>EGP${order.total?.toFixed(2) || "0.00"}</td>
    `;
    return row;
}





