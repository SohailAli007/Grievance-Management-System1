const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
    complaintId: { type: mongoose.Schema.Types.ObjectId, ref: 'Complaint', required: true, unique: true },
    citizenId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: String,
    isPublic: { type: Boolean, default: true }
}, { timestamps: true, collection: 'feedbacks' });

module.exports = mongoose.model('Feedback', feedbackSchema);
