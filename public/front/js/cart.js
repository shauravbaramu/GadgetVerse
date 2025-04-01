// Function to add products to the cart
function addToCart(productId, productName, productPrice, productImage, productStock) {
    // Retrieve the cart from local storage or initialize an empty array
    let cart = JSON.parse(localStorage.getItem('cartProducts')) || [];

    // Check if the product is already in the cart
    let existingProduct = cart.find(item => item.productId === productId);

    if (existingProduct) {
        // If the product exists, increase the quantity if stock is available
        if (existingProduct.quantity < productStock) {
            existingProduct.quantity++;
        } else {
            alert('Stock limit reached');
            return;
        }
    } else {
        // If the product is not in the cart, add it
        cart.push({
            productId: productId,
            name: productName,
            price: productPrice,
            image: productImage,
            stock: productStock,
            quantity: 1
        });
    }

    // Save the updated cart to local storage
    localStorage.setItem('cartProducts', JSON.stringify(cart));

    // Update the cart count on the page
    updateCartCount();
}

// Function to update the cart count displayed on the cart icon
function updateCartCount() {
    let cart = JSON.parse(localStorage.getItem('cartProducts')) || [];
    let cartCount = cart.reduce((total, item) => total + item.quantity, 0);
    let cartBadge = document.getElementById('cart-count');

    if (cartCount > 0) {
        cartBadge.style.display = 'inline-block';
        cartBadge.textContent = cartCount;
    } else {
        cartBadge.style.display = 'none';
    }
}

// Function to display the cart
function displayCart() {
    let cart = JSON.parse(localStorage.getItem('cartProducts')) || [];
    let cartContainer = document.getElementById('cart-items');
    let totalPrice = 0;

    // Clear the cart container
    cartContainer.innerHTML = '';

    if (cart.length === 0) {
        document.getElementById('empty-cart').classList.remove('d-none');
        return;
    }

    // Hide the empty cart message if items are present
    document.getElementById('empty-cart').classList.add('d-none');

    // Iterate through the cart and render each item
    cart.forEach(item => {
        let productRow = document.createElement('tr');

        productRow.innerHTML = `
            <td><img src="${item.image}" alt="${item.name}" style="width: 50px; height: auto;"></td>
            <td>${item.name}</td>
            <td>
                <input type="number" value="${item.quantity}" min="1" max="${item.stock}" 
                       onchange="updateQuantity('${item.productId}', this.value)" class="form-control">
            </td>
            <td>$${item.price}</td>
            <td><button onclick="removeItem('${item.productId}')">Remove</button></td>
        `;

        cartContainer.appendChild(productRow);
        totalPrice += item.price * item.quantity;
    });

    // Update total price in the summary
    document.getElementById('sub-total').textContent = `$${totalPrice.toFixed(2)}`;
    document.getElementById('total').textContent = `$${(totalPrice + 10).toFixed(2)}`; // Add $10 delivery charge
}

// Function to update the quantity of a product in the cart
function updateQuantity(productId, action) {
    let cart = JSON.parse(localStorage.getItem('cartProducts')) || [];
    let product = cart.find(item => item.productId === productId);

    if (!product) return;

    if (action === 'increase' && product.quantity < product.stock) {
        product.quantity++;
    } else if (action === 'decrease' && product.quantity > 1) {
        product.quantity--;
    }

    // Save the updated cart
    localStorage.setItem('cartProducts', JSON.stringify(cart));

    // Update the quantity displayed on the page
    document.getElementById(`quantity-${productId}`).textContent = product.quantity;

    // Update cart count
    updateCartCount();

    // Re-render the cart page
    displayCart();
}

// Function to remove an item from the cart
function removeItem(productId) {
    let cart = JSON.parse(localStorage.getItem('cartProducts')) || [];
    cart = cart.filter(item => item.productId !== productId);

    // Save the updated cart
    localStorage.setItem('cartProducts', JSON.stringify(cart));

    // Update cart count
    updateCartCount();

    // Re-render the cart page
    displayCart();
}

// Update cart count on page load
window.onload = function () {
    updateCartCount(); // Update the cart count on page load

    // If the page is the cart page, display the cart
    if (window.location.pathname === '/cart') {
        displayCart();
    }
};