import React from 'react';
import { useApplications } from '../../hooks/useApplications';
import StatsCard from './StatsCard';
import RecentApplications from './RecentApplications';
import AnalyticsChart from './AnalyticsChart';
import { FaFileAlt, FaCheckCircle, FaClock, FaTimesCircle } from 'react-icons/fa';

const Dashboard = ({ userId }) => {
  const { applications, loading } = useApplications(userId);

  const stats = {
    total: applications.length,
    pending: applications.filter(app => app.status === 'Applied').length,
    interview: applications.filter(app => app.status === 'Interview').length,
    rejected: applications.filter(app => app.status === 'Rejected').length,
    accepted: applications.filter(app => app.status === 'Accepted').length
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

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

      {/* New Analytics Chart Section */}
      <AnalyticsChart applications={applications} />

      <RecentApplications applications={applications.slice(0, 5)} />
    </div>
  );
};

export default Dashboard;