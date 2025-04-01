const Order = require('../../models/Order');
const Product = require('../../models/Product');

// Create Order Controller
exports.createOrder = async (req, res) => {
    try {
        // Log the request body to verify the data
        console.log(req.body);

        // Extract user and cart items from the request body
        let { cartItems, shippingAddress, subTotal, totalPrice } = req.body;

        // Ensure the cart items are provided and is an array
        if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
            return res.status(400).send('Cart items are required.');
        }

        // If cartItems is a string (i.e., stringified array), parse it
        if (typeof cartItems === 'string') {
            cartItems = JSON.parse(cartItems); // Parse the string into an array of objects
        }

        // Log the user info
        console.log(req.user._id);

        // Fixed delivery charge
        const deliveryCharge = 10.00;

        // Calculate the total price if not already provided
        let calculatedSubTotal = 0;
        cartItems.forEach(item => {
            const price = parseFloat(item.price) || 0;
            const quantity = parseInt(item.quantity) || 0;
            calculatedSubTotal += price * quantity;
        });

        // Calculate totalPrice without redeclaring totalPrice
        totalPrice = calculatedSubTotal + deliveryCharge; // Use the existing totalPrice variable

        // Prepare the order object
        const order = new Order({
            user: req.user._id, // Assuming user is authenticated
            items: [],
            shippingAddress,
            subTotal: calculatedSubTotal,
            totalPrice,  // Use the updated totalPrice
            deliveryCharge,
        });

        // Loop through cart items and populate the order's items
        for (const item of cartItems) {
            // Look up the product by ID to fetch the price
            const product = await Product.findById(item.productId);

            if (!product) {
                return res.status(400).send('Product not found.');
            }

            // Push the item into the order
            order.items.push({
                product: item.productId,
                quantity: item.quantity,
                price: parseFloat(item.price), // Ensure price is a number
            });
        }

        // Save the order to the database
        const savedOrder = await order.save();

        localStorage.removeItem('cartProducts');  // Remove the cart from localStorage

        // Redirect to the order success page with the order ID
        res.redirect(`/order/success/${savedOrder._id}`);

    } catch (error) {
        console.error(error);
        res.status(500).send('Server error.');
    }
};

// Get orders for the logged-in user
exports.getOrders = async (req, res) => {
    try {
        // Fetch orders for the authenticated user
        const orders = await Order.find({ user: req.user._id }).populate('items.product');

        if (!orders || orders.length === 0) {
            return res.status(404).json({ message: 'No orders found for this user.' });
        }

        // Render the myOrders view in the front/user folder
        res.render('front/user/myOrders', { orders });

    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
};