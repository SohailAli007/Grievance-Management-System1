require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/config/db');

const PORT = process.env.PORT || 5001;

// Connect to MongoDB
connectDB();

// Start server
app.listen(PORT, () => {
    console.log(`🚀 MVC Server running on port ${PORT}`);
    console.log(`📍 API available at http://localhost:${PORT}/api`);
});
