
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");

const User = require("./models/User");

dotenv.config();

const seedSuperAdmin = async () => {
  try {
    // ==========================================
    // CONNECT TO MONGODB
    // ==========================================

    const mongoURI =
      process.env.MONGO_URL ||
      process.env.MONGO_URI ||
      process.env.MONGODB_URI;

    if (!mongoURI) {
      throw new Error(
        "MONGO_URL, MONGO_URI or MONGODB_URI is missing."
      );
    }

    await mongoose.connect(mongoURI);

    console.log("MongoDB connected successfully.");

    // ==========================================
    // SUPER ADMIN CREDENTIALS
    // ==========================================

    const email = "admin@msnacademy.com";
    const password =
      process.env.SUPER_ADMIN_PASSWORD || "Msn@12345";

    const hashedPassword = await bcrypt.hash(password, 10);

    // ==========================================
    // FIND EXISTING SUPER ADMIN
    // ==========================================

    let superAdmin = await User.findOne({ email });

    if (superAdmin) {
      // Update existing account without deleting it
      superAdmin.name = "Super Admin";
      superAdmin.password = hashedPassword;
      superAdmin.role = "super_admin";
      superAdmin.status = "Active";

      await superAdmin.save();

      console.log("Existing Super Admin account updated.");
    } else {
      // Create account only if it does not exist
      await User.create({
        name: "Super Admin",
        email,
        password: hashedPassword,
        role: "super_admin",
        status: "Active",
      });

      console.log("New Super Admin account created.");
    }

    // ==========================================
    // SUCCESS SUMMARY
    // ==========================================

    console.log("");
    console.log("==================================");
    console.log("SUPER ADMIN ACCOUNT READY");
    console.log("==================================");
    console.log("Email: admin@msnacademy.com");
    console.log("Password: Set from environment/fallback");
    console.log("==================================");

  } catch (error) {
    console.error("Super Admin Seed Error:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

seedSuperAdmin();
