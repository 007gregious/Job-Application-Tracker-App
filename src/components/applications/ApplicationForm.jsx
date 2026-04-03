import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';
import Input from '../common/Input';
import Button from '../common/Button';
import { useApplications } from '../../hooks/useApplications';
import { validateApplication } from '../../services/validationService';
import { APPLICATION_STATUS } from '../../utils/constants';
import { buildFitScore, buildReadinessScore } from '../../utils/scoring';

const ApplicationForm = ({ onSuccess, applicationToEdit }) => {
  const { addApplication, updateApplication } = useApplications();
  const [formData, setFormData] = useState({
    company: applicationToEdit?.company || '',
    position: applicationToEdit?.position || '',
    location: applicationToEdit?.location || '',
    salary: applicationToEdit?.salary || '',
    jobType: applicationToEdit?.jobType || 'Full-time',
    status: applicationToEdit?.status || 'Applied',
    appliedDate: applicationToEdit?.appliedDate || new Date().toISOString().split('T')[0],
    contactPerson: applicationToEdit?.contactPerson || '',
    contactEmail: applicationToEdit?.contactEmail || '',
    jobUrl: applicationToEdit?.jobUrl || '',
    notes: applicationToEdit?.notes || '',
    rejectionReason: applicationToEdit?.rejectionReason || '',
    resumeVersion: applicationToEdit?.applyPacket?.resumeVersion || '',
    coverLetter: applicationToEdit?.applyPacket?.coverLetter || '',
    answerWhyRole: applicationToEdit?.applyPacket?.answers?.whyThisRole || '',
    answerSalaryExpectation: applicationToEdit?.applyPacket?.answers?.salaryExpectation || '',
    answerAvailability: applicationToEdit?.applyPacket?.answers?.availability || ''
  });
  
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const validationErrors = validateApplication(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error('Please fix the errors before submitting');
      return;
    }

    const answers = {
      whyThisRole: formData.answerWhyRole,
      salaryExpectation: formData.answerSalaryExpectation,
      availability: formData.answerAvailability
    };

    const fitScore = buildFitScore(formData);
    const readinessScore = buildReadinessScore({
      resumeVersion: formData.resumeVersion,
      coverLetter: formData.coverLetter,
      answers,
      fitScore: fitScore.total
    });

    const payload = {
      ...formData,
      applyPacket: {
        resumeVersion: formData.resumeVersion,
        coverLetter: formData.coverLetter,
        answers,
        fitScore: fitScore.total,
        scoreBreakdown: fitScore.breakdown,
        readinessScore,
        confidenceScore: fitScore.total
      },
      queueStatus: applicationToEdit?.queueStatus || 'draft'
    };

    if (applicationToEdit) {
      updateApplication({ ...payload, id: applicationToEdit.id });
      toast.success('Application updated successfully!');
    } else {
      addApplication({ ...payload, id: uuidv4() });
      toast.success('Application added successfully!');
    }
    
    if (onSuccess) onSuccess();
  };

  return (
    <div className="application-form">
      <h2>{applicationToEdit ? 'Edit Application' : 'Add New Application'}</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <Input
            label="Company"
            name="company"
            value={formData.company}
            onChange={handleChange}
            required
            error={errors.company}
            placeholder="Enter company name"
          />
          
          <Input
            label="Position"
            name="position"
            value={formData.position}
            onChange={handleChange}
            required
            error={errors.position}
            placeholder="Enter job title"
          />
        </div>

        <div className="form-row">
          <Input
            label="Location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="City, State (Remote)"
          />
          
          <Input
            label="Salary"
            name="salary"
            value={formData.salary}
            onChange={handleChange}
            placeholder="e.g., $80,000 - $100,000"
          />
        </div>

        <div className="form-row">
          <Input
            type="select"
            label="Job Type"
            name="jobType"
            value={formData.jobType}
            onChange={handleChange}
            options={[
              { value: 'Full-time', label: 'Full-time' },
              { value: 'Part-time', label: 'Part-time' },
              { value: 'Contract', label: 'Contract' },
              { value: 'Internship', label: 'Internship' },
              { value: 'Remote', label: 'Remote' }
            ]}
          />
          
          <Input
            type="select"
            label="Status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            options={APPLICATION_STATUS}
          />
        </div>

        <div className="form-row">
          <Input
            type="date"
            label="Applied Date"
            name="appliedDate"
            value={formData.appliedDate}
            onChange={handleChange}
            required
            error={errors.appliedDate}
          />
          
          <Input
            label="Contact Person"
            name="contactPerson"
            value={formData.contactPerson}
            onChange={handleChange}
            placeholder="HR Manager name"
          />
        </div>

        <div className="form-row">
          <Input
            label="Contact Email"
            type="email"
            name="contactEmail"
            value={formData.contactEmail}
            onChange={handleChange}
            placeholder="hr@company.com"
          />
          
          <Input
            label="Job URL"
            type="url"
            name="jobUrl"
            value={formData.jobUrl}
            onChange={handleChange}
            placeholder="https://..."
          />
        </div>

        <Input
          type="textarea"
          label="Notes"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          placeholder="Add any additional notes about the application..."
        />
        <h3>Apply Packet</h3>
        <div className="form-row">
          <Input
            label="Resume Version ID"
            name="resumeVersion"
            value={formData.resumeVersion}
            onChange={handleChange}
            placeholder="e.g., resume-v3-product"
          />
          <Input
            type="textarea"
            label="Why this role?"
            name="answerWhyRole"
            value={formData.answerWhyRole}
            onChange={handleChange}
            placeholder="Short answer template for ATS forms"
          />
        </div>
        <div className="form-row">
          <Input
            label="Salary expectation"
            name="answerSalaryExpectation"
            value={formData.answerSalaryExpectation}
            onChange={handleChange}
            placeholder="e.g., Open to market range"
          />
          <Input
            label="Start availability"
            name="answerAvailability"
            value={formData.answerAvailability}
            onChange={handleChange}
            placeholder="e.g., 2 weeks notice"
          />
        </div>
        <Input
          type="textarea"
          label="Generated cover letter"
          name="coverLetter"
          value={formData.coverLetter}
          onChange={handleChange}
          placeholder="Paste generated cover letter draft here..."
        />

        {formData.status === 'Rejected' && (
          <Input
            type="textarea"
            label="Rejection Reason"
            name="rejectionReason"
            value={formData.rejectionReason}
            onChange={handleChange}
            required
            error={errors.rejectionReason}
            placeholder="Capture why the process ended in rejection"
          />
        )}

        <div className="form-actions">
          <Button type="submit" variant="primary">
            {applicationToEdit ? 'Update Application' : 'Save Application'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ApplicationForm;
