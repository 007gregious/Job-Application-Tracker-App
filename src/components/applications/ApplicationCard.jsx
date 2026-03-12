import React, { useMemo, useState } from 'react';
import { FaBuilding, FaMapMarkerAlt, FaMoneyBillAlt, FaCalendar, FaTrash, FaEdit } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { formatDate } from '../../utils/dateUtils';
import ApplicationForm from './ApplicationForm';
import Button from '../common/Button';
import { useApplications } from '../../hooks/useApplications';
import { STATUS_FLOW, TERMINAL_STATUSES } from '../../utils/constants';

const STATUS_PROGRESS = {
  Applied: 25,
  Interview: 50,
  'Technical Test': 75,
  Offer: 90,
  Accepted: 100,
  Rejected: 100,
  Withdrawn: 100
};

const ApplicationCard = ({ application, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState(application.rejectionReason || '');
  const [rejectionError, setRejectionError] = useState('');
  const { updateApplication } = useApplications();

  const currentStepIndex = STATUS_FLOW.indexOf(application.status);
  const nextStatuses = useMemo(() => {
    if (TERMINAL_STATUSES.includes(application.status) || currentStepIndex === -1) {
      return [];
    }

    const pipelineStatuses = STATUS_FLOW.slice(currentStepIndex + 1);
    return [...pipelineStatuses, 'Accepted', 'Rejected', 'Withdrawn'];
  }, [application.status, currentStepIndex]);

  const progressValue = STATUS_PROGRESS[application.status] || 0;

  const handleStatusUpdate = (nextStatus) => {
    if (nextStatus === 'Rejected') {
      setIsRejectModalOpen(true);
      return;
    }

    updateApplication({ ...application, status: nextStatus });
    toast.success(`Status updated to ${nextStatus}`);
  };

  const handleRejectSubmit = (e) => {
    e.preventDefault();

    if (!rejectionReason.trim()) {
      setRejectionError('Rejection reason is required.');
      return;
    }

    updateApplication({
      ...application,
      status: 'Rejected',
      rejectionReason: rejectionReason.trim()
    });

    setIsRejectModalOpen(false);
    setRejectionError('');
    toast.success('Status updated to Rejected with feedback saved');
  };

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
    <>
      <div className={`application-card ${showDetails ? 'expanded' : ''}`}>
        <div className="card-header" onClick={() => setShowDetails(!showDetails)}>
          <div className="company-info">
            <FaBuilding className="company-icon" />
            <div>
              <h3>{application.company}</h3>
              <p className="position">{application.position}</p>
            </div>
          </div>
          <span className={`status-badge status-${application.status.toLowerCase().replace(/\s+/g, '')}`}>
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

          <div className="status-progress-wrapper" onClick={(e) => e.stopPropagation()}>
            <div className="status-progress-label-row">
              <span>Application progress</span>
              <strong>{progressValue}%</strong>
            </div>
            <div className="status-progress-track">
              <div className="status-progress-fill" style={{ width: `${progressValue}%` }} />
            </div>

            {nextStatuses.length > 0 && (
              <div className="status-editor" aria-label="Quick status update">
                <p>Update status</p>
                <div className="status-editor-actions">
                  {nextStatuses.map((status) => (
                    <button
                      key={status}
                      type="button"
                      className="status-chip"
                      onClick={() => handleStatusUpdate(status)}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            )}
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

        {application.rejectionReason && (
          <div className="rejection-feedback">
            <strong>Rejection feedback:</strong>
            <p>{application.rejectionReason}</p>
          </div>
        )}

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

      {isRejectModalOpen && (
        <div className="modal-overlay" onClick={() => setIsRejectModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Why was this application rejected?</h3>
            <p>Please provide a reason so you can collect useful feedback for future applications.</p>
            <form onSubmit={handleRejectSubmit}>
              <textarea
                value={rejectionReason}
                onChange={(e) => {
                  setRejectionReason(e.target.value);
                  if (rejectionError) setRejectionError('');
                }}
                placeholder="e.g., Missing specific tool experience, role paused, etc."
                required
                rows="4"
              />
              {rejectionError && <span className="error-message">{rejectionError}</span>}
              <div className="modal-actions">
                <Button variant="secondary" onClick={() => setIsRejectModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary">Save feedback</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default ApplicationCard;
