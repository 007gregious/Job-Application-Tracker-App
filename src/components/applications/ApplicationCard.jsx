import React, { useState } from 'react';
import { FaBuilding, FaMapMarkerAlt, FaMoneyBillAlt, FaCalendar, FaTrash, FaEdit } from 'react-icons/fa';
import { formatDate } from '../../utils/dateUtils';
import ApplicationForm from './ApplicationForm';
import Button from '../common/Button';

const ApplicationCard = ({ application, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  if (isEditing) {
    return (
      <div className="application-card editing">
        <ApplicationForm 
          applicationToEdit={application} 
          onSuccess={() => setIsEditing(false)}
        />
      </div>
    );
  }

  return (
    <div className={`application-card ${showDetails ? 'expanded' : ''}`}>
      <div className="card-header" onClick={() => setShowDetails(!showDetails)}>
        <div className="company-info">
          <FaBuilding className="company-icon" />
          <div>
            <h3>{application.company}</h3>
            <p className="position">{application.position}</p>
          </div>
        </div>
        <span className={`status-badge status-${application.status.toLowerCase()}`}>
          {application.status}
        </span>
      </div>

      <div className="card-body">
        <div className="quick-info">
          {application.location && (
            <span><FaMapMarkerAlt /> {application.location}</span>
          )}
          {application.salary && (
            <span><FaMoneyBillAlt /> {application.salary}</span>
          )}
          <span><FaCalendar /> {formatDate(application.appliedDate)}</span>
        </div>

        {showDetails && (
          <div className="details-section">
            {application.jobType && (
              <p><strong>Job Type:</strong> {application.jobType}</p>
            )}
            {application.contactPerson && (
              <p><strong>Contact:</strong> {application.contactPerson}</p>
            )}
            {application.contactEmail && (
              <p><strong>Email:</strong> {application.contactEmail}</p>
            )}
            {application.jobUrl && (
              <p>
                <strong>Job URL:</strong> 
                <a href={application.jobUrl} target="_blank" rel="noopener noreferrer">
                  View Job Posting
                </a>
              </p>
            )}
            {application.notes && (
              <div className="notes">
                <strong>Notes:</strong>
                <p>{application.notes}</p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="card-actions">
        <Button 
          variant="secondary" 
          size="small"
          onClick={() => setIsEditing(true)}
          icon={<FaEdit />}
        >
          Edit
        </Button>
        <Button 
          variant="danger" 
          size="small"
          onClick={() => {
            if (window.confirm('Are you sure you want to delete this application?')) {
              onDelete(application.id);
            }
          }}
          icon={<FaTrash />}
        >
          Delete
        </Button>
      </div>
    </div>
  );
};

export default ApplicationCard;