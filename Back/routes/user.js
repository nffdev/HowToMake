const { Router } = require('express');
const router = Router();

const { getMe, getAllUsers, updateUserRole, deleteUser } = require('../controllers/user');
const adminMiddleware = require('../middleware/admin');

router.get('/me', getMe);

router.get('/all', adminMiddleware, getAllUsers);
router.patch('/:userId/role', adminMiddleware, updateUserRole);
router.delete('/:userId', adminMiddleware, deleteUser);

module.exports = router;