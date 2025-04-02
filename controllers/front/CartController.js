const Cart = require("../../models/Cart");
const Product = require("../../models/Product");

class CartController {
  // Fetch cart items for a user
  async getCart(req, res) {
    try {
      const userId = req.user._id; // Assuming `req.user` contains the authenticated user
      const cartItems = await Cart.find({ user: userId }).populate("product").lean();

      const cart = {
        items: cartItems.map((item) => ({
          productId: item.product._id,
          name: item.product.name,
          price: item.product.price,
          image: item.product.image || "/admin/img/placeholder.png",
          stock: item.product.stock,
          quantity: item.quantity,
        })),
        discount: 0,
        deliveryCharge: 10,
      };

      res.json({ success: true, cart });
    } catch (err) {
      console.error("Error fetching cart:", err);
      res.status(500).json({ success: false, message: "Failed to fetch cart." });
    }
  }

  // Add item to cart
  async addToCart(req, res) {
    try {
      const { productId } = req.body;
      const userId = req.user._id;

      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ success: false, message: "Product not found." });
      }

      let cartItem = await Cart.findOne({ user: userId, product: productId });
      if (cartItem) {
        if (cartItem.quantity < product.stock) {
          cartItem.quantity += 1;
          await cartItem.save();
        } else {
          return res.status(400).json({ success: false, message: "Stock limit reached." });
        }
      } else {
        cartItem = new Cart({
          user: userId,
          product: productId,
          quantity: 1,
        });
        await cartItem.save();
      }

      res.json({ success: true, message: "Product added to cart." });
    } catch (err) {
      console.error("Error adding to cart:", err);
      res.status(500).json({ success: false, message: "Failed to add item to cart." });
    }
  }

  // Update item quantity
  async updateQuantity(req, res) {
    try {
      const { productId, action } = req.body;
      const userId = req.user._id;
  
      // Find the cart item
      const cartItem = await Cart.findOne({ user: userId, product: productId }).populate("product");
      if (!cartItem) {
        return res.status(404).json({ success: false, message: "Product not found in cart." });
      }
  
      // Handle increase or decrease action
      if (action === "increase") {
        if (cartItem.quantity < cartItem.product.stock) {
          cartItem.quantity += 1;
        } else {
          return res.status(400).json({ success: false, message: "Stock limit reached." });
        }
      } else if (action === "decrease") {
        if (cartItem.quantity > 1) {
          cartItem.quantity -= 1;
        } else {
          return res.status(400).json({ success: false, message: "Minimum quantity is 1." });
        }
      } else {
        return res.status(400).json({ success: false, message: "Invalid action." });
      }
  
      // Save the updated cart item
      await cartItem.save();
      res.json({ success: true, message: "Cart updated successfully." });
    } catch (err) {
      console.error("Error updating quantity:", err);
      res.status(500).json({ success: false, message: "Failed to update quantity." });
    }
  }

  // Remove item from cart
  async removeFromCart(req, res) {
    try {
      const { productId } = req.body;
      const userId = req.user._id;

      await Cart.findOneAndDelete({ user: userId, product: productId });
      res.json({ success: true, message: "Product removed from cart." });
    } catch (err) {
      console.error("Error removing item from cart:", err);
      res.status(500).json({ success: false, message: "Failed to remove item from cart." });
    }
  }

  // Update discount and delivery charge
  async updateCartSettings(req, res) {
    try {
      const { discount, deliveryCharge } = req.body;
      const userId = req.user._id;

      // Store discount and delivery charge in the database or calculate dynamically
      const cart = {
        discount: parseFloat(discount) || 0,
        deliveryCharge: parseFloat(deliveryCharge) || 0,
      };

      res.json({ success: true, cart });
    } catch (err) {
      console.error("Error updating cart settings:", err);
      res.status(500).json({ success: false, message: "Failed to update cart settings." });
    }
  }

  async getCartCount(req, res) {
    try {
      const userId = req.user._id; // Assuming the user is authenticated
      const cartItems = await Cart.find({ user: userId });
      const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0); // Sum of all quantities
      res.json({ success: true, cartCount });
    } catch (err) {
      console.error("Error fetching cart count:", err);
      res.status(500).json({ success: false, message: "Failed to fetch cart count." });
    }
  }
}

module.exports = new CartController();