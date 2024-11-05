const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Admin Sign-Up Function
const adminSignup = async (req, res) => {
    try {
        const { username, password, email } = req.body;

        // Check if all required fields are present
        if (!username || !password || !email) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Check if admin already exists
        const existingAdmin = await pool.query(
            'SELECT * FROM admins WHERE email = $1',
            [email]
        );
        if (existingAdmin.rows.length > 0) {
            return res.status(400).json({ error: 'Admin already exists' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert new admin into database
        const newAdmin = await pool.query(
            'INSERT INTO admins (username, password, email) VALUES ($1, $2, $3) RETURNING *',
            [username, hashedPassword, email]
        );

        res.status(201).json({ message: 'Admin registered successfully', admin: newAdmin.rows[0] });
    } catch (err) {
        console.error("Error in adminSignup:", err.message);
        res.status(500).json({ error: 'Server error' });
    }
};

// Admin Login Function
const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if admin exists
        const admin = await pool.query(
            'SELECT * FROM admins WHERE email = $1',
            [email]
        );

        if (admin.rows.length === 0) {
            return res.status(400).json({ error: 'Admin not found' });
        }

        // Verify password
        const validPassword = await bcrypt.compare(password, admin.rows[0].password);
        if (!validPassword) {
            return res.status(400).json({ error: 'Invalid password' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { admin_id: admin.rows[0].admin_id },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({ message: 'Login successful', token });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
};

// Get all customers (example function)
const getAllCustomers = async (req, res) => {
    try {
        const customers = await pool.query('SELECT * FROM customers');
        res.json(customers.rows);
    } catch (err) {
        console.error("Error in getAllCustomers:", err.message);
        res.status(500).json({ error: 'Server error' });
    }
};

module.exports = { adminSignup, adminLogin, getAllCustomers };
