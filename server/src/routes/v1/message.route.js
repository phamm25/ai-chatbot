const express = require('express');
const messageController = require('../../controllers/message.controller');
const validate = require('../../middlewares/validate');
const messageValidation = require('../../validations/message.validation');

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(messageController.listMessages)
  .post(validate(messageValidation.createMessage), messageController.createMessage);

module.exports = router;
