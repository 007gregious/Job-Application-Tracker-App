import React from 'react';
import { useApplications } from '../../hooks/useApplications';
import StatsCard from './StatsCard';
import RecentApplications from './RecentApplications';
import { FaFileAlt, FaCheckCircle, FaClock, FaTimesCircle } from 'react-icons/fa';

const Dashboard = () => {
  const { applications } = useApplications();

  const stats = {
    total: applications.length,
    pending: applications.filter(app => app.status === 'Applied').length,
    interview: applications.filter(app => app.status === 'Interview').length,
    rejected: applications.filter(app => app.status === 'Rejected').length,
    accepted: applications.filter(app => app.status === 'Accepted').length
  };

  return (
    <div className="dashboard">
      <h2>Dashboard</h2>
      
      <div className="stats-grid">
        <StatsCard 
          title="Total Applications" 
          value={stats.total}
          icon={<FaFileAlt />}
          color="blue"
        />
        <StatsCard 
          title="Pending" 
          value={stats.pending}
          icon={<FaClock />}
          color="yellow"
        />
        <StatsCard 
          title="Interviews" 
          value={stats.interview}
          icon={<FaCheckCircle />}
          color="green"
        />
        <StatsCard 
          title="Rejected" 
          value={stats.rejected}
          icon={<FaTimesCircle />}
          color="red"
        />
      </div>

      <RecentApplications applications={applications.slice(0, 5)} />
    </div>
  );
};

export default Dashboard;