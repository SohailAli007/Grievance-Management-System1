import { Feedback } from "../../Shared/models.js";
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

        const { complaintId } = event.queryStringParameters || {};

        let query = {};

        // Citizens can only see their own feedback
        if (user.role === "CITIZEN") {
            query.citizenId = user._id;
            if (complaintId) {
                query.complaintId = complaintId;
            }
        }
        // Officers/Admins can see public feedback or all if admin
        else if (["ADMIN_OFFICER", "FIELD_OFFICER", "WORKER", "STAFF"].includes(user.role)) {
            query.isPublic = true;
            if (complaintId) {
                query.complaintId = complaintId;
            }
        }
        // Admins can see all feedback
        else if (["SUPER_ADMIN", "ADMIN"].includes(user.role)) {
            if (complaintId) {
                query.complaintId = complaintId;
            }
        }

        const feedbacks = await Feedback.find(query)
            .populate('complaintId', 'title status')
            .populate('citizenId', 'name email')
            .sort({ createdAt: -1 });

        return response(200, feedbacks);
    } catch (err) {
        return response(500, { error: err.message });
    }
};
