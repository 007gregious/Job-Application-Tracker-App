const USERS_KEY = 'jobtrackr_users';
const SESSION_KEY = 'jobtrackr_current_user';
const PASSWORD_ALGORITHM = 'PBKDF2';
const PASSWORD_HASH = 'SHA-256';
const PASSWORD_ITERATIONS = 210000;
const PASSWORD_KEY_LENGTH = 256;

const normalizeEmail = (email = '') => email.trim().toLowerCase();
const defaultProfile = () => ({
  headline: '',
  targetRole: '',
  location: '',
  linkedinUrl: '',
  portfolioUrl: '',
  photo: ''
});

const normalizeUser = (user = {}) => ({
  ...user,
  profile: {
    ...defaultProfile(),
    ...(user.profile || {})
  }
});

const toSessionUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  profile: user.profile || defaultProfile()
});

const bytesToBase64 = (bytes) => btoa(String.fromCharCode(...bytes));

const base64ToBytes = (base64) => Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));

const createSalt = () => {
  const salt = new Uint8Array(16);
  crypto.getRandomValues(salt);
  return bytesToBase64(salt);
};

const hashPassword = async (password, salt = createSalt()) => {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    PASSWORD_ALGORITHM,
    false,
    ['deriveBits']
  );

  const hashBuffer = await crypto.subtle.deriveBits(
    {
      name: PASSWORD_ALGORITHM,
      hash: PASSWORD_HASH,
      salt: base64ToBytes(salt),
      iterations: PASSWORD_ITERATIONS
    },
    keyMaterial,
    PASSWORD_KEY_LENGTH
  );

  return {
    algorithm: PASSWORD_ALGORITHM,
    hash: PASSWORD_HASH,
    iterations: PASSWORD_ITERATIONS,
    salt,
    value: bytesToBase64(new Uint8Array(hashBuffer))
  };
};

const constantTimeEqual = (left = '', right = '') => {
  if (left.length !== right.length) {
    return false;
  }

  let diff = 0;
  for (let index = 0; index < left.length; index += 1) {
    diff |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }

  return diff === 0;
};

const verifyPassword = async (password, storedHash) => {
  if (!storedHash?.salt || !storedHash?.value) {
    return false;
  }

  const candidate = await hashPassword(password, storedHash.salt);
  return constantTimeEqual(candidate.value, storedHash.value);
};

const createUserId = () => {
  if (crypto.randomUUID) {
    return crypto.randomUUID();
  }

  const randomBytes = new Uint8Array(16);
  crypto.getRandomValues(randomBytes);
  return Array.from(randomBytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
};

const sanitizeUrl = (value = '') => {
  const trimmed = value.trim();
  if (!trimmed) return '';

  try {
    const url = new URL(trimmed);
    return ['https:', 'http:'].includes(url.protocol) ? url.href : '';
  } catch {
    return '';
  }
};

const sanitizeProfile = (profilePayload = {}) => ({
  headline: (profilePayload.headline || '').trim(),
  targetRole: (profilePayload.targetRole || '').trim(),
  location: (profilePayload.location || '').trim(),
  linkedinUrl: sanitizeUrl(profilePayload.linkedinUrl),
  portfolioUrl: sanitizeUrl(profilePayload.portfolioUrl),
  photo: profilePayload.photo || ''
});

export const authService = {
  getUsers: () => {
    try {
      const rawUsers = localStorage.getItem(USERS_KEY);
      const parsedUsers = rawUsers ? JSON.parse(rawUsers) : [];
      return Array.isArray(parsedUsers) ? parsedUsers.map(normalizeUser) : [];
    } catch (error) {
      console.error('Failed to read users:', error);
      return [];
    }
  },

  saveUsers: (users) => {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  },

  signUp: async ({ name, email, password }) => {
    const normalizedEmail = normalizeEmail(email);
    const users = authService.getUsers();

    const existing = users.find((user) => user.email === normalizedEmail);
    if (existing) {
      throw new Error('An account with this email already exists');
    }

    const user = {
      id: createUserId(),
      name: name.trim(),
      email: normalizedEmail,
      passwordHash: await hashPassword(password),
      createdAt: new Date().toISOString(),
      profile: defaultProfile()
    };

    authService.saveUsers([...users, user]);
    localStorage.setItem(SESSION_KEY, JSON.stringify(toSessionUser(user)));

    return user;
  },

  signIn: async ({ email, password }) => {
    const normalizedEmail = normalizeEmail(email);
    const users = authService.getUsers();
    const userIndex = users.findIndex((item) => item.email === normalizedEmail);
    const user = users[userIndex];

    if (!user) {
      throw new Error('Invalid email or password');
    }

    let isValidPassword = await verifyPassword(password, user.passwordHash);

    if (!isValidPassword && user.password === password) {
      isValidPassword = true;
      users[userIndex] = {
        ...user,
        password: undefined,
        passwordHash: await hashPassword(password)
      };
      authService.saveUsers(users);
    }

    if (!isValidPassword) {
      throw new Error('Invalid email or password');
    }

    const sessionUser = toSessionUser(users[userIndex]);
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));

    return sessionUser;
  },

  getCurrentUser: () => {
    try {
      const rawUser = localStorage.getItem(SESSION_KEY);
      return rawUser ? JSON.parse(rawUser) : null;
    } catch (error) {
      console.error('Failed to read session:', error);
      return null;
    }
  },

  signOut: () => {
    localStorage.removeItem(SESSION_KEY);
  },

  updateProfile: (userId, profilePayload) => {
    const users = authService.getUsers();
    const userIndex = users.findIndex((user) => user.id === userId);

    if (userIndex === -1) {
      throw new Error('User not found');
    }

    const currentUser = users[userIndex];
    const updatedUser = {
      ...currentUser,
      name: (profilePayload.name ?? currentUser.name).trim(),
      profile: {
        ...currentUser.profile,
        ...sanitizeProfile(profilePayload.profile)
      }
    };

    const nextUsers = [...users];
    nextUsers[userIndex] = updatedUser;
    authService.saveUsers(nextUsers);

    const session = authService.getCurrentUser();
    if (session?.id === userId) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(toSessionUser(updatedUser)));
    }

    return toSessionUser(updatedUser);
  },

  getUserProfile: (userId) => {
    const user = authService.getUsers().find((item) => item.id === userId);
    return user ? { name: user.name, email: user.email, profile: user.profile } : null;
  }
};
