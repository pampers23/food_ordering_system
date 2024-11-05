const express = require('express');
const { getPaymentMethods } = require('../controllers/paymentController');
const router = express.Router();

// Routes
router.get('/', getPaymentMethods); // Get all payment methods

module.exports = router;