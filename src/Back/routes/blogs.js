const { Router } = require('express');
const router = Router();

const { getBlogs, createBlog, editBlog, deleteBlog } = require('../controllers/blogs');

const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');

router.get('/', getBlogs);
router.post('/', authMiddleware, createBlog);
router.patch('/:id', authMiddleware, adminMiddleware, editBlog);
router.delete('/:id', authMiddleware, adminMiddleware, deleteBlog);

module.exports = router;