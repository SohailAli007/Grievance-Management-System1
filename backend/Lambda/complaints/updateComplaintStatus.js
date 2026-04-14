import { Complaint } from "../../Shared/models.js";
import { response } from "../../Shared/response.js";
import { verify } from "../../Shared/jwt.js";

const isAllowedStatus = (status) =>
  ["PENDING", "ASSIGNED", "IN_PROGRESS", "RESOLVED", "REJECTED", "CLOSED"].includes(status);

export const handler = async (event) => {
  try {
    const authHeader = event.headers?.Authorization || event.headers?.authorization;
    if (!authHeader) return response(401, { error: "Missing token" });

    const token = authHeader.replace("Bearer ", "");
    const decoded = verify(token);

    const body = JSON.parse(event.body || "{}");
    const complaintId = event.pathParameters?.complaintId || body.complaintId;
    const note = body.note || body.comments;
    const status = (body.status || "").toUpperCase();

    if (!complaintId) return response(400, { error: "Missing complaintId" });
    if (!status || !isAllowedStatus(status)) {
      return response(400, { error: "Invalid status" });
    }

    const complaint = await Complaint.findOne({ complaintId });
    if (!complaint) return response(404, { error: "Complaint not found" });

    const isAdmin = decoded.role === "ADMIN";
    const isOfficer = ["ADMIN_OFFICER", "FIELD_OFFICER"].includes(decoded.role);

    if (!isAdmin && !isOfficer) {
      return response(403, { error: "Not authorized to update status" });
    }

    // Authorization check for officers
    if (isOfficer) {
      // Check if complaint is assigned to them
      const isAssignedToMe = complaint.assignedOfficerId === decoded.userId;
      // Also allow if it's unassigned but in their department categories
      // But usually, status update is for assigned tasks.
      if (!isAssignedToMe && complaint.status !== "PENDING" && !isAdmin) {
        return response(403, { error: "You can only update complaints assigned to you" });
      }
    }

    // Update fields
    complaint.status = status;

    // Maintain progress log
    complaint.progress = complaint.progress || [];
    complaint.progress.push({
      at: new Date(),
      status: status,
      byRole: decoded.role,
      byUserId: decoded.userId,
      note: note || `Status updated to ${status}`
    });

    if (status === "RESOLVED") {
      complaint.isResolved = true;
      complaint.resolutionNote = note || "Resolved";
    }

    await complaint.save();

    return response(200, {
      message: "Status updated",
      complaintId: complaint.complaintId,
      status
    });

  } catch (err) {
    console.error("UpdateStatus Error:", err);
    return response(500, { error: err.message });
  }
};
