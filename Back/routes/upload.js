const { Router } = require('express');
const router = Router();
const { upload } = require('../config/upload');
const authMiddleware = require('../middleware/auth');
const path = require('path');

router.post('/image', authMiddleware, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }
    
    const imageUrl = `/uploads/images/${path.basename(req.file.path)}`;
    
    return res.status(200).json({ 
      imageUrl: imageUrl,
      message: 'Image uploaded successfully'
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    return res.status(500).json({ message: 'Error uploading image' });
  }
});

router.get('/images/:filename', (req, res) => {
  const filename = req.params.filename;
  const imagePath = path.join(__dirname, '../uploads/images', filename);
  res.sendFile(imagePath);
});

module.exports = router;
