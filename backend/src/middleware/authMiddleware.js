const { verifyToken } = require('../utils/jwt');

const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'توکن ارائه نشده است' });
    }

    const decoded = verifyToken(token);

    if (!decoded) {
      return res.status(401).json({ error: 'توکن نامعتبر است' });
    }

    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'خطا در احراز هویت' });
  }
};

module.exports = authMiddleware;
