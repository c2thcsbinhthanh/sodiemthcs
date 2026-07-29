import { ROUND_DECIMALS } from '../config/scoring.config.js';

export function roundScore(value) {
  if (value === null || value === undefined || Number.isNaN(value)) return null;
  const factor = 10 ** ROUND_DECIMALS;
  return Math.round(value * factor) / factor;
}

export function formatScore(value) {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  return value.toFixed(ROUND_DECIMALS);
}

export function formatPercent(value) {
  if (value === null || value === undefined || Number.isNaN(value)) return '0%';
  return `${Math.round(value)}%`;
}

export function formatSigned(value) {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  const rounded = roundScore(value);
  return rounded > 0 ? `+${formatScore(rounded)}` : formatScore(rounded);
}

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function formatAbsenceUnit(value) {
  if (value === null || value === undefined) return '0';
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

export function removeDiacritics(text) {
  if (!text) return '';
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
}

export function truncate(text, maxLength) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1)}…`;
}
