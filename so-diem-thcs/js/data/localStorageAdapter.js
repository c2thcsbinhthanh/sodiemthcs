import { StorageAdapter } from './storageAdapter.interface.js';

const NAMESPACE = 'thcs_grade_app::';

export class LocalStorageAdapter extends StorageAdapter {
  constructor() {
    super();
    this.ready = false;
  }

  async init() {
    if (typeof window === 'undefined' || !window.localStorage) {
      throw new Error('LocalStorage không khả dụng trên trình duyệt này');
    }
    this.ready = true;
    return true;
  }

  get isReady() {
    return this.ready;
  }

  get backendName() {
    return 'localStorage';
  }

  namespacedKey(key) {
    return `${NAMESPACE}${key}`;
  }

  async getItem(key) {
    const raw = window.localStorage.getItem(this.namespacedKey(key));
    if (raw === null) return null;
    try {
      return JSON.parse(raw);
    } catch (error) {
      return null;
    }
  }

  async setItem(key, value) {
    window.localStorage.setItem(this.namespacedKey(key), JSON.stringify(value));
    return true;
  }

  async removeItem(key) {
    window.localStorage.removeItem(this.namespacedKey(key));
    return true;
  }

  async listKeys() {
    const keys = [];
    for (let index = 0; index < window.localStorage.length; index += 1) {
      const storageKey = window.localStorage.key(index);
      if (storageKey && storageKey.startsWith(NAMESPACE)) {
        keys.push(storageKey.slice(NAMESPACE.length));
      }
    }
    return keys;
  }

  async clearAll() {
    const keys = await this.listKeys();
    keys.forEach((key) => window.localStorage.removeItem(this.namespacedKey(key)));
    return true;
  }
}
