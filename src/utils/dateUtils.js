import { format, formatDistance, isValid, parseISO } from 'date-fns';

export const formatDate = (date) => {
  if (!date) return 'N/A';
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  return isValid(parsedDate) ? format(parsedDate, 'MMM dd, yyyy') : 'N/A';
};

export const formatRelativeTime = (date) => {
  if (!date) return 'N/A';
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  return isValid(parsedDate) ? formatDistance(parsedDate, new Date(), { addSuffix: true }) : 'N/A';
};

export const getDaysSince = (date) => {
  if (!date) return 0;
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(parsedDate)) return 0;
  
  const diffTime = Math.abs(new Date() - parsedDate);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};