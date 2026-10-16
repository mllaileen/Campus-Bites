function renderFavorites() {

    const user = getCurrentUser();
    if (!user) {
        const container =
            document.getElementById("favorite-foods");
        const empty =
            document.getElementById("empty-favorites");

        if (container) container.innerHTML = "";
        if (empty) {
            empty.classList.remove("hidden");
            empty.innerHTML = `
                <div class="empty-icon">🔐</div>
                <h2>Sign in to view favorites</h2>
                <p>You need an account to save and view favorites.</p>
                <a href="auth.html" class="btn btn-primary">Sign In / Sign Up</a>
            `;
        }
        return;
    }

    const container =
        document.getElementById(
            "favorite-foods"
        );

    const empty =
        document.getElementById(
            "empty-favorites"
        );


    const favorites =
        getFavorites();


    const favoriteFoods =
        foods.filter(
            food =>
                favorites.includes(
                    food.id
                )
        );


    if (favoriteFoods.length === 0) {

        container.innerHTML = "";

        empty.classList.remove(
            "hidden"
        );

        empty.innerHTML = `
            <div class="empty-icon">❤️</div>
            <h2>No favorites yet</h2>
            <p>Click the heart on a food item to save it here.</p>
            <a href="menu.html" class="btn btn-primary">Browse Menu</a>
        `;

        return;

    }


    empty.classList.add(
        "hidden"
    );


    container.innerHTML =
        favoriteFoods
            .map(food =>
                createFoodCard(food)
            )
            .join("");

}


renderFavorites();