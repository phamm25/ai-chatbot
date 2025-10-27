const express = require('express');
const multer = require('multer');
const env = require('../../config/env');
const uploadController = require('../../controllers/upload.controller');

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: env.maxUploadSizeMb * 1024 * 1024,
  },
});

router.post('/images', upload.single('file'), uploadController.uploadImage);
router.post('/csv', upload.single('file'), uploadController.uploadCsv);

module.exports = router;
