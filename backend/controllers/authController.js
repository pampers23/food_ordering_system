const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Admin Sign-Up Function
const adminSignup = async (req, res) => {
    try {
        const { username, password, email } = req.body;

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
        console.error(err.message);
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
        console.error("Error in adminLogin:", err);
        res.status(500).json({ error: 'Server error', details: err.message });
    }
};

// Admin Update Profile
const updateAdminProfile = async (req, res) => {
    try {
        const { admin_id } = req.body; // Assuming you pass admin_id in the request body
        const { email, password } = req.body;
        let profile_image = req.file ? req.file.path : null; // Get the uploaded file path

        // Check if admin exists
        const admin = await pool.query(
            'SELECT * FROM admins WHERE admin_id = $1',
            [admin_id]
        );

        if (admin.rows.length === 0) {
            return res.status(404).json({ error: 'Admin not found' });
        }

        // Prepare updates
        const updates = [];
        const values = [];

        if (email) {
            updates.push(`email = $${updates.length + 1}`);
            values.push(email);
        }

        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            updates.push(`password = $${updates.length + 1}`);
            values.push(hashedPassword);
        }

        if (profile_image) {
            updates.push(`profile_image = $${updates.length + 1}`);
            values.push(profile_image);
        }

        // Only update if there are changes
        if (updates.length > 0) {
            const query = `
                UPDATE admins
                SET ${updates.join(', ')}
                WHERE admin_id = $${updates.length + 1}
                RETURNING *
            `;
            values.push(admin_id);
            const updatedAdmin = await pool.query(query, values);
            return res.json({ message: 'Profile updated successfully', admin: updatedAdmin.rows[0] });
        } else {
            return res.status(400).json({ error: 'No updates provided' });
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
};

module.exports = { adminSignup, adminLogin, updateAdminProfile };
