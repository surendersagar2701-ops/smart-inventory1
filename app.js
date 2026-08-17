/* =========================================================
   SMART INVENTORY APP — app.js
   ========================================================= */

"use strict";

/* ---------- APP STATE ---------- */

const state = {
    products: JSON.parse(localStorage.getItem("inventory_products") || "[]"),
    cart: [],
    currentUser: JSON.parse(localStorage.getItem("inventory_user") || "null"),
    discount: 0,
    discountType: "percent"
};


/* ---------- HELPERS ---------- */

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

function saveProducts() {
    localStorage.setItem("inventory_products", JSON.stringify(state.products));
}

function saveUser() {
    localStorage.setItem("inventory_user", JSON.stringify(state.currentUser));
}

function uid() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
}

function money(value) {
    return "₹" + Number(value || 0).toFixed(2);
}

function escapeHTML(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


/* =========================================================
   LOGIN
   Mobile + OTP OR Gmail
   ========================================================= */

function initLogin() {

    const loginForm = $("#loginForm");

    if (!loginForm) return;

    loginForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const mobile = $("#mobile");
        const email = $("#email");

        const mobileValue = mobile ? mobile.value.trim() : "";
        const emailValue = email ? email.value.trim() : "";

        if (!mobileValue && !emailValue) {
            alert("Mobile number ya Gmail enter karo.");
            return;
        }

        if (mobileValue && mobileValue.length < 10) {
            alert("Valid mobile number enter karo.");
            return;
        }

        state.currentUser = {
            mobile: mobileValue,
            email: emailValue,
            loginTime: new Date().toISOString()
        };

        saveUser();

        alert("Login successful!");

        showApp();
    });

    const otpButton = $("#sendOtp");

    if (otpButton) {
        otpButton.addEventListener("click", function () {

            const mobile = $("#mobile")?.value.trim();

            if (!mobile || mobile.length < 10) {
                alert("Pehle valid mobile number enter karo.");
                return;
            }

            alert("OTP verification system ke liye backend/API connect karna hoga.");
        });
    }
}


/* ---------- SHOW APP ---------- */

function showApp() {

    const loginScreen = $("#loginScreen");
    const app = $("#app");

    if (loginScreen) loginScreen.style.display = "none";
    if (app) app.style.display = "block";

    renderProducts();
    updateDashboard();
}


/* =========================================================
   NAVIGATION
   ========================================================= */

function initNavigation() {

    $$("[data-page]").forEach(button => {

        button.addEventListener("click", function () {

            const pageName = this.dataset.page;

            $$("[data-page]").forEach(btn => {
                btn.classList.remove("active");
            });

            this.classList.add("active");

            $$(".page").forEach(page => {
                page.style.display = "none";
            });

            const target = $("#" + pageName);

            if (target) {
                target.style.display = "block";
            }

            if (pageName === "inventory") {
                renderProducts();
            }

            if (pageName === "dashboard") {
                updateDashboard();
            }

            if (pageName === "billing") {
                renderCart();
            }
        });
    });
}


/* =========================================================
   PRODUCT ADD
   ========================================================= */

function initProductForm() {

    const form = $("#productForm");

    if (!form) return;

    form.addEventListener("submit", function (e) {

        e.preventDefault();

        const product = {
            id: uid(),
            sku: $("#sku")?.value.trim() || generateSKU(),
            name: $("#productName")?.value.trim() || "",
            category: $("#category")?.value.trim() || "",
            brand: $("#brand")?.value.trim() || "",
            color: $("#color")?.value.trim() || "",
            size: $("#size")?.value.trim() || "",
            purchasePrice: Number($("#purchasePrice")?.value || 0),
            sellingPrice: Number($("#sellingPrice")?.value || 0),
            quantity: Number($("#quantity")?.value || 0),
            minStock: Number($("#minStock")?.value || 5),
            image: "",
            createdAt: new Date().toISOString()
        };

        if (!product.name) {
            alert("Product name enter karo.");
            return;
        }

        state.products.push(product);

        saveProducts();

        form.reset();

        alert("Product inventory mein add ho gaya.");

        renderProducts();
        updateDashboard();
    });
}


/* ---------- SKU ---------- */

function generateSKU() {
    return "SKU-" + Date.now().toString().slice(-8);
}


/* =========================================================
   INVENTORY DISPLAY
   ========================================================= */

function renderProducts(list = state.products) {

    const container =
        $("#productList") ||
        $("#inventoryList") ||
        $("#productsContainer");

    if (!container) return;

    if (list.length === 0) {

        container.innerHTML = `
            <div class="empty-state">
                <h3>Inventory Empty</h3>
                <p>Abhi koi product add nahi hua.</p>
            </div>
        `;

        return;
    }

    container.innerHTML = list.map(product => {

        const lowStock =
            Number(product.quantity) <= Number(product.minStock);

        return `
            <div class="product-card">

                <div class="product-info">

                    <h3>${escapeHTML(product.name)}</h3>

                    <p>SKU: ${escapeHTML(product.sku)}</p>

                    <p>
                        ${escapeHTML(product.brand)}
                        ${product.color ? " • " + escapeHTML(product.color) : ""}
                        ${product.size ? " • Size " + escapeHTML(product.size) : ""}
                    </p>

                    <strong>${money(product.sellingPrice)}</strong>

                    <p class="${lowStock ? "low-stock" : ""}">
                        Stock: ${product.quantity}
                    </p>

                </div>

                <div class="product-actions">

                    <button onclick="addToCart('${product.id}')">
                        Add to Bill
                    </button>

                    <button onclick="editProduct('${product.id}')">
                        Edit
                    </button>

                    <button onclick="deleteProduct('${product.id}')">
                        Delete
                    </button>

                </div>

            </div>
        `;

    }).join("");
}


/* =========================================================
   SEARCH
   ========================================================= */

function initSearch() {

    const search =
        $("#searchInput") ||
        $("#inventorySearch") ||
        $("#search");

    if (!search) return;

    search.addEventListener("input", function () {

        const query = this.value.toLowerCase().trim();

        const filtered = state.products.filter(product => {

            return (
                String(product.name).toLowerCase().includes(query) ||
                String(product.sku).toLowerCase().includes(query) ||
                String(product.brand).toLowerCase().includes(query) ||
                String(product.category).toLowerCase().includes(query) ||
                String(product.color).toLowerCase().includes(query) ||
                String(product.size).toLowerCase().includes(query)
            );

        });

        renderProducts(filtered);
    });
}


/* =========================================================
   DELETE PRODUCT
   ========================================================= */

window.deleteProduct = function (id) {

    const product = state.products.find(p => p.id === id);

    if (!product) return;

    if (!confirm(`"${product.name}" delete karna hai?`)) {
        return;
    }

    state.products =
        state.products.filter(product => product.id !== id);

    saveProducts();

    renderProducts();
    updateDashboard();
};


/* =========================================================
   EDIT PRODUCT
   ========================================================= */

window.editProduct = function (id) {

    const product = state.products.find(p => p.id === id);

    if (!product) return;

    const name = prompt("Product name:", product.name);

    if (name === null) return;

    const price = prompt(
        "Selling price:",
        product.sellingPrice
    );

    if (price === null) return;

    const quantity = prompt(
        "Quantity:",
        product.quantity
    );

    if (quantity === null) return;

    product.name = name.trim();
    product.sellingPrice = Number(price);
    product.quantity = Number(quantity);

    saveProducts();

    renderProducts();
    updateDashboard();

    alert("Product updated.");
};


/* =========================================================
   BILLING
   ========================================================= */

window.addToCart = function (id) {

    const product = state.products.find(p => p.id === id);

    if (!product) return;

    if (product.quantity <= 0) {
        alert("Is product ka stock khatam hai.");
        return;
    }

    const existing = state.cart.find(item => item.id === id);

    if (existing) {

        if (existing.qty >= product.quantity) {
            alert("Available stock se zyada quantity nahi le sakte.");
            return;
        }

        existing.qty++;

    } else {

        state.cart.push({
            id: product.id,
            name: product.name,
            sku: product.sku,
            price: Number(product.sellingPrice),
            qty: 1
        });
    }

    renderCart();
};


/* ---------- REMOVE FROM CART ---------- */

window.removeFromCart = function (id) {

    state.cart =
        state.cart.filter(item => item.id !== id);

    renderCart();
};


/* ---------- CHANGE CART QUANTITY ---------- */

window.changeCartQty = function (id, amount) {

    const item = state.cart.find(i => i.id === id);

    if (!item) return;

    const product = state.products.find(p => p.id === id);

    item.qty += amount;

    if (item.qty <= 0) {
        removeFromCart(id);
        return;
    }

    if (product && item.qty > product.quantity) {
        item.qty = product.quantity;
        alert("Available stock se zyada quantity nahi hai.");
    }

    renderCart();
};


/* =========================================================
   CART DISPLAY
   ========================================================= */

function renderCart() {

    const container =
        $("#cartItems") ||
        $("#billingItems") ||
        $("#cart");

    if (!container) return;

    if (state.cart.length === 0) {

        container.innerHTML = `
            <div class="empty-state">
                <p>Bill mein koi product nahi hai.</p>
            </div>
        `;

        updateBillTotals();
        return;
    }

    container.innerHTML = state.cart.map(item => {

        const total = item.price * item.qty;

        return `
            <div class="cart-item">

                <div>
                    <strong>${escapeHTML(item.name)}</strong>
                    <small>${escapeHTML(item.sku)}</small>
                </div>

                <div>
                    <button onclick="changeCartQty('${item.id}', -1)">−</button>

                    <span>${item.qty}</span>

                    <button onclick="changeCartQty('${item.id}', 1)">+</button>
                </div>

                <strong>${money(total)}</strong>

                <button onclick="removeFromCart('${item.id}')">
                    Remove
                </button>

            </div>
        `;

    }).join("");

    updateBillTotals();
}


/* =========================================================
   DISCOUNT
   ========================================================= */

function initDiscount() {

    const discountInput = $("#discount");

    if (!discountInput) return;

    discountInput.addEventListener("input", function () {

        state.discount = Number(this.value || 0);

        updateBillTotals();
    });


    const discountType = $("#discountType");

    if (discountType) {

        discountType.addEventListener("change", function () {

            state.discountType = this.value;

            updateBillTotals();
        });
    }
}


/* ---------- BILL TOTAL ---------- */

function updateBillTotals() {

    const subtotal =
        state.cart.reduce(
            (sum, item) => sum + item.price * item.qty,
            0
        );

    let discountAmount = 0;

    if (state.discountType === "amount") {

        discountAmount =
            Math.min(state.discount, subtotal);

    } else {

        discountAmount =
            subtotal * (state.discount / 100);

    }

    const total =
        Math.max(0, subtotal - discountAmount);

    setText("#subtotal", money(subtotal));
    setText("#discountAmount", money(discountAmount));
    setText("#grandTotal", money(total));
    setText("#total", money(total));
}


/* ---------- TEXT HELPER ---------- */

function setText(selector, value) {

    const element = $(selector);

    if (element) {
        element.textContent = value;
    }
}


/* =========================================================
   COMPLETE BILL
   ========================================================= */

function initCheckout() {

    const button =
        $("#checkoutBtn") ||
        $("#completeBill") ||
        $("#generateBill");

    if (!button) return;

    button.addEventListener("click", completeBill);
}


function completeBill() {

    if (state.cart.length === 0) {
        alert("Bill mein koi product nahi hai.");
        return;
    }

    const subtotal =
        state.cart.reduce(
            (sum, item) => sum + item.price * item.qty,
            0
        );

    let discountAmount = 0;

    if (state.discountType === "amount") {
        discountAmount = Math.min(
            state.discount,
            subtotal
        );
    } else {
        discountAmount =
            subtotal * state.discount / 100;
    }

    const total =
        subtotal - discountAmount;

    /* STOCK UPDATE */

    state.cart.forEach(item => {

        const product =
            state.products.find(p => p.id === item.id);

        if (product) {
            product.quantity -= item.qty;

            if (product.quantity < 0) {
                product.quantity = 0;
            }
        }
    });

    saveProducts();

    /* BILL */

    const billNumber =
        "BILL-" + Date.now().toString().slice(-8);

    const bill = {
        billNumber,
        date: new Date().toLocaleString("en-IN"),
        items: [...state.cart],
        subtotal,
        discount: discountAmount,
        total
    };

    localStorage.setItem(
        "last_bill",
        JSON.stringify(bill)
    );

    alert(
        `Bill Generated!\n\n` +
        `Bill No: ${billNumber}\n` +
        `Total: ${money(total)}`
    );

    state.cart = [];
    state.discount = 0;

    const discountInput = $("#discount");

    if (discountInput) {
        discountInput.value = "";
    }

    renderCart();
    renderProducts();
    updateDashboard();
}


/* =========================================================
   DASHBOARD
   ========================================================= */

function updateDashboard() {

    const totalProducts =
        state.products.length;

    const totalStock =
        state.products.reduce(
            (sum, p) => sum + Number(p.quantity || 0),
            0
        );

    const lowStock =
        state.products.filter(
            p => Number(p.quantity) <= Number(p.minStock || 5)
        ).length;

    setText("#totalProducts", totalProducts);
    setText("#totalStock", totalStock);
    setText("#lowStock", lowStock);
}


/* =========================================================
   BULK PRODUCT ADD
   ========================================================= */

function initBulkAdd() {

    const fileInput =
        $("#bulkFile") ||
        $("#importFile");

    if (!fileInput) return;

    fileInput.addEventListener("change", function () {

        const file = this.files[0];

        if (!file) return;

        const extension =
            file.name.split(".").pop().toLowerCase();

        if (extension === "csv") {

            const reader = new FileReader();

            reader.onload = function (event) {

                importCSV(event.target.result);

            };

            reader.readAsText(file);

        } else {

            alert(
                "CSV file direct import supported hai. " +
                "Excel ke liye XLSX library connect karni hogi."
            );
        }
    });
}


/* ---------- CSV IMPORT ---------- */

function importCSV(text) {

    const rows = text
        .split(/\r?\n/)
        .map(row => row.trim())
        .filter(Boolean);

    if (rows.length < 2) {
        alert("CSV mein data nahi mila.");
        return;
    }

    const headers =
        rows[0].split(",").map(h => h.trim().toLowerCase());

    let added = 0;
    let incomplete = 0;

    for (let i = 1; i < rows.length; i++) {

        const values =
            rows[i].split(",").map(v => v.trim());

        const data = {};

        headers.forEach((header, index) => {
            data[header] = values[index] || "";
        });

        const product = {
            id: uid(),
            sku: data.sku || generateSKU(),
            name: data.name || data.productname || "",
            category: data.category || "",
            brand: data.brand || "",
            color: data.color || "",
            size: data.size || "",
            purchasePrice: Number(
                data.purchaseprice || data.purchase_price || 0
            ),
            sellingPrice: Number(
                data.sellingprice || data.selling_price || 0
            ),
            quantity: Number(data.quantity || data.stock || 0),
            minStock: Number(data.minstock || 5),
            image: "",
            createdAt: new Date().toISOString()
        };

        if (!product.name) {
            incomplete++;
            continue;
        }

        state.products.push(product);
        added++;
    }

    saveProducts();

    renderProducts();
    updateDashboard();

    alert(
        `Import Complete!\n\n` +
        `Added: ${added}\n` +
        `Incomplete: ${incomplete}`
    );
}


/* =========================================================
   QR / SKU SCAN
   ========================================================= */

function initScanner() {

    const scanButton =
        $("#scanButton") ||
        $("#startScanner") ||
        $("#scanAdd");

    if (!scanButton) return;

    scanButton.addEventListener("click", startScanner);
}


async function startScanner() {

    if (!navigator.mediaDevices?.getUserMedia) {

        alert(
            "Camera access browser mein available nahi hai."
        );

        return;
    }

    try {

        const stream =
            await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: "environment"
                }
            });

        const video =
            $("#scannerVideo");

        if (!video) {

            stream.getTracks().forEach(
                track => track.stop()
            );

            alert(
                "Scanner video element HTML mein nahi mila."
            );

            return;
        }

        video.srcObject = stream;
        video.play();

        alert(
            "Camera scanner start ho gaya. " +
            "QR decoding ke liye QR library/API connect karni hogi."
        );

    } catch (error) {

        console.error(error);

        alert(
            "Camera permission allow karo."
        );
    }
}


/* =========================================================
   AI COLOR / SAREE MATCH
   ========================================================= */

function initAISetMaking() {

    const button =
        $("#aiSetMaking") ||
        $("#aiScan") ||
        $("#aiMatch");

    if (!button) return;

    button.addEventListener("click", function () {

        alert(
            "AI Set Making selected.\n\n" +
            "Image scan karke saree ka color detect hoga " +
            "aur inventory ke matching products search honge."
        );

        const input =
            $("#aiImage") ||
            $("#sareeImage");

        if (input) {
            input.click();
        }
    });
}


/* ---------- COLOR MATCH ---------- */

function findColorMatches(color) {

    if (!color) return [];

    const query =
        color.toLowerCase().trim();

    return state.products.filter(product => {

        const productColor =
            String(product.color || "").toLowerCase();

        return (
            productColor.includes(query) ||
            query.includes(productColor)
        );
    });
}


/* =========================================================
   IMAGE PREVIEW
   ========================================================= */

function initImagePreview() {

    $$("input[type='file']").forEach(input => {

        input.addEventListener("change", function () {

            const file = this.files[0];

            if (!file || !file.type.startsWith("image/")) {
                return;
            }

            const reader = new FileReader();

            reader.onload = function (event) {

                const previewId =
                    input.dataset.preview;

                if (!previewId) return;

                const preview =
                    $("#" + previewId);

                if (preview) {
                    preview.src =
                        event.target.result;
                    preview.style.display = "block";
                }
            };

            reader.readAsDataURL(file);
        });
    });
}


/* =========================================================
   LOGOUT
   ========================================================= */

function initLogout() {

    const button = $("#logout");

    if (!button) return;

    button.addEventListener("click", function () {

        if (!confirm("Logout karna hai?")) {
            return;
        }

        state.currentUser = null;

        localStorage.removeItem(
            "inventory_user"
        );

        location.reload();
    });
}


/* =========================================================
   APP INITIALIZATION
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    initLogin();
    initNavigation();
    initProductForm();
    initSearch();
    initDiscount();
    initCheckout();
    initBulkAdd();
    initScanner();
    initAISetMaking();
    initImagePreview();
    initLogout();

    if (state.currentUser) {
        showApp();
    } else {

        const app = $("#app");

        if (app) {
            app.style.display = "none";
        }
    }

    renderProducts();
    renderCart();
    updateDashboard();

    console.log(
        "Smart Inventory App initialized successfully."
    );
});
