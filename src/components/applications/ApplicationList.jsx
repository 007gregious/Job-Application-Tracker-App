import React, { useState } from 'react';
import { useApplications } from '../../hooks/useApplications';
import ApplicationCard from './ApplicationCard';
import ApplicationFilters from './ApplicationFilters';
import ExportButton from '../export/ExportButton';
import Button from '../common/Button';
import { FaSortAmountDown, FaSortAmountUp } from 'react-icons/fa';

const ApplicationList = () => {
  const { applications, deleteApplication } = useApplications();
  const [filters, setFilters] = useState({
    status: '',
    dateRange: '',
    search: ''
  });
  const [sortConfig, setSortConfig] = useState({
    key: 'appliedDate',
    direction: 'desc'
  });

  const handleSort = (key) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc'
    });
  };

  const filteredApplications = applications
    .filter(app => {
      // Status filter
      if (filters.status && app.status !== filters.status) return false;
      
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        return (
          app.company.toLowerCase().includes(searchLower) ||
          app.position.toLowerCase().includes(searchLower)
        );
      }
      return true;
    })
    .sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      
      if (sortConfig.direction === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  return (
    <div className="application-list">
      <div className="list-header">
        <h2>My Applications ({filteredApplications.length})</h2>
        <div className="list-actions">
          <ExportButton data={filteredApplications} />
          <Button 
            variant="secondary"
            onClick={() => handleSort('appliedDate')}
            icon={sortConfig.direction === 'asc' ? <FaSortAmountUp /> : <FaSortAmountDown />}
          >
            Sort by Date
          </Button>
        </div>
      </div>

      <ApplicationFilters filters={filters} setFilters={setFilters} />

      {filteredApplications.length === 0 ? (
        <div className="empty-state">
          <p>No applications found. Start tracking your job applications!</p>
        </div>
      ) : (
        <div className="applications-grid">
          {filteredApplications.map(application => (
            <ApplicationCard 
              key={application.id} 
              application={application}
              onDelete={deleteApplication}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ApplicationList;
