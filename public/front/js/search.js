document.addEventListener("DOMContentLoaded", function () {
    const searchBar = document.getElementById("searchBar");
    const productCategories = document.getElementById("productCategories");

    // Listen for keyup events on the search bar
    searchBar.addEventListener("keyup", async function () {
        const query = searchBar.value.trim(); // Get the search query
        const category = document.getElementById("categoryFilter").value; // Get the selected category
        const price = document.getElementById("priceFilter").value; // Get the selected price range

        try {
            // Fetch search results with filters
            const response = await fetch(`/search-products?query=${query}&category=${category}&price=${price}`);
            const products = await response.json();

            // Clear the product list
            productCategories.innerHTML = "";

            // Group products by category
            const groupedProducts = products.reduce((acc, product) => {
                const categoryName = product.category?.name || "Uncategorized";
                if (!acc[categoryName]) {
                    acc[categoryName] = [];
                }
                acc[categoryName].push(product);
                return acc;
            }, {});

            // Append the grouped search results to the product list
            if (Object.keys(groupedProducts).length > 0) {
                Object.keys(groupedProducts).forEach((categoryName) => {
                    const categorySection = `
                        <div class="product-category">
                            <h2 class="category-title">${categoryName}</h2>
                            <div class="row product-list">
                                ${groupedProducts[categoryName]
                                    .map(
                                        (product) => `
                                        <div class="col-md-3 col-sm-6 col-xs-12">
                                            <div class="product-card">
                                                <div class="product-image">
                                                    <img src="${product.image || '/admin/img/placeholder.png'}" alt="${product.name}">
                                                </div>
                                                <div class="product-details">
                                                    <h3 class="product-name">${product.name}</h3>
                                                    <p class="product-price">$${product.price}</p>
                                                    <a href="/product-details?id=${product._id}" class="button">View Details</a>
                                                </div>
                                            </div>
                                        </div>
                                    `
                                    )
                                    .join("")}
                            </div>
                        </div>
                    `;
                    productCategories.insertAdjacentHTML("beforeend", categorySection);
                });
            } else {
                productCategories.innerHTML = "<p>No products found</p>";
            }
        } catch (err) {
            console.error("Error fetching search results:", err);
        }
    });
});