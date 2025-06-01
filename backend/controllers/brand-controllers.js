// backend/controllers/brand-controller.js
const Brand = require('../model/Brand');
const { uploadToCloudinary } = require('../helpers/cloudinary-helpers');
const fs = require('fs');

// backend/controllers/brand-controller.js
const uploadBrand = async (req, res) => {
  try {
    // 1. Check if files were uploaded
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ 
        error: 'No logo image provided',
        success: false
      });
    }

    // 2. Validate required fields
    if (!req.body.name) {
      return res.status(400).json({ 
        error: 'Brand name is required',
        success: false
      });
    }

    // 3. Upload to Cloudinary
    const uploadedImage = await uploadToCloudinary([req.files[0].path]);
    fs.unlinkSync(req.files[0].path); // Clean up temp file

    // 4. Create brand
    const brand = new Brand({
      name: req.body.name,
      imageUrl: uploadedImage[0].url,
      imagePublicId: uploadedImage[0].publicId
    });

    // 5. Save to database
    await brand.save();

    // 6. Return success response
    res.status(201).json({
      success: true,
      message: 'Brand created successfully',
      brand
    });

  } catch (err) {
    console.error('Brand creation error:', err);
    
    // 7. Return proper error response
    res.status(500).json({ 
      success: false,
      error: 'Server error during brand creation',
      message: err.message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
  }
};

// const upload = require('./your-upload-config'); // Your multer config

// const uploaddeep =  async (req, res) => {
//   try {
//     const { name } = req.body;
    
//     if (!req.files || req.files.length === 0) {
//       return res.status(400).json({ error: 'No files uploaded' });
//     }

//     const uploadedImage = await uploadToCloudinary(req.files[0].path);
//     fs.unlinkSync(req.files[0].path); // delete after upload

//     const brand = new Brand({
//       name,
//       imageUrl: uploadedImage[0].url,
//       imagePublicId: uploadedImage[0].publicId
//     });

//     await brand.save();
//     res.status(201).json(brand);
    
//   } catch (err) {
//     console.error('Server error:', err);
//     res.status(500).json({ 
//       error: 'Server error',
//       message: err.message 
//     });
//   }
// };

// module.exports = router;


const getBrands = async (req, res) => {
    try {
      const brands = await Brand.find();
      res.status(200).json(brands);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch brands', details: err.message });
    }
  };

module.exports = { uploadBrand , getBrands };
