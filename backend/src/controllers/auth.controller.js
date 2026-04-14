const { User, Citizen } = require('../models');
const bcrypt = require('bcryptjs');
const { createToken } = require('../../Shared/jwt');

// Login
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const normalizedEmail = (email || "").toLowerCase().trim();
        const user = await User.findOne({ email: normalizedEmail });

        if (!user) {
            return res.status(400).json({ error: "User not found" });
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).json({ error: "Invalid password" });
        }

        const token = createToken(user);

        return res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                userId: user.userId,
                image: user.imageUrl
            }
        });
    } catch (err) {
        next(err);
    }
};

// Register
const register = async (req, res, next) => {
    try {
        const { name, email, phone, password } = req.body;

        // Check if email exists
        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            return res.status(400).json({ error: "Email address already registered" });
        }

        // Check if phone exists
        if (phone) {
            const existingPhone = await User.findOne({ phone });
            if (existingPhone) {
                return res.status(400).json({ error: "Phone number already registered" });
            }
        }

        const role = "CITIZEN";
        const hashedPass = await bcrypt.hash(password, 10);
        const userId = `citizen-${Date.now()}`;

        const now = new Date();
        const userData = {
            userId,
            name,
            email,
            phone,
            password: hashedPass,
            role,
            isNameChanged: true,
            phoneLastChanged: now,
            emailLastChanged: now,
            isActive: true
        };

        // Create in Master User Table
        await User.create(userData);

        // Create in Citizen Table
        await Citizen.create(userData);

        return res.status(200).json({ message: "User created", userId });
    } catch (err) {
        next(err);
    }
};

module.exports = { login, register };
