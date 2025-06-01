const jwt = require('jsonwebtoken');

const isAdmin = async (req, res, next) => {
  try {

    if (!req.userInfo) {
      console.log('Error: req.userInfo is not defined. Did you forget to use authMiddleware?');
      return res.status(401).json({
        success: false,
        message: 'User information is not available. Please log in again.',
      });
    }


    if (req.userInfo.role === 'admin') {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: 'Access denied: Admins only.',
    });
  } catch (e) {
    console.log('Error in isAdmin middleware: ', e.message);
    res.status(500).json({
      success: false,
      message: 'Something went wrong while checking admin access.',
    });
  }
};

module.exports = isAdmin;
