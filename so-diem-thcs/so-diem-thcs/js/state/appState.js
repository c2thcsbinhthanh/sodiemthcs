import { Repository } from '../data/repository.js';
import { LocalStorageAdapter } from '../data/localStorageAdapter.js';
import { CORE_SUBJECTS, findSubjectById } from '../config/subjects.config.js';
import { computeAllSubjects, computeOverallAverage } from '../core/scoringEngine.js';
import { rankSubjects } from '../core/rankingEngine.js';
import { generateNotifications } from '../core/notificationEngine.js';
import { generateTodoList } from '../core/todoEngine.js';
import { summarizeAbsences, lastAbsenceTimestamp } from '../core/absenceEngine.js';
import { createEmptyGoal } from '../models/goal.model.js';
import { gradeEntryKey } from '../models/subject.model.js';
import { createHistoryEntry, HISTORY_CATEGORIES } from '../models/history.model.js';

export class AppState {
  constructor() {
    this.repository = null;
    this.listeners = new Set();
    this.profile = null;
    this.subjectNameOverrides = {};
    this.grades = {};
    this.passFail = {};
    this.conduct = {};
    this.goal = createEmptyGoal();
    this.absences = [];
    this.history = [];
    this.settings = {};
    this.chatLog = [];
    this.simulationMode = false;
    this.simulationGrades = null;
    this.onboardingDone = false;
  }

  async init(adapter) {
    this.repository = await new Repository(adapter || new LocalStorageAdapter()).init();
    await this.reloadAll();
    return this;
  }

  async reloadAll() {
    const [profile, subjectNameOverrides, grades, passFail, conduct, goal, absences, history, settings, chatLog, onboardingDone] =
      await Promise.all([
        this.repository.getProfile(),
        this.repository.getSubjectNameOverrides(),
        this.repository.getAllGrades(),
        this.repository.getAllPassFail(),
        this.repository.getAllConduct(),
        this.repository.getGoal(),
        this.repository.listAbsences(),
        this.repository.listHistory(),
        this.repository.getSettings(),
        this.repository.getChatLog(),
        this.repository.isOnboardingDone()
      ]);
    this.profile = profile;
    this.subjectNameOverrides = subjectNameOverrides || {};
    this.grades = grades || {};
    this.passFail = passFail || {};
    this.conduct = conduct || {};
    this.goal = goal || createEmptyGoal();
    this.absences = absences || [];
    this.history = history || [];
    this.settings = settings || {};
    this.chatLog = chatLog || [];
    this.onboardingDone = onboardingDone;
    this.notify();
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    this.listeners.forEach((listener) => listener(this));
  }

  get activeGrades() {
    return this.simulationMode && this.simulationGrades ? this.simulationGrades : this.grades;
  }

  get subjectsWithNames() {
    return CORE_SUBJECTS.map((subject) => ({
      ...subject,
      name: this.subjectNameOverrides[subject.id] || subject.name
    }));
  }

  nameOfSubject(subjectId) {
    const override = this.subjectNameOverrides[subjectId];
    if (override) return override;
    const subject = findSubjectById(subjectId);
    return subject ? subject.name : subjectId;
  }

  computeSubjectResults() {
    return computeAllSubjects(this.subjectsWithNames, this.activeGrades);
  }

  computeOverallAverage(field = 'year') {
    return computeOverallAverage(this.computeSubjectResults(), field);
  }

  computeRanking(field = 'year') {
    return rankSubjects(this.computeSubjectResults(), this.goal, field);
  }

  computeAbsenceSummary() {
    return summarizeAbsences(this.absences);
  }

  lastActivityTimestamp() {
    const timestamps = Object.values(this.grades)
      .map((entry) => entry.updatedAt)
      .filter(Boolean);
    if (timestamps.length === 0) return null;
    return [...timestamps].sort().reverse()[0];
  }

  computeNotifications() {
    return generateNotifications({
      subjectResults: this.computeSubjectResults(),
      goal: this.goal,
      gradesMap: this.activeGrades,
      lastActivityAt: this.lastActivityTimestamp(),
      absenceSummary: this.computeAbsenceSummary()
    });
  }

  computeTodoList() {
    return generateTodoList({
      subjectResults: this.computeSubjectResults(),
      goal: this.goal,
      conductMap: this.conduct,
      lastAbsenceCheckAt: lastAbsenceTimestamp(this.absences)
    });
  }

  buildAiContextState() {
    return {
      profile: this.profile,
      subjectResults: this.computeSubjectResults(),
      overallAverage: this.computeOverallAverage(),
      goal: this.goal,
      absenceSummary: this.computeAbsenceSummary(),
      ranking: this.computeRanking()
    };
  }

  async saveProfile(profile) {
    this.profile = await this.repository.saveProfile(profile);
    this.notify();
    return this.profile;
  }

  async setOnboardingDone(done) {
    await this.repository.setOnboardingDone(done);
    this.onboardingDone = done;
    this.notify();
  }

  async saveGradeEntry(entry) {
    const key = gradeEntryKey(entry.subjectId, entry.semester);
    if (this.simulationMode) {
      this.simulationGrades = { ...this.simulationGrades, [key]: { ...entry, updatedAt: new Date().toISOString() } };
      this.notify();
      return this.simulationGrades[key];
    }
    const before = this.grades[key] || null;
    const saved = await this.repository.saveGradeEntry(entry);
    this.grades = { ...this.grades, [key]: saved };
    await this.logHistory({
      category: HISTORY_CATEGORIES.GRADE,
      action: before ? 'Cập nhật điểm' : 'Nhập điểm mới',
      subjectId: entry.subjectId,
      description: `${before ? 'Cập nhật' : 'Nhập'} điểm môn ${this.nameOfSubject(entry.subjectId)} - Học kỳ ${entry.semester}`,
      before,
      after: saved
    });
    this.notify();
    return saved;
  }

  async savePassFailEntry(entry) {
    const saved = await this.repository.savePassFailEntry(entry);
    const key = gradeEntryKey(entry.subjectId, entry.semester);
    this.passFail = { ...this.passFail, [key]: saved };
    this.notify();
    return saved;
  }

  async saveConductEntry(entry) {
    const saved = await this.repository.saveConductEntry(entry);
    this.conduct = { ...this.conduct, [entry.conductId]: saved };
    this.notify();
    return saved;
  }

  async saveGoal(goal) {
    const before = this.goal;
    const saved = await this.repository.saveGoal(goal);
    this.goal = saved;
    await this.logHistory({
      category: HISTORY_CATEGORIES.GOAL,
      action: 'Cập nhật mục tiêu',
      description: 'Cập nhật mục tiêu học tập',
      before,
      after: saved
    });
    this.notify();
    return saved;
  }

  async addAbsence(entry) {
    const saved = await this.repository.addAbsence(entry);
    this.absences = [...this.absences, saved];
    await this.logHistory({
      category: HISTORY_CATEGORIES.ABSENCE,
      action: 'Thêm nghỉ học',
      description: `Thêm ${entry.type} ngày ${entry.date}`,
      after: saved
    });
    this.notify();
    return saved;
  }

  async removeAbsence(id) {
    this.absences = await this.repository.removeAbsence(id);
    this.notify();
  }

  async logHistory(partial) {
    const entry = createHistoryEntry(partial);
    await this.repository.addHistoryEntry(entry);
    this.history = [entry, ...this.history].slice(0, 500);
    return entry;
  }

  async saveSettings(settings) {
    this.settings = await this.repository.saveSettings(settings);
    this.notify();
    return this.settings;
  }

  async saveSubjectNameOverrides(overrides) {
    await this.repository.saveSubjectNameOverrides(overrides);
    this.subjectNameOverrides = overrides;
    this.notify();
  }

  async saveChatLog(messages) {
    this.chatLog = messages;
    await this.repository.saveChatLog(messages);
  }

  enterSimulationMode() {
    this.simulationMode = true;
    this.simulationGrades = { ...this.grades };
    this.notify();
  }

  exitSimulationMode() {
    this.simulationMode = false;
    this.simulationGrades = null;
    this.notify();
  }

  async exportSnapshot() {
    return this.repository.exportSnapshot();
  }

  async importSnapshot(snapshot) {
    await this.repository.importSnapshot(snapshot);
    await this.reloadAll();
  }

  async resetAll() {
    await this.repository.resetAll();
    await this.reloadAll();
  }
}
