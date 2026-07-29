export class StorageAdapter {
  async init() {
    throw new Error('StorageAdapter.init() chưa được triển khai');
  }

  async getItem(key) {
    throw new Error('StorageAdapter.getItem() chưa được triển khai');
  }

  async setItem(key, value) {
    throw new Error('StorageAdapter.setItem() chưa được triển khai');
  }

  async removeItem(key) {
    throw new Error('StorageAdapter.removeItem() chưa được triển khai');
  }

  async listKeys() {
    throw new Error('StorageAdapter.listKeys() chưa được triển khai');
  }

  async clearAll() {
    throw new Error('StorageAdapter.clearAll() chưa được triển khai');
  }

  get isReady() {
    return true;
  }

  get backendName() {
    return 'unknown';
  }
}
