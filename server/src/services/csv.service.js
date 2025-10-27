const crypto = require('crypto');
const fs = require('fs/promises');
// eslint-disable-next-line import/no-unresolved
const { parse } = require('csv-parse/sync');
const fetch = require('node-fetch');
const { initRedis } = require('../config/redis');
const Upload = require('../models/upload.model');
const ApiError = require('../utils/ApiError');

const redis = initRedis();

const detectColumnType = (values) => {
  let numericCount = 0;
  let dateCount = 0;
  let total = 0;

  values.forEach((value) => {
    if (value === null || value === undefined || value === '') {
      return;
    }
    total += 1;
    const num = Number(value);
    if (!Number.isNaN(num)) {
      numericCount += 1;
      return;
    }
    const date = Date.parse(value);
    if (!Number.isNaN(date)) {
      dateCount += 1;
    }
  });

  if (numericCount / (total || 1) > 0.7) {
    return 'numeric';
  }
  if (dateCount / (total || 1) > 0.7) {
    return 'date';
  }
  return 'categorical';
};

const computeNumericStats = (values) => {
  const numericValues = values
    .map((value) => Number(value))
    .filter((value) => !Number.isNaN(value));

  if (!numericValues.length) {
    return undefined;
  }

  const sum = numericValues.reduce((acc, value) => acc + value, 0);
  return {
    min: Math.min(...numericValues),
    max: Math.max(...numericValues),
    mean: Number((sum / numericValues.length).toFixed(3)),
  };
};

const computeColumnSummary = (records, column) => {
  const values = records.map((record) => record[column]);
  const type = detectColumnType(values);
  const missing = values.filter((value) => value === null || value === undefined || value === '').length;
  const uniqueValues = new Set(values.filter((value) => value !== null && value !== undefined && value !== '')).size;

  return {
    name: column,
    type,
    missing,
    uniqueValues,
    stats: type === 'numeric' ? computeNumericStats(values) : undefined,
  };
};

const summarizeRecords = (records) => {
  const columns = Object.keys(records[0] || {});
  const summaries = columns.map((column) => computeColumnSummary(records, column));
  const missingColumn = summaries.reduce((prev, current) => {
    if (!prev || current.missing > prev.missing) {
      return current;
    }
    return prev;
  }, undefined);

  return {
    rowCount: records.length,
    columnCount: columns.length,
    columns: summaries,
    columnWithMostMissingValues: missingColumn ? missingColumn.name : null,
  };
};

const parseCsvBuffer = (buffer) => {
  try {
    const records = parse(buffer, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    if (!records.length) {
      throw new ApiError(400, 'CSV file is empty');
    }

    return summarizeRecords(records);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(400, 'Failed to parse CSV file', { cause: error.message });
  }
};

const getCacheKey = (identifier) => `csv-summary:${identifier}`;

const getSummaryFromCache = async (identifier) => {
  const cacheKey = getCacheKey(identifier);
  const cached = await redis.get(cacheKey);
  return cached ? JSON.parse(cached) : null;
};

const setSummaryToCache = async (identifier, summary) => {
  const cacheKey = getCacheKey(identifier);
  await redis.set(cacheKey, JSON.stringify(summary), 'EX', 3600);
};

const getSummaryFromUpload = async (uploadId) => {
  const upload = await Upload.findById(uploadId);
  if (!upload) {
    throw new ApiError(404, 'Upload not found');
  }
  if (upload.type !== 'csv') {
    throw new ApiError(400, 'Upload is not a CSV file');
  }
  const identifier = upload.checksum || upload.id;
  const cached = await getSummaryFromCache(identifier);
  if (cached) {
    return cached;
  }

  const buffer = await fs.readFile(upload.storagePath);
  const summary = parseCsvBuffer(buffer);
  await setSummaryToCache(identifier, summary);
  return summary;
};

const fetchCsvFromUrl = async (url) => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new ApiError(response.status, 'Failed to fetch CSV from URL');
    }
    const buffer = Buffer.from(await response.arrayBuffer());
    return buffer;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(400, 'Unable to download CSV', { cause: error.message });
  }
};

const getSummaryFromUrl = async (url) => {
  const identifier = crypto.createHash('sha256').update(url).digest('hex');
  const cached = await getSummaryFromCache(identifier);
  if (cached) {
    return cached;
  }
  const buffer = await fetchCsvFromUrl(url);
  const summary = parseCsvBuffer(buffer);
  await setSummaryToCache(identifier, summary);
  return summary;
};

module.exports = {
  parseCsvBuffer,
  getSummaryFromUpload,
  getSummaryFromUrl,
  summarizeRecords,
};
