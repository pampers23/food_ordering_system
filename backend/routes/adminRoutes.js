const express = require('express');
const { adminSignup, adminLogin, getAllCustomers } = require('../controllers/adminController');
const router = express.Router();

// Admin Sign-Up Route
router.post('/signup', adminSignup);

// Admin Login Route
router.post('/login', adminLogin);

// Route to get all customers
router.get('/customers', getAllCustomers);

module.exports = router;
