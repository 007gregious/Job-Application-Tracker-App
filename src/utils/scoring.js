const normalize = (value = '') => value.toString().trim().toLowerCase();

const tokenize = (value = '') => normalize(value)
  .replace(/[^a-z0-9\s]/g, ' ')
  .split(/\s+/)
  .filter(Boolean);

const scoreKeywordMatch = (position = '', notes = '') => {
  const tokens = tokenize(`${position} ${notes}`);
  if (tokens.length === 0) return 50;

  const unique = Array.from(new Set(tokens));
  const meaningful = unique.filter((token) => token.length > 3);
  return Math.round((meaningful.length / unique.length) * 100);
};

const scoreLocationFit = (location = '') => {
  const locationValue = normalize(location);
  if (!locationValue) return 60;
  if (locationValue.includes('remote')) return 95;
  if (locationValue.includes('hybrid')) return 80;
  return 70;
};

const scoreSeniorityFit = (position = '') => {
  const value = normalize(position);
  if (!value) return 60;
  if (/\b(senior|lead|staff|principal)\b/.test(value)) return 80;
  if (/\b(intern|junior|entry)\b/.test(value)) return 70;
  return 85;
};

const scoreVisaRemoteCompatibility = (jobType = '', notes = '') => {
  const value = normalize(`${jobType} ${notes}`);
  if (/\b(no visa|without sponsorship|no sponsorship)\b/.test(value)) return 25;
  if (/\bremote\b/.test(value)) return 95;
  return 75;
};

export const buildFitScore = ({ position, notes, location, jobType }) => {
  const keyword = scoreKeywordMatch(position, notes);
  const locationFit = scoreLocationFit(location);
  const seniority = scoreSeniorityFit(position);
  const visaRemote = scoreVisaRemoteCompatibility(jobType, notes);

  const total = Math.round((keyword * 0.35) + (locationFit * 0.2) + (seniority * 0.2) + (visaRemote * 0.25));
  return {
    total,
    breakdown: {
      keyword,
      location: locationFit,
      seniority,
      visaRemote
    }
  };
};

export const buildReadinessScore = ({ resumeVersion, coverLetter, answers = {}, fitScore }) => {
  let score = 0;
  if (resumeVersion?.trim()) score += 30;
  if (coverLetter?.trim()?.length >= 120) score += 30;

  const answerCount = Object.values(answers).filter((answer) => answer?.trim()?.length >= 10).length;
  score += Math.min(20, answerCount * 7);
  score += Math.round((fitScore || 0) * 0.2);
  return Math.min(100, score);
};
