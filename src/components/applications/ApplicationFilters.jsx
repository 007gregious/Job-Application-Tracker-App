import React from 'react';
import Input from '../common/Input';
import { APPLICATION_STATUS } from '../../utils/constants';

const ApplicationFilters = ({ filters, setFilters }) => {
  return (
    <div className="filters-section">
      <Input
        type="search"
        placeholder="Search by company or position..."
        value={filters.search}
        onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
      />
      
      <Input
        type="select"
        label="Filter by Status"
        value={filters.status}
        onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
        options={[
          { value: '', label: 'All Status' },
          ...APPLICATION_STATUS
        ]}
      />
    </div>
  );
};

export default ApplicationFilters;