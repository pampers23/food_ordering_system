const express = require('express');
const multer = require('multer');
const { customerSignup, customerLogin, updateCustomerProfile } = require('../controllers/customerController');
const router = express.Router();

// Set up Multer storage with destination folder for file uploads
const upload = multer({ dest: 'uploads/' });

// Customer Sign-Up Route (including profile image upload)
router.post('/signup', upload.single('profile_image'), customerSignup);

// Customer Login Route
router.post('/login', customerLogin);

// Route for updating customer profile
router.put('/profile', upload.single('profile_image'), updateCustomerProfile);

module.exports = router;
