const USERS_KEY = 'jobtrackr_users';
const SESSION_KEY = 'jobtrackr_current_user';

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

export const authService = {
  getUsers: () => {
    try {
      const rawUsers = localStorage.getItem(USERS_KEY);
      const parsedUsers = rawUsers ? JSON.parse(rawUsers) : [];
      return parsedUsers.map(normalizeUser);
    } catch (error) {
      console.error('Failed to read users:', error);
      return [];
    }
  },

  saveUsers: (users) => {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  },

  signUp: ({ name, email, password }) => {
    const normalizedEmail = normalizeEmail(email);
    const users = authService.getUsers();

    const existing = users.find((user) => user.email === normalizedEmail);
    if (existing) {
      throw new Error('An account with this email already exists');
    }

    const user = {
      id: Date.now().toString(),
      name: name.trim(),
      email: normalizedEmail,
      password,
      createdAt: new Date().toISOString(),
      profile: defaultProfile()
    };

    authService.saveUsers([...users, user]);
    localStorage.setItem(SESSION_KEY, JSON.stringify(toSessionUser(user)));

    return user;
  },

  signIn: ({ email, password }) => {
    const normalizedEmail = normalizeEmail(email);
    const users = authService.getUsers();
    const user = users.find((item) => item.email === normalizedEmail && item.password === password);

    if (!user) {
      throw new Error('Invalid email or password');
    }

    localStorage.setItem(SESSION_KEY, JSON.stringify(toSessionUser(user)));

    return user;
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
        ...profilePayload.profile
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
