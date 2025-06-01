const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload-middleware');
const auth = require('../middleware/auth-middleware');
const isAdmin = require('../middleware/admin-middleware');
const { uploadBrand ,getBrands } = require('../controllers/brand-controllers');

router.post('/add',auth,isAdmin, upload, uploadBrand);
router.get('/get', getBrands);


module.exports = router;
