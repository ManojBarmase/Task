// server/middleware/auth.js

const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

function auth(req, res, next) {
    // 1. Header से token प्राप्त करें
    const token = req.header('x-auth-token');

    // 2. देखें कि token मौजूद है या नहीं
    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    try {
        // 3. token को verify करें
        // ध्यान दें: JWT_SECRET को global.JWT_SECRET से लिया गया है
        const decoded = jwt.verify(token, JWT_SECRET); 

        // 4. request object में user payload जोड़ें
        req.user = decoded.user;
        
        // 5. अगले middleware/route handler पर जाएँ
        next();

    } catch (e) {
        res.status(401).json({ msg: 'Token is not valid' });
    }
}

module.exports = auth;