import { User } from "../../Shared/models.js";
import { response } from "../../Shared/response.js";
import { verify } from "../../Shared/jwt.js";

export const handler = async (event) => {
  try {
    const authHeader = event.headers?.Authorization || event.headers?.authorization;
    if (!authHeader) return response(401, { error: "Missing token" });

    const token = authHeader.replace("Bearer ", "");
    const decoded = verify(token);

    if (decoded.role !== "ADMIN") {
      return response(403, { error: "Not authorized" });
    }

    const users = await User.find({ isDeleted: { $ne: true } }).sort({ createdAt: -1 });

    const mapped = users.map((u) => ({
      id: u._id,
      userId: u.userId,
      name: u.name || u.email,
      email: u.email,
      role: u.role,
      active: true,
      categories: Array.isArray(u.categories) ? u.categories : [],
    }));

    return response(200, mapped);
  } catch (err) {
    console.error("GetAllUsers Error:", err);
    return response(500, { error: err.message });
  }
};
