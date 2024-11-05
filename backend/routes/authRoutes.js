const express = require('express');
const multer = require('multer');
const { adminLogin, adminSignup, updateAdminProfile } = require('../controllers/authController');

// Initialize multer for file uploads
const upload = multer({ dest: 'uploads/' });

const router = express.Router();

// Admin Sign-Up Route
router.post('/admin/signup', adminSignup);

// Admin Login Route
router.post('/admin/login', adminLogin);

// New route for updating admin profile with profile image upload
router.put('/admin/profile', upload.single('profile_image'), updateAdminProfile);

module.exports = router;
