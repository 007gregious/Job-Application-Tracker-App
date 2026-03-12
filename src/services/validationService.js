export const validateApplication = (formData) => {
  const errors = {};

  if (!formData.company?.trim()) {
    errors.company = 'Company name is required';
  }

  if (!formData.position?.trim()) {
    errors.position = 'Position is required';
  }

  if (!formData.appliedDate) {
    errors.appliedDate = 'Applied date is required';
  }

  if (formData.contactEmail && !isValidEmail(formData.contactEmail)) {
    errors.contactEmail = 'Invalid email format';
  }

  if (formData.jobUrl && !isValidUrl(formData.jobUrl)) {
    errors.jobUrl = 'Invalid URL format';
  }
  if (formData.status === 'Rejected' && !formData.rejectionReason?.trim()) {
    errors.rejectionReason = 'Rejection reason is required for feedback tracking';
  }

  return errors;
};

const isValidEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};