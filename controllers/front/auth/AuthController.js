const User = require("../../../models/User");
const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");

class AuthController {
    // Render the registration page
    async showRegisterPage(req, res) {
        try {
            return res.render("front/register", {
                errors: req.flash("errors"),
                success: req.flash("success"),
            });
        } catch (err) {
            return res.status(500).send(err.message);
        }
    }

    // Handle user registration
    async register(req, res) {
        const { first_name, last_name, email, phone, address, password, confirm_password } = req.body;
        let errors = [];

        // Validate input fields
        if (!first_name || !email || !phone || !address || !password || !confirm_password) {
            errors.push({ msg: "Please fill in all fields" });
        }

        if (password !== confirm_password) {
            errors.push({ msg: "Passwords do not match" });
        }

        if (password.length < 8) {
            errors.push({ msg: "Password must be at least 8 characters long" });
        }

        if (errors.length > 0) {
            req.flash("errors", errors);
            return res.redirect("/register");
        }

        try {
            // Check if email already exists
            const existingUser = await User.findOne({ email });

            if (existingUser) {
                errors.push({ msg: "Email is already registered" });
                req.flash("errors", errors);
                return res.redirect("/register");
            }

            // Hash the password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Create a new user
            const newUser = new User({
                first_name,
                last_name,
                email,
                phone,
                address,
                password: hashedPassword,
                role: "user",
            });

            await newUser.save();

            req.flash("success", "You are now registered. Please log in.");
            return res.redirect("/login");
        } catch (err) {
            errors.push({ msg: err.message });
            req.flash("errors", errors);
            return res.redirect("/register");
        }
    }

    // Render the login page
    async showLoginPage(req, res) {
        try {
            return res.render("front/login", {
                errors: req.flash("errors"),
                success: req.flash("success"),
            });
        } catch (err) {
            return res.status(500).send(err.message);
        }
    }

    // Handle user login
    async login(req, res) {
        const { email, password, remember_me } = req.body;
        let errors = [];

        if (!email || !password) {
            errors.push({ msg: "Please fill in all fields" });
            req.flash("errors", errors);
            return res.redirect("/login");
        }

        try {
            // Find user by email
            const user = await User.findOne({ email, role: "user" });
            if (!user) {
                errors.push({ msg: "Invalid email or password" });
                req.flash("errors", errors);
                return res.redirect("/login");
            }

            // Compare passwords
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                errors.push({ msg: "Invalid email or password" });
                req.flash("errors", errors);
                return res.redirect("/login");
            }

            // Set session data
            req.session.user = {
                id: user._id,
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                address: user.address,
                phone: user.phone,
                role: user.role,
            };

            // Handle "Remember Me" functionality
            if (remember_me) {
                req.session.cookie.maxAge = 1000 * 60 * 60 * 24 * 30; // 30 days
            } else {
                req.session.cookie.expires = false;
            }

            return res.redirect("/");
        } catch (err) {
            errors.push({ msg: err.message });
            req.flash("errors", errors);
            return res.redirect("/login");
        }
    }

    // Handle user logout
    async logout(req, res) {
        try {
            req.session.destroy((err) => {
                if (err) {
                    return res.status(500).send("Error logging out");
                }
                res.redirect("/login");
            });
        } catch (err) {
            return res.status(500).send(err.message);
        }
    }
}

module.exports = new AuthController();
