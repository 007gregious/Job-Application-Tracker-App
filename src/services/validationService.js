const SAFE_URL_PROTOCOLS = ['https:', 'http:'];

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

  if (formData.jobUrl && !isSafeHttpUrl(formData.jobUrl)) {
    errors.jobUrl = 'Enter a valid HTTP or HTTPS URL';
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

export const isSafeHttpUrl = (url) => {
  try {
    return SAFE_URL_PROTOCOLS.includes(new URL(url).protocol);
  } catch {
    return false;
  }
};
