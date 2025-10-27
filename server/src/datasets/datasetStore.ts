import { DatasetSummary } from '../types/chat';

class DatasetStore {
  private datasets = new Map<string, DatasetSummary>();

  upsert(dataset: DatasetSummary) {
    this.datasets.set(dataset.id, dataset);
    return dataset;
  }

  get(datasetId: string) {
    return this.datasets.get(datasetId);
  }

  getMany(datasetIds: string[]) {
    return datasetIds
      .map((id) => this.datasets.get(id))
      .filter((dataset): dataset is DatasetSummary => Boolean(dataset));
  }
}

export const datasetStore = new DatasetStore();
