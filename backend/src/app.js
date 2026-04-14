const express = require('express');
const cors = require('cors');
const { errorHandler, notFound } = require('./middlewares/error.middleware');

// Import routes
const authRoutes = require('./routes/auth.routes');
const complaintRoutes = require('./routes/complaint.routes');
const adminRoutes = require('./routes/admin.routes');
const officerRoutes = require('./routes/officer.routes');

const { addClient, removeClient } = require('./utils/broadcast');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => res.json({ ok: true }));

// SSE Events
app.get('/api/events', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    addClient(res);
    res.write('event: connect\ndata: {"message": "connected"}\n\n');

    req.on('close', () => {
        removeClient(res);
    });
});

// API Routes
app.use('/api', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/complaints', officerRoutes);
app.use('/api/admin', adminRoutes);

// Departments and Categories (shared endpoints)
app.get('/api/departments', async (req, res, next) => {
    try {
        const { Department } = require('./models');
        const depts = await Department.find({ isDeleted: { $ne: true } });
        res.json(depts);
    } catch (err) {
        next(err);
    }
});

app.get('/api/categories', async (req, res, next) => {
    try {
        const { Category } = require('./models');
        const { departmentId } = req.query;
        const filter = { isDeleted: { $ne: true } };
        if (departmentId) filter.departmentId = departmentId;
        const cats = await Category.find(filter);
        res.json(cats);
    } catch (err) {
        next(err);
    }
});

// Error handling
app.use(notFound);
app.use(errorHandler);

module.exports = app;
