const Cart = require("../../models/Cart");
const Product = require("../../models/Product");
const Order = require("../../models/Order");

class CheckoutController {
  // Render the checkout page
  async showCheckoutPage(req, res) {
    try {
      const userId = req.user._id;

      // Fetch cart items for the user
      const cartItems = await Cart.find({ user: userId }).populate("product").lean();

      // Calculate totals
      let subTotal = 0;
      const items = cartItems.map((item) => {
        const productTotal = item.product.price * item.quantity;
        subTotal += productTotal;
        return {
          productId: item.product._id,
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
          total: productTotal,
        };
      });

      const deliveryCharge = 10.0;
      const total = subTotal + deliveryCharge;

      // Render the checkout page with cart data
      res.render("front/checkout", {
        user: req.user,
        cart: {
          items,
          subTotal,
          deliveryCharge,
          total,
        },
      });
    } catch (err) {
      console.error("Error rendering checkout page:", err);
      res.status(500).send("Failed to load checkout page.");
    }
  }

  // Handle checkout form submission
  async handleCheckout(req, res) {
    try {
      const { shippingAddress, paymentMethod } = req.body;

      // Validate the input
      if (!shippingAddress || !paymentMethod) {
        req.flash("error", "Shipping address and payment method are required.");
        return res.redirect("/checkout");
      }

      // Process the order (you can add order creation logic here)
      // For now, we'll just redirect to a success page
      req.flash("success", "Order placed successfully!");
      res.redirect("/order/success");
    } catch (err) {
      console.error("Error processing checkout:", err);
      req.flash("error", "Failed to process checkout.");
      res.redirect("/checkout");
    }
  }

  async placeOrder(req, res) {
    try {
      const userId = req.user._id; // Assuming `req.user` contains the authenticated user
      const { shippingAddress, paymentMethod } = req.body;
  
      // Fetch the user's cart
      const cartItems = await Cart.find({ user: userId }).populate("product").lean();
  
      if (cartItems.length === 0) {
        return res.status(400).send("Your cart is empty.");
      }
  
      // Prepare order items
      const items = cartItems.map((item) => ({
        product: item.product._id,
        quantity: item.quantity,
        price: item.product.price, // Price at the time of order
      }));
  
      // Calculate totals
      const subTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const discount = 0; // Add logic for discounts if applicable
      const deliveryCharge = 10; // Fixed delivery charge
      const totalPrice = subTotal + deliveryCharge - discount;
  
      // Create a new order
      const order = new Order({
        user: userId,
        items,
        shippingAddress,
        status: "pending",
        discount,
        deliveryCharge,
        subTotal,
        totalPrice,
      });
  
      await order.save();
  
      // Clear the user's cart
      await Cart.deleteMany({ user: userId });
  
      // Redirect to success page
      res.redirect(`/checkout/success?orderId=${order._id}`);
    } catch (err) {
      console.error("Error placing order:", err);
      res.status(500).send("Failed to place order.");
    }
  }
}

module.exports = new CheckoutController();