import fs from 'fs';
import axios from 'axios';
import _ from 'lodash';
import dayjs from 'dayjs';
import { parse } from 'csv-parse/sync';
import { DatasetSummary } from '../types/chat';
import { datasetStore } from '../datasets/datasetStore';
import { generateId } from '../utils/id';
import { resolveStoragePath } from '../config/storage';
import { environment } from '../config/environment';
import { ApiError } from '../utils/ApiError';

interface ParsedDataset {
  summary: DatasetSummary;
  filePath: string;
}

const inferType = (value: string): 'number' | 'date' | 'string' => {
  if (value === '' || value === null || value === undefined) {
    return 'string';
  }
  const numeric = Number(value);
  if (!Number.isNaN(numeric)) {
    return 'number';
  }
  const date = dayjs(value);
  if (date.isValid()) {
    return 'date';
  }
  return 'string';
};

const calculateStats = (values: number[]) => {
  if (!values.length) {
    return undefined;
  }
  const sorted = [...values].sort((a, b) => a - b);
  const mean = _.sum(values) / values.length;
  const median = values.length % 2 === 0
    ? (sorted[values.length / 2 - 1] + sorted[values.length / 2]) / 2
    : sorted[Math.floor(values.length / 2)];
  const variance = _.sum(values.map((value) => (value - mean) ** 2)) / values.length;
  return {
    min: sorted[0],
    max: sorted[sorted.length - 1],
    mean,
    median,
    standardDeviation: Math.sqrt(variance),
  };
};

class DatasetService {
  async parseCsvFromBuffer(name: string, buffer: Buffer): Promise<ParsedDataset> {
    const raw = buffer.toString('utf8');
    return this.parseCsv(name, raw);
  }

  async parseCsvFromUrl(url: string): Promise<ParsedDataset> {
    try {
      const response = await axios.get(url, { responseType: 'text', timeout: 15000 });
      const fileName = url.split('/').pop() ?? 'dataset.csv';
      this.validateFileSize(Buffer.byteLength(response.data));
      return this.parseCsv(fileName, response.data);
    } catch (error) {
      throw new ApiError(400, 'Failed to fetch CSV from the provided URL', error);
    }
  }

  private async parseCsv(name: string, raw: string): Promise<ParsedDataset> {
    const rows = parse(raw, {
      columns: true,
      skip_empty_lines: true,
      bom: true,
      cast: (value) => (value === undefined || value === null ? '' : value),
    }) as Record<string, string>[];
    if (!rows.length) {
      throw new ApiError(400, 'CSV file is empty');
    }
    const headers = Object.keys(rows[0]);
    const dataRows = rows;

    const summary: DatasetSummary = {
      id: generateId(),
      name,
      rowCount: dataRows.length,
      columnCount: headers.length,
      columns: headers.map((header) => {
        const columnValues = dataRows.map((row) => row[header]);
        const type = this.inferColumnType(columnValues);
        const missingValues = columnValues.filter((value) => value === '' || value === null || value === undefined).length;
        const uniqueValues = new Set(columnValues.filter((value) => value !== '' && value !== null && value !== undefined)).size;
        const stats = type === 'number'
          ? calculateStats(columnValues.filter((value) => value !== '').map((value) => Number(value)))
          : undefined;
        return {
          name: header,
          type,
          uniqueValues,
          missingValues,
          sampleValues: columnValues.slice(0, 5),
          stats,
        };
      }),
      sampleRows: dataRows.slice(0, 20),
    };

    const datasetPath = resolveStoragePath('csv', `${summary.id}.csv`);
    fs.writeFileSync(datasetPath, raw);
    datasetStore.upsert(summary);

    return {
      summary,
      filePath: datasetPath,
    };
  }

  getDataset(id: string) {
    return datasetStore.get(id);
  }

  private inferColumnType(values: string[]) {
    const samples = values.filter((value) => value !== '' && value !== null && value !== undefined).slice(0, 25);
    if (!samples.length) {
      return 'string';
    }
    const numericCount = samples.filter((value) => inferType(value) === 'number').length;
    const dateCount = samples.filter((value) => inferType(value) === 'date').length;
    if (numericCount / samples.length > 0.7) {
      return 'number';
    }
    if (dateCount / samples.length > 0.7) {
      return 'date';
    }
    return 'string';
  }

  buildDatasetContext(dataset?: DatasetSummary) {
    if (!dataset) {
      return undefined;
    }
    const columnDescriptions = dataset.columns.map((column) => {
      const parts = [
        `${column.name} (${column.type})`,
        `unique: ${column.uniqueValues}`,
        `missing: ${column.missingValues}`,
      ];
      if (column.stats) {
        parts.push(
          `min: ${column.stats.min.toFixed(2)}, max: ${column.stats.max.toFixed(2)}, mean: ${column.stats.mean.toFixed(2)}, median: ${column.stats.median.toFixed(2)}, stdev: ${column.stats.standardDeviation.toFixed(2)}`,
        );
      }
      return parts.join(' | ');
    });
    return [
      `Dataset ${dataset.name} contains ${dataset.rowCount} rows and ${dataset.columnCount} columns.`,
      'Columns:',
      ...columnDescriptions,
      'Sample rows:',
      ...dataset.sampleRows.slice(0, 5).map((row, index) => `${index + 1}. ${JSON.stringify(row)}`),
    ].join('\n');
  }

  validateFileSize(bytes: number) {
    const maxBytes = environment.maxUploadSizeMb * 1024 * 1024;
    if (bytes > maxBytes) {
      throw new ApiError(413, `CSV exceeds maximum size of ${environment.maxUploadSizeMb}MB`);
    }
  }
}

export const datasetService = new DatasetService();
