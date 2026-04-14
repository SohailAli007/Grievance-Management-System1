const { Complaint, Category, Department } = require('../models');

const { broadcast } = require('../utils/broadcast');

// File a new complaint
const fileComplaint = async (req, res, next) => {
    try {
        const { title, description, category, priority = "MEDIUM", image, location } = req.body;
        const userId = req.user.userId;

        if (!title || !description || !category) {
            return res.status(400).json({ error: "Required fields: title, description, category" });
        }

        // Duplicate prevention
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        const existing = await Complaint.findOne({
            userId,
            title,
            createdAt: { $gt: oneHourAgo },
            isDeleted: { $ne: true }
        });

        if (existing) {
            return res.status(400).json({ error: "A similar complaint was recently filed. Please wait 1 hour." });
        }

        // Find category and department
        const cat = await Category.findOne({ name: category });
        if (!cat) {
            return res.status(400).json({ error: `Category '${category}' not found` });
        }

        const dept = await Department.findById(cat.departmentId);
        if (!dept) {
            return res.status(400).json({ error: "Department not found for this category" });
        }

        const complaintId = `CMP-${Date.now()}`;
        const complaintData = {
            complaintId,
            userId,
            title,
            description,
            categoryId: cat._id,
            categoryName: cat.name,
            departmentId: dept._id,
            departmentName: dept.name,
            priority: cat.priority || priority,
            status: "PENDING",
            imageUrl: image || null,
            locationText: location || null
        };

        const newComplaint = await Complaint.create(complaintData);

        // Broadcast event
        broadcast('complaint_created', newComplaint);

        return res.status(201).json({
            message: "Complaint filed successfully",
            complaintId: newComplaint.complaintId
        });
    } catch (err) {
        next(err);
    }
};

// Get user's complaints
const getMyComplaints = async (req, res, next) => {
    try {
        const userId = req.user.userId;

        const complaints = await Complaint.find({
            userId,
            isDeleted: { $ne: true }
        }).sort({ updatedAt: -1 });

        const mapped = complaints.map(c => ({
            id: c.complaintId,
            complaintId: c.complaintId,
            title: c.title,
            description: c.description,
            status: String(c.status).toLowerCase(),
            department: c.departmentName || 'General',
            category: c.categoryName,
            assignedOfficerName: c.assignedOfficerName,
            updatedAt: c.updatedAt,
            createdAt: c.createdAt,
            location: c.locationText,
            imageUrl: c.imageUrl
        }));

        return res.status(200).json(mapped);
    } catch (err) {
        next(err);
    }
};

// Track a specific complaint
const trackComplaint = async (req, res, next) => {
    try {
        const { complaintId } = req.query;
        if (!complaintId) {
            return res.status(400).json({ error: "Missing complaintId" });
        }

        const complaint = await Complaint.findOne({ complaintId });
        if (!complaint) {
            return res.status(404).json({ error: "Complaint not found" });
        }

        return res.status(200).json(complaint);
    } catch (err) {
        next(err);
    }
};

// Update complaint status
const updateComplaintStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const complaint = await Complaint.findOne({ complaintId: id });
        if (!complaint) {
            return res.status(404).json({ error: "Complaint not found" });
        }

        const oldStatus = complaint.status;
        complaint.status = status;
        complaint.updatedAt = new Date();
        await complaint.save();

        // Broadcast update
        broadcast('complaint_updated', { complaintId: id, status, oldStatus });

        return res.status(200).json({ message: "Status updated", complaint });
    } catch (err) {
        next(err);
    }
};

module.exports = { fileComplaint, getMyComplaints, trackComplaint, updateComplaintStatus };

