import { User, Citizen } from "../../Shared/models.js";
import { response } from "../../Shared/response.js";
import bcrypt from "bcryptjs";

export const handler = async (event) => {
  console.log("CreateUser lambda invoked");
  try {
    if (!event.body) {
      console.error("No body provided");
      return response(400, { error: "No body provided" });
    }

    const body = JSON.parse(event.body);
    console.log("Parsed body:", { ...body, password: "***" });
    const { name, email, phone, password } = body;

    // Check if email exists
    console.log("Checking for existing user with email:", email);
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return response(400, { error: "Email address already registered" });
    }

    // Check if phone exists
    if (phone) {
      const existingPhone = await User.findOne({ phone });
      if (existingPhone) {
        return response(400, { error: "Phone number already registered" });
      }
    }

    const role = "CITIZEN";
    console.log("Hashing password...");
    // Handle bcrypt import inconsistency if any
    const hashFn = bcrypt.hash || bcrypt.default?.hash;
    if (!hashFn) throw new Error("bcrypt.hash is not defined");

    const hashedPass = await hashFn(password, 10);
    const userId = `citizen-${Date.now()}`; // Unique ID
    console.log("Generated userId:", userId);

    const now = new Date();
    const userData = {
      userId,
      name,
      email,
      phone,
      password: hashedPass,
      role,
      isNameChanged: true, // Lock name immediately
      phoneLastChanged: now, // Lock phone immediately for 45 days
      emailLastChanged: now, // Lock email immediately for 45 days
      isActive: true
    };

    // Create in Master User Table
    console.log("Creating in User table...");
    await User.create(userData);

    // Create in Citizen Table
    console.log("Creating in Citizen table...");
    await Citizen.create(userData);

    console.log("User creation successful");
    return response(200, { message: "User created", userId });
  } catch (err) {
    if (err.name === 'ValidationError') {
      console.error("Register Validation Error Details:", Object.keys(err.errors).map(key => ({
        field: key,
        message: err.errors[key].message
      })));
    }
    console.error("Register Error Detailed:", err);
    return response(500, { error: err.message, details: err.errors });
  }
};
