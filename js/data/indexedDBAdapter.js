import { StorageAdapter } from './storageAdapter.interface.js';
import { STORAGE_DB_NAME, STORAGE_DB_VERSION } from '../config/app.config.js';

const STORE_NAME = 'kv';

export class IndexedDBAdapter extends StorageAdapter {
  constructor() {
    super();
    this.db = null;
  }

  async init() {
    if (typeof window === 'undefined' || !window.indexedDB) {
      throw new Error('IndexedDB không khả dụng trên trình duyệt này');
    }
    this.db = await new Promise((resolve, reject) => {
      const request = window.indexedDB.open(STORAGE_DB_NAME, STORAGE_DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    return true;
  }

  get isReady() {
    return Boolean(this.db);
  }

  get backendName() {
    return 'indexedDB';
  }

  transaction(mode) {
    return this.db.transaction(STORE_NAME, mode).objectStore(STORE_NAME);
  }

  async getItem(key) {
    return new Promise((resolve, reject) => {
      const request = this.transaction('readonly').get(key);
      request.onsuccess = () => resolve(request.result === undefined ? null : request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async setItem(key, value) {
    return new Promise((resolve, reject) => {
      const request = this.transaction('readwrite').put(value, key);
      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  }

  async removeItem(key) {
    return new Promise((resolve, reject) => {
      const request = this.transaction('readwrite').delete(key);
      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  }

  async listKeys() {
    return new Promise((resolve, reject) => {
      const request = this.transaction('readonly').getAllKeys();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async clearAll() {
    return new Promise((resolve, reject) => {
      const request = this.transaction('readwrite').clear();
      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  }
}
