const USERS_KEY = 'jobtrackr_users';
const SESSION_KEY = 'jobtrackr_current_user';

const normalizeEmail = (email = '') => email.trim().toLowerCase();

export const authService = {
  getUsers: () => {
    try {
      const rawUsers = localStorage.getItem(USERS_KEY);
      return rawUsers ? JSON.parse(rawUsers) : [];
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
      createdAt: new Date().toISOString()
    };

    authService.saveUsers([...users, user]);
    localStorage.setItem(SESSION_KEY, JSON.stringify({ id: user.id, name: user.name, email: user.email }));

    return user;
  },

  signIn: ({ email, password }) => {
    const normalizedEmail = normalizeEmail(email);
    const users = authService.getUsers();
    const user = users.find((item) => item.email === normalizedEmail && item.password === password);

    if (!user) {
      throw new Error('Invalid email or password');
    }

    localStorage.setItem(SESSION_KEY, JSON.stringify({ id: user.id, name: user.name, email: user.email }));

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
  }
};
