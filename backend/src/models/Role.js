const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    level: { type: Number, required: true },
    description: String,
    isActive: { type: Boolean, default: true }
}, { timestamps: true, collection: 'roles' });

module.exports = mongoose.model('Role', roleSchema);
