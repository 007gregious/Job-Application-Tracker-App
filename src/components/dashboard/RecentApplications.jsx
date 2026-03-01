import React from 'react';
import { formatDate } from '../../utils/dateUtils';

const RecentApplications = ({ applications }) => {
  return (
    <div className="recent-applications">
      <h3>Recent Applications</h3>
      
      {applications.length === 0 ? (
        <p className="no-data">No applications yet. Start tracking today!</p>
      ) : (
        <div className="recent-list">
          {applications.map(app => (
            <div key={app.id} className="recent-item">
              <div className="recent-info">
                <h4>{app.company}</h4>
                <p>{app.position}</p>
              </div>
              <div className="recent-meta">
                <span className={`status-badge status-${app.status.toLowerCase()}`}>
                  {app.status}
                </span>
                <span className="recent-date">{formatDate(app.appliedDate)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentApplications;