 // server/middleware/role.js

/**
 * Middleware function to check if the user's role matches one of the allowed roles.
 * Usage: router.put('/:id', auth, role(['approver', 'admin']), ...)
 */
module.exports = function (roles) {
    return (req, res, next) => {
        // req.user JWT payload से आता है (जिसे auth middleware ने जोड़ा था)
        if (!req.user || !req.user.role) {
            // यदि auth middleware विफल हो गया या role JWT में नहीं है
            return res.status(401).json({ msg: 'Authorization denied. User role not found in token.' });
        }

        const userRole = req.user.role; // वर्तमान logged-in user का role

        // चेक करें कि user का role, allowed roles की list में है या नहीं
        if (Array.isArray(roles) && !roles.includes(userRole)) {
            // यदि user के पास आवश्यक role नहीं है (e.g., employee tries to access approver API)
            console.warn(`Access Forbidden: User with role '${userRole}' attempted to access restricted route.`);
            return res.status(403).json({ 
                msg: 'Forbidden: You do not have the required role/permissions to perform this action.' 
            });
        }

        // यदि role मैच करता है, तो आगे बढ़ें
        next();
    };
};