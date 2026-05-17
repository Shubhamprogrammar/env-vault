const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/signin', authController.signin);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);

module.exports = router;
