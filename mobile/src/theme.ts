/**
 * NeoPOP-inspired tokens — light canvas, sporty green accent, generous spacing.
 * @see https://cred.club/design
 */
import { fonts } from './fonts';

export const colors = {
  primary: '#0F172A',
  primaryMuted: '#334155',
  accent: '#16C964',
  accentMuted: 'rgba(22, 201, 100, 0.12)',
  accentDark: '#0E9F52',
  onAccent: '#0A0A0A',
  popBlue: '#4F6BF6',
  popYellow: '#CA8A04',
  popGreen: '#16C964',
  reddit: '#EA580C',
  redditMuted: 'rgba(234, 88, 12, 0.1)',
  background: '#F4F6F8',
  backgroundAlt: '#EEF1F4',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  surfaceHover: '#F8FAFC',
  border: '#E2E8F0',
  borderStrong: '#CBD5E1',
  text: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  textOnImage: '#FFFFFF',
  textOnImageMuted: 'rgba(255, 255, 255, 0.88)',
  success: '#16C964',
  successBg: 'rgba(22, 201, 100, 0.12)',
  warning: '#CA8A04',
  warningBg: 'rgba(202, 138, 4, 0.12)',
  danger: '#DC2626',
  dangerBg: 'rgba(220, 38, 38, 0.1)',
  overlay: 'rgba(15, 23, 42, 0.45)',
};

/** Generous spacing — information in the spotlight, not cramped */
export const spacing = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

export const radius = {
  sm: 8,
  md: 14,
  lg: 20,
  xl: 28,
  full: 999,
};

export const layout = {
  screenPadding: 20,
  cardPadding: 20,
  sectionGap: 32,
  rowHeight: 52,
  inputHeight: 52,
  buttonHeight: 52,
  tabHeight: 60,
  bannerHeight: 140,
  avatarMd: 52,
  avatarLg: 64,
};

export const typography = {
  overline: {
    fontFamily: fonts.bold,
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: 'uppercase' as const,
    color: colors.textMuted,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 28,
    color: colors.text,
    lineHeight: 34,
    letterSpacing: -0.5,
  },
  heading: {
    fontFamily: fonts.bold,
    fontSize: 17,
    color: colors.text,
    lineHeight: 24,
  },
  body: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  bodyStrong: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.text,
    lineHeight: 24,
  },
  caption: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 19,
  },
  captionMedium: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 19,
  },
  captionBold: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 19,
  },
  metric: {
    fontFamily: fonts.bold,
    fontSize: 32,
    color: colors.text,
    lineHeight: 38,
    letterSpacing: -0.5,
  },
};

export const feedAccents = {
  default: colors.popBlue,
  profile: colors.popBlue,
  skills: colors.accent,
  checklist: colors.accentDark,
  courses: colors.popBlue,
  admin: colors.textMuted,
};

/** Minimal elevation — borders carry most separation */
export const shadow = {
  card: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  pop: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
};
