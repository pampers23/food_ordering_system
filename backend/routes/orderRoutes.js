const express = require('express');
const { createOrder, updateOrderStatus, getAllOrders, getCustomerOrders, deleteOrder } = require('../controllers/orderController');
const authMiddleware = require('../middleware/authMiddleware'); // Make sure this path is correct
const router = express.Router();

// Routes
router.post('/', authMiddleware, createOrder); // Customer places an order
router.put('/:order_id/status', authMiddleware, updateOrderStatus); // Admin updates order status (admin can be checked within the middleware)
router.get('/', authMiddleware, getAllOrders); // Admin gets all orders
router.get('/customer/:customer_id', authMiddleware, getCustomerOrders); // Customer gets their orders
router.delete('/:order_id', authMiddleware, deleteOrder); // Customer deletes their order

module.exports = router;
