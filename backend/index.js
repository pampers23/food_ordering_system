const express = require('express');
const cors = require('cors');
const app = express();
const pool = require("./config/db");
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const customerRoutes = require('./routes/customerRoutes');
const foodRoutes = require('./routes/foodRoutes');
const orderRoutes = require('./routes/orderRoutes'); // Import order routes
const paymentRoutes = require('./routes/paymentRoutes'); // Import payment routes

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/customer', customerRoutes);
app.use('/api/food', foodRoutes);
app.use('/api/orders', orderRoutes); // Use order routes
app.use('/api/payment-methods', paymentRoutes); // Use payment methods routes

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
