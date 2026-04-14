const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
    complaintId: { type: mongoose.Schema.Types.ObjectId, ref: 'Complaint', required: true },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    assignedBy: { type: String, default: 'SYSTEM' },
    teamName: String,
    role: {
        type: String,
        enum: ["ADMIN_OFFICER", "FIELD_OFFICER", "WORKER", "STAFF"],
        required: true
    },
    assignedAt: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true }
}, { timestamps: true, collection: 'assignments' });

module.exports = mongoose.model('Assignment', assignmentSchema);
