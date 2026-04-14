import { Complaint, Assignment, User, ComplaintLog, Notification } from "../../Shared/models.js";
import { response } from "../../Shared/response.js";
import { verify } from "../../Shared/jwt.js";

export const handler = async (event) => {
    try {
        const authHeader = event.headers?.Authorization || event.headers?.authorization;
        if (!authHeader) return response(401, { error: "Missing token" });

        const token = authHeader.replace("Bearer ", "");
        const decoded = verify(token);

        // Fetch the claiming user
        const officer = await User.findById(decoded.userId);
        if (!officer) return response(404, { error: "Officer record not found" });

        // Only authorized roles can claim
        if (!["ADMIN", "OFFICER"].includes(decoded.role)) {
            return response(403, { error: "Only officers or admins can claim complaints" });
        }


        const { complaintId } = event.pathParameters || {};
        if (!complaintId) return response(400, { error: "Missing complaintId" });

        // Find complaint (support both MongoDB ID and business ID)
        let complaint = await Complaint.findOne({
            $or: [
                { _id: complaintId.length === 24 ? complaintId : null },
                { complaintId }
            ]
        });

        if (!complaint) return response(404, { error: "Complaint not found" });

        // Check if already assigned
        if (complaint.status !== "PENDING" && complaint.assignedOfficerId) {
            return response(400, { error: `Complaint is already ${complaint.status}` });
        }

        // Logic check: Can this officer claim this? 
        // Typically, officers claim tasks from their own department categories.
        const canClaim = decoded.role === "ADMIN" ||
            (officer.categories || []).includes(complaint.categoryName);

        if (!canClaim) {
            return response(403, { error: "This complaint is not in your authorized departments" });
        }

        // 1. Create Assignment
        const assignment = await Assignment.create({
            complaintId: complaint._id,
            assignedTo: officer._id,
            assignedBy: decoded.userId,
            teamName: officer.teamName || "N/A",
            role: officer.role
        });

        // 2. Update Complaint
        complaint.status = "ASSIGNED";
        complaint.assignedOfficerId = decoded.userId;
        complaint.assignedOfficerName = officer.name;
        await complaint.save();

        // 3. Log the change
        await ComplaintLog.create({
            complaintId: complaint._id,
            status: "ASSIGNED",
            updatedBy: decoded.userId,
            message: `Claimed by ${officer.name} (${officer.role})`
        });

        // 4. Notify Citizen
        if (complaint.userId) {
            await Notification.create({
                userId: complaint.userId,
                title: "Complaint Assigned",
                message: `Your complaint "${complaint.title}" has been claimed by ${officer.name}.`,
                complaintId: complaint._id,
                read: false
            });
        }

        return response(200, {
            message: "Complaint claimed successfully",
            complaintId: complaint.complaintId,
            assignedTo: officer.name
        });

    } catch (err) {
        console.error("Claim Error:", err);
        return response(500, { error: err.message });
    }
};
