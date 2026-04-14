import { Complaint, User } from "../../Shared/models.js";
import { response } from "../../Shared/response.js";
import { verify } from "../../Shared/jwt.js";

export const handler = async (event) => {
  try {
    const authHeader = event.headers?.Authorization || event.headers?.authorization;
    if (!authHeader) return response(401, { error: "Missing token" });

    const token = authHeader.replace("Bearer ", "");
    const decoded = verify(token);

    // Roles authorized to see assigned/available tasks
    if (!["ADMIN", "OFFICER"].includes(decoded.role)) {
      return response(403, { error: "Not authorized" });
    }

    let query = { isDeleted: { $ne: true } };

    if (decoded.role !== "ADMIN") {
      // Find officer to get their department
      const officer = await User.findOne({ userId: decoded.userId });
      const departmentName = officer?.departmentName;

      // Filter complaints by department - officers see only their department complaints
      if (departmentName) {
        query.departmentName = departmentName;
      }
    }

    const complaints = await Complaint.find(query).sort({ createdAt: -1 });

    const mapped = complaints.map((c) => ({
      id: c.complaintId,
      title: c.title,
      citizen: c.citizenName || c.citizenEmail || c.userId,
      status: c.status,
      lastUpdated: c.updatedAt || c.createdAt,
      category: c.categoryName,
      assignedOfficerName: c.assignedOfficerName,
    }));

    return response(200, mapped);
  } catch (err) {
    console.error("Get Assigned Complaints Error:", err);
    return response(500, { error: err.message });
  }
};
