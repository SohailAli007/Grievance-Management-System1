const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: { type: String, required: true },
    departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
    priority: { type: String, enum: ["LOW", "MEDIUM", "HIGH"], default: "LOW" },
    isActive: { type: Boolean, default: true }
}, { timestamps: true, collection: 'categories' });

categorySchema.index({ name: 1, departmentId: 1 }, { unique: true });

module.exports = mongoose.model('Category', categorySchema);
