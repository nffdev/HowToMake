const { Router } = require('express');
const router = Router();

const { getBlogs, createBlog, editBlog, deleteBlog } = require('../controllers/blogs');
const adminMiddleware = require('../middleware/admin');

router.get('/', getBlogs);
router.post('/', createBlog);
router.patch('/:id', adminMiddleware, editBlog);
router.delete('/:id', adminMiddleware, deleteBlog);

module.exports = router;