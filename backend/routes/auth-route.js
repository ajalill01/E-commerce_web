const express = require('express')
const rateLimit = require('express-rate-limit');
const {
    login
} = require('../controllers/auth-controllers') 

const loginLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 15,
    message: 'Too many login attempts, please try again in 5 minutes.',
  });
  

const router = express.Router()

router.post('/login',loginLimiter,login)

module.exports = router