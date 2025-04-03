const Cart = require("../../models/Cart");
const Product = require("../../models/Product");
const Order = require("../../models/Order");
const Notification = require("../../models/Notification");
const User = require("../../models/User");
const sendEmail = require("../../utils/mailer");

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
      const userId = req.user._id;
      const { shippingAddress, paymentMethod } = req.body;

      // Fetch the user's cart and calculate the subTotal
      const cartItems = await Cart.find({ user: userId }).populate("product").lean();
      const subTotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

      // Define a delivery charge (if applicable)
      const deliveryCharge = 10.0; // Example delivery charge
      const totalPrice = subTotal + deliveryCharge;

      // Create the order
      const order = new Order({
        user: userId,
        items: cartItems.map((item) => ({
          product: item.product._id,
          quantity: item.quantity,
          price: item.product.price,
        })),
        shippingAddress,
        paymentMethod,
        subTotal,
        deliveryCharge,
        totalPrice, // Include the calculated totalPrice
        status: "pending",
      });
      await order.save();

      // Clear the user's cart
      await Cart.deleteMany({ user: userId });

      // Send email to the user
      const emailSubject = "Order Confirmation - GadgetVerse";
      const templatePath = "orderConfirmation.ejs";
      const templateData = {
        user: req.user,
        items: cartItems,
        subTotal,
        deliveryCharge,
        total: totalPrice,
      };

      await sendEmail(req.user.email, emailSubject, templatePath, templateData);

      // Send notification to the admin
      const adminUsers = await User.find({ role: "admin" }); // Assuming admins have a role field
      const notifications = adminUsers.map((admin) => ({
        admin: admin._id,
        message: `New order placed.`,
        link: `/admin/orders/show/${order._id}`, // Link to the order details page
      }));
      await Notification.insertMany(notifications);

      // Redirect to success page
      res.redirect(`/checkout/success?orderId=${order._id}`);
    } catch (err) {
      console.error("Error placing order:", err);
      res.status(500).send("Failed to place order.");
    }
  }
}

module.exports = new CheckoutController();