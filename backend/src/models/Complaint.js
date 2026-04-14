const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    citizenId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    userId: { type: String, required: true },
    departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    departmentName: String,
    categoryName: String,
    citizenEmail: String,
    citizenName: String,
    locationText: String,
    latitude: Number,
    longitude: Number,
    status: {
        type: String,
        enum: ["PENDING", "ASSIGNED", "IN_PROGRESS", "RESOLVED", "CLOSED", "REJECTED"],
        default: "PENDING"
    },
    priority: {
        type: String,
        enum: ["LOW", "MEDIUM", "HIGH"],
        default: "LOW"
    },
    imageUrl: String,
    assignedOfficerId: String,
    assignedOfficerName: String,
    closedAt: Date,
    complaintId: { type: String, unique: true },
    isDeleted: { type: Boolean, default: false }
}, { timestamps: true, collection: 'complaints' });

// Indexes
complaintSchema.index({ citizenId: 1, title: 1, createdAt: -1 });
complaintSchema.index({ status: 1, departmentId: 1, createdAt: -1 });
complaintSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Complaint', complaintSchema);
