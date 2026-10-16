function renderOrders() {

    refreshOrderStatuses();

    const user = getCurrentUser();

    const container =
        document.getElementById(
            "orders-list"
        );

    const empty =
        document.getElementById(
            "empty-orders"
        );

    const signInPrompt =
        document.getElementById(
            "signin-prompt"
        );

    if (!user) {

        if (signInPrompt) {
            signInPrompt.classList.remove("hidden");
        }
        if (container) {
            container.classList.add("hidden");
        }
        if (empty) {
            empty.classList.add("hidden");
        }

        return;

    }
    if (signInPrompt) {
        signInPrompt.classList.add("hidden");
    }
    if (container) {
        container.classList.remove("hidden");
    }

    const orders = getUserOrders();

    if (orders.length === 0) {

        empty.classList.remove("hidden");
        container.classList.add("hidden");

        return;

    }

    empty.classList.add("hidden");

    container.innerHTML =
        orders.map(order => {

            const status =
                getOrderStatus(order);

            const itemNames =
                order.items
                    .map(item => {
                        const detail =
                            getOrderItem(item);

                        return (
                            detail.name +
                            " × " +
                            item.quantity
                        );
                    })
                    .join(", ");

            const itemImages =
                order.items.map(item => {
                    const detail =
                        getOrderItem(item);

                    return `<img src="${detail.image}" alt="${detail.name}" class="order-item-image" loading="lazy">`;
                }).join("");

            const isCancellable =
                status === "Order Placed" ||
                status === "Preparing";

            const isReady =
                status === "Ready for Pickup";

            let actionButtons =
                `<button
                    class="btn btn-primary small-button"
                    onclick="viewOrder('${order.id}')"
                >
                    Track Order
                </button>`;

            if (isCancellable) {
                actionButtons +=
                    `<button
                        class="btn btn-danger small-button"
                        onclick="cancelOrder('${order.id}')"
                    >
                        Cancel
                    </button>`;
            }

            if (isReady) {
                actionButtons +=
                    `<button
                        class="btn btn-success small-button"
                        onclick="confirmPickup('${order.id}')"
                    >
                        Confirm Pickup ✓
                    </button>`;
            }

            return `

                <article class="order-card">

                    <div class="order-header">

                        <div>

                            <span class="food-category">
                                ORDER
                            </span>

                            <h2>
                                #${order.id}
                            </h2>

                            <small>
                                ${order.date}
                            </small>

                        </div>

                        <span class="status-badge" data-status="${status}">
                            ${status}
                        </span>

                    </div>

                    <div class="order-body">

                        <div class="order-images">
                            ${itemImages}
                        </div>

                        <p>
                            <strong>Items:</strong>
                            ${itemNames}
                        </p>

                        ${order.customerName ? `
                        <p>
                            <strong>Pickup Name:</strong>
                            ${order.customerName}
                        </p>` : ""}

                        <p>
                            <strong>Pickup:</strong>
                            ${order.pickup}${order.pickupTime ? " • 🕐 " + order.pickupTime : ""}
                        </p>

                        <p>
                            <strong>Payment:</strong>
                            ${order.payment}${order.changeDue != null ? " (change: " + formatCurrency(order.changeDue) + ")" : ""}
                        </p>

                        ${order.notes ? `<p><strong>Notes:</strong> ${order.notes}</p>` : ""}

                        ${order.estimatedTime ? `<p><strong>Est. Pickup:</strong> ⏱️ ${order.estimatedTime}</p>` : ""}

                    </div>


                    <div class="order-footer">

                        <strong>
                            Total:
                            ${formatCurrency(
                                order.total
                            )}
                        </strong>

                        <div class="order-actions">
                            ${actionButtons}
                        </div>

                    </div>

                </article>

            `;

        }).join("");

}


function viewOrder(orderId) {

    const orders = getOrders();

    const order =
        orders.find(
            order => order.id === orderId
        );

    if (!order) {
        return;
    }

    const status = getOrderStatus(order);
    const cancelled = status === "Cancelled";

    const stages = [
        "Order Placed",
        "Preparing",
        "Ready for Pickup",
        "Completed"
    ];

    let currentStage =
        stages.indexOf(status);

    if (currentStage < 0) {
        currentStage = cancelled ? 0 : 1;
    }

    const progressPercent =
        cancelled
            ? 0
            : (currentStage / (stages.length - 1)) * 100;

    let timeline = "";

    stages.forEach(
        (stage, index) => {

            const active =
                !cancelled && index <= currentStage;

            const isCurrent =
                !cancelled && index === currentStage;

            timeline += `

                <div class="
                    tracking-step
                    ${active ? "completed" : ""}
                    ${isCurrent ? "current" : ""}
                ">

                    <div class="tracking-dot">
                        ${active ? "✓" : index + 1}
                    </div>

                    <span>
                        ${stage}
                        ${isCurrent ? '<small class="current-label">Current</small>' : ""}
                    </span>

                </div>

            `;

        }
    );

    const itemImages = order.items.map(item => {
        const detail = getOrderItem(item);
        return `<img src="${detail.image}" alt="${detail.name}" class="receipt-item-image" loading="lazy">`;
    }).join("");

    const isCancellable =
        status === "Order Placed" ||
        status === "Preparing";

    const isReady =
        status === "Ready for Pickup";

    let modalActions = "";

    if (isCancellable) {
        modalActions +=
            `<button
                class="btn btn-danger full-button"
                onclick="cancelOrder('${order.id}'); this.closest('.modal-overlay').remove();"
            >
                Cancel Order
            </button>`;
    }

    if (isReady) {
        modalActions +=
            `<button
                class="btn btn-success full-button"
                onclick="confirmPickup('${order.id}'); this.closest('.modal-overlay').remove();"
            >
                Confirm Pickup ✓
            </button>`;
    }

    const modal =
        document.createElement(
            "div"
        );

    modal.className =
        "modal-overlay";

    modal.innerHTML = `

        <div class="modal">

            <button
                class="modal-close"
                onclick="this.closest('.modal-overlay').remove()"
            >
                ×
            </button>

            <p class="eyebrow">
                ORDER TRACKING
            </p>

            <h2>
                #${order.id}
            </h2>

            <div class="tracking-progress">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${progressPercent}%"></div>
                </div>
                <span class="progress-text">${status}</span>
            </div>

            <p>
                Pickup at:
                <strong>${order.pickup}</strong>
            </p>

            ${order.pickupTime ? `<p>Pickup time: <strong>🕐 ${order.pickupTime}</strong></p>` : ""}

            ${order.estimatedTime ? `<p class="tracking-estimate">⏱️ Estimated: ${order.estimatedTime}</p>` : ""}

            ${cancelled ? `<p class="tracking-estimate" style="color: #f87171;">❌ This order was cancelled</p>` : ""}

            <div class="tracking">
                ${timeline}
            </div>

            <div class="receipt-images">
                ${itemImages}
            </div>

            <div class="modal-total">

                <span>Total:</span>

                <strong>
                    ${formatCurrency(
                        order.total
                    )}
                </strong>

            </div>

            ${modalActions ? `<div class="modal-actions">${modalActions}</div>` : ""}

        </div>

    `;


    document.body.appendChild(
        modal
    );

}


renderOrders();

setInterval(renderOrders, 30000);
