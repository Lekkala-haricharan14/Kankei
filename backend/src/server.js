// Backend server with updated Enrollment schema
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');
const enrollmentRoutes = require('./routes/enrollment.routes');
const clientPoRoutes = require('./routes/clientPo.routes');
const trainerPoRoutes = require('./routes/trainerPo.routes');
const invoiceRoutes = require('./routes/invoice.routes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/client-pos', clientPoRoutes);
app.use('/api/trainer-pos', trainerPoRoutes);
app.use('/api/invoices', invoiceRoutes);

// Health Check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'GUVI Backend Running' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
