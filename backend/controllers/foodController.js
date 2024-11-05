// controllers/foodController.js
const pool = require('../config/db');

// Add Food Function
const addFood = async (req, res) => {
    const { name, description, price, image_url } = req.body;

    try {
        const newFood = await pool.query(
            'INSERT INTO foods (name, description, price, image_url) VALUES ($1, $2, $3, $4) RETURNING *',
            [name, description, price, image_url]
        );
        res.status(201).json({ message: 'Food item added successfully', food: newFood.rows[0] });
    } catch (err) {
        console.error("Error in addFood:", err.message);
        res.status(500).json({ error: 'Server error' });
    }
};

// Update Food Function
const updateFood = async (req, res) => {
    const { food_id, name, description, price, image_url } = req.body; // Change id to food_id

    console.log("Received data for update:", req.body); // Log received data

    try {
        const updatedFood = await pool.query(
            'UPDATE foods SET name = $1, description = $2, price = $3, image_url = $4 WHERE food_id = $5 RETURNING *',
            [name, description, price, image_url, food_id] // Change id to food_id
        );
        if (updatedFood.rows.length === 0) {
            return res.status(404).json({ error: 'Food item not found' });
        }
        res.json({ message: 'Food item updated successfully', food: updatedFood.rows[0] });
    } catch (err) {
        console.error("Error in updateFood:", err.message);
        res.status(500).json({ error: 'Server error' });
    }
};


// Delete Food Function
const deleteFood = async (req, res) => {
    const { food_id } = req.params; // Get food_id from URL parameters
    console.log(`Attempting to delete food with ID: ${food_id}`);

    try {
        const deletedFood = await pool.query(
            'DELETE FROM foods WHERE food_id = $1 RETURNING *',
            [food_id] // Use food_id instead of id
        );
        if (deletedFood.rows.length === 0) {
            return res.status(404).json({ error: 'Food item not found' });
        }
        res.json({ message: 'Food item deleted successfully', food: deletedFood.rows[0] });
    } catch (err) {
        console.error("Error in deleteFood:", err.message);
        res.status(500).json({ error: 'Server error' });
    }
};


// Get All Foods Function
const getAllFoods = async (req, res) => {
    try {
        const foods = await pool.query('SELECT * FROM foods');
        res.json(foods.rows);
    } catch (err) {
        console.error("Error in getAllFoods:", err.message);
        res.status(500).json({ error: 'Server error' });
    }
};

module.exports = { addFood, updateFood, deleteFood, getAllFoods };
