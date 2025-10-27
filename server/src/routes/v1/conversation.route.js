const express = require('express');
const conversationController = require('../../controllers/conversation.controller');
const validate = require('../../middlewares/validate');
const conversationValidation = require('../../validations/conversation.validation');

const router = express.Router();

router
  .route('/')
  .get(conversationController.listConversations)
  .post(validate(conversationValidation.createConversation), conversationController.createConversation);

router.route('/:conversationId').get(conversationController.getConversation);

module.exports = router;
