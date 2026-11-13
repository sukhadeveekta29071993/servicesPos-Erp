const connectDB = require("../config/db");
const env = require("../config/env");

const User = require("../models/User");

const createSuperAdmin = async () => {
  try {
    await connectDB();

    const name = process.env.BOOTSTRAP_ADMIN_NAME;
    const email = process.env.BOOTSTRAP_ADMIN_EMAIL;
    const password = process.env.BOOTSTRAP_ADMIN_PASSWORD;

    if (!name || !email || !password) {
      throw new Error("Bootstrap admin name, email and password are required");
    }

    if (password.length < 12) {
      throw new Error(
        "Bootstrap admin password must contain at least 12 characters",
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingAdmin = await User.findOne({
      role: "super_admin",
    });

    if (existingAdmin) {
      console.log("Super Admin already exists.");
      return;
    }

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      throw new Error("This email already belongs to another user");
    }

    const admin = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      role: "super_admin",
      status: "active",
      isEmailVerified: true,
    });

    console.log("Super Admin created successfully.");
    console.log("Admin ID:", admin._id);
    console.log("Admin Email:", admin.email);
  } catch (error) {
    console.error("Super Admin setup failed:", error.message);
    process.exitCode = 1;
  } finally {
    const mongoose = require("mongoose");
    await mongoose.disconnect();
  }
};

createSuperAdmin();
