export const CHART_TITLES: Record<string, string> = {
  predicted_field: 'Tech track',
  user_level: 'Experience level',
  resume_score: 'Resume score',
  country: 'Upload country',
  region: 'Upload region',
  city: 'Upload city',
  upload_source: 'Upload source',
  feedback_rating: 'Feedback rating',
};

export const PROFILE_CHART_ORDER = [
  'predicted_field',
  'user_level',
  'resume_score',
] as const;

export const CHART_ORDER = [
  'predicted_field',
  'user_level',
  'resume_score',
  'country',
  'region',
  'city',
  'upload_source',
  'feedback_rating',
] as const;
