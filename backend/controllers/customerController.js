const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');

// Setup multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname); // Appending timestamp to avoid name conflicts
    },
});

const upload = multer({ storage: storage });

// Customer Sign-Up Function
const customerSignup = async (req, res) => {
    try {
        const { username, password, email, phone_number } = req.body;

        // Check if all required fields are present
        if (!username || !password || !email || !phone_number) {
            console.log("Received data:", req.body);
            return res.status(400).json({ error: 'All fields are required' });
        }

        console.log("Password received:", password); // Log password to check if it’s defined

        // Check if customer already exists
        const existingCustomer = await pool.query(
            'SELECT * FROM customers WHERE email = $1',
            [email]
        );
        if (existingCustomer.rows.length > 0) {
            return res.status(400).json({ error: 'Customer already exists' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert new customer into database, including profile_image if provided
        const profileImage = req.file ? req.file.path : null; // Get the uploaded file path

        const newCustomer = await pool.query(
            'INSERT INTO customers (username, password, email, phone_number, profile_image) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [username, hashedPassword, email, phone_number, profileImage] // Use phone_number here
        );

        res.status(201).json({ message: 'Customer registered successfully', customer: newCustomer.rows[0] });
    } catch (err) {
        console.error("Error in customerSignup:", err.message);  // Log the specific error message
        res.status(500).json({ error: 'Server error' });
    }
};


// Customer Login Function
const customerLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if customer exists
        const customer = await pool.query(
            'SELECT * FROM customers WHERE email = $1',
            [email]
        );

        if (customer.rows.length === 0) {
            return res.status(400).json({ error: 'Customer not found' });
        }

        // Verify password
        const validPassword = await bcrypt.compare(password, customer.rows[0].password);
        if (!validPassword) {
            return res.status(400).json({ error: 'Invalid password' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { customer_id: customer.rows[0].customer_id },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({ message: 'Login successful', token });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
};

// Customer Update Profile Function
const updateCustomerProfile = async (req, res) => {
    try {
        const { customer_id } = req.body; // Assuming you pass customer_id in the request body
        const { email, password, phone_number } = req.body;

        // Check if customer exists
        const customer = await pool.query(
            'SELECT * FROM customers WHERE customer_id = $1',
            [customer_id]
        );

        if (customer.rows.length === 0) {
            return res.status(404).json({ error: 'Customer not found' });
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

        if (phone_number) {
            updates.push(`phone_number = $${updates.length + 1}`);
            values.push(phone_number);
        }

        // Handle profile image
        const profileImage = req.file ? req.file.path : null; // Get the uploaded file path
        if (profileImage) {
            updates.push(`profile_image = $${updates.length + 1}`);
            values.push(profileImage);
        }

        // Only update if there are changes
        if (updates.length > 0) {
            const query = `
                UPDATE customers
                SET ${updates.join(', ')}
                WHERE customer_id = $${updates.length + 1}
                RETURNING *
            `;
            values.push(customer_id);
            const updatedCustomer = await pool.query(query, values);
            return res.json({ message: 'Profile updated successfully', customer: updatedCustomer.rows[0] });
        } else {
            return res.status(400).json({ error: 'No updates provided' });
        }
    } catch (err) {
        console.error("Error in customerSignup:", err.message);
        res.status(500).json({ error: 'Server error' });
    }
};

module.exports = { customerSignup, customerLogin, updateCustomerProfile, upload };
