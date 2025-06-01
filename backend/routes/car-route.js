const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload-middleware');
const auth = require('../middleware/auth-middleware');
const isAdmin = require('../middleware/admin-middleware');
const { uploadCar ,getCars} = require('../controllers/car-controllers');

router.post('/add',auth,isAdmin, upload, uploadCar);
router.get('/get', getCars);

module.exports = router;
