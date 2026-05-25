import Constants from 'expo-constants';
import { Platform } from 'react-native';
import {
  getResumeFileValidationError,
  getResumeLinkValidationError,
} from '../utils/resumeLink';

const PRODUCTION_API = 'https://tech-resume-analyzer-1.onrender.com';
const LOCAL_API_PORT = 5000;

/** Metro / Expo Go host (your PC's LAN IP when testing on a physical device). */
function getMetroLanHost(): string | null {
  const hostUri =
    Constants.expoConfig?.hostUri ??
    (Constants.expoGoConfig as { debuggerHost?: string } | undefined)?.debuggerHost;
  if (!hostUri) return null;
  const host = hostUri.split(':')[0];
  if (host && host !== 'localhost' && host !== '127.0.0.1') {
    return host;
  }
  return null;
}

/** Map localhost in .env to a host the phone/emulator can reach. */
function rewriteLocalhostUrl(url: string): string {
  try {
    const parsed = new URL(url);
    if (!['localhost', '127.0.0.1'].includes(parsed.hostname)) {
      return url.replace(/\/$/, '');
    }
    const port = parsed.port || String(LOCAL_API_PORT);
    const lan = getMetroLanHost();
    if (lan) {
      return `http://${lan}:${port}`;
    }
    if (Platform.OS === 'android') {
      return `http://10.0.2.2:${port}`;
    }
    return `http://127.0.0.1:${port}`;
  } catch {
    return url.replace(/\/$/, '');
  }
}

function normalizeApiUrl(raw: string): string {
  let url = raw.trim().replace(/\/$/, '');
  if (/^https:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i.test(url)) {
    url = url.replace(/^https:/i, 'http:');
  }
  return rewriteLocalhostUrl(url);
}

/**
 * Resolve Flask API URL:
 * - EXPO_PUBLIC_API_URL wins if set (use http://localhost:5000 for local dev)
 * - app.json extra.apiUrl (production default)
 * - Dev fallback: Metro LAN IP, Android emulator 10.0.2.2, or localhost
 */
function resolveApiBase(): string {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return normalizeApiUrl(process.env.EXPO_PUBLIC_API_URL);
  }

  const fromExtra = Constants.expoConfig?.extra?.apiUrl as string | undefined;
  if (fromExtra) {
    return fromExtra.replace(/\/$/, '');
  }

  if (!__DEV__) {
    return PRODUCTION_API;
  }

  const lan = getMetroLanHost();
  if (lan) {
    return `http://${lan}:${LOCAL_API_PORT}`;
  }

  if (Platform.OS === 'android') {
    return `http://10.0.2.2:${LOCAL_API_PORT}`;
  }

  return `http://127.0.0.1:${LOCAL_API_PORT}`;
}

export const API_BASE = resolveApiBase();

if (__DEV__) {
  console.log('[API] Using backend:', API_BASE);
}

export type AnalysisMode = 'nlp' | 'ollama';

export type AiAnalysis = {
  summary: string;
  strengths: string[];
  weaknesses: string[];
  improvement_tips: string[];
  career_track: string;
  overall_score: number;
};

export type YoutubeVideo = {
  applicable: boolean;
  title: string;
  url: string;
  category?: string;
  reason?: string;
};

export type AnalyzeResult = {
  analysis_mode: AnalysisMode;
  profile: {
    name?: string;
    email?: string;
    phone?: string;
    degree?: string;
    pages?: number;
  };
  skills: string[];
  predicted_field: string;
  candidate_level: string;
  recommended_skills: string[];
  courses: { name: string; url: string }[];
  resume_score: number;
  resume_tips: { label: string; passed: boolean; points: number }[];
  bonus_videos: { resume: string; interview: string };
  ai_analysis?: AiAnalysis | null;
  youtube_video?: YoutubeVideo | null;
};

async function parseJson(res: Response) {
  const text = await res.text();
  if (text.trimStart().startsWith('<')) {
    const hint =
      res.status >= 500
        ? 'Server timed out or crashed. Try Quick scan, or wait a minute and retry Detailed review.'
        : `Unexpected HTML response (${res.status})`;
    throw new Error(hint);
  }
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    throw new Error(text || `Server error (${res.status})`);
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, options);
  } catch {
    throw new Error(
      'Cannot reach the server. Check your connection and try again.'
    );
  }
  const json = await parseJson(res);
  if (!res.ok) {
    throw new Error(json.error || 'Request failed');
  }
  return json;
}

export async function checkApiHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/health`, { method: 'GET' });
    return res.ok;
  } catch {
    return false;
  }
}

export async function checkOllamaStatus(): Promise<{
  available: boolean;
  base_url?: string;
  model?: string;
  hint?: string;
}> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/ollama/status`);
    if (!res.ok) return { available: false };
    return res.json();
  } catch {
    return { available: false };
  }
}

type AnalyzeCommon = {
  name?: string;
  email?: string;
  phone?: string;
  analysisMode?: AnalysisMode;
};

async function postAnalyze(
  form: FormData,
  analysisMode: AnalysisMode = 'nlp',
): Promise<AnalyzeResult> {
  const controller = new AbortController();
  const timeoutMs = analysisMode === 'ollama' ? 510_000 : 180_000;
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  let res: Response;
  try {
    const authHeaders = await getAuthHeaders();
    res = await fetch(`${API_BASE}/api/v1/analyze`, {
      method: 'POST',
      headers: { 'X-Upload-Source': 'mobile', ...authHeaders },
      body: form,
      signal: controller.signal,
    });
  } catch (e) {
    if (e instanceof Error && e.name === 'AbortError') {
      throw new Error(
        'Analysis took too long. Try Quick scan, or retry Detailed review on a stable connection.',
      );
    }
    throw new Error(
      API_BASE.startsWith('https://')
        ? 'Could not reach the server. It may be waking up (free tier) — wait a minute and try again.'
        : 'Could not connect. Start the Flask backend locally or set EXPO_PUBLIC_API_URL in mobile/.env.',
    );
  } finally {
    clearTimeout(timer);
  }

  const json = await parseJson(res);
  if (!res.ok) {
    const msg = json.error || 'Analysis failed';
    if (msg.includes('PDF file required') && msg.includes('resume')) {
      throw new Error(
        'This server does not support PDF links yet. Push the latest backend to Render and redeploy.',
      );
    }
    throw new Error(msg);
  }
  return json.data;
}

async function postAnalyzeJson(
  body: Record<string, string | number>,
  analysisMode: AnalysisMode = 'nlp',
): Promise<AnalyzeResult> {
  const controller = new AbortController();
  const timeoutMs = analysisMode === 'ollama' ? 510_000 : 180_000;
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  let res: Response;
  try {
    const authHeaders = await getAuthHeaders();
    res = await fetch(`${API_BASE}/api/v1/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Upload-Source': 'mobile',
        ...authHeaders,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } catch (e) {
    if (e instanceof Error && e.name === 'AbortError') {
      throw new Error(
        'Analysis took too long. Try Quick scan, or retry Detailed review on a stable connection.',
      );
    }
    throw new Error(
      API_BASE.startsWith('https://')
        ? 'Could not reach the server. It may be waking up (free tier) — wait a minute and try again.'
        : 'Could not connect. Start the Flask backend locally or set EXPO_PUBLIC_API_URL in mobile/.env.',
    );
  } finally {
    clearTimeout(timer);
  }

  const json = await parseJson(res);
  if (!res.ok) {
    const msg = json.error || 'Analysis failed';
    if (msg.includes('PDF file required') && msg.includes('resume')) {
      throw new Error(
        'This server does not support PDF links yet. Push the latest backend to Render and redeploy.',
      );
    }
    throw new Error(msg);
  }
  return json.data;
}

export async function analyzeResume(
  params: {
    uri: string;
    fileName: string;
  } & AnalyzeCommon,
): Promise<AnalyzeResult> {
  const fileError = getResumeFileValidationError(
    params.fileName || 'resume.pdf',
    'application/pdf',
  );
  if (fileError) throw new Error(fileError);
  const form = new FormData();
  form.append('act_name', params.name ?? '');
  form.append('act_mail', params.email ?? '');
  form.append('act_mob', params.phone ?? '');
  form.append('analysis_mode', params.analysisMode ?? 'nlp');
  form.append('resume', {
    uri: params.uri,
    name: params.fileName,
    type: 'application/pdf',
  } as unknown as Blob);
  return postAnalyze(form, params.analysisMode ?? 'nlp');
}

export async function analyzeResumeFromLink(
  params: { resumeUrl: string } & AnalyzeCommon,
): Promise<AnalyzeResult> {
  const linkError = getResumeLinkValidationError(params.resumeUrl);
  if (linkError) throw new Error(linkError);
  return postAnalyzeJson(
    {
      act_name: params.name ?? '',
      act_mail: params.email ?? '',
      act_mob: params.phone ?? '',
      analysis_mode: params.analysisMode ?? 'nlp',
      resume_url: params.resumeUrl.trim(),
    },
    params.analysisMode ?? 'nlp',
  );
}

export async function submitFeedback(body: {
  name: string;
  email: string;
  score: number;
  comments: string;
}) {
  return request('/api/v1/feedback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

export type AuthRole = 'user' | 'admin';

export type AuthResponse = {
  token: string;
  role: AuthRole;
  email: string;
  expires_in?: number;
};

export async function authLogin(email: string, password: string): Promise<AuthResponse> {
  return request<AuthResponse>('/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
}

export async function authRegister(
  email: string,
  password: string,
  name?: string,
): Promise<AuthResponse> {
  return request<AuthResponse>('/api/v1/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name }),
  });
}

/** @deprecated use authLogin */
export async function adminLogin(username: string, password: string) {
  const res = await authLogin(username, password);
  return { token: res.token };
}

export type AnalysisRecord = {
  id: number;
  act_name?: string;
  act_mail?: string;
  act_mob?: string;
  name?: string;
  email?: string;
  resume_score?: number;
  timestamp?: string;
  page_no?: string;
  predicted_field?: string;
  user_level?: string;
  actual_skills?: string;
  recommended_skills?: string;
  recommended_courses?: string;
  pdf_name?: string;
  ip_address?: string;
  country?: string;
  region?: string;
  city?: string;
  upload_source?: string;
};

export type ChartItem = { label: string; value: number };

export type ProfileAnalytics = {
  role: AuthRole;
  total_users: number;
  analyses: AnalysisRecord[];
  charts?: Record<string, ChartItem[]>;
};

export async function fetchProfileAnalytics(token: string): Promise<ProfileAnalytics> {
  const res = await fetch(`${API_BASE}/api/v1/profile/analytics`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await parseJson(res);
  if (!res.ok) throw new Error(json.error || 'Failed to load profile data');
  return json;
}

/** @deprecated use fetchProfileAnalytics */
export async function fetchAnalytics(token: string): Promise<ProfileAnalytics> {
  return fetchProfileAnalytics(token);
}

export async function getAuthHeaders(): Promise<Record<string, string>> {
  const { getStoredAuthToken } = await import('../authStorage');
  const token = await getStoredAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}
