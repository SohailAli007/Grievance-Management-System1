import { Notification } from "../../Shared/models.js";
import { response } from "../../Shared/response.js";
import { verify } from "../../Shared/jwt.js";
import { getUserFromToken } from "../../Shared/userHelper.js";

export const handler = async (event) => {
    try {
        const authHeader = event.headers?.Authorization || event.headers?.authorization;
        if (!authHeader) {
            return response(401, { error: "Missing Authorization header" });
        }

        const token = authHeader.replace("Bearer ", "");
        const decoded = verify(token);
        const user = await getUserFromToken(decoded);

        const notifications = await Notification.find({ userId: user._id })
            .sort({ createdAt: -1 })
            .limit(50);

        const unreadCount = await Notification.countDocuments({
            userId: user._id,
            read: false
        });

        return response(200, { notifications, unreadCount });
    } catch (err) {
        return response(500, { error: err.message });
    }
};
