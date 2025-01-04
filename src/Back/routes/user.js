const { Router } = require('express');
const router = Router();

const { getMe } = require('../controllers/user');

router.get('/me', getMe);

module.exports = router;