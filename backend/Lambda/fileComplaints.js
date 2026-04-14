import { response } from "../Shared/response.js";
import { verify } from "../Shared/jwt.js";
import { User, Category, Department, Complaint } from "../Shared/models.js";
import mongoose from "mongoose";

export const handler = async (event) => {
  try {
    const authHeader = event.headers?.Authorization || event.headers?.authorization;
    if (!authHeader) return response(401, { error: "Missing token" });

    const token = authHeader.replace("Bearer ", "");
    const decoded = verify(token);

    const body = JSON.parse(event.body);
    const { title, description, category, priority = "MEDIUM", image, location } = body;

    console.log("[FileComplaint] Incoming Payload:", { title, category, userId: decoded.userId });

    if (!title || !description || !category) {
      const missing = [];
      if (!title) missing.push("title");
      if (!description) missing.push("description");
      if (!category) missing.push("category");
      console.log("[FileComplaint] Missing fields:", missing);
      return response(400, { error: `Required fields missing: ${missing.join(", ")}` });
    }

    // --- DATA INTEGRITY: Duplicate Prevention ---
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const existing = await Complaint.findOne({
      userId: decoded.userId,
      title: title,
      createdAt: { $gt: oneHourAgo },
      isDeleted: { $ne: true }
    });

    if (existing) {
      console.log("[FileComplaint] Duplicate found for user:", decoded.userId);
      return response(400, { error: "A similar complaint was recently filed. Please wait 1 hour." });
    }

    // Lookup Category
    const categoryDoc = await Category.findOne({ name: category });
    if (!categoryDoc) {
      console.log("[FileComplaint] Category not found in DB:", category);
      return response(400, { error: `Invalid category: ${category}. Please refresh and try again.` });
    }

    const departmentDoc = await Department.findById(categoryDoc.departmentId);
    if (!departmentDoc) {
      console.log("[FileComplaint] Department not found for category:", category);
      return response(500, { error: "Department not found for this category" });
    }

    const citizenDoc = await User.findOne({ userId: decoded.userId });
    if (!citizenDoc) {
      console.log("[FileComplaint] User not found in master User table:", decoded.userId);
      return response(400, { error: "Logged in user record not found. Please re-login." });
    }

    // Auto-Assignment Logic
    const potentialOfficers = await User.find({
      departmentId: departmentDoc._id,
      role: "OFFICER",
      isActive: true
    });


    let assignedOfficer = null;
    if (potentialOfficers.length > 0) {
      assignedOfficer = potentialOfficers[Math.floor(Math.random() * potentialOfficers.length)];
    }

    const complaintId = `COMP-${Date.now()}`;

    const newComplaint = await Complaint.create({
      complaintId,
      citizenId: citizenDoc?._id,
      userId: decoded.userId,
      citizenEmail: decoded.email,
      citizenName: decoded.name,
      title,
      description,
      departmentId: departmentDoc._id,
      categoryId: categoryDoc._id,
      departmentName: departmentDoc.name,
      categoryName: categoryDoc.name,
      locationText: location || null,
      imageUrl: image || null,
      priority: String(priority).toUpperCase(),
      status: assignedOfficer ? "ASSIGNED" : "PENDING",
      assignedOfficerId: assignedOfficer?.userId || null,
      assignedOfficerName: assignedOfficer?.name || null,
      assignedOfficerEmail: assignedOfficer?.email || null,
      statusHistory: [
        { status: "PENDING", changedAt: new Date() },
        ...(assignedOfficer ? [{ status: "ASSIGNED", changedAt: new Date(), note: `Auto-assigned to ${assignedOfficer.name}` }] : [])
      ]
    });

    return response(200, {
      message: "Complaint filed successfully",
      complaintId: newComplaint.complaintId,
      status: newComplaint.status,
      assignedTo: assignedOfficer?.name || "Pending Assignment"
    });

  } catch (err) {
    console.error("File Complaint Error:", err);
    return response(500, { error: err.message });
  }
};
