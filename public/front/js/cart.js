$(document).ready(function () {
  // Fetch and render cart items
  function fetchCart() {
    $.get("/cart/items", function (response) {
      if (response.success) {
        renderCart(response.cart);
      }
    });
  }

  // Render cart items
  function renderCart(cart) {
    const { items, discount, deliveryCharge } = cart;
    let subtotal = 0;

    $("#cart-items").empty();

    if (items.length > 0) {
      items.forEach((product) => {
        const productImage = product.image || "/admin/img/placeholder.png";
        const productTotal = product.price * product.quantity;
        subtotal += productTotal;

        const productDetails = `
            <tr class="cart-item" data-id="${product.productId}">
              <td><img src="${productImage}" alt="${product.name}" style="width: 60px; height: 60px; object-fit: cover;"></td>
              <td>${product.name}</td>
              <td>
                <div class="quantity-wrapper">
                  <button class="btn btn-sm btn-outline-secondary decrease" data-id="${product.productId}" data-action="decrease">
                    <i class="fa fa-minus"></i>
                  </button>
                  <input type="text" class="form-control text-center quantity-input" value="${product.quantity}" readonly>
                  <button class="btn btn-sm btn-outline-secondary increase" data-id="${product.productId}" data-action="increase">
                    <i class="fa fa-plus"></i>
                  </button>
                </div>
              </td>
              <td>$${product.price.toFixed(2)}</td>
              <td>
                <button class="btn btn-sm btn-danger remove" data-id="${product.productId}">
                  <i class="fa fa-trash"></i>
                </button>
              </td>
            </tr>
          `;
        $("#cart-items").append(productDetails);
      });

      $("#sub-total").text(`$${subtotal.toFixed(2)}`);
      $("#discount-display").text(`$${discount.toFixed(2)}`);
      $("#delivery-charge-display").text(`$${deliveryCharge.toFixed(2)}`);
      const total = subtotal - discount + deliveryCharge;
      $("#total").text(`$${total.toFixed(2)}`);

      // Enable the checkout button
      $("#checkout-btn").removeClass("disabled").off("click");
    } else {
      $("#cart-items").html(`<tr><td colspan="5" class="text-center text-danger">Your cart is empty.</td></tr>`);

      // Disable the checkout button and show an alert when clicked
      $("#checkout-btn").addClass("disabled").on("click", function (e) {
        e.preventDefault();
        Swal.fire({
          title: "Cart is Empty",
          text: "Please add items to your cart before proceeding to checkout.",
          icon: "warning",
          confirmButtonColor: "#5772C1",
        });
      });
    }
  }

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

  updateCartCount();

  // Handle quantity update (increase or decrease)
  $(document).on("click", ".decrease, .increase", function () {
    const productId = $(this).data("id");
    const action = $(this).data("action");

    $.post("/cart/update-quantity", { productId, action }, function (response) {
      if (response.success) {
        fetchCart(); // Re-fetch the cart to update the UI
        setTimeout(updateCartCount, 500);
      } else {
        // Show SweetAlert error message
        Swal.fire({
          title: "Error",
          text: response.message || "Failed to update quantity.",
          icon: "error",
          confirmButtonColor: "#5772C1",
        });
      }
    }).fail(function (xhr) {
      // Handle server errors (e.g., 400 Bad Request)
      const errorMessage = xhr.responseJSON?.message || "An error occurred while updating the quantity.";
      Swal.fire({
        title: "Error",
        text: errorMessage,
        icon: "error",
        confirmButtonColor: "#5772C1",
      });
    });
  });

  // Handle item removal
  $(document).on("click", ".remove", function () {
    const productId = $(this).data("id");

    $.post("/cart/remove", { productId }, function (response) {
      if (response.success) {
        fetchCart(); // Re-fetch the cart to update the UI
      } else {
        Swal.fire({
          title: "Error",
          text: response.message || "Failed to remove item from cart.",
          icon: "error",
          confirmButtonColor: "#5772C1",
        });
      }
    });
  });

  // Handle discount and delivery charge editing
  $(document).on("click", "#discount-display, #delivery-charge-display", function () {
    const inputId = $(this).data("input-id");
    $(`#${inputId}`).removeClass("d-none").focus();
    $(this).addClass("d-none");
  });

  $(document).on("blur keyup", "#discount-input, #delivery-charge-input", function (e) {
    if (e.type === "blur" || e.key === "Enter") {
      const inputId = $(this).attr("id");
      const displayId = $(this).data("display-id");
      const value = parseFloat($(this).val()) || 0;

      // Update the display value
      $(`#${displayId}`).text(`$${value.toFixed(2)}`).removeClass("d-none");
      $(this).addClass("d-none");

      // Recalculate the total
      const discount = parseFloat($("#discount-input").val()) || 0;
      const deliveryCharge = parseFloat($("#delivery-charge-input").val()) || 0;
      const subtotal = parseFloat($("#sub-total").text().replace("$", "")) || 0;
      const total = subtotal - discount + deliveryCharge;
      $("#total").text(`$${total.toFixed(2)}`);

      // Optionally, send the updated values to the server
      $.post("/cart/update-settings", { discount, deliveryCharge }, function (response) {
        if (!response.success) {
          Swal.fire({
            title: "Error",
            text: response.message || "Failed to update cart settings.",
            icon: "error",
            confirmButtonColor: "#5772C1",
          });
        }
      });
    }
  });

  // Initialize cart
  fetchCart();
});