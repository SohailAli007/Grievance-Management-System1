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

        const { notificationId } = event.pathParameters || {};

        if (notificationId) {
            // Mark single notification as read
            await Notification.findOneAndUpdate(
                { _id: notificationId, userId: user._id },
                { read: true }
            );
        } else {
            // Mark all notifications as read
            await Notification.updateMany(
                { userId: user._id, read: false },
                { read: true }
            );
        }

        return response(200, { message: "Notification(s) marked as read" });
    } catch (err) {
        return response(500, { error: err.message });
    }
};
