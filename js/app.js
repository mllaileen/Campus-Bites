function getCart() {

    return JSON.parse(
        localStorage.getItem("campusBitesCart") || "[]"
    );

}


function saveCart(cart) {

    localStorage.setItem(
        "campusBitesCart",
        JSON.stringify(cart)
    );

}


function getFavorites() {

    return JSON.parse(
        localStorage.getItem("campusBitesFavorites") || "[]"
    );

}


function saveFavorites(favorites) {

    localStorage.setItem(
        "campusBitesFavorites",
        JSON.stringify(favorites)
    );

}


function getOrders() {

    return JSON.parse(
        localStorage.getItem("campusBitesOrders") || "[]"
    );

}


function saveOrders(orders) {

    localStorage.setItem(
        "campusBitesOrders",
        JSON.stringify(orders)
    );

}


const SERVICE_FEE = 10;


function getServiceFee() {

    return SERVICE_FEE;

}


function getUserOrders() {

    const user = getCurrentUser();

    if (!user) {
        return [];
    }

    return getOrders().filter(
        order => order.email === user.email
    );

}


function getOrderStatus(order) {

    if (
        order.status === "Cancelled" ||
        order.status === "Completed"
    ) {
        return order.status;
    }

    const placedAt =
        new Date(order.placedAt).getTime();

    if (isNaN(placedAt)) {
        return "Ready for Pickup";
    }

    const minutes =
        (Date.now() - placedAt) / 60000;

    if (minutes < 0.5) {
        return "Order Placed";
    }

    if (minutes < 1.5) {
        return "Preparing";
    }

    return "Ready for Pickup";

}


function refreshOrderStatuses() {

    const orders = getOrders();

    let changed = false;

    orders.forEach(order => {

        const status = getOrderStatus(order);

        if (order.status !== status) {

            order.status = status;
            changed = true;

            if (status === "Ready for Pickup") {
                showToast(
                    `🎉 Order #${order.id} is ready for pickup!`
                );
            }

        }

    });

    if (changed) {
        saveOrders(orders);
    }

    return changed;

}


function cancelOrder(orderId) {

    const orders = getOrders();

    const order =
        orders.find(o => o.id === orderId);

    if (!order) {
        return;
    }

    const status = getOrderStatus(order);

    if (
        status !== "Order Placed" &&
        status !== "Preparing"
    ) {
        showToast(
            "⚠️ This order can no longer be cancelled"
        );
        return;
    }

    order.status = "Cancelled";
    saveOrders(orders);

    showToast("❌ Order #" + orderId + " cancelled");

    if (typeof renderOrders === "function") {
        renderOrders();
    }

}


function confirmPickup(orderId) {

    const orders = getOrders();

    const order =
        orders.find(o => o.id === orderId);

    if (!order) {
        return;
    }

    if (getOrderStatus(order) !== "Ready for Pickup") {
        showToast("⚠️ Your order is not ready yet");
        return;
    }

    order.status = "Completed";
    saveOrders(orders);

    showToast(
        `✅ Order #${orderId} completed. Enjoy your food!`
    );

    if (typeof renderOrders === "function") {
        renderOrders();
    }

}


function getOrderItem(item) {

    if (item.name) {
        return {
            name: item.name,
            price: item.price,
            image: item.image
        };
    }

    const food = getFood(item.id);

    return (
        food ||
        { name: "Unknown Item", price: 0, image: "" }
    );

}


function formatCurrency(amount) {

    return "₱" + amount.toLocaleString("en-PH");

}


function getCartCount() {

    const cart = getCart();

    return cart.reduce(
        (total, item) => total + item.quantity,
        0
    );

}


function updateCartCount() {

    const countElement =
        document.getElementById("cart-count");

    if (!countElement) {
        return;
    }

    countElement.textContent =
        getCartCount();

}


function addToCart(foodId) {

    const user = getCurrentUser();
    if (!user) {
        showToast("⚠️ Please sign in to add items");
        setTimeout(() => {
            window.location.href = "auth.html";
        }, 1200);
        return;
    }

    const cart = getCart();

    const existingItem =
        cart.find(item => item.id === foodId);

    if (existingItem) {

        existingItem.quantity++;

    } else {

        cart.push({
            id: foodId,
            quantity: 1
        });

    }

    saveCart(cart);

    updateCartCount();

    const badge = document.getElementById("cart-count");
    if (badge) {
        badge.classList.remove("cart-badge-bounce");
        void badge.offsetWidth;
        badge.classList.add("cart-badge-bounce");
    }

    showToast("Added to cart!");

}


function removeFromCart(foodId) {

    let cart = getCart();

    cart = cart.filter(
        item => item.id !== foodId
    );

    saveCart(cart);

    updateCartCount();

}


function clearCart() {

    saveCart([]);
    updateCartCount();

}


function changeQuantity(foodId, change) {

    const cart = getCart();

    const item =
        cart.find(item => item.id === foodId);

    if (!item) {
        return;
    }

    item.quantity += change;

    if (item.quantity <= 0) {

        removeFromCart(foodId);

        return;

    }

    saveCart(cart);

    updateCartCount();

}


function toggleFavorite(foodId) {

    let favorites = getFavorites();

    if (favorites.includes(foodId)) {

        favorites =
            favorites.filter(
                id => id !== foodId
            );

        showToast("Removed from favorites");

    } else {

        favorites.push(foodId);

        showToast("Added to favorites ❤️");

    }

    saveFavorites(favorites);

}


function isFavorite(foodId) {

    const favorites = getFavorites();

    return favorites.includes(foodId);

}


function getFood(foodId) {

    return foods.find(
        food => food.id === foodId
    );

}


function renderPopularFoods() {

    const container =
        document.getElementById("popular-foods");

    if (!container) {
        return;
    }

    const popularFoods =
        foods.filter(food => food.popular);

    container.innerHTML =
        popularFoods
            .slice(0, 4)
            .map(food => createFoodCard(food))
            .join("");

}


function createFoodCard(food) {

    const favorite =
        isFavorite(food.id);

    return `

        <article class="food-card">

            <div class="food-image">

                <img
                    src="${food.image}"
                    alt="${food.name}"
                    class="food-emoji"
                    loading="lazy"
                >

                <button
                    class="favorite-button ${favorite ? "favorite-active" : ""}"
                    onclick="toggleFavorite(${food.id}); refreshCurrentPage();"
                    aria-label="Favorite"
                >
                    ${favorite ? "❤️" : "♡"}
                </button>

            </div>


            <div class="food-info">

                <span class="food-category">
                    ${food.category}
                </span>

                <h3>
                    ${food.name}
                </h3>

                <p>
                    ${food.description}
                </p>


                <div class="food-bottom">

                    <strong class="food-price">
                        ${formatCurrency(food.price)}
                    </strong>

                    <button
                        class="add-button"
                        onclick="addToCart(${food.id})"
                    >
                        + Add
                    </button>

                </div>

            </div>

        </article>

    `;

}


function showToast(message) {

    let toast =
        document.getElementById("toast");

    if (!toast) {

        toast =
            document.createElement("div");

        toast.id = "toast";

        toast.className = "toast";

        document.body.appendChild(toast);

    }

    toast.textContent = message;

    toast.classList.remove("show");
    void toast.offsetWidth;
    toast.classList.add("show");

    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => {
        toast.classList.remove("show");
    }, 2200);

}


function refreshCurrentPage() {

    if (typeof renderMenuFoods === "function") {
        renderMenuFoods();
    }

    if (typeof renderFavorites === "function") {
        renderFavorites();
    }

    if (typeof renderCart === "function") {
        renderCart();
    }

    updateCartCount();

}


document.addEventListener(
    "DOMContentLoaded",
    function() {

        updateCartCount();

    }
);