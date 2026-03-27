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

export const ApplicationProvider = ({ children, currentUserId }) => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadApplications(currentUserId);
  }, [currentUserId]);

  const loadApplications = (userId) => {
    if (!userId) {
      setApplications([]);
      setLoading(false);
      return;
    }

    const data = storageService.getApplications(userId);
    setApplications(data);
    setLoading(false);
  };

  const addApplication = (application) => {
    if (!currentUserId) return;
    const updated = [...applications, application];
    setApplications(updated);
    storageService.saveApplications(updated, currentUserId);
  };

  const updateApplication = (updatedApplication) => {
    if (!currentUserId) return;
    const updated = applications.map(app => 
      app.id === updatedApplication.id ? updatedApplication : app
    );
    setApplications(updated);
    storageService.saveApplications(updated, currentUserId);
  };

  const deleteApplication = (id) => {
    if (!currentUserId) return;
    const updated = applications.filter(app => app.id !== id);
    setApplications(updated);
    storageService.saveApplications(updated, currentUserId);
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
