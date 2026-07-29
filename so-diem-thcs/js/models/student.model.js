export function createStudentProfile({
  name = '',
  className = '',
  level = 'thcs',
  role = 'hocsinh',
  mode = 'quick',
  authProvider = null,
  email = null,
  avatarUrl = null
} = {}) {
  const timestamp = new Date().toISOString();
  return {
    id: `student_${Date.now()}`,
    name,
    className,
    level,
    role,
    mode,
    authProvider,
    email,
    avatarUrl,
    createdAt: timestamp,
    updatedAt: timestamp
  };
}

export function isProfileComplete(profile) {
  return Boolean(profile && profile.level && profile.role && profile.mode);
}
