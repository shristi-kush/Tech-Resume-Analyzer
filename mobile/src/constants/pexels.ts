/**
 * Stock photos from https://www.pexels.com (free to use).
 */
const q = 'auto=compress&cs=tinysrgb';

export const PexelsImages = {
  hero: `https://images.pexels.com/photos/2680270/pexels-photo-2680270.jpeg?${q}&w=1200`,
  resumeDesk: `https://images.pexels.com/photos/590022/pexels-photo-590022.jpeg?${q}&w=800`,
  hiring: `https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?${q}&w=800`,
  writing: `https://images.pexels.com/photos/590016/pexels-photo-590016.jpeg?${q}&w=800`,
  analytics: `https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?${q}&w=800`,
  teamwork: `https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?${q}&w=800`,
  laptop: `https://images.pexels.com/photos/669615/pexels-photo-669615.jpeg?${q}&w=800`,
  office: `https://images.pexels.com/photos/7688336/pexels-photo-7688336.jpeg?${q}&w=800`,
  interview: `https://images.pexels.com/photos/3183197/pexels-photo-3183197.jpeg?${q}&w=800`,
  success: `https://images.pexels.com/photos/3184296/pexels-photo-3184296.jpeg?${q}&w=800`,
  feedback: `https://images.pexels.com/photos/3183197/pexels-photo-3183197.jpeg?${q}&w=800`,
} as const;

export const PEXELS_ATTRIBUTION = 'Photos provided by Pexels';

/** Default header image per screen */
export const PageImages = {
  analyze: PexelsImages.laptop,
  feedback: PexelsImages.interview,
  about: PexelsImages.laptop,
  admin: PexelsImages.analytics,
  results: PexelsImages.success,
} as const;
