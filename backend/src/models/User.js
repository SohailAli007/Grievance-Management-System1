const mongoose = require('mongoose');

// Shared user schema fields
const userSchemaFields = {
    userId: { type: String, required: true, unique: true },
    name: { type: String, required: false },
    email: { type: String, required: true, unique: true },
    phone: String,
    password: { type: String, required: true },
    role: {
        type: String,
        enum: ["ADMIN", "OFFICER", "STAFF", "CITIZEN"],
        required: true
    },
    currentAddress: { type: String, default: null },
    permanentAddress: { type: String, default: null },
    categories: [String],
    departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', default: null },
    departmentName: String,
    teamName: String,
    lastLogin: Date,
    imageUrl: String,
    isNameChanged: { type: Boolean, default: false },
    phoneLastChanged: { type: Date, default: null },
    emailLastChanged: { type: Date, default: null },
    secondaryPhone: { type: String, default: null },
    secondaryEmail: { type: String, default: null },
    status: { type: String, enum: ["ACTIVE", "ON_LEAVE"], default: "ACTIVE" },
    managerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
    emailNotifications: { type: Boolean, default: true },
    smsNotifications: { type: Boolean, default: false }
};

// Master User model for Auth
const masterUserSchema = new mongoose.Schema(userSchemaFields, {
    timestamps: true,
    collection: 'users'
});

// Role-specific models
const citizenSchema = new mongoose.Schema(userSchemaFields, {
    timestamps: true,
    collection: 'citizens'
});

const officerSchema = new mongoose.Schema(userSchemaFields, {
    timestamps: true,
    collection: 'officers'
});

const adminSchema = new mongoose.Schema(userSchemaFields, {
    timestamps: true,
    collection: 'admins'
});

const User = mongoose.model('User', masterUserSchema);
const Citizen = mongoose.model('Citizen', citizenSchema);
const Officer = mongoose.model('Officer', officerSchema);
const Admin = mongoose.model('Admin', adminSchema);

module.exports = { User, Citizen, Officer, Admin };
