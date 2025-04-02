$(document).ready(function () {
    // Fetch and update cart count
    function updateCartCount() {
      $.get("/cart/count", function (response) {
        if (response.success) {
          const cartCount = response.cartCount;
          const cartCountElement = $("#cart-count");
  
          if (cartCount > 0) {
            cartCountElement.text(cartCount).show(); // Update count and show badge
          } else {
            cartCountElement.hide(); // Hide badge if count is 0
          }
        }
      });
    }
  
    // Call updateCartCount on page load
    updateCartCount();
  });