const adminMiddleware = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied, this area for admin only' });
    }
    next();
};

module.exports = adminMiddleware;
