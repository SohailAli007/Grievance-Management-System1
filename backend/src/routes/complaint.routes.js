const express = require('express');
const router = express.Router();
const complaintController = require('../controllers/complaint.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

// POST /api/complaints - File a complaint (Citizen only)
router.post('/',
    authenticate,
    authorize(['CITIZEN']),
    complaintController.fileComplaint
);

// GET /api/complaints/my - Get user's complaints (Citizen only)
router.get('/my',
    authenticate,
    authorize(['CITIZEN']),
    complaintController.getMyComplaints
);

// PATCH /api/complaints/:id/status - Update status (Officer/Admin)
router.patch('/:id/status',
    authenticate,
    authorize(['OFFICER', 'ADMIN']),
    complaintController.updateComplaintStatus
);

// GET /api/complaints/track - Track a specific complaint
router.get('/track',
    complaintController.trackComplaint
);

module.exports = router;
