const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    description: String,
    leaderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
    isActive: { type: Boolean, default: true }
}, { timestamps: true, collection: 'teams' });

module.exports = mongoose.model('Team', teamSchema);
