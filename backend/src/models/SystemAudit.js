const mongoose = require('mongoose');

const systemAuditSchema = new mongoose.Schema({
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, required: true },
    targetModel: String,
    targetId: mongoose.Schema.Types.ObjectId,
    details: mongoose.Schema.Types.Mixed,
    ipAddress: String
}, { timestamps: true, collection: 'systemAudits' });

module.exports = mongoose.model('SystemAudit', systemAuditSchema);
