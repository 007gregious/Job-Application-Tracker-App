const STORAGE_KEY = 'job_applications';

export const storageService = {
  getApplications: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return [];
    }
  },

  saveApplications: (applications) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(applications));
      return true;
    } catch (error) {
      console.error('Error saving to localStorage:', error);
      return false;
    }
  },

  addApplication: (application) => {
    const applications = storageService.getApplications();
    applications.push(application);
    return storageService.saveApplications(applications);
  },

  updateApplication: (updatedApplication) => {
    const applications = storageService.getApplications();
    const index = applications.findIndex(app => app.id === updatedApplication.id);
    if (index !== -1) {
      applications[index] = updatedApplication;
      return storageService.saveApplications(applications);
    }
    return false;
  },

  deleteApplication: (id) => {
    const applications = storageService.getApplications();
    const filtered = applications.filter(app => app.id !== id);
    return storageService.saveApplications(filtered);
  }
};