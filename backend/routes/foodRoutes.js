// routes/foodRoutes.js
const express = require('express');
const { addFood, updateFood, deleteFood, getAllFoods } = require('../controllers/foodController');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware'); // Assuming you have middleware for authentication

// Route to add food item
router.post('/', authMiddleware, addFood); // Protect route with authentication middleware

// Route to update food item
router.put('/', authMiddleware, updateFood); // Protect route with authentication middleware

// Route to delete food item
router.delete('/:food_id', authMiddleware, deleteFood); // Protect route with authentication middleware

// Route to get all food items
router.get('/', authMiddleware, getAllFoods); // Protect route with authentication middleware

module.exports = router;
