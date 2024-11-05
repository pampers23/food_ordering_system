const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    try {
        // Extract the token from the Authorization header
        const authHeader = req.header('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'No token, authorization denied' });
        }

        // Remove 'Bearer ' from token string
        const token = authHeader.replace('Bearer ', '');

        // Verify the token using JWT secret
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach user data to the request object
        req.user = decoded; // This includes customer info

        // Check for admin privileges
        if (decoded.admin_id) {
            req.admin = decoded; // Attach admin info if admin
        } else {
            req.customer_id = decoded.customer_id; // Attach customer ID if it's a customer
        }

        next(); // Proceed to the next middleware or route handler
    } catch (err) {
        console.error("JWT Verification Error:", err);
        res.status(401).json({ error: 'Token is not valid' });
    }
};

module.exports = authMiddleware;
