const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

// All admin routes require ADMIN role
router.use(authenticate, authorize(['ADMIN']));

// GET /api/admin/analytics
router.get('/analytics', adminController.getAnalytics);

// GET /api/admin/users
router.get('/users', adminController.getAllUsers);

// POST /api/admin/users - Add staff
router.post('/users', adminController.addStaff);

// GET /api/admin/complaints
router.get('/complaints', adminController.getAllComplaints);

// POST /api/admin/complaints/:complaintId/assign - Assign a complaint
router.post('/complaints/:complaintId/assign', adminController.assignComplaint);

// GET /api/admin/live-activity
router.get('/live-activity', adminController.getLiveActivity);

// GET /api/admin/urgent-cases
router.get('/urgent-cases', adminController.getUrgentCases);

// GET /api/admin/officer-performance
router.get('/officer-performance', adminController.getOfficerPerformance);

module.exports = router;
