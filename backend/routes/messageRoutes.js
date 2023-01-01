const express = require('express');
const { sendMessage, allMessages } = require('../controllers/messageController');
// const { registerUser , authUser, allUsers } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();



router.route('/').post(protect, sendMessage)
router.route('/:chatId').get(protect , allMessages)
// router.route('/login').post(authUser)


module.exports = router