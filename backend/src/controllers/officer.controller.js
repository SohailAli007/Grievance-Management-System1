const { Complaint, Assignment, User, ComplaintLog, Notification } = require('../models');
const { broadcast } = require('../utils/broadcast');

// Get assigned complaints
const getAssignedComplaints = async (req, res, next) => {
    try {
        const userId = req.user.userId;

        const complaints = await Complaint.find({
            assignedOfficerId: userId,
            isDeleted: { $ne: true }
        }).sort({ updatedAt: -1 });

        const mapped = complaints.map(c => ({
            id: c.complaintId,
            title: c.title,
            description: c.description,
            status: c.status,
            category: c.categoryName,
            department: c.departmentName,
            createdAt: c.createdAt,
            location: c.locationText
        }));

        return res.status(200).json(mapped);
    } catch (err) {
        next(err);
    }
};

// Claim a complaint (self-assign)
const claimComplaint = async (req, res, next) => {
    try {
        const { complaintId } = req.params;
        const officerUserId = req.user.userId;

        // Fetch officer
        const officer = await User.findOne({ userId: officerUserId });
        if (!officer) return res.status(404).json({ error: "Officer record not found" });

        // Find complaint
        const complaint = await Complaint.findOne({
            $or: [
                { _id: complaintId.length === 24 ? complaintId : null },
                { complaintId }
            ]
        });
        if (!complaint) return res.status(404).json({ error: "Complaint not found" });

        if (complaint.status !== "PENDING" && complaint.assignedOfficerId) {
            return res.status(400).json({ error: "Complaint is already assigned or in progress" });
        }

        // Create Assignment
        await Assignment.create({
            complaintId: complaint._id,
            assignedTo: officer._id,
            assignedBy: officerUserId,
            teamName: officer.teamName || "N/A",
            role: officer.role
        });

        // Update Complaint
        complaint.status = "ASSIGNED";
        complaint.assignedOfficerId = officerUserId;
        complaint.assignedOfficerName = officer.name;
        await complaint.save();

        // Log
        await ComplaintLog.create({
            complaintId: complaint._id,
            status: "ASSIGNED",
            updatedBy: officerUserId,
            message: `Claimed by ${officer.name}`
        });

        // Notify Citizen
        if (complaint.userId) {
            const citizen = await User.findOne({ userId: complaint.userId });
            if (citizen) {
                await Notification.create({
                    userId: citizen._id,
                    title: "Complaint Assigned",
                    message: `Your complaint has been claimed by ${officer.name}.`,
                    complaintId: complaint._id
                });
            }
        }

        broadcast('complaint_claimed', { complaintId: complaint.complaintId, officerName: officer.name });

        return res.status(200).json({ message: "Claimed successfully", assignedTo: officer.name });
    } catch (err) {
        next(err);
    }
};

module.exports = { getAssignedComplaints, claimComplaint };
