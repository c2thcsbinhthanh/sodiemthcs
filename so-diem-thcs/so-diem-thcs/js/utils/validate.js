import { SCORE_MIN, SCORE_MAX } from '../config/scoring.config.js';

export function isValidScore(value) {
  if (value === null || value === undefined || value === '') return false;
  const number = Number(value);
  if (Number.isNaN(number)) return false;
  return number >= SCORE_MIN && number <= SCORE_MAX;
}

export function parseScoreInput(rawValue) {
  if (rawValue === null || rawValue === undefined || rawValue === '') return null;
  const normalized = String(rawValue).trim().replace(',', '.');
  if (normalized === '') return null;
  const number = Number(normalized);
  if (Number.isNaN(number)) return null;
  return clampScore(number);
}

export function clampScore(value) {
  return Math.min(SCORE_MAX, Math.max(SCORE_MIN, value));
}

export function isEmpty(value) {
  return value === null || value === undefined || String(value).trim() === '';
}

export function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}
