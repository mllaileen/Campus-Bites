const cart = getCart();

const checkoutItems =
    document.getElementById(
        "checkout-items"
    );

const checkoutTotal =
    document.getElementById(
        "checkout-total"
    );

const checkoutSubtotal =
    document.getElementById(
        "checkout-subtotal"
    );

const checkoutFee =
    document.getElementById(
        "checkout-fee"
    );

const placeOrderButton =
    document.getElementById(
        "place-order"
    );

const pickupError =
    document.getElementById(
        "pickup-error"
    );

const paymentError =
    document.getElementById(
        "payment-error"
    );

const nameError =
    document.getElementById(
        "name-error"
    );

const cashError =
    document.getElementById(
        "cash-error"
    );

const orderNotes =
    document.getElementById(
        "order-notes"
    );

const pickupNameInput =
    document.getElementById(
        "pickup-name"
    );

const pickupTimeSelect =
    document.getElementById(
        "pickup-time"
    );

const cashAmountRow =
    document.getElementById(
        "cash-amount-row"
    );

const cashAmountInput =
    document.getElementById(
        "cash-amount"
    );

const changeRow =
    document.getElementById(
        "change-row"
    );

const changeDue =
    document.getElementById(
        "change-due"
    );

const estimatedTimeValue =
    document.getElementById(
        "estimated-time-value"
    );

function getSubtotal() {
    return cart.reduce((sum, item) => {
        const food = getFood(item.id);
        return sum + food.price * item.quantity;
    }, 0);
}

function getPickupTimeOptions() {

    const options = [
        {
            value: "asap",
            label: "ASAP — ready in 15–20 mins"
        }
    ];

    const now = new Date();

    [60, 90, 120].forEach(function(minutes) {

        const time = new Date(
            now.getTime() +
            minutes * 60000
        );

        const label = time.toLocaleTimeString(
            "en-US",
            { hour: "numeric", minute: "2-digit" }
        );

        options.push({
            value: label,
            label: "Today • " + label
        });

    });

    return options;

}

function getSelectedPickupTime() {

    const value = pickupTimeSelect.value;

    if (value === "asap") {
        return "ASAP (15–20 mins)";
    }

    return value;

}

function updateEstimatedTime() {

    if (!estimatedTimeValue) {
        return;
    }

    const value = pickupTimeSelect.value;

    estimatedTimeValue.textContent =
        value === "asap"
            ? "15–20 mins"
            : value;

}

function updateCashSummary() {

    const paymentEl = document.querySelector(
        'input[name="payment"]:checked'
    );

    const isCash =
        paymentEl &&
        paymentEl.value === "Cash";

    if (!isCash) {
        cashAmountRow.classList.add("hidden");
        changeRow.classList.add("hidden");
        return;
    }

    cashAmountRow.classList.remove("hidden");

    const tendered =
        parseFloat(cashAmountInput.value) || 0;

    const total = getSubtotal() + SERVICE_FEE;

    if (tendered > 0 && tendered >= total) {
        changeRow.classList.remove("hidden");
        changeDue.textContent =
            formatCurrency(tendered - total);
    } else {
        changeRow.classList.add("hidden");
    }

}

function initCheckoutForm() {

    const user = getCurrentUser();

    if (user && pickupNameInput) {
        pickupNameInput.value = user.name || "";
    }

    if (pickupTimeSelect) {
        getPickupTimeOptions().forEach(
            function(option) {
                const opt =
                    document.createElement("option");
                opt.value = option.value;
                opt.textContent = option.label;
                pickupTimeSelect.appendChild(opt);
            }
        );
    }

    document.querySelectorAll(
        'input[name="payment"]'
    ).forEach(function(radio) {
        radio.addEventListener(
            "change",
            updateCashSummary
        );
    });

    if (cashAmountInput) {
        cashAmountInput.addEventListener(
            "input",
            updateCashSummary
        );
    }

    if (pickupTimeSelect) {
        pickupTimeSelect.addEventListener(
            "change",
            updateEstimatedTime
        );
    }

    updateCashSummary();
    updateEstimatedTime();

}

function renderCheckout() {

    const user = getCurrentUser();
    const signInPrompt = document.getElementById("signin-prompt");
    const checkoutLayout = document.querySelector(".checkout-layout");

    if (!user) {
        if (signInPrompt) signInPrompt.classList.remove("hidden");
        if (checkoutLayout) checkoutLayout.classList.add("hidden");
        return;
    }

    if (signInPrompt) signInPrompt.classList.add("hidden");
    if (checkoutLayout) checkoutLayout.classList.remove("hidden");

    if (cart.length === 0) {
        window.location.href = "cart.html";
        return;
    }

    checkoutItems.innerHTML =
        cart.map(item => {

            const food = getFood(item.id);

            return `
                <div class="summary-item">
                    <span>
                        <img
                            src="${food.image}"
                            alt="${food.name}"
                            class="checkout-item-image"
                            loading="lazy"
                        >
                        ${food.name}
                        <span class="quantity-badge">×${item.quantity}</span>
                    </span>
                    <strong>
                        ${formatCurrency(
                            food.price * item.quantity
                        )}
                    </strong>
                </div>
            `;

        }).join("");

    const subtotal = getSubtotal();
    const total = subtotal + SERVICE_FEE;

    checkoutSubtotal.textContent = formatCurrency(subtotal);
    checkoutFee.textContent = formatCurrency(SERVICE_FEE);
    checkoutTotal.textContent = formatCurrency(total);

    updateCashSummary();
    updateEstimatedTime();

}

placeOrderButton.addEventListener(
    "click",
    function() {

        const user = getCurrentUser();

        if (!user) {
            window.location.href = "auth.html";
            return;
        }

        const pickupEl = document.querySelector(
            'input[name="pickup"]:checked'
        );
        const paymentEl = document.querySelector(
            'input[name="payment"]:checked'
        );

        let hasError = false;

        if (!pickupEl) {
            pickupError.classList.remove("hidden");
            hasError = true;
        } else {
            pickupError.classList.add("hidden");
        }

        if (!paymentEl) {
            paymentError.classList.remove("hidden");
            hasError = true;
        } else {
            paymentError.classList.add("hidden");
        }

        const customerName =
            pickupNameInput.value.trim();

        if (!customerName) {
            nameError.classList.remove("hidden");
            hasError = true;
        } else {
            nameError.classList.add("hidden");
        }

        let cashTendered = null;
        let changeDueValue = null;

        if (
            paymentEl &&
            paymentEl.value === "Cash"
        ) {
            cashTendered =
                parseFloat(cashAmountInput.value) || 0;

            const total =
                getSubtotal() + SERVICE_FEE;

            if (cashTendered < total) {
                cashError.classList.remove("hidden");
                hasError = true;
            } else {
                cashError.classList.add("hidden");
                changeDueValue =
                    cashTendered - total;
            }
        } else {
            cashError.classList.add("hidden");
        }

        if (hasError) return;

        placeOrderButton.disabled = true;
        placeOrderButton.textContent = "Processing...";
        placeOrderButton.classList.add("btn-loading");

        const pickup = pickupEl.value;
        const payment = paymentEl.value;
        const notes = orderNotes.value.trim();
        const pickupTime = getSelectedPickupTime();
        const subtotal = getSubtotal();
        const total = subtotal + SERVICE_FEE;

        const orderNumber =
            "CB" +
            Date.now().toString().slice(-6);

        setTimeout(() => {

            const newOrder = {
                id: orderNumber,
                email: user.email,
                customerName: customerName,
                items: cart.map(item => {
                    const food = getFood(item.id);
                    return {
                        id: food.id,
                        name: food.name,
                        price: food.price,
                        image: food.image,
                        quantity: item.quantity
                    };
                }),
                subtotal: subtotal,
                serviceFee: SERVICE_FEE,
                total: total,
                pickup: pickup,
                pickupTime: pickupTime,
                payment: payment,
                cashTendered: cashTendered,
                changeDue: changeDueValue,
                notes: notes,
                status: "Order Placed",
                date: new Date().toLocaleString(),
                placedAt: new Date().toISOString(),
                estimatedTime:
                    pickupTime === "ASAP (15–20 mins)"
                        ? "15–20 mins"
                        : pickupTime
            };

            const orders = getOrders();
            orders.unshift(newOrder);
            saveOrders(orders);

            localStorage.removeItem("campusBitesCart");
            updateCartCount();

            showOrderSuccessModal(newOrder);

        }, 1500);

    }
);

function showOrderSuccessModal(order) {

    const modal = document.createElement("div");
    modal.className = "modal-overlay";

    const itemImages = order.items.map(item => {
        const detail = getOrderItem(item);
        return `
            <img
                src="${detail.image}"
                alt="${detail.name}"
                class="receipt-item-image"
                loading="lazy"
            >
        `;
    }).join("");

    modal.innerHTML = `
        <div class="modal success-modal">
            <div class="success-animation">
                <div class="checkmark">✓</div>
            </div>
            <h2>Order Confirmed!</h2>
            <p class="success-subtitle">
                Your order has been placed successfully
            </p>
            <div class="receipt">
                <div class="receipt-header">
                    <span class="receipt-label">ORDER NUMBER</span>
                    <strong class="receipt-number">#${order.id}</strong>
                </div>
                <div class="receipt-items">
                    ${order.items.map(item => {
                        const detail = getOrderItem(item);
                        return `
                            <div class="receipt-item">
                                <span>${detail.name} × ${item.quantity}</span>
                                <strong>${formatCurrency(detail.price * item.quantity)}</strong>
                            </div>
                        `;
                    }).join("")}
                </div>
                ${order.notes ? `<div class="receipt-notes">📝 ${order.notes}</div>` : ""}
                <hr>
                <div class="receipt-row">
                    <span>Subtotal</span>
                    <span>${formatCurrency(order.subtotal)}</span>
                </div>
                <div class="receipt-row">
                    <span>Service Fee</span>
                    <span>${formatCurrency(order.serviceFee)}</span>
                </div>
                <div class="receipt-row receipt-total">
                    <strong>Total</strong>
                    <strong>${formatCurrency(order.total)}</strong>
                </div>
                <div class="receipt-row">
                    <span>Customer</span>
                    <span>${order.customerName}</span>
                </div>
                <div class="receipt-row">
                    <span>Pickup</span>
                    <span>${order.pickup}</span>
                </div>
                <div class="receipt-row">
                    <span>Pickup Time</span>
                    <span class="estimated-time-badge">🕐 ${order.pickupTime}</span>
                </div>
                <div class="receipt-row">
                    <span>Payment</span>
                    <span>${order.payment}</span>
                </div>
                ${order.changeDue != null ? `
                <div class="receipt-row">
                    <span>Cash Tendered</span>
                    <span>${formatCurrency(order.cashTendered)}</span>
                </div>
                <div class="receipt-row">
                    <span>Change</span>
                    <span>${formatCurrency(order.changeDue)}</span>
                </div>` : ""}
                <div class="receipt-row">
                    <span>Estimated Pickup</span>
                    <span class="estimated-time-badge">⏱️ ${order.estimatedTime}</span>
                </div>
            </div>
            <div class="receipt-images">
                ${itemImages}
            </div>
            <button
                class="btn btn-primary full-button"
                onclick="window.location.href='orders.html'"
            >
                View My Orders →
            </button>
        </div>
    `;

    document.body.appendChild(modal);

}

initCheckoutForm();
renderCheckout();
