
import mongoose from "mongoose";
// Updated: 2026-02-16 (Compiled from src/models/)
// Source of truth: src/models/
// This file is for Lambda functions only


// --- DEPARTMENT SCHEMA ---
const departmentSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    description: String,
    adminOfficerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Head of Dept/Admin Officer
    slaHours: { type: Number, default: 24 }, // Resolution timeframe
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false }
}, { timestamps: true, collection: 'departments' });

export const Department = mongoose.model("Department", departmentSchema);

// --- TEAM SCHEMA ---
const teamSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true }, // e.g., "Team A"
    description: String,
    leaderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Field Officer
    departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
    isActive: { type: Boolean, default: true }
}, { timestamps: true, collection: 'teams' });

export const Team = mongoose.model("Team", teamSchema);

// --- CATEGORY SCHEMA ---
const categorySchema = new mongoose.Schema({
    name: { type: String, required: true },
    departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
    priority: { type: String, enum: ["LOW", "MEDIUM", "HIGH"], default: "LOW" },
    isActive: { type: Boolean, default: true }
}, { timestamps: true, collection: 'categories' });

categorySchema.index({ name: 1, departmentId: 1 }, { unique: true });

export const Category = mongoose.model("Category", categorySchema);

// --- SHARED USER SCHEMA FIELDS ---
const userSchemaFields = {
    userId: { type: String, required: true, unique: true },
    name: { type: String, required: false }, // Use false to avoid update validation issues
    email: { type: String, required: true, unique: true },
    phone: String,
    password: { type: String, required: true },
    role: {
        type: String,
        enum: ["ADMIN", "OFFICER", "CITIZEN"],
        required: true
    },

    currentAddress: { type: String, default: null },
    permanentAddress: { type: String, default: null },
    categories: [String],
    departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', default: null },
    departmentName: String,
    teamName: String, // e.g., "Team A"
    lastLogin: Date,
    imageUrl: String,
    isNameChanged: { type: Boolean, default: false },

    // 45-Day Change Restriction Fields
    phoneLastChanged: { type: Date, default: null },
    emailLastChanged: { type: Date, default: null },

    // Optional Secondary Contact Fields
    secondaryPhone: { type: String, default: null },
    secondaryEmail: { type: String, default: null },

    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },

    // Notification Preferences
    emailNotifications: { type: Boolean, default: true },
    smsNotifications: { type: Boolean, default: false }
};

const citizenSchema = new mongoose.Schema(userSchemaFields, { timestamps: true, collection: 'citizens' });
const officerSchema = new mongoose.Schema(userSchemaFields, { timestamps: true, collection: 'officers' });
const adminSchema = new mongoose.Schema(userSchemaFields, { timestamps: true, collection: 'admins' });

export const Citizen = mongoose.model("Citizen", citizenSchema);
export const Officer = mongoose.model("Officer", officerSchema);
export const Admin = mongoose.model("Admin", adminSchema);

// Master User model for Auth
const masterUserSchema = new mongoose.Schema(userSchemaFields, { timestamps: true, collection: 'users' });

export const User = mongoose.model("User", masterUserSchema);

// --- COMPLAINT SCHEMA ---
const complaintSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    citizenId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    userId: { type: String, required: true },
    departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    departmentName: String,
    categoryName: String,
    citizenEmail: String,
    citizenName: String,
    locationText: String,
    latitude: Number,
    longitude: Number,
    status: {
        type: String,
        enum: ["PENDING", "ASSIGNED", "IN_PROGRESS", "RESOLVED", "CLOSED", "REJECTED"],
        default: "PENDING"
    },
    priority: {
        type: String,
        enum: ["LOW", "MEDIUM", "HIGH"],
        default: "LOW"
    },
    imageUrl: String,
    assignedOfficerId: String,
    assignedOfficerName: String,
    closedAt: Date,
    complaintId: { type: String, unique: true },
    isDeleted: { type: Boolean, default: false }
}, { timestamps: true, collection: 'complaints' });

export const Complaint = mongoose.model("Complaint", complaintSchema);

// --- ROLE SCHEMA ---
const roleSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    level: { type: Number, required: true }, // 1 (Highest) to 6 (Lowest)
    description: String,
    isActive: { type: Boolean, default: true }
}, { timestamps: true, collection: 'roles' });

export const Role = mongoose.model("Role", roleSchema);

// --- NOTIFICATION SCHEMA ---
const notificationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    complaintId: { type: mongoose.Schema.Types.ObjectId, ref: 'Complaint' },
    read: { type: Boolean, default: false }
}, { timestamps: true, collection: 'notifications' });

export const Notification = mongoose.model("Notification", notificationSchema);

// --- ASSIGNMENT SCHEMA ---
const assignmentSchema = new mongoose.Schema({
    complaintId: { type: mongoose.Schema.Types.ObjectId, ref: 'Complaint', required: true },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    assignedBy: { type: String, default: 'SYSTEM' }, // userId OR "SYSTEM"
    teamName: String, // If a specific team is assigned under supervision (e.g., Team C)
    role: {
        type: String,
        enum: ["ADMIN_OFFICER", "FIELD_OFFICER", "WORKER", "STAFF"],
        required: true
    },
    assignedAt: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true }
}, { timestamps: true, collection: 'assignments' });

export const Assignment = mongoose.model("Assignment", assignmentSchema);

// --- COMPLAINT LOG SCHEMA ---
const complaintLogSchema = new mongoose.Schema({
    complaintId: { type: mongoose.Schema.Types.ObjectId, ref: 'Complaint', required: true },
    status: {
        type: String,
        enum: ["PENDING", "ASSIGNED", "IN_PROGRESS", "RESOLVED", "CLOSED", "REJECTED"],
        required: true
    },
    updatedBy: { type: String, required: true }, // Stores the user ID
    message: String,
    photoUrl: String
}, { timestamps: true, collection: 'complaintLogs' });

export const ComplaintLog = mongoose.model("ComplaintLog", complaintLogSchema);

// --- FEEDBACK SCHEMA ---
const feedbackSchema = new mongoose.Schema({
    complaintId: { type: mongoose.Schema.Types.ObjectId, ref: 'Complaint', required: true, unique: true },
    citizenId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: String,
    isPublic: { type: Boolean, default: true }
}, { timestamps: true, collection: 'feedbacks' });

export const Feedback = mongoose.model("Feedback", feedbackSchema);

// --- VERIFICATION SCHEMA ---
const verificationSchema = new mongoose.Schema({
    target: { type: String, required: true }, // Email or Phone
    code: { type: String, required: true },
    type: { type: String, enum: ["OTP_LOGIN", "EMAIL_VERIFY", "PASSWORD_RESET"], required: true },
    expiresAt: { type: Date, required: true },
    isUsed: { type: Boolean, default: false }
}, { timestamps: true, collection: 'verifications' });

verificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // Auto-delete expired OTPs

export const Verification = mongoose.model("Verification", verificationSchema);

// --- SYSTEM AUDIT SCHEMA ---
const systemAuditSchema = new mongoose.Schema({
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, required: true }, // e.g., "ROLE_CHANGE", "DEPT_DELETE"
    targetModel: String,
    targetId: mongoose.Schema.Types.ObjectId,
    details: mongoose.Schema.Types.Mixed,
    ipAddress: String
}, { timestamps: true, collection: 'systemAudits' });

export const SystemAudit = mongoose.model("SystemAudit", systemAuditSchema);

// --- INDEXES ---
// Unique & Performance
complaintSchema.index({ citizenId: 1, title: 1, createdAt: -1 }); // For duplicate prevention check
complaintSchema.index({ status: 1, departmentId: 1, createdAt: -1 }); // Compound index
complaintSchema.index({ title: 'text', description: 'text' }); // Text index for search
