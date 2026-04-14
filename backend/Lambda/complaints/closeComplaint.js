import { Complaint } from "../../Shared/models.js";
import { response } from "../../Shared/response.js";
import { verify } from "../../Shared/jwt.js";

export const handler = async (event) => {
  try {
    const authHeader = event.headers?.Authorization || event.headers?.authorization;
    if (!authHeader) return response(401, { error: "Missing token" });

    const token = authHeader.replace("Bearer ", "");
    const decoded = verify(token);

    if (decoded.role !== "ADMIN") {
      return response(403, { error: "Not authorized. Administrative role required." });
    }

    const body = JSON.parse(event.body || "{}");
    const complaintId = event.pathParameters?.complaintId || body.complaintId;
    const { note } = body;

    if (!complaintId) return response(400, { error: "Missing complaintId" });

    const complaint = await Complaint.findOne({
      $or: [
        { _id: complaintId.length === 24 ? complaintId : null },
        { complaintId }
      ]
    });

    if (!complaint) return response(404, { error: "Complaint not found" });

    // Transition to CLOSED
    complaint.status = "CLOSED";

    complaint.progress = complaint.progress || [];
    complaint.progress.push({
      at: new Date(),
      status: "CLOSED",
      byRole: decoded.role,
      byUserId: decoded.userId,
      note: note || "Complaint marked as CLOSED by Admin"
    });

    await complaint.save();

    return response(200, {
      message: "Complaint closed successfully",
      complaintId: complaint.complaintId
    });
  } catch (err) {
    console.error("Close Error:", err);
    return response(500, { error: err.message });
  }
};
