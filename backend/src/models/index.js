/**
 * MODEL INDEX
 * Central export point for all models in MVC architecture
 */

const Department = require('./Department');
const Team = require('./Team');
const Category = require('./Category');
const { User, Citizen, Officer, Admin } = require('./User');
const Complaint = require('./Complaint');
const Notification = require('./Notification');
const Feedback = require('./Feedback');
const Assignment = require('./Assignment');
const ComplaintLog = require('./ComplaintLog');
const Role = require('./Role');
const Verification = require('./Verification');
const SystemAudit = require('./SystemAudit');

module.exports = {
    Department,
    Team,
    Category,
    User,
    Citizen,
    Officer,
    Admin,
    Complaint,
    Notification,
    Feedback,
    Assignment,
    ComplaintLog,
    Role,
    Verification,
    SystemAudit
};
