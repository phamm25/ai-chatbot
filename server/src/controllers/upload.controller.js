const catchAsync = require('../utils/catchAsync');
const { formatResponse } = require('../utils/response');
const uploadService = require('../services/upload.service');
const { parseCsvBuffer } = require('../services/csv.service');

const uploadImage = catchAsync(async (req, res) => {
  if (!req.file) {
    res.status(400).json({ message: 'Image file is required' });
    return;
  }
  const upload = await uploadService.createUpload({
    type: 'image',
    originalName: req.file.originalname,
    mimeType: req.file.mimetype,
    buffer: req.file.buffer,
    size: req.file.size,
  });
  res.status(201).json(formatResponse(upload));
});

const uploadCsv = catchAsync(async (req, res) => {
  if (!req.file) {
    res.status(400).json({ message: 'CSV file is required' });
    return;
  }
  const upload = await uploadService.createUpload({
    type: 'csv',
    originalName: req.file.originalname,
    mimeType: req.file.mimetype,
    buffer: req.file.buffer,
    size: req.file.size,
  });
  const summary = parseCsvBuffer(req.file.buffer);
  res.status(201).json(formatResponse({ upload, summary }));
});

module.exports = {
  uploadImage,
  uploadCsv,
};
