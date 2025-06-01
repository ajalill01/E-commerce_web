const Hacker = require('../model/ipHack.js');

const sanitize = async (req, res, next) => {
  const hasMongoOperators = (obj) => {
    for (let key in obj) {
      if (key.startsWith('$')) {
        return true;
      }
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        if (hasMongoOperators(obj[key])) {
          return true;
        }
      }
    }
    return false;
  };

  if (hasMongoOperators(req.body) || hasMongoOperators(req.query) || hasMongoOperators(req.params)) {
    const userIp = req.headers['x-forwarded-for'] || req.ip;
    const attackedRoute = req.originalUrl;


    try {
      await Hacker.create({
        ip: userIp,
        route: attackedRoute
      });
      console.log(`Hacking attempt saved from IP: ${userIp} on route ${attackedRoute}`);
    } catch (error) {
      console.error('Failed to save hacker attempt:', error);
    }

    return res.status(400).json({
      success: false,
      message: `We detected a hacking attempt. Your IP (${userIp}) has been logged.`
    });
  }

  next();
};

module.exports = sanitize;

