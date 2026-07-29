let currentUser = null;

export function isGoogleReady() {
  return typeof window !== 'undefined' && Boolean(window.google && window.google.accounts && window.google.accounts.id);
}

export function initGoogleAuth(clientId, onCredential) {
  if (!isGoogleReady() || !clientId) return false;
  window.google.accounts.id.initialize({
    client_id: clientId,
    callback: (response) => handleCredential(response, onCredential),
    auto_select: false
  });
  return true;
}

function decodeJwt(token) {
  const payloadPart = token.split('.')[1];
  const decoded = atob(payloadPart.replace(/-/g, '+').replace(/_/g, '/'));
  return JSON.parse(decodeURIComponent(escape(decoded)));
}

function handleCredential(response, onCredential) {
  try {
    const payload = decodeJwt(response.credential);
    currentUser = {
      name: payload.name,
      email: payload.email,
      avatarUrl: payload.picture,
      sub: payload.sub
    };
    if (onCredential) onCredential(currentUser, null);
  } catch (error) {
    if (onCredential) onCredential(null, error);
  }
}

export function renderGoogleButton(container, options = {}) {
  if (!isGoogleReady()) return false;
  window.google.accounts.id.renderButton(container, {
    theme: options.theme || 'outline',
    size: options.size || 'large',
    width: options.width,
    locale: 'vi',
    text: 'continue_with',
    shape: 'pill'
  });
  return true;
}

export function signOutGoogle() {
  currentUser = null;
  if (isGoogleReady()) window.google.accounts.id.disableAutoSelect();
}

export function getCurrentGoogleUser() {
  return currentUser;
}
