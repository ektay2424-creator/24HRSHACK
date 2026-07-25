// RouteWise API Integration Layer
// All functions now throw errors if the backend is unreachable.
// No fallback data – the UI must handle loading/error states.

const BASE_URL = 'http://localhost:4000';

export type Subscription = {
  id: string;
  name: string;
  price: number;
  oldPrice?: number;
  plan: string;
  category: string;
  tag: 'Keep' | 'Review';
  member?: string;
};

export type DetectionResult = {
  subscriptions: Subscription[];
  hikeAlert: {
    name: string;
    oldPrice: number;
    newPrice: number;
    increasePct: number;
  } | null;
};

export type NarrationResult = {
  summary: string;
  bullets: string[];
};

export type FamilyMember = {
  name: string;
  avatar: string;
  count: number;
  monthly: number;
  accent: 'purple' | 'cyan' | 'emerald';
};

export type Overlap = {
  service: string;
  members: { name: string; price: number; plan: string }[];
  recommendation: string;
  saving: number;
};

export type FamilyResult = {
  members: FamilyMember[];
  overlaps: Overlap[];
  monthlySaving: number;
  yearlySaving: number;
};

export type GoalResult = {
  affordable: boolean;
  months: number;
  monthlySaving: number;
  targetName: string;
  targetCost: number;
  timeline: { month: number; saved: number; pct: number }[];
  steps: { label: string; amount: number }[];
};

async function postJSON<T>(path: string, body: unknown): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3500);
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: controller.signal,
  });
  clearTimeout(timeout);
  if (!res.ok) throw new Error(`HTTP ${res.status} – ${res.statusText}`);
  return await res.json();
}

export function detectSubscriptions(userId = 'aditya') {
  return postJSON<DetectionResult>('/api/detect', { userId });
}

export function narrateInsights(userId = 'aditya') {
  return postJSON<NarrationResult>('/api/narrate', { userId });
}

export function familyOverlaps(userId = 'aditya') {
  return postJSON<FamilyResult>('/api/family', { userId });
}

export function calculateGoal(targetName: string, targetCost: number, monthlySaving: number) {
  return postJSON<GoalResult>('/api/goal', { targetName, targetCost, monthlySaving });
}

export function triggerVoiceCall(userId = 'aditya', message?: string) {
  return postJSON<{ status: string; message: string }>('/api/call', { userId, message });
}