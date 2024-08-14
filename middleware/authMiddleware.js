const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const token = req.header('token')?.replace('Bearer ', '');  

  if (!token) return res.status(401).json({ message: 'Access denied' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_KEY);
    req.user = decoded.id;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = authMiddleware;
