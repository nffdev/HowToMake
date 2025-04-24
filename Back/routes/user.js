const { Router } = require('express');
const router = Router();

const { getMe, getAllUsers, updateUserRole } = require('../controllers/user');
const adminMiddleware = require('../middleware/admin');

router.get('/me', getMe);

router.get('/all', adminMiddleware, getAllUsers);
router.patch('/:userId/role', adminMiddleware, updateUserRole);

module.exports = router;