const express = require('express');
const conversationRoute = require('./conversation.route');
const messageRoute = require('./message.route');
const uploadRoute = require('./upload.route');
const dataRoute = require('./data.route');

const router = express.Router();

router.use('/conversations', conversationRoute);
router.use('/conversations/:conversationId/messages', messageRoute);
router.use('/uploads', uploadRoute);
router.use('/data', dataRoute);

module.exports = router;
