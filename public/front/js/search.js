document.addEventListener('DOMContentLoaded', function () {
    const searchBar = document.getElementById("searchBar");
    const searchDropdown = document.getElementById("searchDropdown");

    if (searchBar) {
        searchBar.addEventListener("input", async function () {
            const searchQuery = this.value.trim();

            if (searchQuery.length > 0) {
                searchDropdown.style.display = "block";
                const response = await fetch(`/search?query=${searchQuery}`);
                const products = await response.json();
                searchDropdown.innerHTML = "";

                if (products.length > 0) {
                    products.forEach(product => {
                        const productElement = document.createElement("div");
                        productElement.classList.add("search-item");
                        productElement.innerHTML = `
                            <a href="/product-details?id=${product._id}">
                                <img src="${product.image}" alt="${product.name}" class="search-item-image">
                                <span class="search-item-name">${product.name}</span>
                            </a>
                        `;
                        searchDropdown.appendChild(productElement);
                    });
                } else {
                    searchDropdown.innerHTML = "<p>No results found</p>";
                }
            } else {
                searchDropdown.style.display = "none";
            }
        });
    }
});
