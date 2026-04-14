import { Complaint } from "../../Shared/models.js";
import { response } from "../../Shared/response.js";
import { verify } from "../../Shared/jwt.js";

export const handler = async (event) => {
  try {
    const authHeader = event.headers?.Authorization || event.headers?.authorization;
    if (!authHeader) return response(401, { error: "Missing token" });

    const token = authHeader.replace("Bearer ", "");
    const decoded = verify(token);

    if (!["ADMIN", "ADMIN_OFFICER"].includes(decoded.role)) {
      return response(403, { error: "Access denied" });
    }

    const { department, status, startDate, endDate } = event.queryStringParameters || {};

    let query = { isDeleted: { $ne: true } };

    if (department && department !== "All") {
      query.departmentName = department;
    }

    if (status && status !== "All") {
      query.status = status.toUpperCase();
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const complaints = await Complaint.find(query).sort({ createdAt: -1 });

    const items = complaints.map((c) => ({
      id: c.complaintId,
      title: c.title,
      citizen: c.citizenName || c.citizenEmail || c.userId,
      status: c.status,
      category: c.categoryName,
      assignedTo: c.assignedOfficerName || "Not Assigned",
      createdAt: c.createdAt
    }));

    return response(200, items);
  } catch (err) {
    console.error("GetAllComplaints Error:", err);
    return response(500, { error: err.message });
  }
};
