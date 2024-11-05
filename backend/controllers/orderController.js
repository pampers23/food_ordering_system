const pool = require('../config/db');

// Create Order
const createOrder = async (req, res) => {
    const { customer_id, items, payment_method_id } = req.body;

    try {
        // Check if payment method exists
        const paymentMethod = await pool.query(
            'SELECT * FROM payment_methods WHERE method_id = $1',
            [payment_method_id]
        );

        if (paymentMethod.rows.length === 0) {
            return res.status(400).json({ error: 'Invalid payment method' });
        }

        // Create a new order
        const newOrder = await pool.query(
            'INSERT INTO orders (customer_id, order_date, status, total_amount) VALUES ($1, $2, $3, $4) RETURNING *',
            [customer_id, new Date(), 'Pending', calculateTotalAmount(items)]
        );

        const orderId = newOrder.rows[0].order_id;

        // Insert order items
        for (const item of items) {
            await pool.query(
                'INSERT INTO order_items (order_id, food_id, quantity, price) VALUES ($1, $2, $3, $4)',
                [orderId, item.food_id, item.quantity, item.price]
            );
        }

        // Create payment record
        await pool.query(
            'INSERT INTO payments (order_id, method_id, payment_status) VALUES ($1, $2, $3)',
            [orderId, payment_method_id, 'Successful']
        );

        res.json({ message: 'Order placed successfully', payment_status: 'Payment method: ' + paymentMethod.rows[0].method_name, order_id: orderId });
    } catch (err) {
        console.error("Error in createOrder:", err.message);
        res.status(500).json({ error: 'Server error' });
    }
};

// Helper function to calculate total amount
const calculateTotalAmount = (items) => {
    return items.reduce((total, item) => total + item.price * item.quantity, 0);
};



// Update Order Status
const updateOrderStatus = async (req, res) => {
    const { order_id } = req.params;
    const { status } = req.body;
    try {
        const updatedOrder = await pool.query(
            'UPDATE orders SET status = $1 WHERE order_id = $2 RETURNING *',
            [status, order_id]
        );
        if (updatedOrder.rows.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }
        res.json({ message: 'Order status updated', order: updatedOrder.rows[0] });
    } catch (err) {
        console.error("Error in updateOrderStatus:", err.message);
        res.status(500).json({ error: 'Server error' });
    }
};

// Get All Orders
const getAllOrders = async (req, res) => {
    try {
        const orders = await pool.query('SELECT * FROM orders');
        res.json(orders.rows);
    } catch (err) {
        console.error("Error in getAllOrders:", err.message);
        res.status(500).json({ error: 'Server error' });
    }
};

// Get Orders for a Customer
const getCustomerOrders = async (req, res) => {
    const { customer_id } = req.params;
    try {
        const orders = await pool.query(
            'SELECT * FROM orders WHERE customer_id = $1',
            [customer_id]
        );
        res.json(orders.rows);
    } catch (err) {
        console.error("Error in getCustomerOrders:", err.message);
        res.status(500).json({ error: 'Server error' });
    }
};

const deleteOrder = async (req, res) => {
    const { order_id } = req.params; // Get the order_id from the URL
    const customer_id = req.customer_id; // Get the customer_id from the request object

    if (!customer_id) {
        return res.status(401).json({ error: 'Unauthorized: No customer information' });
    }

    try {
        // Check if the order belongs to the customer before deleting
        const orderCheck = await pool.query(
            'SELECT * FROM orders WHERE order_id = $1 AND customer_id = $2',
            [order_id, customer_id]
        );

        if (orderCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Order not found or does not belong to this customer' });
        }

        const deletedOrder = await pool.query(
            'DELETE FROM orders WHERE order_id = $1 RETURNING *',
            [order_id]
        );

        res.json({ message: 'Order deleted successfully', order: deletedOrder.rows[0] });
    } catch (err) {
        console.error("Error in deleteOrder:", err.message);
        res.status(500).json({ error: 'Server error' });
    }
};


module.exports = { createOrder, updateOrderStatus, getAllOrders, getCustomerOrders, deleteOrder };
