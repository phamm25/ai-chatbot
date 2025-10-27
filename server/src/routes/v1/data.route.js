const express = require('express');
const validate = require('../../middlewares/validate');
const dataValidation = require('../../validations/data.validation');
const dataController = require('../../controllers/data.controller');

const router = express.Router();

router.post('/csv/url', validate(dataValidation.summarizeCsvFromUrl), dataController.summarizeCsvFromUrl);

module.exports = router;
