import { User, Officer, Admin } from "../../Shared/models.js";
import { response } from "../../Shared/response.js";
import { verify } from "../../Shared/jwt.js";
import bcrypt from "bcryptjs";

export const handler = async (event) => {
    try {
        const authHeader = event.headers?.Authorization || event.headers?.authorization;
        if (!authHeader) {
            return response(401, { error: "Missing Authorization header" });
        }

        const token = authHeader.replace("Bearer ", "");
        const requester = verify(token);

        // Strict Uppercase check
        if (requester.role !== "ADMIN") {
            return response(403, { error: "Only Admins can add staff (Officers/Admins)" });
        }

        const { name, email, password, role, categories, departmentId } = JSON.parse(event.body);

        // Normalize role to uppercase
        const normalizedRole = (role || "").toUpperCase();

        if (!["OFFICER", "ADMIN"].includes(normalizedRole)) {
            return response(400, { error: "Invalid staff role. Must be OFFICER or ADMIN." });
        }

        const hashedPass = await bcrypt.hash(password, 10);
        const userId = `${normalizedRole.toLowerCase()}-${Date.now()}`;

        const userData = {
            userId,
            name: name || email.split('@')[0],
            email,
            password: hashedPass,
            role: normalizedRole,
            departmentId: departmentId || null,
            categories: normalizedRole === "OFFICER" ? (categories || []) : [],
            isActive: true
        };

        // Create in master User table
        await User.create(userData);

        // Create in Role-Specific table
        if (normalizedRole === "OFFICER") await Officer.create(userData);
        if (normalizedRole === "ADMIN") await Admin.create(userData);

        return response(200, { message: `${normalizedRole} added successfully`, userId });
    } catch (err) {
        console.error("AddStaff Error:", err);
        return response(500, { error: err.message });
    }
};
