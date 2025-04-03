const mongoose = require("mongoose");
const Order = require("./models/Order");
const Product = require("./models/Product"); // Assuming you have a Product model
const User = require("./models/User"); // Assuming you have a User model

// Connect to the database
mongoose
  .connect(`mongodb+srv://shaurav:shaurav@cluster0.wqzbx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`)
  .then(() => console.log("Database connected successfully"))
  .catch((err) => {
    console.error("Database connection error:", err.message);
    process.exit(1);
  });

const seedOrders = async () => {
  try {
    // Fetch a sample user and product from the database
    let user = await User.findOne(); // Fetch any user
    if (!user) {
      user = new User({
        first_name: "Test",
        last_name: "User",
        email: "testuser@example.com",
        password: "password123", // You may want to hash this in a real scenario
        phone: "1234567890",
        address: "123 Test Street, Test City, Test Country",
        role: "user", // Assuming the User model has a role field
      });
      await user.save();
      console.log("Test user created:", user);
    }

    let product = await Product.findOne(); // Fetch any product

    // Create sample order items
    const orderItems = [
      {
        product: "67e9e5b37e04ed307e0890e4",
        quantity: 2,
        price: 898, // Assuming the Product model has a price field
      },
      {
        product: "67e9e5b37e04ed307e0890e4",
        quantity: 1,
        price: 898,
      },
    ];

    // Calculate totals
    const subTotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const deliveryCharge = 50; // Example delivery charge
    const discount = 20; // Example discount
    const totalPrice = subTotal + deliveryCharge - discount;

    // Create a new order
    const order = new Order({
      user: user._id,
      items: orderItems,
      shippingAddress: "123 Test Street, Test City, Test Country",
      status: "pending",
      discount,
      deliveryCharge,
      subTotal,
      totalPrice,
    });

    // Save the order to the database
    await order.save();

    console.log("Order seeded successfully:", order);
    process.exit(0);
  } catch (err) {
    console.error("Error seeding orders:", err);
    process.exit(1);
  }
};

seedOrders();