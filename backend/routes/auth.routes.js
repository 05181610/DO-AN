const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { validateRegister } = require('../middleware/validate');

router.post('/register', validateRegister, authController.register);
router.post('/login', authController.login);
router.get('/profile', authMiddleware, authController.getProfile);

module.exports = router; 