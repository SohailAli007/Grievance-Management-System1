const mongoose = require('mongoose');

const complaintLogSchema = new mongoose.Schema({
    complaintId: { type: mongoose.Schema.Types.ObjectId, ref: 'Complaint', required: true },
    status: {
        type: String,
        enum: ["PENDING", "ASSIGNED", "IN_PROGRESS", "RESOLVED", "CLOSED", "REJECTED"],
        required: true
    },
    updatedBy: { type: String, required: true },
    message: String,
    photoUrl: String
}, { timestamps: true, collection: 'complaintLogs' });

module.exports = mongoose.model('ComplaintLog', complaintLogSchema);
