const catchAsync = require('../utils/catchAsync');
const { formatResponse } = require('../utils/response');
const { getSummaryFromUrl } = require('../services/csv.service');

const summarizeCsvFromUrl = catchAsync(async (req, res) => {
  const { url } = req.body;
  if (!url) {
    res.status(400).json({ message: 'CSV URL is required' });
    return;
  }
  const summary = await getSummaryFromUrl(url);
  res.json(formatResponse({ url, summary }));
});

module.exports = {
  summarizeCsvFromUrl,
};
