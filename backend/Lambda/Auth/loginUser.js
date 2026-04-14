import { User } from "../../Shared/models.js";
import { response } from "../../Shared/response.js";
import bcrypt from "bcryptjs";
import { createToken } from "../../Shared/jwt.js";

export const handler = async (event) => {
  try {
    const { email, password } = JSON.parse(event.body);
    const normalizedEmail = (email || "").toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });


    if (!user) {
      console.warn("Login failed: User not found", email);
      return response(400, { error: "User not found" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      console.warn("Login failed: Invalid password", email);
      return response(401, { error: "Invalid password" });
    }

    const token = createToken(user);

    return response(200, {
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        userId: user.userId,
        image: user.imageUrl,
        departmentName: user.departmentName || null
      }
    });

  } catch (err) {
    console.error("Login Error:", err);
    return response(500, { error: err.message });
  }
};
