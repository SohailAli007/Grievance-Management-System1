import { response } from "../../Shared/response.js";
import { verify } from "../../Shared/jwt.js";
import { Complaint } from "../../Shared/models.js";

export const handler = async (event) => {
  try {
    const authHeader = event.headers?.Authorization || event.headers?.authorization;
    if (!authHeader) return response(401, { error: "Missing token" });

    const token = authHeader.replace("Bearer ", "");
    const decoded = verify(token);

    // Fetch complaints from MongoDB
    const complaints = await Complaint.find({
      userId: decoded.userId,
      isDeleted: { $ne: true }
    }).sort({ updatedAt: -1 });

    // Map to the format the frontend expects
    const mapped = complaints.map(c => ({
      id: c.complaintId,
      complaintId: c.complaintId,
      title: c.title,
      description: c.description,
      status: String(c.status).toLowerCase(), // Frontend expects lowercase for styles
      department: c.departmentName || 'General',
      category: c.categoryName,
      assignedOfficerName: c.assignedOfficerName,
      updatedAt: c.updatedAt,
      createdAt: c.createdAt,
      location: c.locationText,
      imageUrl: c.imageUrl
    }));

    return response(200, mapped);
  } catch (err) {
    console.error("Get My Complaints Error:", err);
    return response(500, { error: err.message });
  }
};
