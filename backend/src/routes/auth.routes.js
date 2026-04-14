const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

// POST /api/register
router.post('/register', authController.register);

// POST /api/login
router.post('/login', authController.login);

module.exports = router;
