const mongoose = require('mongoose');

const verificationSchema = new mongoose.Schema({
    target: { type: String, required: true },
    code: { type: String, required: true },
    type: { type: String, enum: ["OTP_LOGIN", "EMAIL_VERIFY", "PASSWORD_RESET"], required: true },
    expiresAt: { type: Date, required: true },
    isUsed: { type: Boolean, default: false }
}, { timestamps: true, collection: 'verifications' });

verificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Verification', verificationSchema);
