import { STORAGE_KEYS } from '../config/app.config.js';
import { gradeEntryKey } from '../models/subject.model.js';

export class Repository {
  constructor(adapter) {
    this.adapter = adapter;
  }

  async init() {
    await this.adapter.init();
    return this;
  }

  get backendName() {
    return this.adapter.backendName;
  }

  async getProfile() {
    return this.adapter.getItem(STORAGE_KEYS.PROFILE);
  }

  async saveProfile(profile) {
    return this.adapter.setItem(STORAGE_KEYS.PROFILE, { ...profile, updatedAt: new Date().toISOString() });
  }

  async isOnboardingDone() {
    const value = await this.adapter.getItem(STORAGE_KEYS.ONBOARDING_DONE);
    return Boolean(value);
  }

  async setOnboardingDone(done) {
    return this.adapter.setItem(STORAGE_KEYS.ONBOARDING_DONE, done);
  }

  async getSubjectNameOverrides() {
    const value = await this.adapter.getItem(STORAGE_KEYS.SUBJECT_NAMES);
    return value || {};
  }

  async saveSubjectNameOverrides(overrides) {
    return this.adapter.setItem(STORAGE_KEYS.SUBJECT_NAMES, overrides);
  }

  async getAllGrades() {
    const value = await this.adapter.getItem(STORAGE_KEYS.GRADES);
    return value || {};
  }

  async getGradeEntry(subjectId, semester) {
    const all = await this.getAllGrades();
    return all[gradeEntryKey(subjectId, semester)] || null;
  }

  async saveGradeEntry(entry) {
    const all = await this.getAllGrades();
    const key = gradeEntryKey(entry.subjectId, entry.semester);
    all[key] = { ...entry, updatedAt: new Date().toISOString() };
    await this.adapter.setItem(STORAGE_KEYS.GRADES, all);
    return all[key];
  }

  async getAllPassFail() {
    const value = await this.adapter.getItem(STORAGE_KEYS.PASS_FAIL);
    return value || {};
  }

  async savePassFailEntry(entry) {
    const all = await this.getAllPassFail();
    const key = gradeEntryKey(entry.subjectId, entry.semester);
    all[key] = { ...entry, updatedAt: new Date().toISOString() };
    await this.adapter.setItem(STORAGE_KEYS.PASS_FAIL, all);
    return all[key];
  }

  async getAllConduct() {
    const value = await this.adapter.getItem(STORAGE_KEYS.CONDUCT);
    return value || {};
  }

  async saveConductEntry(entry) {
    const all = await this.getAllConduct();
    all[entry.conductId] = { ...entry, updatedAt: new Date().toISOString() };
    await this.adapter.setItem(STORAGE_KEYS.CONDUCT, all);
    return all[entry.conductId];
  }

  async getGoal() {
    const value = await this.adapter.getItem(STORAGE_KEYS.GOALS);
    return value;
  }

  async saveGoal(goal) {
    const withTimestamp = { ...goal, updatedAt: new Date().toISOString() };
    await this.adapter.setItem(STORAGE_KEYS.GOALS, withTimestamp);
    return withTimestamp;
  }

  async listAbsences() {
    const value = await this.adapter.getItem(STORAGE_KEYS.ABSENCES);
    return value || [];
  }

  async addAbsence(entry) {
    const list = await this.listAbsences();
    list.push(entry);
    await this.adapter.setItem(STORAGE_KEYS.ABSENCES, list);
    return entry;
  }

  async removeAbsence(id) {
    const list = await this.listAbsences();
    const filtered = list.filter((item) => item.id !== id);
    await this.adapter.setItem(STORAGE_KEYS.ABSENCES, filtered);
    return filtered;
  }

  async listHistory() {
    const value = await this.adapter.getItem(STORAGE_KEYS.HISTORY);
    return value || [];
  }

  async addHistoryEntry(entry) {
    const list = await this.listHistory();
    list.unshift(entry);
    const trimmed = list.slice(0, 500);
    await this.adapter.setItem(STORAGE_KEYS.HISTORY, trimmed);
    return entry;
  }

  async getSettings() {
    const value = await this.adapter.getItem(STORAGE_KEYS.SETTINGS);
    return value || {};
  }

  async saveSettings(settings) {
    await this.adapter.setItem(STORAGE_KEYS.SETTINGS, settings);
    return settings;
  }

  async getChatLog() {
    const value = await this.adapter.getItem(STORAGE_KEYS.CHAT_LOG);
    return value || [];
  }

  async saveChatLog(messages) {
    await this.adapter.setItem(STORAGE_KEYS.CHAT_LOG, messages.slice(-100));
    return messages;
  }

  async exportSnapshot() {
    const [profile, subjectNames, grades, passFail, conduct, goal, absences, history, settings] = await Promise.all([
      this.getProfile(),
      this.getSubjectNameOverrides(),
      this.getAllGrades(),
      this.getAllPassFail(),
      this.getAllConduct(),
      this.getGoal(),
      this.listAbsences(),
      this.listHistory(),
      this.getSettings()
    ]);
    return {
      exportedAt: new Date().toISOString(),
      version: 1,
      profile,
      subjectNames,
      grades,
      passFail,
      conduct,
      goal,
      absences,
      history,
      settings
    };
  }

  async importSnapshot(snapshot) {
    if (!snapshot || typeof snapshot !== 'object') throw new Error('Dữ liệu nhập không hợp lệ');
    const operations = [];
    if (snapshot.profile) operations.push(this.adapter.setItem(STORAGE_KEYS.PROFILE, snapshot.profile));
    if (snapshot.subjectNames) operations.push(this.adapter.setItem(STORAGE_KEYS.SUBJECT_NAMES, snapshot.subjectNames));
    if (snapshot.grades) operations.push(this.adapter.setItem(STORAGE_KEYS.GRADES, snapshot.grades));
    if (snapshot.passFail) operations.push(this.adapter.setItem(STORAGE_KEYS.PASS_FAIL, snapshot.passFail));
    if (snapshot.conduct) operations.push(this.adapter.setItem(STORAGE_KEYS.CONDUCT, snapshot.conduct));
    if (snapshot.goal) operations.push(this.adapter.setItem(STORAGE_KEYS.GOALS, snapshot.goal));
    if (snapshot.absences) operations.push(this.adapter.setItem(STORAGE_KEYS.ABSENCES, snapshot.absences));
    if (snapshot.history) operations.push(this.adapter.setItem(STORAGE_KEYS.HISTORY, snapshot.history));
    if (snapshot.settings) operations.push(this.adapter.setItem(STORAGE_KEYS.SETTINGS, snapshot.settings));
    await Promise.all(operations);
    return true;
  }

  async resetAll() {
    return this.adapter.clearAll();
  }
}
