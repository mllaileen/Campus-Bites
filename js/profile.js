function loadProfileStats() {

    const user = getCurrentUser();

    if (!user) {
        document.getElementById("profile-name").textContent = "Guest";
        document.getElementById("profile-email").textContent = "Not signed in";
        return;
    }

    document.getElementById("profile-name").textContent = user.name;
    document.getElementById("profile-email").textContent = user.email;

    const orders =
        getUserOrders();

    const favorites =
        getFavorites();

    const totalSpent =
        orders.reduce(
            (total, order) =>
                total + order.total,
            0
        );


    document.getElementById(
        "profile-orders"
    ).textContent =
        orders.length;


    document.getElementById(
        "profile-favorites"
    ).textContent =
        favorites.length;


    document.getElementById(
        "profile-spent"
    ).textContent =
        formatCurrency(totalSpent);

}


loadProfileStats();
