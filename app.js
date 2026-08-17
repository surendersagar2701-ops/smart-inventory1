/* =========================================================
   SMART INVENTORY
   FINAL FRONTEND ENGINE
========================================================= */

"use strict";


/* =========================================================
   STORAGE
========================================================= */

const STORAGE_PRODUCTS =
    "smart_inventory_products_v2";

const STORAGE_SALES =
    "smart_inventory_sales_v2";

const STORAGE_USER =
    "smart_inventory_user_v2";


let inventory =
    JSON.parse(
        localStorage.getItem(
            STORAGE_PRODUCTS
        ) || "[]"
    );


let sales =
    JSON.parse(
        localStorage.getItem(
            STORAGE_SALES
        ) || "[]"
    );


let currentUser =
    JSON.parse(
        localStorage.getItem(
            STORAGE_USER
        ) || "null"
    );


const LOW_STOCK_LIMIT = 5;

let otp = null;

let selectedDesigns = [0];

let selectedAIFile = null;

let scannedProducts = [];

let scannerStream = null;

let scannerVideo = null;

let scannerTimer = null;


/* =========================================================
   INITIALIZE
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    initialize
);


function initialize() {

    if (currentUser) {

        showApp();

    } else {

        showLogin();

    }

    setupEvents();

    updateAll();

}


/* =========================================================
   EVENT SETUP
========================================================= */

function setupEvents() {

    const form =
        document.getElementById(
            "productForm"
        );

    if (form) {

        form.addEventListener(
            "submit",
            addProduct
        );
    }


    const file =
        document.getElementById(
            "aiFile"
        );

    if (file) {

        file.addEventListener(
            "change",
            handleImportFile
        );
    }


    const image =
        document.getElementById(
            "sareeImage"
        );

    if (image) {

        image.addEventListener(
            "change",
            event => {

                selectedAIFile =
                    event.target.files[0] ||
                    null;

            }
        );
    }


    const billProduct =
        document.getElementById(
            "billProduct"
        );

    if (billProduct) {

        billProduct.addEventListener(
            "change",
            calculateBillPreview
        );
    }


    document
        .querySelectorAll(
            ".design-card"
        )
        .forEach(
            (button, index) => {

                button.addEventListener(
                    "click",
                    () =>
                        toggleDesign(
                            index,
                            button
                        )
                );

            }
        );


    document
        .querySelectorAll(
            ".filter-btn"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        document
                            .querySelectorAll(
                                ".filter-btn"
                            )
                            .forEach(
                                b =>
                                    b.classList.remove(
                                        "active"
                                    )
                            );

                        button.classList.add(
                            "active"
                        );

                        filterInventory(
                            button.textContent
                                .trim()
                        );

                    }
                );

            }
        );
}


/* =========================================================
   LOGIN
========================================================= */

function showLogin() {

    document
        .getElementById(
            "loginScreen"
        )
        ?.classList.remove(
            "hidden"
        );

    document
        .getElementById(
            "app"
        )
        ?.classList.add(
            "hidden"
        );
}


function showApp() {

    document
        .getElementById(
            "loginScreen"
        )
        ?.classList.add(
            "hidden"
        );

    document
        .getElementById(
            "app"
        )
        ?.classList.remove(
            "hidden"
        );

    updateUserInfo();

    openPage(
        "homePage"
    );
}


/* =========================================================
   OTP
========================================================= */

function sendOTP() {

    const input =
        document.getElementById(
            "mobileNumber"
        );

    const mobile =
        input?.value.trim();


    if (!/^[0-9]{10}$/.test(mobile)) {

        alert(
            "Please enter a valid 10 digit mobile number."
        );

        return;
    }


    otp =
        String(
            Math.floor(
                100000 +
                Math.random() *
                900000
            )
        );


    document
        .getElementById(
            "mobileLogin"
        )
        ?.classList.add(
            "hidden"
        );


    document
        .getElementById(
            "otpLogin"
        )
        ?.classList.remove(
            "hidden"
        );


    alert(
        "Demo OTP: " +
        otp +
        "\n\nReal SMS OTP requires Firebase/backend."
    );
}


function verifyOTP() {

    const entered =
        document
            .getElementById(
                "otpInput"
            )
            ?.value.trim();


    if (
        !otp ||
        entered !== otp
    ) {

        alert(
            "Incorrect OTP."
        );

        return;
    }


    document
        .getElementById(
            "otpLogin"
        )
        ?.classList.add(
            "hidden"
        );


    document
        .getElementById(
            "gmailLogin"
        )
        ?.classList.remove(
            "hidden"
        );
}


function backToMobile() {

    document
        .getElementById(
            "otpLogin"
        )
        ?.classList.add(
            "hidden"
        );

    document
        .getElementById(
            "mobileLogin"
        )
        ?.classList.remove(
            "hidden"
        );
}


function loginWithGmail() {

    const gmail =
        document
            .getElementById(
                "gmailInput"
            )
            ?.value.trim();


    if (
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/
            .test(gmail)
    ) {

        alert(
            "Enter a valid Gmail address."
        );

        return;
    }


    const mobile =
        document
            .getElementById(
                "mobileNumber"
            )
            ?.value.trim();


    currentUser = {

        mobile,

        gmail,

        loginAt:
            new Date().toISOString()

    };


    localStorage.setItem(
        STORAGE_USER,
        JSON.stringify(
            currentUser
        )
    );


    showApp();
}


function logout() {

    if (
        !confirm(
            "Logout from this device?"
        )
    ) {

        return;
    }


    localStorage.removeItem(
        STORAGE_USER
    );


    currentUser = null;

    otp = null;

    showLogin();


    document
        .getElementById(
            "mobileLogin"
        )
        ?.classList.remove(
            "hidden"
        );


    document
        .getElementById(
            "otpLogin"
        )
        ?.classList.add(
            "hidden"
        );


    document
        .getElementById(
            "gmailLogin"
        )
        ?.classList.add(
            "hidden"
        );
}


function updateUserInfo() {

    return;
}


function openProfile() {

    if (!currentUser) {

        return;
    }


    alert(
        "Smart Inventory Profile\n\n" +
        "Mobile: " +
        currentUser.mobile +
        "\nGmail: " +
        currentUser.gmail
    );
}


/* =========================================================
   NAVIGATION
========================================================= */

function openPage(
    pageId,
    clickedButton = null
) {

    document
        .querySelectorAll(
            ".page"
        )
        .forEach(
            page =>
                page.classList.remove(
                    "active"
                )
        );


    document
        .getElementById(
            pageId
        )
        ?.classList.add(
            "active"
        );


    if (clickedButton) {

        document
            .querySelectorAll(
                ".nav-item"
            )
            .forEach(
                item =>
                    item.classList.remove(
                        "active"
                    )
            );

        clickedButton.classList.add(
            "active"
        );
    }


    if (
        pageId ===
        "inventoryPage"
    ) {

        renderInventory(
            inventory
        );
    }


    if (
        pageId ===
        "billPage"
    ) {

        updateBillProducts();

        calculateBillPreview();
    }


    if (
        pageId ===
        "lowStockPage"
    ) {

        renderLowStock();
    }


    window.scrollTo(
        0,
        0
    );
}


/* =========================================================
   PRODUCT ADD
========================================================= */

function addProduct(event) {

    event.preventDefault();


    const value =
        id =>
            document
                .getElementById(
                    id
                )
                ?.value.trim() ||
            "";


    const productName =
        value(
            "productName"
        );


    const sku =
        value(
            "productSKU"
        );


    if (
        !productName ||
        !sku
    ) {

        alert(
            "Product Name and SKU are required."
        );

        return;
    }


    const duplicate =
        inventory.some(
            product =>
                product.sku
                    .toLowerCase() ===
                sku.toLowerCase()
        );


    if (duplicate) {

        alert(
            "This SKU already exists."
        );

        return;
    }


    const product = {

        id:
            crypto.randomUUID
                ? crypto.randomUUID()
                : Date.now().toString(),

        name:
            productName,

        sku,

        category:
            value(
                "productCategory"
            ),

        colour:
            value(
                "productColour"
            ),

        size:
            value(
                "productSize"
            ),

        quantity:
            numberValue(
                "productQuantity"
            ),

        purchasePrice:
            numberValue(
                "purchasePrice"
            ),

        sellingPrice:
            numberValue(
                "sellingPrice"
            ),

        notes:
            value(
                "productNotes"
            ),

        createdAt:
            new Date().toISOString()

    };


    inventory.push(
        product
    );


    saveProducts();

    updateAll();


    document
        .getElementById(
            "productForm"
        )
        ?.reset();


    document
        .getElementById(
            "productQuantity"
        )
        .value = 0;


    alert(
        "Product added successfully."
    );


    openPage(
        "inventoryPage"
    );
}


function numberValue(id) {

    return (
        Number(
            document
                .getElementById(
                    id
                )
                ?.value
        ) || 0
    );
}


function saveProducts() {

    localStorage.setItem(
        STORAGE_PRODUCTS,
        JSON.stringify(
            inventory
        )
    );
}


/* =========================================================
   INVENTORY
========================================================= */

function renderInventory(
    products
) {

    const container =
        document.getElementById(
            "inventoryList"
        );


    if (!container) {

        return;
    }


    if (!products.length) {

        container.innerHTML = `
            <div class="empty-state">

                <div>📦</div>

                <h3>No products found</h3>

                <p>
                    Add products to your inventory.
                </p>

            </div>
        `;

        return;
    }


    container.innerHTML =
        products
            .map(
                product =>
                    productHTML(
                        product
                    )
            )
            .join("");
}


function productHTML(
    product
) {

    const low =
        Number(
            product.quantity
        ) <= LOW_STOCK_LIMIT;


    return `

        <div class="product-item">

            <div class="product-item-header">

                <div>

                    <h3>
                        ${safe(
                            product.name
                        )}
                    </h3>

                    <small>
                        SKU:
                        ${safe(
                            product.sku
                        )}
                    </small>

                </div>


                <button
                    class="small-main-btn"
                    onclick="editStock('${product.id}')"
                >
                    Update
                </button>

            </div>


            <div class="product-item-info">

                <div class="info-box">

                    <small>
                        Category
                    </small>

                    <strong>
                        ${safe(
                            product.category ||
                            "-"
                        )}
                    </strong>

                </div>


                <div class="info-box">

                    <small>
                        Colour
                    </small>

                    <strong>
                        ${safe(
                            product.colour ||
                            "-"
                        )}
                    </strong>

                </div>


                <div class="info-box">

                    <small>
                        Size
                    </small>

                    <strong>
                        ${safe(
                            product.size ||
                            "-"
                        )}
                    </strong>

                </div>


                <div class="info-box">

                    <small>
                        Stock
                    </small>

                    <strong
                        class="${
                            low
                                ? "stock-low"
                                : "stock-good"
                        }"
                    >
                        ${product.quantity}
                        ${
                            low
                                ? " ⚠️"
                                : ""
                        }
                    </strong>

                </div>


                <div class="info-box">

                    <small>
                        Purchase
                    </small>

                    <strong>
                        ₹${money(
                            product.purchasePrice
                        )}
                    </strong>

                </div>


                <div class="info-box">

                    <small>
                        Selling
                    </small>

                    <strong>
                        ₹${money(
                            product.sellingPrice
                        )}
                    </strong>

                </div>

            </div>


            <button
                onclick="deleteProduct('${product.id}')"
                style="
                    margin-top:15px;
                    border:0;
                    background:transparent;
                    color:#dc3545;
                    font-weight:700;
                "
            >
                Delete Product
            </button>

        </div>

    `;
}


function searchInventory() {

    const query =
        document
            .getElementById(
                "inventorySearch"
            )
            ?.value
            .toLowerCase()
            .trim() ||
        "";


    const filtered =
        inventory.filter(
            product =>

                product.name
                    .toLowerCase()
                    .includes(
                        query
                    ) ||

                product.sku
                    .toLowerCase()
                    .includes(
                        query
                    ) ||

                String(
                    product.colour
                )
                    .toLowerCase()
                    .includes(
                        query
                    ) ||

                String(
                    product.category
                )
                    .toLowerCase()
                    .includes(
                        query
                    ) ||

                String(
                    product.size
                )
                    .toLowerCase()
                    .includes(
                        query
                    )
        );


    renderInventory(
        filtered
    );
}


function filterInventory(
    type
) {

    let filtered =
        [...inventory];


    if (
        type ===
        "Low Stock"
    ) {

        filtered =
            filtered.filter(
                product =>
                    Number(
                        product.quantity
                    ) <=
                    LOW_STOCK_LIMIT
            );
    }


    if (
        type ===
        "Out of Stock"
    ) {

        filtered =
            filtered.filter(
                product =>
                    Number(
                        product.quantity
                    ) === 0
            );
    }


    renderInventory(
        filtered
    );
}


function editStock(
    id
) {

    const product =
        inventory.find(
            p =>
                p.id === id
        );


    if (!product) {

        return;
    }


    const value =
        prompt(
            "Enter new stock quantity:",
            product.quantity
        );


    if (value === null) {

        return;
    }


    const quantity =
        Number(
            value
        );


    if (
        !Number.isFinite(
            quantity
        ) ||
        quantity < 0
    ) {

        alert(
            "Enter a valid quantity."
        );

        return;
    }


    product.quantity =
        quantity;


    saveProducts();

    updateAll();
}


function deleteProduct(
    id
) {

    const product =
        inventory.find(
            p =>
                p.id === id
        );


    if (!product) {

        return;
    }


    if (
        !confirm(
            `Delete ${product.name}?`
        )
    ) {

        return;
    }


    inventory =
        inventory.filter(
            p =>
                p.id !== id
        );


    saveProducts();

    updateAll();
}


/* =========================================================
   DASHBOARD
========================================================= */

function updateDashboard() {

    const totalProducts =
        document.getElementById(
            "totalProducts"
        );


    const totalStock =
        document.getElementById(
            "totalStock"
        );


    const lowStock =
        document.getElementById(
            "lowStock"
        );


    const todaySale =
        document.getElementById(
            "todaySale"
        );


    const stock =
        inventory.reduce(
            (
                total,
                product
            ) =>
                total +
                Number(
                    product.quantity ||
                    0
                ),
            0
        );


    const low =
        inventory.filter(
            product =>
                Number(
                    product.quantity ||
                    0
                ) <=
                LOW_STOCK_LIMIT
        ).length;


    const today =
        new Date()
            .toDateString();


    const sale =
        sales
            .filter(
                item =>
                    new Date(
                        item.date
                    ).toDateString() ===
                    today
            )
            .reduce(
                (
                    total,
                    item
                ) =>
                    total +
                    Number(
                        item.total ||
                        0
                    ),
                0
            );


    if (totalProducts) {

        totalProducts.textContent =
            inventory.length;
    }


    if (totalStock) {

        totalStock.textContent =
            stock;
    }


    if (lowStock) {

        lowStock.textContent =
            low;
    }


    if (todaySale) {

        todaySale.textContent =
            "₹" +
            money(
                sale
            );
    }
}


/* =========================================================
   LOW STOCK
========================================================= */

function renderLowStock() {

    const products =
        inventory.filter(
            product =>
                Number(
                    product.quantity
                ) <=
                LOW_STOCK_LIMIT
        );


    const home =
        document.getElementById(
            "homeLowStock"
        );


    const page =
        document.getElementById(
            "lowStockList"
        );


    const html =
        products.length
            ? products
                .map(
                    product =>
                        productHTML(
                            product
                        )
                )
                .join("")
            : `
                <div class="empty-state">

                    <div>✓</div>

                    <h3>
                        Stock is healthy
                    </h3>

                    <p>
                        No low-stock products.
                    </p>

                </div>
            `;


    if (home) {

        home.innerHTML =
            html;
    }


    if (page) {

        page.innerHTML =
            html;
    }
}


/* =========================================================
   BULK IMPORT
========================================================= */

function handleImportFile(
    event
) {

    const file =
        event.target.files[0];


    if (!file) {

        return;
    }


    selectedAIFile =
        file;


    if (
        file.name
            .toLowerCase()
            .endsWith(
                ".csv"
            )
    ) {

        parseCSV(
            file
        );

    } else {

        showImportMessage(
            "File selected. CSV parsing is available directly. For image/PDF/Excel AI extraction, connect an AI/backend service."
        );
    }
}


function parseCSV(
    file
) {

    const reader =
        new FileReader();


    reader.onload =
        event => {

            const text =
                event.target.result;


            const rows =
                text
                    .split(/\r?\n/)
                    .filter(
                        row =>
                            row.trim()
                    );


            if (
                rows.length < 2
            ) {

                showImportMessage(
                    "No usable records found."
                );

                return;
            }


            const headers =
                splitCSV(
                    rows[0]
                ).map(
                    h =>
                        h
                            .toLowerCase()
                            .trim()
                );


            const records =
                rows
                    .slice(1)
                    .map(
                        row => {

                            const cells =
                                splitCSV(
                                    row
                                );


                            const get =
                                (
                                    names
                                ) => {

                                    const index =
                                        headers.findIndex(
                                            h =>
                                                names.some(
                                                    name =>
                                                        h.includes(
                                                            name
                                                        )
                                                )
                                        );


                                    return index >= 0
                                        ? cells[
                                            index
                                        ] || ""
                                        : "";
                                };


                            return {

                                name:
                                    get(
                                        [
                                            "product name",
                                            "product",
                                            "name"
                                        ]
                                    ),

                                sku:
                                    get(
                                        [
                                            "sku",
                                            "code"
                                        ]
                                    ),

                                category:
                                    get(
                                        [
                                            "category"
                                        ]
                                    ),

                                colour:
                                    get(
                                        [
                                            "colour",
                                            "color"
                                        ]
                                    ),

                                size:
                                    get(
                                        [
                                            "size"
                                        ]
                                    ),

                                quantity:
                                    Number(
                                        get(
                                            [
                                                "quantity",
                                                "stock",
                                                "qty"
                                            ]
                                        )
                                    ) || 0,

                                purchasePrice:
                                    Number(
                                        get(
                                            [
                                                "purchase",
                                                "buy"
                                            ]
                                        )
                                    ) || 0,

                                sellingPrice:
                                    Number(
                                        get(
                                            [
                                                "selling",
                                                "sale",
                                                "price"
                                            ]
                                        )
                                    ) || 0

                            };

                        }
                    )
                    .filter(
                        record =>
                            record.name ||
                            record.sku
                    );


            window.pendingImport =
                records;


            renderImportPreview(
                records
            );
        };


    reader.readAsText(
        file
    );
}


function splitCSV(
    line
) {

    const result = [];

    let current = "";

    let quote = false;


    for (
        let i = 0;
        i < line.length;
        i++
    ) {

        const char =
            line[i];


        if (
            char ===
            '"'
        ) {

            quote =
                !quote;

            continue;
        }


        if (
            char === "," &&
            !quote
        ) {

            result.push(
                current.trim()
            );

            current = "";

        } else {

            current +=
                char;
        }
    }


    result.push(
        current.trim()
    );


    return result;
}


function renderImportPreview(
    records
) {

    const result =
        document.getElementById(
            "aiResults"
        );


    if (!result) {

        return;
    }


    if (!records.length) {

        showImportMessage(
            "No complete records were detected."
        );

        return;
    }


    result.innerHTML = `

        <div class="form-card">

            <h3>
                ${records.length}
                records detected
            </h3>

            <p
                class="muted"
                style="margin-top:8px"
            >
                Review the records before
                adding them.
            </p>


            <div class="list-container">

                ${
                    records
                        .slice(
                            0,
                            20
                        )
                        .map(
                            record => `

                                <div
                                    class="product-item"
                                >

                                    <strong>
                                        ${safe(
                                            record.name
                                        )}
                                    </strong>

                                    <small>
                                        SKU:
                                        ${safe(
                                            record.sku
                                        )}
                                    </small>

                                    <small>
                                        Colour:
                                        ${safe(
                                            record.colour ||
                                            "-"
                                        )}
                                    </small>

                                    <small>
                                        Stock:
                                        ${record.quantity}
                                    </small>

                                </div>

                            `
                        )
                        .join("")
                }

            </div>


            <button
                class="primary-btn full"
                style="margin-top:18px"
                onclick="addImportedProducts()"
            >
                ✓ Add All Records
            </button>

        </div>

    `;
}


function showImportMessage(
    message
) {

    const result =
        document.getElementById(
            "aiResults"
        );


    if (!result) {

        return;
    }


    result.innerHTML = `

        <div class="form-card">

            <h3>
                Import
            </h3>

            <p>
                ${safe(
                    message
                )}
            </p>

        </div>

    `;
}


function addImportedProducts() {

    const records =
        window.pendingImport ||
        [];


    let added = 0;

    let duplicate = 0;

    let incomplete = 0;


    records.forEach(
        record => {

            if (
                !record.name ||
                !record.sku
            ) {

                incomplete++;

                return;
            }


            const exists =
                inventory.some(
                    product =>
                        product.sku
                            .toLowerCase() ===
                        record.sku
                            .toLowerCase()
                );


            if (exists) {

                duplicate++;

                return;
            }


            inventory.push({

                id:
                    Date.now()
                    .toString() +
                    Math.random(),

                ...record,

                createdAt:
                    new Date()
                        .toISOString()

            });


            added++;
        }
    );


    saveProducts();

    updateAll();


    alert(
        `${added} products added.\n` +
        `${duplicate} duplicates skipped.\n` +
        `${incomplete} incomplete records skipped.`
    );


    openPage(
        "inventoryPage"
    );
}


/* =========================================================
   QR / BARCODE
========================================================= */

async function startScanner() {

    const result =
        document.getElementById(
            "scanResults"
        );


    if (!result) {

        return;
    }


    if (
        !navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia
    ) {

        result.innerHTML = `
            <div class="form-card">
                <h3>
                    Camera not available
                </h3>

                <p>
                    Please use HTTPS GitHub Pages
                    and allow camera access.
                </p>
            </div>
        `;

        return;
    }


    if (
        !("BarcodeDetector" in window)
    ) {

        result.innerHTML = `
            <div class="form-card">

                <h3>
                    QR scanner not supported
                </h3>

                <p>
                    Your current browser does not
                    provide BarcodeDetector.
                    Chrome on supported devices
                    is recommended.
                </p>

            </div>
        `;

        return;
    }


    try {

        scannerStream =
            await navigator
                .mediaDevices
                .getUserMedia({

                    video: {
                        facingMode:
                            {
                                ideal:
                                    "environment"
                            }
                    }

                });


        scannerVideo =
            document.createElement(
                "video"
            );


        scannerVideo.autoplay =
            true;

        scannerVideo.playsInline =
            true;


        scannerVideo.style.width =
            "100%";

        scannerVideo.style.borderRadius =
            "18px";


        result.innerHTML =
            "";


        result.appendChild(
            scannerVideo
        );


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
            setInterval(
                async () => {

                    if (
                        scannerVideo.readyState <
                        2
                    ) {

                        return;
                    }


                    try {

                        const codes =
                            await detector.detect(
                                scannerVideo
                            );


                        if (
                            !codes.length
                        ) {

                            return;
                        }


                        const code =
                            codes[0]
                                .rawValue;


                        stopScanner();


                        processScannedSKU(
                            code
                        );

                    }
                    catch (
                        error
                    ) {

                        console.log(
                            error
                        );

                    }

                },
                500
            );

    }
    catch (
        error
    ) {

        result.innerHTML = `

            <div class="form-card">

                <h3>
                    Camera permission denied
                </h3>

                <p>
                    Allow camera access in
                    browser settings and
                    try again.
                </p>

            </div>

        `;
    }
}


function stopScanner() {

    if (
        scannerTimer
    ) {

        clearInterval(
            scannerTimer
        );

        scannerTimer =
            null;
    }


    if (
        scannerStream
    ) {

        scannerStream
            .getTracks()
            .forEach(
                track =>
                    track.stop()
            );

        scannerStream =
            null;
    }


    scannerVideo =
        null;
}


function processScannedSKU(
    code
) {

    const product =
        inventory.find(
            product =>
                product.sku
                    .toLowerCase() ===
                String(
                    code
                )
                    .toLowerCase()
        );


    const result =
        document.getElementById(
            "scanResults"
        );


    if (!product) {

        result.innerHTML = `

            <div class="form-card">

                <h3>
                    Product not found
                </h3>

                <p>
                    Scanned SKU:
                    <strong>
                        ${safe(code)}
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

        return;
    }


    addScannedProduct(
        product
    );


    renderScannedProducts();
}


function addScannedProduct(
    product
) {

    const existing =
        scannedProducts.find(
            item =>
                item.id ===
                product.id
        );


    if (existing) {

        existing.quantity++;

    } else {

        scannedProducts.push({

            id:
                product.id,

            name:
                product.name,

            sku:
                product.sku,

            quantity:
                1

        });
    }
}


function renderScannedProducts() {

    const result =
        document.getElementById(
            "scanResults"
        );


    if (!result) {

        return;
    }


    result.innerHTML = `

        <div class="form-card">

            <h3>
                Scanned Products
            </h3>

            <div
                class="list-container"
                style="margin-top:15px"
            >

                ${
                    scannedProducts
                        .map(
                            item => `

                                <div
                                    class="product-item"
                                >

                                    <strong>
                                        ${safe(
                                            item.name
                                        )}
                                    </strong>

                                    <small>
                                        SKU:
                                        ${safe(
                                            item.sku
                                        )}
                                    </small>

                                    <strong>
                                        Qty:
                                        ${item.quantity}
                                    </strong>

                                </div>

                            `
                        )
                        .join("")
                }

            </div>


            <button
                class="primary-btn full"
                style="margin-top:18px"
                onclick="addScannedStock()"
            >
                ✓ Add Scanned Stock
            </button>


            <button
                class="secondary-btn full"
                onclick="startScanner()"
            >
                Scan More
            </button>

        </div>

    `;
}


function addScannedStock() {

    scannedProducts.forEach(
        scanned => {

            const product =
                inventory.find(
                    item =>
                        item.id ===
                        scanned.id
                );


            if (
                product
            ) {

                product.quantity +=
                    scanned.quantity;
            }

        }
    );


    saveProducts();

    scannedProducts =
        [];


    updateAll();

    renderScannedProducts();


    alert(
        "Scanned stock added successfully."
    );
}


/* =========================================================
   AI SET MAKER
========================================================= */

function toggleDesign(
    index,
    button
) {

    if (
        selectedDesigns
            .includes(
                index
            )
    ) {

        if (
            selectedDesigns.length ===
            1
        ) {

            return;
        }


        selectedDesigns =
            selectedDesigns.filter(
                item =>
                    item !==
                    index
            );


        button.classList.remove(
            "selected"
        );

    } else {

        if (
            selectedDesigns.length >=
            4
        ) {

            alert(
                "Maximum 4 designs."
            );

            return;
        }


        selectedDesigns.push(
            index
        );


        button.classList.add(
            "selected"
        );
    }
}


async function analyzeSaree() {

    if (
        !selectedAIFile
    ) {

        alert(
            "Please upload a saree image first."
        );

        return;
    }


    const result =
        document.getElementById(
            "setMakerResults"
        );


    result.innerHTML = `

        <div class="form-card">

            <h3>
                ✦ AI is analyzing...
            </h3>

            <p>
                Detecting dominant colour and
                searching inventory.
            </p>

        </div>

    `;


    try {

        const colour =
            await detectImageColour(
                selectedAIFile
            );


        const matches =
            findMatchingProducts(
                colour
            );


        renderAIResult(
            colour,
            matches
        );

    }
    catch (
        error
    ) {

        console.error(
            error
        );


        result.innerHTML = `

            <div class="form-card">

                <h3>
                    Analysis failed
                </h3>

                <p>
                    Please try another image.
                </p>

            </div>

        `;
    }
}


function detectImageColour(
    file
) {

    return new Promise(
        (
            resolve,
            reject
        ) => {

            const image =
                new Image();


            const url =
                URL.createObjectURL(
                    file
                );


            image.onload =
                () => {

                    const canvas =
                        document.createElement(
                            "canvas"
                        );


                    const size =
                        120;


                    canvas.width =
                        size;

                    canvas.height =
                        size;


                    const ctx =
                        canvas.getContext(
                            "2d"
                        );


                    ctx.drawImage(
                        image,
                        0,
                        0,
                        size,
                        size
                    );


                    const data =
                        ctx.getImageData(
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

                        const red =
                            data[i];

                        const green =
                            data[i + 1];

                        const blue =
                            data[i + 2];

                        const alpha =
                            data[i + 3];


                        if (
                            alpha < 100
                        ) {

                            continue;
                        }


                        const brightness =
                            (
                                red +
                                green +
                                blue
                            ) / 3;


                        if (
                            brightness >
                            245 ||
                            brightness <
                            15
                        ) {

                            continue;
                        }


                        r += red;

                        g += green;

                        b += blue;

                        count++;
                    }


                    URL.revokeObjectURL(
                        url
                    );


                    if (
                        !count
                    ) {

                        resolve({
                            r: 128,
                            g: 128,
                            b: 128,
                            name: "Mixed"
                        });

                        return;
                    }


                    r =
                        Math.round(
                            r / count
                        );

                    g =
                        Math.round(
                            g / count
                        );

                    b =
                        Math.round(
                            b / count
                        );


                    resolve({

                        r,

                        g,

                        b,

                        name:
                            colourName(
                                r,
                                g,
                                b
                            )

                    });

                };


            image.onerror =
                reject;


            image.src =
                url;

        }
    );
}


function colourName(
    r,
    g,
    b
) {

    const max =
        Math.max(
            r,
            g,
            b
        );


    const min =
        Math.min(
            r,
            g,
            b
        );


    if (
        max < 45
    ) {

        return "Black";
    }


    if (
        min > 215
    ) {

        return "White";
    }


    if (
        r > 170 &&
        g < 100 &&
        b < 110
    ) {

        return "Red";
    }


    if (
        r > 180 &&
        g > 120 &&
        b < 100
    ) {

        return "Orange";
    }


    if (
        r > 175 &&
        g > 155 &&
        b < 120
    ) {

        return "Yellow";
    }


    if (
        g > r * 1.15 &&
        g > b * 1.1
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
        r > 130 &&
        b > 100 &&
        Math.abs(
            r - b
        ) < 70
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


function findMatchingProducts(
    detected
) {

    if (
        !inventory.length
    ) {

        return [];
    }


    const target =
        detected.name
            .toLowerCase();


    const aliases = {

        red: [
            "red",
            "maroon",
            "wine",
            "burgundy",
            "rani",
            "lal"
        ],

        blue: [
            "blue",
            "navy",
            "royal",
            "sky",
            "neela",
            "nili"
        ],

        green: [
            "green",
            "olive",
            "mint",
            "pista",
            "hara"
        ],

        purple: [
            "purple",
            "violet",
            "lavender",
            "baingani"
        ],

        pink: [
            "pink",
            "rose",
            "rani",
            "gulabi"
        ],

        yellow: [
            "yellow",
            "mustard",
            "haldi",
            "peela"
        ],

        orange: [
            "orange",
            "peach",
            "kesariya"
        ],

        brown: [
            "brown",
            "coffee",
            "chocolate",
            "bhura"
        ],

        black: [
            "black",
            "kala"
        ],

        white: [
            "white",
            "cream",
            "ivory",
            "safed"
        ]

    };


    const words =
        aliases[
            target
        ] || [];


    const scored =
        inventory
            .map(
                product => {

                    const text =
                        (
                            String(
                                product.colour ||
                                ""
                            ) +
                            " " +
                            String(
                                product.name ||
                                ""
                            ) +
                            " " +
                            String(
                                product.category ||
                                ""
                            )
                        )
                            .toLowerCase();


                    let score =
                        0;


                    if (
                        text.includes(
                            target
                        )
                    ) {

                        score +=
                            100;
                    }


                    words.forEach(
                        word => {

                            if (
                                text.includes(
                                    word
                                )
                            ) {

                                score +=
                                    20;
                            }

                        }
                    );


                    if (
                        Number(
                            product.quantity
                        ) > 0
                    ) {

                        score +=
                            10;
                    }


                    return {
                        product,
                        score
                    };

                }
            )
            .filter(
                item =>
                    item.score >
                    0
            )
            .sort(
                (
                    a,
                    b
                ) =>
                    b.score -
                    a.score
            );


    return scored
        .map(
            item =>
                item.product
        )
        .slice(
            0,
            20
        );
}


function renderAIResult(
    colour,
    matches
) {

    const result =
        document.getElementById(
            "setMakerResults"
        );


    result.innerHTML = `

        <div class="form-card">

            <h3>
                ✦ AI Match Result
            </h3>


            <div
                style="
                    display:flex;
                    align-items:center;
                    gap:15px;
                    margin:18px 0;
                "
            >

                <div
                    style="
                        width:60px;
                        height:60px;
                        border-radius:18px;
                        background:rgb(
                            ${colour.r},
                            ${colour.g},
                            ${colour.b}
                        );
                        border:3px solid white;
                        box-shadow:
                            0 5px 15px
                            rgba(0,0,0,.15);
                    "
                ></div>


                <div>

                    <small
                        style="color:#777"
                    >
                        Detected Colour
                    </small>

                    <strong
                        style="
                            display:block;
                            font-size:20px;
                        "
                    >
                        ${safe(
                            colour.name
                        )}
                    </strong>

                </div>

            </div>


            <div
                class="section-title"
            >

                <h3>
                    Closest Inventory
                </h3>

                <span>
                    ${matches.length}
                    matches
                </span>

            </div>


            ${
                matches.length
                    ? matches
                        .map(
                            product =>
                                productHTML(
                                    product
                                )
                        )
                        .join("")
                    : `
                        <div
                            class="empty-state"
                        >

                            <div>
                                🔍
                            </div>

                            <h3>
                                No colour match
                            </h3>

                            <p>
                                Add more colour
                                variants to
                                inventory.
                            </p>

                        </div>
                    `
            }

        </div>

    `;
}


/* =========================================================
   BILL
========================================================= */

function updateBillProducts() {

    const select =
        document.getElementById(
            "billProduct"
        );


    if (!select) {

        return;
    }


    const current =
        select.value;


    select.innerHTML = `

        <option value="">
            Select product
        </option>

        ${
            inventory
                .map(
                    product => `

                        <option
                            value="${product.id}"
                        >
                            ${safe(
                                product.name
                            )}
                            —
                            ₹${money(
                                product.sellingPrice
                            )}
                            —
                            Stock:
                            ${product.quantity}
                        </option>

                    `
                )
                .join("")
        }

    `;


    if (
        inventory.some(
            product =>
                product.id ===
                current
        )
    ) {

        select.value =
            current;
    }
}


function calculateBillPreview() {

    const productId =
        document.getElementById(
            "billProduct"
        )
        ?.value;


    const quantity =
        Number(
            document.getElementById(
                "billQuantity"
            )
            ?.value
        ) || 0;


    const discount =
        Number(
            document.getElementById(
                "billDiscount"
            )
            ?.value
        ) || 0;


    const preview =
        document.getElementById(
            "billCalculation"
        );


    if (!preview) {

        return;
    }


    const product =
        inventory.find(
            p =>
                p.id ===
                productId
        );


    if (
        !product ||
        quantity <= 0
    ) {

        preview.innerHTML =
            "Select product and quantity.";

        return;
    }


    const subtotal =
        Number(
            product.sellingPrice
        ) *
        quantity;


    const safeDiscount =
        Math.min(
            Math.max(
                discount,
                0
            ),
            subtotal
        );


    const total =
        subtotal -
        safeDiscount;


    preview.innerHTML = `

        <div>
            <span>Subtotal</span>
            <strong>
                ₹${money(
                    subtotal
                )}
            </strong>
        </div>

        <div>
            <span>Discount</span>
            <strong>
                - ₹${money(
                    safeDiscount
                )}
            </strong>
        </div>

        <hr>

        <div>
            <strong>
                Total
            </strong>

            <strong>
                ₹${money(
                    total
                )}
            </strong>
        </div>

    `;
}


function createBill() {

    const productId =
        document.getElementById(
            "billProduct"
        )?.value;


    const quantity =
        Number(
            document.getElementById(
                "billQuantity"
            )?.value
        ) || 0;


    const discount =
        Number(
            document.getElementById(
                "billDiscount"
            )?.value
        ) || 0;


    const customer =
        document.getElementById(
            "customerName"
        )
        ?.value
        .trim() ||
        "Walk-in Customer";


    const product =
        inventory.find(
            p =>
                p.id ===
                productId
        );


    if (!product) {

        alert(
            "Please select a product."
        );

        return;
    }


    if (
        quantity <= 0
    ) {

        alert(
            "Quantity must be at least 1."
        );

        return;
    }


    if (
        quantity >
        Number(
            product.quantity
        )
    ) {

        alert(
            "Not enough stock available."
        );

        return;
    }


    const subtotal =
        Number(
            product.sellingPrice
        ) *
        quantity;


    const safeDiscount =
        Math.min(
            Math.max(
                discount,
                0
            ),
            subtotal
        );


    const total =
        subtotal -
        safeDiscount;


    const billNumber =
        "SI-" +
        Date.now()
            .toString()
            .slice(
                -8
            );


    const sale = {

        id:
            Date.now().toString(),

        billNumber,

        customer,

        productId,

        productName:
            product.name,

        sku:
            product.sku,

        quantity,

        price:
            Number(
                product.sellingPrice
            ),

        subtotal,

        discount:
            safeDiscount,

        total,

        date:
            new Date()
                .toISOString()

    };


    product.quantity -=
        quantity;


    sales.push(
        sale
    );


    localStorage.setItem(
        STORAGE_SALES,
        JSON.stringify(
            sales
        )
    );


    saveProducts();

    updateAll();

    renderBill(
        sale
    );


    alert(
        "Bill created successfully.\nStock deducted automatically."
    );
}


function renderBill(
    sale
) {

    const preview =
        document.getElementById(
            "billPreview"
        );


    if (!preview) {

        return;
    }


    preview.innerHTML = `

        <div class="bill-preview">

            <div class="bill-header">

                <div
                    class="brand-logo"
                    style="
                        margin:auto;
                    "
                >
                    SI
                </div>

                <h2>
                    Smart Inventory
                </h2>

                <p>
                    Sale Bill / Parcha
                </p>

                <small>
                    Bill No:
                    ${safe(
                        sale.billNumber
                    )}
                </small>

            </div>


            <hr>


            <p>
                <strong>
                    Customer:
                </strong>

                ${safe(
                    sale.customer
                )}
            </p>


            <p>
                <strong>
                    Product:
                </strong>

                ${safe(
                    sale.productName
                )}
            </p>


            <p>
                <strong>
                    SKU:
                </strong>

                ${safe(
                    sale.sku
                )}
            </p>


            <p>
                <strong>
                    Quantity:
                </strong>

                ${sale.quantity}
            </p>


            <p>
                <strong>
                    Price:
                </strong>

                ₹${money(
                    sale.price
                )}
            </p>


            <hr>


            <p>
                Subtotal:
                ₹${money(
                    sale.subtotal
                )}
            </p>


            <p>
                Discount:
                - ₹${money(
                    sale.discount
                )}
            </p>


            <h2>
                Total:
                ₹${money(
                    sale.total
                )}
            </h2>


            <button
                class="primary-btn full"
                onclick="window.print()"
            >
                🖨️ Print Bill
            </button>

        </div>

    `;
}


/* =========================================================
   EXPORT
========================================================= */

function exportInventory() {

    if (
        !inventory.length
    ) {

        alert(
            "Inventory is empty."
        );

        return;
    }


    const headers = [

        "Product Name",
        "SKU",
        "Category",
        "Colour",
        "Size",
        "Quantity",
        "Purchase Price",
        "Selling Price",
        "Notes"

    ];


    const rows =
        inventory.map(
            product => [

                product.name,

                product.sku,

                product.category,

                product.colour,

                product.size,

                product.quantity,

                product.purchasePrice,

                product.sellingPrice,

                product.notes

            ]
        );


    const csv =
        [
            headers,
            ...rows
        ]
            .map(
                row =>
                    row
                        .map(
                            cell =>
                                `"${String(
                                    cell ??
                                    ""
                                )
                                .replace(
                                    /"/g,
                                    '""'
                                )}"`
                        )
                        .join(",")
            )
            .join("\n");


    const blob =
        new Blob(
            [csv],
            {
                type:
                    "text/csv;charset=utf-8;"
            }
        );


    const url =
        URL.createObjectURL(
            blob
        );


    const a =
        document.createElement(
            "a"
        );


    a.href =
        url;


    a.download =
        "smart-inventory-backup.csv";


    a.click();


    URL.revokeObjectURL(
        url
    );
}


/* =========================================================
   GLOBAL UPDATE
========================================================= */

function updateAll() {

    updateDashboard();

    renderInventory(
        inventory
    );

    renderLowStock();

    updateBillProducts();

    calculateBillPreview();
}


/* =========================================================
   HELPERS
========================================================= */

function money(
    value
) {

    return Number(
        value || 0
    ).toFixed(2);
}


function safe(
    value
) {

    return String(
        value ??
        ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );
}


/* =========================================================
   GLOBAL EXPORTS
========================================================= */

window.showLogin =
    showLogin;

window.showApp =
    showApp;

window.sendOTP =
    sendOTP;

window.verifyOTP =
    verifyOTP;

window.backToMobile =
    backToMobile;

window.loginWithGmail =
    loginWithGmail;

window.logout =
    logout;

window.openProfile =
    openProfile;

window.openPage =
    openPage;

window.addProduct =
    addProduct;

window.searchInventory =
    searchInventory;

window.filterInventory =
    filterInventory;

window.editStock =
    editStock;

window.deleteProduct =
    deleteProduct;

window.addImportedProducts =
    addImportedProducts;

window.startScanner =
    startScanner;

window.stopScanner =
    stopScanner;

window.addScannedStock =
    addScannedStock;

window.analyzeSaree =
    analyzeSaree;

window.calculateBillPreview =
    calculateBillPreview;

window.createBill =
    createBill;

window.exportInventory =
    exportInventory;
