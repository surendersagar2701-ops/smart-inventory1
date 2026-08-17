/* =========================================================
   SMART INVENTORY — APP.JS
   Working frontend logic
========================================================= */


/* =========================================================
   DATA
========================================================= */

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


/* =========================================================
   INITIALIZATION
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    if (currentUser) {
        showApp();
    } else {
        showLogin();
    }

    updateDashboard();
    renderInventory();
    updateBillProducts();

    const productForm = document.getElementById("productForm");

    if (productForm) {
        productForm.addEventListener("submit", addProduct);
    }
});


/* =========================================================
   LOGIN
========================================================= */

function showLogin() {

    const loginScreen = document.getElementById("loginScreen");
    const app = document.getElementById("app");

    if (loginScreen) {
        loginScreen.classList.remove("hidden");
    }

    if (app) {
        app.classList.add("hidden");
    }
}


function showApp() {

    const loginScreen = document.getElementById("loginScreen");
    const app = document.getElementById("app");

    if (loginScreen) {
        loginScreen.classList.add("hidden");
    }

    if (app) {
        app.classList.remove("hidden");
    }

    updateUserInfo();
    updateDashboard();
    renderInventory();
    updateBillProducts();

    openPage("homePage");
}


/* =========================================================
   MOBILE OTP
========================================================= */

function sendOTP() {

    const mobileInput = document.getElementById("mobileNumber");

    if (!mobileInput) return;

    const mobile = mobileInput.value.trim();

    if (!/^[0-9]{10}$/.test(mobile)) {

        alert("Please enter a valid 10 digit mobile number.");

        return;
    }


    /*
       DEVELOPMENT PLACEHOLDER

       Real production OTP will be connected
       to Firebase/Auth/backend later.

       This temporary OTP is ONLY for testing
       the application flow.
    */

    temporaryOTP = String(
        Math.floor(100000 + Math.random() * 900000)
    );

    console.log("Development OTP:", temporaryOTP);

    alert(
        "OTP testing mode.\n\nYour OTP is: " +
        temporaryOTP
    );


    document
        .getElementById("mobileLogin")
        ?.classList.add("hidden");

    document
        .getElementById("otpLogin")
        ?.classList.remove("hidden");
}


function verifyOTP() {

    const otpInput = document.getElementById("otpInput");

    if (!otpInput) return;

    const otp = otpInput.value.trim();

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

    const gmailInput = document.getElementById("gmailInput");

    if (!gmailInput) return;

    const gmail = gmailInput.value.trim();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(gmail)) {

        alert("Please enter a valid Gmail address.");

        return;
    }


    const mobile =
        document.getElementById("mobileNumber")?.value.trim() || "";


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

    const userInfo =
        document.getElementById("userInfo");

    if (!userInfo) return;

    if (currentUser) {

        userInfo.textContent =
            currentUser.gmail || currentUser.mobile || "Inventory Management";

    } else {

        userInfo.textContent =
            "Inventory Management";
    }
}


function logout() {

    const confirmLogout =
        confirm("Are you sure you want to logout?");

    if (!confirmLogout) return;

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


/* =========================================================
   PAGE NAVIGATION
========================================================= */

function openPage(pageId, clickedButton = null) {

    const pages =
        document.querySelectorAll(".page");

    pages.forEach(page => {

        page.classList.remove("active");

    });


    const selectedPage =
        document.getElementById(pageId);

    if (selectedPage) {

        selectedPage.classList.add("active");

    }


    const navItems =
        document.querySelectorAll(".nav-item");

    navItems.forEach(item => {

        item.classList.remove("active");

    });


    if (clickedButton) {

        clickedButton.classList.add("active");

    } else {

        const pageToNav = {

            homePage: 0,

            inventoryPage: 1,

            aiSetMakerPage: 2,

            billPage: 3,

            morePage: 4

        };


        if (pageToNav[pageId] !== undefined) {

            navItems[
                pageToNav[pageId]
            ]?.classList.add("active");

        }
    }


    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });


    if (pageId === "inventoryPage") {

        renderInventory();

    }


    if (pageId === "billPage") {

        updateBillProducts();

    }


    if (pageId === "homePage") {

        updateDashboard();

    }
}


/* =========================================================
   ADD PRODUCT
========================================================= */

function addProduct(event) {

    event.preventDefault();


    const name =
        document.getElementById("productName").value.trim();

    const sku =
        document.getElementById("productSKU").value.trim();

    const category =
        document.getElementById("productCategory").value.trim();

    const colour =
        document.getElementById("productColour").value.trim();

    const size =
        document.getElementById("productSize").value.trim();

    const quantity =
        Number(
            document.getElementById("productQuantity").value
        ) || 0;

    const purchasePrice =
        Number(
            document.getElementById("purchasePrice").value
        ) || 0;

    const sellingPrice =
        Number(
            document.getElementById("sellingPrice").value
        ) || 0;


    if (!name || !sku) {

        alert("Product name and SKU are required.");

        return;
    }


    const duplicate =
        inventory.find(
            product =>
                product.sku.toLowerCase() ===
                sku.toLowerCase()
        );


    if (duplicate) {

        alert(
            "This SKU already exists in inventory."
        );

        return;
    }


    const product = {

        id:
            Date.now().toString(),

        name,

        sku,

        category,

        colour,

        size,

        quantity,

        purchasePrice,

        sellingPrice,

        createdAt:
            new Date().toISOString()

    };


    inventory.push(product);

    saveInventory();


    document
        .getElementById("productForm")
        .reset();


    document
        .getElementById("productQuantity")
        .value = 0;


    updateDashboard();

    renderInventory();

    updateBillProducts();


    alert(
        "Product successfully added to inventory."
    );


    openPage("inventoryPage");
}


/* =========================================================
   SAVE INVENTORY
========================================================= */

function saveInventory() {

    localStorage.setItem(

        "smartInventoryProducts",

        JSON.stringify(inventory)

    );
}


/* =========================================================
   INVENTORY RENDER
========================================================= */

function renderInventory(searchTerm = "") {

    const container =
        document.getElementById("inventoryList");

    if (!container) return;


    let products = [...inventory];


    if (searchTerm) {

        const term =
            searchTerm.toLowerCase();

        products =
            products.filter(product =>

                product.name
                    .toLowerCase()
                    .includes(term)

                ||

                product.sku
                    .toLowerCase()
                    .includes(term)

                ||

                (product.colour || "")
                    .toLowerCase()
                    .includes(term)

                ||

                (product.category || "")
                    .toLowerCase()
                    .includes(term)

            );
    }


    if (products.length === 0) {

        container.innerHTML = `

            <div class="empty-state">

                <div>📦</div>

                <h3>
                    ${searchTerm
                        ? "No matching products"
                        : "No products yet"}
                </h3>

                <p>
                    ${searchTerm
                        ? "Try another search."
                        : "Add your first product to inventory."}
                </p>

            </div>

        `;

        return;
    }


    container.innerHTML =
        products.map(product => {

            const lowStock =
                product.quantity <= 5;


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
                                ${escapeHTML(
                                    product.category || "-"
                                )}
                            </strong>

                        </div>


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

                            <strong
                                class="${
                                    lowStock
                                        ? "stock-low"
                                        : "stock-good"
                                }"
                            >
                                ${product.quantity}

                                ${
                                    lowStock
                                        ? " ⚠️"
                                        : ""
                                }

                            </strong>

                        </div>


                        <div class="info-box">

                            <small>Purchase</small>

                            <strong>
                                ₹${product.purchasePrice}
                            </strong>

                        </div>


                        <div class="info-box">

                            <small>Selling</small>

                            <strong>
                                ₹${product.sellingPrice}
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
                            font-size:12px;
                            font-weight:700;
                        "
                    >
                        Delete Product
                    </button>

                </div>

            `;

        }).join("");
}


/* =========================================================
   SEARCH
========================================================= */

function searchInventory() {

    const input =
        document.getElementById(
            "inventorySearch"
        );

    if (!input) return;

    renderInventory(
        input.value.trim()
    );
}


/* =========================================================
   STOCK UPDATE
========================================================= */

function editStock(productId) {

    const product =
        inventory.find(
            item => item.id === productId
        );

    if (!product) return;


    const newQuantity =
        prompt(
            `Current stock: ${product.quantity}\n\nEnter new stock quantity:`,
            product.quantity
        );


    if (newQuantity === null) return;


    const quantity =
        Number(newQuantity);


    if (
        Number.isNaN(quantity) ||
        quantity < 0
    ) {

        alert(
            "Please enter a valid stock quantity."
        );

        return;
    }


    product.quantity = quantity;

    saveInventory();

    renderInventory();

    updateDashboard();

    updateBillProducts();
}


function deleteProduct(productId) {

    const product =
        inventory.find(
            item => item.id === productId
        );

    if (!product) return;


    const confirmation =
        confirm(
            `Delete "${product.name}" from inventory?`
        );


    if (!confirmation) return;


    inventory =
        inventory.filter(
            item => item.id !== productId
        );


    saveInventory();

    renderInventory();

    updateDashboard();

    updateBillProducts();
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


    const totalQuantity =
        inventory.reduce(

            (sum, product) =>
                sum + Number(product.quantity || 0),

            0

        );


    const lowStockCount =
        inventory.filter(

            product =>
                Number(product.quantity || 0) <= 5

        ).length;


    const today =
        new Date().toDateString();


    const salesToday =
        sales.filter(

            sale =>
                new Date(
                    sale.date
                ).toDateString() === today

        );


    const todayAmount =
        salesToday.reduce(

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
            totalQuantity;

    }


    if (lowStock) {

        lowStock.textContent =
            lowStockCount;

    }


    if (todaySale) {

        todaySale.textContent =
            "₹" + todayAmount.toFixed(0);

    }
}


/* =========================================================
   BILL PRODUCT LIST
========================================================= */

function updateBillProducts() {

    const select =
        document.getElementById(
            "billProduct"
        );

    if (!select) return;


    if (inventory.length === 0) {

        select.innerHTML = `

            <option value="">
                No products available
            </option>

        `;

        return;
    }


    select.innerHTML = `

        <option value="">
            Select product
        </option>

        ${
            inventory.map(product => `

                <option
                    value="${product.id}"
                >

                    ${escapeHTML(product.name)}
                    —
                    ₹${product.sellingPrice}
                    —
                    Stock: ${product.quantity}

                </option>

            `).join("")
        }

    `;
}


/* =========================================================
   BILL CREATION
========================================================= */

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
        )?.value.trim() || "Walk-in Customer";


    if (!productId) {

        alert(
            "Please select a product."
        );

        return;
    }


    if (quantity <= 0) {

        alert(
            "Quantity must be at least 1."
        );

        return;
    }


    const product =
        inventory.find(
            item => item.id === productId
        );


    if (!product) {

        alert(
            "Product not found."
        );

        return;
    }


    if (quantity > product.quantity) {

        alert(

            `Only ${product.quantity} units are available.`

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
        Date.now().toString().slice(-8);


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
            product.sellingPrice,

        subtotal,

        discount:
            finalDiscount,

        total,

        date:
            new Date().toISOString()

    };


    /*
       STOCK AUTOMATICALLY DEDUCTS
    */

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


    alert(
        "Bill created successfully.\nStock updated automatically."
    );
}


/* =========================================================
   BILL PREVIEW
========================================================= */

function showBillPreview(sale) {

    const preview =
        document.getElementById(
            "billPreview"
        );

    if (!preview) return;


    preview.innerHTML = `

        <div class="bill-preview">

            <div class="bill-header">

                <h2>
                    Smart Inventory
                </h2>

                <p>
                    Parcha / Sale Bill
                </p>

                <small>
                    Bill No:
                    ${sale.billNumber}
                </small>

            </div>


            <div class="bill-row">

                <span>Customer</span>

                <strong>
                    ${escapeHTML(sale.customer)}
                </strong>

            </div>


            <div class="bill-row">

                <span>Product</span>

                <strong>
                    ${escapeHTML(sale.productName)}
                </strong>

            </div>


            <div class="bill-row">

                <span>SKU</span>

                <strong>
                    ${escapeHTML(sale.sku)}
                </strong>

            </div>


            <div class="bill-row">

                <span>
                    ${sale.quantity} × ₹${sale.price}
                </span>

                <strong>
                    ₹${sale.subtotal.toFixed(2)}
                </strong>

            </div>


            <div class="bill-row bill-discount">

                <span>Discount</span>

                <strong>
                    -₹${sale.discount.toFixed(2)}
                </strong>

            </div>


            <div class="bill-row bill-total">

                <span>
                    TOTAL
                </span>

                <strong>
                    ₹${sale.total.toFixed(2)}
                </strong>

            </div>


            <button
                class="main-btn"
                onclick="printBill()"
            >
                Print Bill
            </button>

        </div>

    `;
}


function printBill() {

    const preview =
        document.getElementById(
            "billPreview"
        );

    if (!preview) return;


    const printWindow =
        window.open(
            "",
            "_blank",
            "width=500,height=700"
        );


    if (!printWindow) {

        alert(
            "Please allow pop-ups to print the bill."
        );

        return;
    }


    printWindow.document.write(`

        <!DOCTYPE html>

        <html>

        <head>

            <title>
                Smart Inventory Bill
            </title>

            <style>

                body {
                    font-family: Arial;
                    padding: 30px;
                }

                h2 {
                    margin-bottom: 5px;
                }

                .bill-row {
                    display:flex;
                    justify-content:space-between;
                    padding:10px 0;
                    border-bottom:1px solid #ddd;
                }

                .bill-total {
                    font-size:20px;
                    font-weight:bold;
                }

            </style>

        </head>

        <body>

            ${preview.innerHTML}

        </body>

        </html>

    `);


    printWindow.document.close();

    printWindow.focus();

    setTimeout(() => {

        printWindow.print();

    }, 300);
}


/* =========================================================
   AI IMPORT
========================================================= */

function processAIFile() {

    const fileInput =
        document.getElementById(
            "aiFile"
        );


    const results =
        document.getElementById(
            "aiResults"
        );


    if (!fileInput?.files?.length) {

        alert(
            "Please select an image or file first."
        );

        return;
    }


    const file =
        fileInput.files[0];


    /*
       Real AI/OCR API will be connected
       here in the backend integration phase.

       For now this creates a review state
       rather than pretending that AI has
       actually analyzed the file.
    */


    results.innerHTML = `

        <div class="form-card">

            <h3>
                File Ready for AI Processing
            </h3>

            <p style="
                color:#718096;
                margin-top:8px;
                line-height:1.6;
            ">

                <strong>
                    ${escapeHTML(file.name)}
                </strong>

                has been selected.

                <br><br>

                The production AI/OCR connection
                will read the product information,
                identify missing fields and send
                complete records to inventory.

            </p>

            <div class="verified-box"
                style="margin-top:20px;"
            >
                ✓ File successfully selected
            </div>

        </div>

    `;
}


/* =========================================================
   QR SCANNER
========================================================= */

function startScanner() {

    const results =
        document.getElementById(
            "scanResults"
        );


    results.innerHTML = `

        <div class="form-card">

            <h3>
                Camera Scanner
            </h3>

            <p style="
                color:#718096;
                margin-top:8px;
                line-height:1.6;
            ">

                Camera permission and
                production QR/SKU scanner
                will be connected here.

            </p>

            <div class="verified-box"
                style="
                    margin-top:20px;
                    color:#d88917;
                    background:#fff5df;
                "
            >
                Scanner module ready
            </div>

        </div>

    `;
}


/* =========================================================
   AI SET MAKER
========================================================= */

function analyzeSaree() {

    const input =
        document.getElementById(
            "sareeImage"
        );


    const results =
        document.getElementById(
            "setMakerResults"
        );


    if (!input?.files?.length) {

        alert(
            "Please select a saree image first."
        );

        return;
    }


    const file =
        input.files[0];


    /*
       Real computer-vision AI integration
       will be connected here.

       The production version will detect
       the saree colour and compare it with
       inventory colour records.
    */


    results.innerHTML = `

        <div class="form-card">

            <h3>
                Saree Image Ready
            </h3>

            <p style="
                color:#718096;
                margin-top:8px;
                line-height:1.6;
            ">

                <strong>
                    ${escapeHTML(file.name)}
                </strong>

                selected successfully.

                <br><br>

                The production AI colour-analysis
                module will detect the closest
                inventory colour and match it
                against the configured set designs.

            </p>

        </div>

    `;
}


/* =========================================================
   PROFILE
========================================================= */

function openProfile() {

    if (!currentUser) {

        showLogin();

        return;
    }


    alert(

        "Smart Inventory Account\n\n" +

        "Mobile: " +
        (currentUser.mobile || "-") +

        "\nGmail: " +
        (currentUser.gmail || "-")

    );
}


/* =========================================================
   SECURITY / HTML ESCAPE
========================================================= */

function escapeHTML(value) {

    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


/* =========================================================
   DEVELOPMENT RESET
========================================================= */

function resetApplicationData() {

    const confirmation =
        confirm(
            "This will delete all local inventory, bills and login data. Continue?"
        );


    if (!confirmation) return;


    localStorage.removeItem(
        "smartInventoryProducts"
    );

    localStorage.removeItem(
        "smartInventorySales"
    );

    localStorage.removeItem(
        "smartInventoryUser"
    );


    inventory = [];

    sales = [];

    currentUser = null;

    temporaryOTP = null;


    location.reload();
}
