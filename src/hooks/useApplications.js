import React, { createContext, useContext, useState, useEffect } from 'react';
import { storageService } from '../services/storageService';

const ApplicationContext = createContext();

export const useApplications = () => {
  const context = useContext(ApplicationContext);
  if (!context) {
    throw new Error('useApplications must be used within an ApplicationProvider');
  }
  return context;
};

export const ApplicationProvider = ({ children }) => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = () => {
    const data = storageService.getApplications();
    setApplications(data);
    setLoading(false);
  };

  const addApplication = (application) => {
    const updated = [...applications, application];
    setApplications(updated);
    storageService.saveApplications(updated);
  };

  const updateApplication = (updatedApplication) => {
    const updated = applications.map(app => 
      app.id === updatedApplication.id ? updatedApplication : app
    );
    setApplications(updated);
    storageService.saveApplications(updated);
  };

  const deleteApplication = (id) => {
    const updated = applications.filter(app => app.id !== id);
    setApplications(updated);
    storageService.saveApplications(updated);
  };

  const value = {
    applications,
    loading,
    addApplication,
    updateApplication,
    deleteApplication
  };

  return (
    <ApplicationContext.Provider value={value}>
      {children}
    </ApplicationContext.Provider>
  );
};