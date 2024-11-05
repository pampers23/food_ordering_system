const pool = require('../config/db'); // Assuming you have a db.js to manage your database connection

// Get All Payment Methods
const getPaymentMethods = async (req, res) => {
    try {
        const paymentMethods = await pool.query('SELECT * FROM payment_methods');
        res.json(paymentMethods.rows);
    } catch (err) {
        console.error("Error in getPaymentMethods:", err.message);
        res.status(500).json({ error: 'Server error' });
    }
};

module.exports = {
    getPaymentMethods,
};