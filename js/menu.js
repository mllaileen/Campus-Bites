let selectedCategory = "All";
let searchText = "";


const searchInput =
    document.getElementById("menu-search");

const categoryContainer =
    document.getElementById("categories");


function renderMenuFoods() {

    const container =
        document.getElementById("menu-foods");

    const count =
        document.getElementById("food-count");

    const noResults =
        document.getElementById("no-results");


    let filteredFoods =
        foods.filter(food => {

            const matchesCategory =
                selectedCategory === "All" ||
                food.category === selectedCategory;

            const matchesSearch =
                food.name
                    .toLowerCase()
                    .includes(
                        searchText.toLowerCase()
                    ) ||

                food.description
                    .toLowerCase()
                    .includes(
                        searchText.toLowerCase()
                    );

            return (
                matchesCategory &&
                matchesSearch
            );

        });


    container.innerHTML =
        filteredFoods
            .map((food, index) => {
                const card = createFoodCard(food);
                return card.replace(
                    'class="food-card"',
                    `class="food-card" style="animation-delay: ${index * 0.05}s"`
                );
            })
            .join("");


    count.textContent =
        filteredFoods.length +
        (filteredFoods.length === 1
            ? " food item"
            : " food items");


    if (filteredFoods.length === 0) {

        noResults.classList.remove("hidden");

    } else {

        noResults.classList.add("hidden");

    }

}


searchInput.addEventListener(
    "input",
    function() {

        searchText =
            this.value.trim();

        renderMenuFoods();

    }
);


categoryContainer.addEventListener(
    "click",
    function(event) {

        const button =
            event.target.closest(
                ".filter-button"
            );

        if (!button) {
            return;
        }

        selectedCategory =
            button.dataset.category;


        document
            .querySelectorAll(".filter-button")
            .forEach(btn => {

                btn.classList.remove(
                    "active"
                );

            });


        button.classList.add("active");

        renderMenuFoods();

    }
);


const params =
    new URLSearchParams(
        window.location.search
    );


const urlCategory =
    params.get("category");

const urlSearch =
    params.get("search");


if (urlCategory) {

    selectedCategory =
        urlCategory;

    document
        .querySelectorAll(".filter-button")
        .forEach(button => {

            button.classList.toggle(
                "active",
                button.dataset.category ===
                urlCategory
            );

        });

}


if (urlSearch) {

    searchText = urlSearch;

    searchInput.value =
        urlSearch;

}


renderMenuFoods();