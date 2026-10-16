function renderCart() {

    const user = getCurrentUser();
    if (!user) {
        showSignInPrompt();
        return;
    }

    const cart = getCart();

    const itemsContainer =
        document.getElementById("cart-items");

    const emptyCart =
        document.getElementById("empty-cart");

    const cartContent =
        document.getElementById("cart-content");

    const signInPrompt =
        document.getElementById("signin-prompt");

    if (signInPrompt) {
        signInPrompt.classList.add("hidden");
    }

    if (cart.length === 0) {

        cartContent.classList.add("hidden");

        emptyCart.classList.remove(
            "hidden"
        );

        return;

    }


    cartContent.classList.remove(
        "hidden"
    );

    emptyCart.classList.add(
        "hidden"
    );


    itemsContainer.innerHTML =
        cart.map(item => {

            const food =
                getFood(item.id);

            if (!food) {
                return "";
            }


            return `

                <article class="cart-item">

                    <div class="cart-food-image">
                        <img
                            src="${food.image}"
                            alt="${food.name}"
                            loading="lazy"
                        >
                    </div>


                    <div class="cart-food-info">

                        <span class="food-category">
                            ${food.category}
                        </span>

                        <h3>
                            ${food.name}
                        </h3>

                        <strong>
                            ${formatCurrency(food.price)}
                        </strong>

                    </div>


                    <div class="quantity-control">

                        <button
                            onclick="changeQuantity(
                                ${food.id},
                                -1
                            ); renderCart();"
                        >
                            −
                        </button>

                        <span>
                            ${item.quantity}
                        </span>

                        <button
                            onclick="changeQuantity(
                                ${food.id},
                                1
                            ); renderCart();"
                        >
                            +
                        </button>

                    </div>


                    <div class="cart-item-total">

                        <strong>
                            ${formatCurrency(
                                food.price *
                                item.quantity
                            )}
                        </strong>

                        <button
                            class="remove-button"
                            onclick="
                                removeFromCart(${food.id});
                                renderCart();
                            "
                        >
                            Remove
                        </button>

                    </div>

                </article>

            `;

        }).join("");


    const subtotal =
        cart.reduce(
            (total, item) => {

                const food =
                    getFood(item.id);

                return total +
                    (food.price *
                    item.quantity);

            },
            0
        );


    const fee = getServiceFee();
    const total = subtotal + fee;

    document.getElementById(
        "subtotal"
    ).textContent =
        formatCurrency(subtotal);


    document.getElementById(
        "cart-fee"
    ).textContent =
        formatCurrency(fee);


    document.getElementById(
        "total"
    ).textContent =
        formatCurrency(total);

}

function showSignInPrompt() {
    const signInPrompt =
        document.getElementById("signin-prompt");
    const cartContent =
        document.getElementById("cart-content");
    const emptyCart =
        document.getElementById("empty-cart");

    if (signInPrompt) {
        signInPrompt.classList.remove("hidden");
    }
    if (cartContent) {
        cartContent.classList.add("hidden");
    }
    if (emptyCart) {
        emptyCart.classList.add("hidden");
    }
}

renderCart();
