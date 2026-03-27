const STORAGE_KEY = 'job_applications';
const getUserStorageKey = (userId) => (userId ? `${STORAGE_KEY}:${userId}` : STORAGE_KEY);

export const storageService = {
  getApplications: (userId) => {
    try {
      const userData = localStorage.getItem(getUserStorageKey(userId));
      if (userData) {
        return JSON.parse(userData);
      }

      if (userId) {
        const legacyData = localStorage.getItem(STORAGE_KEY);
        return legacyData ? JSON.parse(legacyData) : [];
      }

      return [];
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return [];
    }
  },

  saveApplications: (applications, userId) => {
    try {
      localStorage.setItem(getUserStorageKey(userId), JSON.stringify(applications));
      return true;
    } catch (error) {
      console.error('Error saving to localStorage:', error);
      return false;
    }
  },

  addApplication: (application, userId) => {
    const applications = storageService.getApplications(userId);
    applications.push(application);
    return storageService.saveApplications(applications, userId);
  },

  updateApplication: (updatedApplication, userId) => {
    const applications = storageService.getApplications(userId);
    const index = applications.findIndex(app => app.id === updatedApplication.id);
    if (index !== -1) {
      applications[index] = updatedApplication;
      return storageService.saveApplications(applications, userId);
    }
    return false;
  },

  deleteApplication: (id, userId) => {
    const applications = storageService.getApplications(userId);
    const filtered = applications.filter(app => app.id !== id);
    return storageService.saveApplications(filtered, userId);
  }
};
