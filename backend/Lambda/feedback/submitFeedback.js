import { Feedback, Complaint } from "../../Shared/models.js";
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

        // Only citizens can submit feedback
        if (user.role !== "CITIZEN") {
            return response(403, { error: "Only citizens can submit feedback" });
        }

        const { complaintId, rating, comment, isPublic } = JSON.parse(event.body || "{}");

        if (!complaintId || !rating) {
            return response(400, { error: "Missing complaintId or rating" });
        }

        if (rating < 1 || rating > 5) {
            return response(400, { error: "Rating must be between 1 and 5" });
        }

        // Find complaint
        const complaint = await Complaint.findById(complaintId);
        if (!complaint) {
            return response(404, { error: "Complaint not found" });
        }

        // Verify complaint belongs to user
        if (complaint.citizenId.toString() !== user._id.toString()) {
            return response(403, { error: "You can only provide feedback for your own complaints" });
        }

        // Check if complaint is resolved/closed
        if (!["RESOLVED", "CLOSED"].includes(complaint.status)) {
            return response(400, { error: "Feedback can only be submitted for resolved/closed complaints" });
        }

        // Check if feedback already exists
        const existingFeedback = await Feedback.findOne({ complaintId: complaint._id });
        if (existingFeedback) {
            return response(400, { error: "Feedback already submitted for this complaint" });
        }

        // Create feedback
        const feedback = await Feedback.create({
            complaintId: complaint._id,
            citizenId: user._id,
            rating,
            comment: comment || "",
            isPublic: isPublic !== false // Default to true
        });

        return response(200, {
            message: "Feedback submitted successfully",
            feedback
        });
    } catch (err) {
        return response(500, { error: err.message });
    }
};
