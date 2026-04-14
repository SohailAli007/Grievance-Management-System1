const express = require('express');
const router = express.Router();
const officerController = require('../controllers/officer.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

// GET /api/complaints/assigned - Get officer's assigned complaints
router.get('/assigned',
    authenticate,
    authorize(['OFFICER']),
    officerController.getAssignedComplaints
);

// POST /api/complaints/:complaintId/claim - Claim a complaint
router.post('/:complaintId/claim',
    authenticate,
    authorize(['OFFICER', 'ADMIN']),
    officerController.claimComplaint
);

module.exports = router;
