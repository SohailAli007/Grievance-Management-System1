import { Complaint, Assignment, User, Notification, ComplaintLog } from "../../Shared/models.js";
import { response } from "../../Shared/response.js";
import { verify } from "../../Shared/jwt.js";

export const handler = async (event) => {
    try {
        const authHeader = event.headers?.Authorization || event.headers?.authorization;
        if (!authHeader) return response(401, { error: "Missing token" });

        const token = authHeader.replace("Bearer ", "");
        const decoded = verify(token);

        // Fetch user context
        const admin = await User.findById(decoded.userId);
        if (!admin) return response(404, { error: "Admin context not found" });

        // Only admins and admin officers can assign
        if (!["ADMIN", "ADMIN_OFFICER"].includes(decoded.role)) {
            return response(403, { error: "Not authorized to assign complaints" });
        }

        const { complaintId } = event.pathParameters || {};
        const { assignedTo, teamName, note } = JSON.parse(event.body || "{}");

        if (!complaintId || !assignedTo) {
            return response(400, { error: "Missing complaintId or assignedTo" });
        }

        // Find complaint (support both MongoDB ID and business ID)
        let complaint = await Complaint.findOne({
            $or: [
                { _id: complaintId.length === 24 ? complaintId : null },
                { complaintId }
            ]
        });

        if (!complaint) return response(404, { error: "Complaint not found" });

        // Find assignee (assignedTo is userId or Mongo _id)
        const assignee = await User.findOne({
            $or: [
                { _id: assignedTo.length === 24 ? assignedTo : null },
                { userId: assignedTo }
            ]
        });

        if (!assignee) return response(404, { error: "Assignee user not found" });

        // Deactivate previous assignments
        await Assignment.updateMany(
            { complaintId: complaint._id, isActive: true },
            { isActive: false }
        );

        // Create new assignment record
        await Assignment.create({
            complaintId: complaint._id,
            assignedTo: assignee._id,
            assignedBy: decoded.userId,
            teamName: teamName || assignee.teamName || "N/A",
            role: assignee.role
        });

        // Update complaint status and cache names
        complaint.status = "ASSIGNED";
        complaint.assignedOfficerId = assignee.userId;
        complaint.assignedOfficerName = assignee.name;
        await complaint.save();

        // Create complaint progress log
        await ComplaintLog.create({
            complaintId: complaint._id,
            status: "ASSIGNED",
            updatedBy: decoded.userId,
            message: note || `Assigned to ${assignee.name} (${assignee.role}) by ${admin.name}`
        });

        // Notify assignee
        await Notification.create({
            userId: assignee._id,
            title: "New Task Assigned",
            message: `You have been assigned complaint ${complaint.complaintId}: ${complaint.title}`,
            complaintId: complaint._id,
            read: false
        });

        // Notify citizen
        if (complaint.userId) {
            await Notification.create({
                userId: complaint.userId,
                title: "Complaint Assigned",
                message: `Your complaint "${complaint.title}" is now being handled by ${assignee.name}.`,
                complaintId: complaint._id,
                read: false
            });
        }

        return response(200, {
            message: "Complaint assigned successfully",
            complaintId: complaint.complaintId,
            assignedTo: assignee.name
        });

    } catch (err) {
        console.error("Assign Error:", err);
        return response(500, { error: err.message });
    }
};
