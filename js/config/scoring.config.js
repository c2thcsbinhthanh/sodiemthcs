export const TX_SLOT_COUNT = 4;

export const SCORE_WEIGHTS = {
  tx: 1,
  gk: 2,
  ck: 3
};

export const ROUND_DECIMALS = 1;

export const SCORE_MIN = 0;

export const SCORE_MAX = 10;

export const YEAR_WEIGHTS = {
  hk1: 1,
  hk2: 2
};

export const STUDENT_TYPE_TIERS = [
  {
    id: 'trungbinh',
    label: 'Học sinh trung bình',
    minAverage: 5.0,
    minSubjectAverage: 3.5,
    color: 'tier-trungbinh'
  },
  {
    id: 'dat',
    label: 'Học sinh đạt',
    minAverage: 6.5,
    minSubjectAverage: 5.0,
    color: 'tier-dat'
  },
  {
    id: 'kha',
    label: 'Học sinh khá',
    minAverage: 7.0,
    minSubjectAverage: 6.0,
    color: 'tier-kha'
  },
  {
    id: 'gioi',
    label: 'Học sinh giỏi',
    minAverage: 8.0,
    minSubjectAverage: 6.5,
    color: 'tier-gioi'
  },
  {
    id: 'xuatsac',
    label: 'Học sinh xuất sắc',
    minAverage: 9.0,
    minSubjectAverage: 8.0,
    color: 'tier-xuatsac'
  }
];

export const STATUS_COLOR = {
  DAT: 'success',
  GAN_DAT: 'warning',
  CAN_CAI_THIEN: 'danger'
};

export const GAN_DAT_THRESHOLD = 0.5;

export function findTierById(tierId) {
  return STUDENT_TYPE_TIERS.find((tier) => tier.id === tierId) || null;
}
