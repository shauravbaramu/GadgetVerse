const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const seedAdmin = async () => {
  try {
    // Check if an admin already exists
    const adminExists = await User.findOne({ role: "admin" });
    if (adminExists) {
      console.log("Admin user already exists.");
      return;
    }

    const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com";
    const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    const admin = new User({
      first_name: "Admin",
      last_name: "User",
      email: adminEmail,
      phone: "1234567890",
      address: "Admin Address",
      password: hashedPassword,
      role: "admin",
    });

    await admin.save();
    console.log("Admin created successfully.");
  } catch (err) {
    console.error("Error seeding admin :", err.message);
  }
};

module.exports = seedAdmin;
