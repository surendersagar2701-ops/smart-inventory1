/* =========================================================
   SMART INVENTORY — FINAL APP.JS
   ========================================================= */

/* =========================
   DATA
========================= */

let inventory = JSON.parse(
    localStorage.getItem("smartInventoryProducts") || "[]"
);

let sales = JSON.parse(
    localStorage.getItem("smartInventorySales") || "[]"
);

let currentUser = JSON.parse(
    localStorage.getItem("smartInventoryUser") || "null"
);

let temporaryOTP = null;
let selectedDesigns = [0];

const LOW_STOCK_LIMIT = 5;


/* =========================
   START APP
========================= */

document.addEventListener("DOMContentLoaded", () => {

    if (currentUser) {
        showApp();
    } else {
        showLogin();
    }

    const form = document.getElementById("productForm");

    if (form) {
        form.addEventListener("submit", addProduct);
    }

    const aiFile = document.getElementById("aiFile");

    if (aiFile) {
        aiFile.addEventListener("change", handleAIFile);
    }

    const sareeImage = document.getElementById("sareeImage");

    if (sareeImage) {
        sareeImage.addEventListener("change", handleSareeImage);
    }

    setupDesignButtons();

    updateDashboard();
    renderInventory();
    updateBillProducts();
    renderLowStock();
});


/* =========================
   LOGIN
========================= */

function showLogin() {

    document
        .getElementById("loginScreen")
        ?.classList.remove("hidden");

    document
        .getElementById("app")
        ?.classList.add("hidden");
}


function showApp() {

    document
        .getElementById("loginScreen")
        ?.classList.add("hidden");

    document
        .getElementById("app")
        ?.classList.remove("hidden");

    updateUserInfo();
    updateDashboard();
    renderInventory();
    updateBillProducts();
    renderLowStock();

    openPage("homePage");
}


/* =========================
   OTP LOGIN
========================= */

function sendOTP() {

    const input = document.getElementById("mobileNumber");

    if (!input) return;

    const mobile = input.value.trim();

    if (!/^[0-9]{10}$/.test(mobile)) {

        alert("Please enter a valid 10 digit mobile number.");

        return;
    }

    /*
      Temporary frontend OTP.

      IMPORTANT:
      Real SMS OTP requires Firebase/Auth or
      another backend service.
    */

    temporaryOTP =
        String(Math.floor(100000 + Math.random() * 900000));

    console.log("TEST OTP:", temporaryOTP);

    alert(
        "Testing OTP:\n\n" +
        temporaryOTP +
        "\n\nReal SMS OTP will be connected later."
    );

    document
        .getElementById("mobileLogin")
        ?.classList.add("hidden");

    document
        .getElementById("otpLogin")
        ?.classList.remove("hidden");
}


function verifyOTP() {

    const input = document.getElementById("otpInput");

    if (!input) return;

    const otp = input.value.trim();

    if (!temporaryOTP) {

        alert("Please request OTP first.");

        return;
    }

    if (otp !== temporaryOTP) {

        alert("Incorrect OTP.");

        return;
    }

    document
        .getElementById("otpLogin")
        ?.classList.add("hidden");

    document
        .getElementById("gmailLogin")
        ?.classList.remove("hidden");
}


function backToMobile() {

    document
        .getElementById("otpLogin")
        ?.classList.add("hidden");

    document
        .getElementById("mobileLogin")
        ?.classList.remove("hidden");
}


function loginWithGmail() {

    const gmailInput =
        document.getElementById("gmailInput");

    if (!gmailInput) return;

    const gmail = gmailInput.value.trim();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(gmail)) {

        alert("Please enter a valid Gmail address.");

        return;
    }

    const mobile =
        document.getElementById("mobileNumber")
        ?.value.trim() || "";

    currentUser = {
        mobile: mobile,
        gmail: gmail,
        loginDate: new Date().toISOString()
    };

    localStorage.setItem(
        "smartInventoryUser",
        JSON.stringify(currentUser)
    );

    showApp();
}


function updateUserInfo() {

    const element =
        document.getElementById("userInfo");

    if (!element) return;

    element.textContent =
        currentUser?.gmail ||
        currentUser?.mobile ||
        "Inventory Management";
}


function logout() {

    if (!confirm("Are you sure you want to logout?")) {
        return;
    }

    localStorage.removeItem("smartInventoryUser");

    currentUser = null;
    temporaryOTP = null;

    showLogin();

    document
        .getElementById("mobileLogin")
        ?.classList.remove("hidden");

    document
        .getElementById("otpLogin")
        ?.classList.add("hidden");

    document
        .getElementById("gmailLogin")
        ?.classList.add("hidden");
}


/* =========================
   NAVIGATION
========================= */

function openPage(pageId, clickedButton = null) {

    document
        .querySelectorAll(".page")
        .forEach(page => {
            page.classList.remove("active");
        });

    const page =
        document.getElementById(pageId);

    if (page) {
        page.classList.add("active");
    }

    document
        .querySelectorAll(".nav-item")
        .forEach(item => {
            item.classList.remove("active");
        });

    if (clickedButton) {

        clickedButton.classList.add("active");

    } else {

        const map = {
            homePage: 0,
            inventoryPage: 1,
            aiSetMakerPage: 2,
            billPage: 3,
            morePage: 4
        };

        const index = map[pageId];

        if (index !== undefined) {

            document
                .querySelectorAll(".nav-item")
                [index]
                ?.classList.add("active");
        }
    }

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

    if (pageId === "homePage") {
        updateDashboard();
        renderLowStock();
    }

    if (pageId === "inventoryPage") {
        renderInventory();
    }

    if (pageId === "billPage") {
        updateBillProducts();
    }

    if (pageId === "lowStockPage") {
        renderLowStock();
    }
}


/* =========================
   NORMAL ADD
========================= */

function addProduct(event) {

    event.preventDefault();

    const get = id =>
        document.getElementById(id)?.value.trim() || "";

    const name = get("productName");
    const sku = get("productSKU");
    const category = get("productCategory");
    const colour = get("productColour");
    const size = get("productSize");
    const notes = get("productNotes");

    const quantity =
        Number(get("productQuantity")) || 0;

    const purchasePrice =
        Number(get("purchasePrice")) || 0;

    const sellingPrice =
        Number(get("sellingPrice")) || 0;

    if (!name || !sku) {

        alert("Product Name and SKU are required.");

        return;
    }

    const exists =
        inventory.some(
            product =>
                product.sku.toLowerCase() ===
                sku.toLowerCase()
        );

    if (exists) {

        alert("This SKU already exists.");

        return;
    }

    const product = {

        id: crypto.randomUUID
            ? crypto.randomUUID()
            : Date.now().toString(),

        name,
        sku,
        category,
        colour,
        size,
        quantity,
        purchasePrice,
        sellingPrice,
        notes,

        createdAt:
            new Date().toISOString()
    };

    inventory.push(product);

    saveInventory();

    document
        .getElementById("productForm")
        ?.reset();

    const quantityInput =
        document.getElementById("productQuantity");

    if (quantityInput) {
        quantityInput.value = 0;
    }

    updateDashboard();
    renderInventory();
    updateBillProducts();
    renderLowStock();

    alert("Product added successfully.");

    openPage("inventoryPage");
}


function saveInventory() {

    localStorage.setItem(
        "smartInventoryProducts",
        JSON.stringify(inventory)
    );
}


/* =========================
   INVENTORY
========================= */

function renderInventory(searchTerm = "") {

    const container =
        document.getElementById("inventoryList");

    if (!container) return;

    let products = [...inventory];

    const term =
        searchTerm.toLowerCase().trim();

    if (term) {

        products =
            products.filter(product => {

                return (

                    String(product.name)
                        .toLowerCase()
                        .includes(term)

                    ||

                    String(product.sku)
                        .toLowerCase()
                        .includes(term)

                    ||

                    String(product.colour || "")
                        .toLowerCase()
                        .includes(term)

                    ||

                    String(product.category || "")
                        .toLowerCase()
                        .includes(term)

                    ||

                    String(product.size || "")
                        .toLowerCase()
                        .includes(term)
                );
            });
    }

    if (!products.length) {

        container.innerHTML = `
            <div class="empty-state">
                <div>📦</div>
                <h3>No products found</h3>
                <p>Add products to your inventory.</p>
            </div>
        `;

        return;
    }

    container.innerHTML =
        products.map(product => {

            const low =
                Number(product.quantity) <= LOW_STOCK_LIMIT;

            return `
                <div class="product-item">

                    <div class="product-item-header">

                        <div>
                            <h3>
                                ${escapeHTML(product.name)}
                            </h3>

                            <small>
                                SKU:
                                ${escapeHTML(product.sku)}
                            </small>
                        </div>

                        <button
                            class="small-main-btn"
                            onclick="editStock('${product.id}')"
                        >
                            Update Stock
                        </button>

                    </div>

                    <div class="product-item-info">

                        <div class="info-box">
                            <small>Category</small>
                            <strong>
                                ${escapeHTML(product.category || "-")}
                            </strong>
                        </div>

                        <div class="info-box">
                            <small>Colour</small>
                            <strong>
                                ${escapeHTML(product.colour || "-")}
                            </strong>
                        </div>

                        <div class="info-box">
                            <small>Size</small>
                            <strong>
                                ${escapeHTML(product.size || "-")}
                            </strong>
                        </div>

                        <div class="info-box">
                            <small>Stock</small>
                            <strong class="${low ? "stock-low" : "stock-good"}">
                                ${product.quantity}
                                ${low ? " ⚠️" : ""}
                            </strong>
                        </div>

                        <div class="info-box">
                            <small>Purchase</small>
                            <strong>
                                ₹${Number(product.purchasePrice).toFixed(2)}
                            </strong>
                        </div>

                        <div class="info-box">
                            <small>Selling</small>
                            <strong>
                                ₹${Number(product.sellingPrice).toFixed(2)}
                            </strong>
                        </div>

                    </div>

                    <button
                        onclick="deleteProduct('${product.id}')"
                        style="
                            margin-top:15px;
                            border:0;
                            background:transparent;
                            color:#d64545;
                            font-weight:700;
                        "
                    >
                        Delete Product
                    </button>

                </div>
            `;

        }).join("");
}


function searchInventory() {

    const input =
        document.getElementById("inventorySearch");

    renderInventory(
        input?.value || ""
    );
}


function editStock(productId) {

    const product =
        inventory.find(
            item => item.id === productId
        );

    if (!product) return;

    const value =
        prompt(
            `Current stock: ${product.quantity}\nEnter new quantity:`,
            product.quantity
        );

    if (value === null) return;

    const quantity = Number(value);

    if (
        Number.isNaN(quantity) ||
        quantity < 0
    ) {

        alert("Enter a valid quantity.");

        return;
    }

    product.quantity = quantity;

    saveInventory();

    updateDashboard();
    renderInventory();
    updateBillProducts();
    renderLowStock();
}


function deleteProduct(productId) {

    const product =
        inventory.find(
            item => item.id === productId
        );

    if (!product) return;

    if (
        !confirm(
            `Delete "${product.name}"?`
        )
    ) {
        return;
    }

    inventory =
        inventory.filter(
            item => item.id !== productId
        );

    saveInventory();

    updateDashboard();
    renderInventory();
    updateBillProducts();
    renderLowStock();
}


/* =========================
   DASHBOARD
========================= */

function updateDashboard() {

    const totalProducts =
        document.getElementById("totalProducts");

    const totalStock =
        document.getElementById("totalStock");

    const lowStock =
        document.getElementById("lowStock");

    const todaySale =
        document.getElementById("todaySale");

    const total =
        inventory.reduce(
            (sum, product) =>
                sum + Number(product.quantity || 0),
            0
        );

    const low =
        inventory.filter(
            product =>
                Number(product.quantity || 0)
                <= LOW_STOCK_LIMIT
        ).length;

    const today =
        new Date().toDateString();

    const amount =
        sales
            .filter(
                sale =>
                    new Date(sale.date)
                        .toDateString() === today
            )
            .reduce(
                (sum, sale) =>
                    sum + Number(sale.total || 0),
                0
            );

    if (totalProducts) {
        totalProducts.textContent =
            inventory.length;
    }

    if (totalStock) {
        totalStock.textContent =
            total;
    }

    if (lowStock) {
        lowStock.textContent =
            low;
    }

    if (todaySale) {
        todaySale.textContent =
            "₹" + amount.toFixed(0);
    }
}


/* =========================
   LOW STOCK
========================= */

function renderLowStock() {

    const container =
        document.getElementById("homeLowStock");

    const products =
        inventory.filter(
            product =>
                Number(product.quantity) <=
                LOW_STOCK_LIMIT
        );

    if (container) {

        if (!products.length) {

            container.innerHTML = `
                <div class="empty-state">
                    <div>✅</div>
                    <h3>No low-stock products</h3>
                    <p>Everything looks good.</p>
                </div>
            `;

        } else {

            container.innerHTML =
                products.map(product => `
                    <div class="product-item">

                        <strong>
                            ${escapeHTML(product.name)}
                        </strong>

                        <small>
                            SKU: ${escapeHTML(product.sku)}
                        </small>

                        <strong class="stock-low">
                            ${product.quantity} left
                        </strong>

                    </div>
                `).join("");
        }
    }

    const lowPage =
        document.getElementById("lowStockList");

    if (lowPage) {

        lowPage.innerHTML =
            products.map(product => `
                <div class="product-item">

                    <h3>
                        ⚠️ ${escapeHTML(product.name)}
                    </h3>

                    <small>
                        SKU: ${escapeHTML(product.sku)}
                    </small>

                    <strong class="stock-low">
                        ${product.quantity} left
                    </strong>

                </div>
            `).join("");
    }
}


/* =========================
   BILL PRODUCTS
========================= */

function updateBillProducts() {

    const select =
        document.getElementById("billProduct");

    if (!select) return;

    if (!inventory.length) {

        select.innerHTML =
            `<option value="">No products available</option>`;

        return;
    }

    select.innerHTML = `
        <option value="">Select product</option>

        ${
            inventory.map(product => `
                <option value="${product.id}">
                    ${escapeHTML(product.name)}
                    — ₹${Number(product.sellingPrice).toFixed(2)}
                    — Stock: ${product.quantity}
                </option>
            `).join("")
        }
    `;
}


/* =========================
   BILL + DISCOUNT
========================= */

function calculateBillPreview() {

    const productId =
        document.getElementById("billProduct")?.value;

    const quantity =
        Number(
            document.getElementById("billQuantity")?.value
        ) || 0;

    const discount =
        Number(
            document.getElementById("billDiscount")?.value
        ) || 0;

    const product =
        inventory.find(
            item => item.id === productId
        );

    const preview =
        document.getElementById("billCalculation");

    if (!product || !preview) return;

    const subtotal =
        Number(product.sellingPrice) *
        quantity;

    const finalDiscount =
        Math.min(
            Math.max(discount, 0),
            subtotal
        );

    const total =
        subtotal - finalDiscount;

    preview.innerHTML = `
        <div>
            Subtotal:
            <strong>₹${subtotal.toFixed(2)}</strong>
        </div>

        <div>
            Discount:
            <strong>- ₹${finalDiscount.toFixed(2)}</strong>
        </div>

        <hr>

        <div>
            Total:
            <strong>₹${total.toFixed(2)}</strong>
        </div>
    `;
}


function createBill() {

    const productId =
        document.getElementById("billProduct")?.value;

    const quantity =
        Number(
            document.getElementById("billQuantity")?.value
        ) || 0;

    const discount =
        Number(
            document.getElementById("billDiscount")?.value
        ) || 0;

    const customer =
        document.getElementById("customerName")
        ?.value.trim() ||
        "Walk-in Customer";

    if (!productId) {

        alert("Please select a product.");

        return;
    }

    if (quantity <= 0) {

        alert("Quantity must be at least 1.");

        return;
    }

    const product =
        inventory.find(
            item => item.id === productId
        );

    if (!product) {

        alert("Product not found.");

        return;
    }

    if (quantity > product.quantity) {

        alert(
            `Only ${product.quantity} units available.`
        );

        return;
    }

    const subtotal =
        Number(product.sellingPrice) *
        quantity;

    const finalDiscount =
        Math.min(
            Math.max(discount, 0),
            subtotal
        );

    const total =
        subtotal - finalDiscount;

    const billNumber =
        "SI-" +
        Date.now()
            .toString()
            .slice(-8);

    const sale = {

        id: Date.now().toString(),

        billNumber,

        customer,

        productId,

        productName: product.name,

        sku: product.sku,

        quantity,

        price: product.sellingPrice,

        subtotal,

        discount: finalDiscount,

        total,

        date: new Date().toISOString()
    };

    /* STOCK DEDUCTION */

    product.quantity -= quantity;

    sales.push(sale);

    localStorage.setItem(
        "smartInventorySales",
        JSON.stringify(sales)
    );

    saveInventory();

    showBillPreview(sale);

    updateDashboard();
    renderInventory();
    updateBillProducts();
    renderLowStock();

    alert(
        "Bill created successfully.\nStock updated automatically."
    );
}


/* =========================
   BILL PREVIEW
========================= */

function showBillPreview(sale) {

    const preview =
        document.getElementById("billPreview");

    if (!preview) return;

    preview.innerHTML = `

        <div class="bill-preview">

            <div class="bill-header">

                <h2>Smart Inventory</h2>

                <p>Parcha / Sale Bill</p>

                <small>
                    Bill No: ${escapeHTML(sale.billNumber)}
                </small>

            </div>

            <hr>

            <p>
                <strong>Customer:</strong>
                ${escapeHTML(sale.customer)}
            </p>

            <p>
                <strong>Product:</strong>
                ${escapeHTML(sale.productName)}
            </p>

            <p>
                <strong>SKU:</strong>
                ${escapeHTML(sale.sku)}
            </p>

            <p>
                <strong>Quantity:</strong>
                ${sale.quantity}
            </p>

            <p>
                <strong>Price:</strong>
                ₹${Number(sale.price).toFixed(2)}
            </p>

            <hr>

            <p>
                Subtotal:
                ₹${Number(sale.subtotal).toFixed(2)}
            </p>

            <p>
                Discount:
                - ₹${Number(sale.discount).toFixed(2)}
            </p>

            <h2>
                Total:
                ₹${Number(sale.total).toFixed(2)}
            </h2>

            <button
                class="primary-btn"
                onclick="window.print()"
            >
                🖨️ Print Bill
            </button>

        </div>
    `;
}


/* =========================
   AI FILE IMPORT
========================= */

function handleAIFile(event) {

    const file =
        event.target.files?.[0];

    if (!file) return;

    const result =
        document.getElementById("aiResults");

    if (!result) return;

    result.innerHTML = `
        <div class="info-card">

            <h3>File Selected</h3>

            <p>
                ${escapeHTML(file.name)}
            </p>

            <p>
                Size:
                ${(file.size / 1024).toFixed(1)} KB
            </p>

            <button
                class="primary-btn"
                onclick="processImportedFile()"
            >
                Preview Records
            </button>

        </div>
    `;

    window.selectedAIFile = file;
}


function processImportedFile() {

    const file =
        window.selectedAIFile;

    const result =
        document.getElementById("aiResults");

    if (!file || !result) return;

    const extension =
        file.name
            .split(".")
            .pop()
            .toLowerCase();

    if (extension === "csv") {

        const reader = new FileReader();

        reader.onload = event => {

            const text =
                event.target.result;

            const rows =
                text
                    .split(/\r?\n/)
                    .filter(Boolean);

            const records = [];

            rows.forEach((row, index) => {

                const columns =
                    row.split(",")
                        .map(value =>
                            value.trim()
                        );

                if (index === 0 &&
                    columns[0]
                        ?.toLowerCase()
                        .includes("product")) {
                    return;
                }

                if (!columns[0]) return;

                records.push({

                    name: columns[0] || "Unknown",

                    sku: columns[1] || `IMPORT-${index}`,

                    category: columns[2] || "",

                    colour: columns[3] || "",

                    size: columns[4] || "",

                    quantity:
                        Number(columns[5]) || 0,

                    purchasePrice:
                        Number(columns[6]) || 0,

                    sellingPrice:
                        Number(columns[7]) || 0
                });
            });

            showImportPreview(records);
        };

        reader.readAsText(file);

        return;
    }

    showImportPreview([]);
}


function showImportPreview(records) {

    const result =
        document.getElementById("aiResults");

    if (!result) return;

    if (!records.length) {

        result.innerHTML = `

            <div class="info-card">

                <h3>AI Import Ready</h3>

                <p>
                    This file requires AI/document
                    parsing before records can be
                    created.
                </p>

                <p>
                    Complete records will be added
                    automatically after review.
                </p>

            </div>

        `;

        return;
    }

    window.pendingImportRecords = records;

    result.innerHTML = `

        <div class="info-card">

            <h3>
                Import Preview
            </h3>

            <p>
                ${records.length}
                records detected.
            </p>

            <div class="import-preview">

                ${
                    records.slice(0, 20)
                    .map(record => `

                        <div class="product-item">

                            <strong>
                                ${escapeHTML(record.name)}
                            </strong>

                            <small>
                                SKU:
                                ${escapeHTML(record.sku)}
                            </small>

                            <span>
                                Qty:
                                ${record.quantity}
                            </span>

                        </div>

                    `)
                    .join("")
                }

            </div>

            <button
                class="primary-btn full-btn"
                onclick="addImportedRecords()"
            >
                ✓ Add All Records
            </button>

        </div>
    `;
}


function addImportedRecords() {

    const records =
        window.pendingImportRecords || [];

    let added = 0;
    let skipped = 0;

    records.forEach(record => {

        const duplicate =
            inventory.some(
                product =>
                    product.sku.toLowerCase() ===
                    String(record.sku).toLowerCase()
            );

        if (duplicate) {

            skipped++;

            return;
        }

        inventory.push({

            id:
                Date.now().toString() +
                Math.random(),

            ...record,

            createdAt:
                new Date().toISOString()
        });

        added++;
    });

    saveInventory();

    updateDashboard();
    renderInventory();
    updateBillProducts();
    renderLowStock();

    alert(
        `${added} records added.\n` +
        `${skipped} duplicate records skipped.`
    );

    openPage("inventoryPage");
}


/* =========================
   QR / BARCODE SCANNER
========================= */

let scannerStream = null;
let scannerVideo = null;
let scannerTimer = null;
let scannedProducts = [];


async function startScanner() {

    const result =
        document.getElementById("scanResults");

    if (!result) return;

    if (!("BarcodeDetector" in window)) {

        result.innerHTML = `
            <div class="info-card">

                <h3>Scanner unavailable</h3>

                <p>
                    Your browser does not support
                    the built-in QR scanner.
                </p>

                <p>
                    You can use a QR scanner app
                    or a supported Chromium browser.
                </p>

            </div>
        `;

        return;
    }

    try {

        scannerStream =
            await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: {
                        ideal: "environment"
                    }
                }
            });

        scannerVideo =
            document.createElement("video");

        scannerVideo.autoplay = true;
        scannerVideo.playsInline = true;

        scannerVideo.style.width = "100%";
        scannerVideo.style.borderRadius = "18px";

        result.innerHTML = "";

        result.appendChild(scannerVideo);

        scannerVideo.srcObject =
            scannerStream;

        const detector =
            new BarcodeDetector({
                formats: [
                    "qr_code",
                    "code_128",
                    "code_39",
                    "ean_13",
                    "ean_8"
                ]
            });

        scannerTimer =
            setInterval(async () => {

                if (
                    !scannerVideo ||
                    scannerVideo.readyState < 2
                ) {
                    return;
                }

                try {

                    const codes =
                        await detector.detect(
                            scannerVideo
                        );

                    if (!codes.length) return;

                    const value =
                        codes[0].rawValue;

                    stopScanner();

                    handleScannedCode(value);

                } catch (error) {

                    console.log(
                        "Scanner error:",
                        error
                    );
                }

            }, 500);

    } catch (error) {

        result.innerHTML = `
            <div class="info-card">

                <h3>Camera permission required</h3>

                <p>
                    Please allow camera access
                    and try again.
                </p>

            </div>
        `;
    }
}


function stopScanner() {

    if (scannerTimer) {

        clearInterval(scannerTimer);

        scannerTimer = null;
    }

    if (scannerStream) {

        scannerStream
            .getTracks()
            .forEach(track =>
                track.stop()
            );

        scannerStream = null;
    }

    scannerVideo = null;
}


function handleScannedCode(code) {

    const product =
        inventory.find(
            item =>
                item.sku.toLowerCase() ===
                String(code).toLowerCase()
        );

    const result =
        document.getElementById("scanResults");

    if (!product) {

        if (result) {

            result.innerHTML = `
                <div class="info-card">

                    <h3>Product not found</h3>

                    <p>
                        Scanned Code:
                        <strong>
                            ${escapeHTML(code)}
                        </strong>
                    </p>

                    <button
                        class="primary-btn"
                        onclick="startScanner()"
                    >
                        Scan Again
                    </button>

                </div>
            `;
        }

        return;
    }

    addScannedProduct(product);

    renderScannedItems();
}


function addScannedProduct(product) {

    const existing =
        scannedProducts.find(
            item => item.productId === product.id
        );

    if (existing) {

        existing.quantity++;

    } else {

        scannedProducts.push({

            productId: product.id,

            name: product.name,

            sku: product.sku,

            quantity: 1
        });
    }
}


function renderScannedItems() {

    const result =
        document.getElementById("scanResults");

    if (!result) return;

    result.innerHTML = `

        <div class="info-card">

            <h3>
                Scanned Items
                (${scannedProducts.length})
            </h3>

            ${
                scannedProducts
                    .map(item => `

                        <div class="product-item">

                            <strong>
                                ${escapeHTML(item.name)}
                            </strong>

                            <small>
                                SKU:
                                ${escapeHTML(item.sku)}
                            </small>

                            <strong>
                                Qty:
                                ${item.quantity}
                            </strong>

                        </div>

                    `)
                    .join("")
            }

            <button
                class="primary-btn full-btn"
                onclick="reviewScannedItems()"
            >
                Review List
            </button>

            <button
                class="primary-btn full-btn"
                onclick="startScanner()"
            >
                Scan More
            </button>

        </div>
    `;
}


function reviewScannedItems() {

    if (!scannedProducts.length) {

        alert("No products scanned.");

        return;
    }

    let added = 0;

    scannedProducts.forEach(item => {

        const product =
            inventory.find(
                p => p.id === item.productId
            );

        if (!product) return;

        /*
          Scan Add means inventory count is updated
          according to the scanned quantity.
        */

        product.quantity += item.quantity;

        added++;
    });

    saveInventory();

    updateDashboard();
    renderInventory();
    updateBillProducts();
    renderLowStock();

    alert(
        `${added} scanned products updated in inventory.`
    );

    scannedProducts = [];

    openPage("inventoryPage");
}


/* =========================
   AI SET MAKER
========================= */

let sareeImageFile = null;
let detectedSareeColour = null;


function handleSareeImage(event) {

    sareeImageFile =
        event.target.files?.[0] || null;

    const result =
        document.getElementById("setMakerResults");

    if (!result || !sareeImageFile) return;

    result.innerHTML = `

        <div class="info-card">

            <h3>
                Saree Image Selected
            </h3>

            <p>
                ${escapeHTML(sareeImageFile.name)}
            </p>

            <p>
                Click "Find Matching Inventory"
                to analyze the image.
            </p>

        </div>
    `;
}


function setupDesignButtons() {

    const buttons =
        document.querySelectorAll(
            ".design-card"
        );

    buttons.forEach(
        (button, index) => {

            button.addEventListener(
                "click",
                () => {

                    if (
                        selectedDesigns.includes(index)
                    ) {

                        selectedDesigns =
                            selectedDesigns.filter(
                                item =>
                                    item !== index
                            );

                        button.classList.remove(
                            "selected"
                        );

                    } else {

                        selectedDesigns.push(index);

                        button.classList.add(
                            "selected"
                        );
                    }
                }
            );
        }
    );
}


async function analyzeSaree() {

    const result =
        document.getElementById("setMakerResults");

    if (!result) return;

    if (!sareeImageFile) {

        alert(
            "Please select a saree image first."
        );

        return;
    }

    result.innerHTML = `
        <div class="info-card">
            <h3>AI is analyzing...</h3>
            <p>
                Detecting dominant saree colour
                and matching inventory.
            </p>
        </div>
    `;

    try {

        detectedSareeColour =
            await detectImageColour(
                sareeImageFile
            );

        const matches =
            findColourMatches(
                detectedSareeColour
            );

        renderSareeMatches(
            detectedSareeColour,
            matches
        );

    } catch (error) {

        console.error(error);

        result.innerHTML = `
            <div class="info-card">
                <h3>Unable to analyze image</h3>
                <p>Please try another image.</p>
            </div>
        `;
    }
}


function detectImageColour(file) {

    return new Promise(
        (resolve, reject) => {

            const image =
                new Image();

            const url =
                URL.createObjectURL(file);

            image.onload = () => {

                const canvas =
                    document.createElement("canvas");

                const size = 100;

                canvas.width = size;
                canvas.height = size;

                const context =
                    canvas.getContext("2d");

                context.drawImage(
                    image,
                    0,
                    0,
                    size,
                    size
                );

                const data =
                    context.getImageData(
                        0,
                        0,
                        size,
                        size
                    ).data;

                let r = 0;
                let g = 0;
                let b = 0;
                let count = 0;

                for (
                    let i = 0;
                    i < data.length;
                    i += 16
                ) {

                    const red = data[i];
                    const green = data[i + 1];
                    const blue = data[i + 2];
                    const alpha = data[i + 3];

                    if (alpha < 100) continue;

                    /*
                      Ignore very white/black
                      background pixels.
                    */

                    const brightness =
                        (red + green + blue) / 3;

                    if (
                        brightness > 245 ||
                        brightness < 15
                    ) {
                        continue;
                    }

                    r += red;
                    g += green;
                    b += blue;

                    count++;
                }

                URL.revokeObjectURL(url);

                if (!count) {

                    resolve({
                        r: 128,
                        g: 128,
                        b: 128,
                        name: "Unknown"
                    });

                    return;
                }

                r = Math.round(r / count);
                g = Math.round(g / count);
                b = Math.round(b / count);

                resolve({
                    r,
                    g,
                    b,
                    name: rgbToColourName(
                        r,
                        g,
                        b
                    )
                });
            };

            image.onerror = reject;

            image.src = url;
        }
    );
}


function rgbToColourName(r, g, b) {

    const max =
        Math.max(r, g, b);

    const min =
        Math.min(r, g, b);

    if (max < 50) return "Black";

    if (min > 210) return "White";

    if (
        r > 170 &&
        g < 100 &&
        b < 100
    ) {
        return "Red";
    }

    if (
        r > 180 &&
        g > 100 &&
        b < 100
    ) {
        return "Orange";
    }

    if (
        r > 180 &&
        g > 150 &&
        b < 120
    ) {
        return "Yellow";
    }

    if (
        g > r * 1.15 &&
        g > b * 1.15
    ) {
        return "Green";
    }

    if (
        b > r * 1.2 &&
        b > g * 1.05
    ) {
        return "Blue";
    }

    if (
        r > 120 &&
        b > 100 &&
        r > g * 1.15
    ) {
        return "Purple";
    }

    if (
        r > 120 &&
        g > 80 &&
        b > 80 &&
        Math.abs(r - b) < 60
    ) {
        return "Pink";
    }

    if (
        r > g &&
        g > b
    ) {
        return "Brown";
    }

    return "Mixed";
}


function findColourMatches(colour) {

    if (!inventory.length) {
        return [];
    }

    const target =
        colour.name.toLowerCase();

    const exact =
        inventory.filter(
            product =>
                String(product.colour || "")
                    .toLowerCase()
                    .includes(target)
        );

    if (exact.length) {
        return exact;
    }

    const keywords = {

        red: [
            "red",
            "maroon",
            "wine",
            "burgundy",
            "rani"
        ],

        blue: [
            "blue",
            "navy",
            "royal",
            "sky"
        ],

        green: [
            "green",
            "olive",
            "mint",
            "pista"
        ],

        purple: [
            "purple",
            "violet",
            "lavender"
        ],

        pink: [
            "pink",
            "rose",
            "rani"
        ],

        yellow: [
            "yellow",
            "mustard",
            "gold"
        ],

        orange: [
            "orange",
            "peach"
        ],

        brown: [
            "brown",
            "coffee",
            "chocolate"
        ],

        black: [
            "black"
        ],

        white: [
            "white",
            "cream",
            "ivory"
        ]
    };

    const list =
        keywords[target] || [];

    return inventory.filter(
        product => {

            const colourText =
                String(
                    product.colour || ""
                ).toLowerCase();

            return list.some(
                word =>
                    colourText.includes(word)
            );
        }
    );
}


function renderSareeMatches(
    detectedColour,
    matches
) {

    const result =
        document.getElementById(
            "setMakerResults"
        );

    if (!result) return;

    result.innerHTML = `

        <div class="info-card">

            <h3>
                AI Matching Result
            </h3>

            <p>
                Detected Colour:
                <strong>
                    ${escapeHTML(
                        detectedColour.name
                    )}
                </strong>
            </p>

            <div
                style="
                    width:60px;
                    height:60px;
                    border-radius:50%;
                    margin:12px 0;
                    border:3px solid white;
                    box-shadow:0 2px 10px #999;
                    background:rgb(
                        ${detectedColour.r},
                        ${detectedColour.g},
                        ${detectedColour.b}
                    );
                "
            ></div>

            <h3>
                Closest Inventory Matches
            </h3>

            ${
                matches.length
                    ? matches
                        .slice(0, 20)
                        .map(product => `

                            <div class="product-item">

                                <strong>
                                    ${escapeHTML(
                                        product.name
                                    )}
                                </strong>

                                <small>
                                    SKU:
                                    ${escapeHTML(
                                        product.sku
                                    )}
                                </small>

                                <small>
                                    Colour:
                                    ${escapeHTML(
                                        product.colour ||
                                        "-"
                                    )}
                                </small>

                                <strong>
                                    Stock:
                                    ${product.quantity}
                                </strong>

                            </div>

                        `)
                        .join("")

                    : `
                        <div class="empty-state">

                            <h3>
                                No exact colour match
                            </h3>

                            <p>
                                Try another saree
                                image or add more
                                colour variants
                                to inventory.
                            </p>

                        </div>
                    `
            }

        </div>
    `;
}


/* =========================
   PROFILE
========================= */

function openProfile() {

    const email =
        currentUser?.gmail ||
        "Not connected";

    const mobile =
        currentUser?.mobile ||
        "Not connected";

    const action =
        confirm(
            "Smart Inventory Profile\n\n" +
            "Gmail: " + email +
            "\nMobile: " + mobile +
            "\n\nPress OK to logout."
        );

    if (action) {
        logout();
    }
}


/* =========================
   FILTER BUTTONS
========================= */

document.addEventListener(
    "click",
    event => {

        const button =
            event.target.closest(
                ".filter-btn"
            );

        if (!button) return;

        document
            .querySelectorAll(".filter-btn")
            .forEach(
                item =>
                    item.classList.remove(
                        "active"
                    )
            );

        button.classList.add("active");

        const mode =
            button.textContent
                .trim()
                .toLowerCase();

        let products =
            [...inventory];

        if (mode === "low stock") {

            products =
                products.filter(
                    product =>
                        product.quantity <=
                        LOW_STOCK_LIMIT
                );

        } else if (
            mode === "out of stock"
        ) {

            products =
                products.filter(
                    product =>
                        Number(
                            product.quantity
                        ) === 0
                );
        }

        renderInventoryArray(products);
    }
);


function renderInventoryArray(products) {

    const container =
        document.getElementById(
            "inventoryList"
        );

    if (!container) return;

    if (!products.length) {

        container.innerHTML = `
            <div class="empty-state">
                <div>📦</div>
                <h3>No products found</h3>
            </div>
        `;

        return;
    }

    container.innerHTML =
        products.map(product => {

            const low =
                product.quantity <=
                LOW_STOCK_LIMIT;

            return `

                <div class="product-item">

                    <div class="product-item-header">

                        <div>

                            <h3>
                                ${escapeHTML(
                                    product.name
                                )}
                            </h3>

                            <small>
                                SKU:
                                ${escapeHTML(
                                    product.sku
                                )}
                            </small>

                        </div>

                        <button
                            class="small-main-btn"
                            onclick="editStock('${product.id}')"
                        >
                            Update Stock
                        </button>

                    </div>

                    <div class="product-item-info">

                        <div class="info-box">
                            <small>Colour</small>
                            <strong>
                                ${escapeHTML(
                                    product.colour || "-"
                                )}
                            </strong>
                        </div>

                        <div class="info-box">
                            <small>Size</small>
                            <strong>
                                ${escapeHTML(
                                    product.size || "-"
                                )}
                            </strong>
                        </div>

                        <div class="info-box">
                            <small>Stock</small>
                            <strong class="${
                                low
                                    ? "stock-low"
                                    : "stock-good"
                            }">
                                ${product.quantity}
                            </strong>
                        </div>

                        <div class="info-box">
                            <small>Selling</small>
                            <strong>
                                ₹${Number(
                                    product.sellingPrice
                                ).toFixed(2)}
                            </strong>
                        </div>

                    </div>

                    <button
                        onclick="deleteProduct('${product.id}')"
                        style="
                            margin-top:15px;
                            border:0;
                            background:transparent;
                            color:#d64545;
                            font-weight:700;
                        "
                    >
                        Delete Product
                    </button>

                </div>
            `;

        }).join("");
}


/* =========================
   UTILITY
========================= */

function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* =========================
   GLOBAL FUNCTIONS
   For onclick="" in HTML
========================= */

window.showLogin = showLogin;
window.showApp = showApp;

window.sendOTP = sendOTP;
window.verifyOTP = verifyOTP;
window.backToMobile = backToMobile;
window.loginWithGmail = loginWithGmail;
window.logout = logout;

window.openPage = openPage;

window.addProduct = addProduct;

window.searchInventory = searchInventory;
window.editStock = editStock;
window.deleteProduct = deleteProduct;

window.updateDashboard = updateDashboard;

window.createBill = createBill;
window.calculateBillPreview = calculateBillPreview;

window.startScanner = startScanner;
window.stopScanner = stopScanner;
window.reviewScannedItems = reviewScannedItems;

window.analyzeSaree = analyzeSaree;

window.openProfile = openProfile;

window.processImportedFile =
    processImportedFile;

window.addImportedRecords =
    addImportedRecords;
