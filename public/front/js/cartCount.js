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
  
    // Set interval to update cart count every 5 seconds
    setInterval(updateCartCount, 2000);
    // Call updateCartCount on page load
    updateCartCount();
  });