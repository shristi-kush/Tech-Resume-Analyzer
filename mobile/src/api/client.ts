import Constants from 'expo-constants';
import { Platform } from 'react-native';

const PRODUCTION_API = 'https://tech-resume-analyzer-1.onrender.com';

/**
 * Resolve Flask API URL:
 * - EXPO_PUBLIC_API_URL wins if set
 * - app.json extra.apiUrl (production default)
 * - Dev: same LAN IP as Metro (Expo Go) or emulator localhost
 */
function resolveApiBase(): string {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL.replace(/\/$/, '');
  }

  const fromExtra = Constants.expoConfig?.extra?.apiUrl as string | undefined;
  if (fromExtra) {
    return fromExtra.replace(/\/$/, '');
  }

  if (!__DEV__) {
    return PRODUCTION_API;
  }

  const hostUri =
    Constants.expoConfig?.hostUri ??
    (Constants.expoGoConfig as { debuggerHost?: string } | undefined)?.debuggerHost;

  if (hostUri) {
    const host = hostUri.split(':')[0];
    if (host && host !== 'localhost' && host !== '127.0.0.1') {
      return `http://${host}:5000`;
    }
  }

  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:5000';
  }

  return 'http://localhost:5000';
}

export const API_BASE = resolveApiBase();

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

export async function analyzeResume(params: {
  uri: string;
  fileName: string;
  name?: string;
  email?: string;
  phone?: string;
  analysisMode?: AnalysisMode;
}): Promise<AnalyzeResult> {
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

  let res: Response;
  const controller = new AbortController();
  const timeoutMs = params.analysisMode === 'ollama' ? 200_000 : 90_000;
  const timer = setTimeout(() => controller.abort(), timeoutMs);
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
  if (!res.ok) throw new Error(json.error || 'Analysis failed');
  return json.data;
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
