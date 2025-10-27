import fs from 'fs';
import { parse } from 'csv-parse';
import { pipeline as streamPipeline } from 'stream';
import { promisify } from 'util';

const pipeline = promisify(streamPipeline);

export const readCsvStream = async (filePath: string): Promise<string[][]> => {
  const rows: string[][] = [];
  await pipeline(
    fs.createReadStream(filePath),
    parse({
      bom: true,
      skipEmptyLines: true,
    }).on('data', (row: string[]) => {
      rows.push(row);
    })
  );
  return rows;
};
