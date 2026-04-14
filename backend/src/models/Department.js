const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    description: String,
    adminOfficerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    slaHours: { type: Number, default: 24 },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false }
}, { timestamps: true, collection: 'departments' });

module.exports = mongoose.model('Department', departmentSchema);
