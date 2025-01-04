const { Router } = require('express');
const router = Router();

const { createBlog, editBlog, deleteBlog } = require('../controllers/blogs');
const adminMiddleware = require('../middleware/admin');

router.post('/', createBlog);
router.patch('/:id', adminMiddleware, editBlog);
router.delete('/:id', adminMiddleware, deleteBlog);

module.exports = router;