// RouteWise API Integration Layer
// All hooks call backend endpoints with graceful fallbacks to seed data
// so the dashboard works fully even without the local server running.

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
  };
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

const SEED_DETECTION: DetectionResult = {
  hikeAlert: {
    name: 'Adobe Creative Cloud',
    oldPrice: 1600,
    newPrice: 4293,
    increasePct: 168,
  },
  subscriptions: [
    { id: '1', name: 'Netflix', price: 499, plan: 'Mobile', category: 'Streaming', tag: 'Keep', member: 'Aditya' },
    { id: '2', name: 'Spotify', price: 119, plan: 'Individual', category: 'Music', tag: 'Keep', member: 'Aditya' },
    { id: '3', name: 'Adobe Creative Cloud', price: 4293, oldPrice: 1600, plan: 'All Apps', category: 'Creative', tag: 'Review', member: 'Aditya' },
    { id: '4', name: 'YouTube Premium', price: 139, plan: 'Individual', category: 'Streaming', tag: 'Keep', member: 'Aditya' },
  ],
};

const SEED_NARRATION: NarrationResult = {
  summary:
    "Aditya, I detected a stealth price hike on Adobe Creative Cloud. It surged 168% from ₹1,600 to ₹4,293/month — quietly draining ₹2,693 extra every cycle. Across your household, three duplicate streaming subscriptions are bleeding value. Consolidating them unlocks ₹1,713/month in hidden savings.",
  bullets: [
    'Adobe Creative Cloud hiked 168% — biggest single leak in your stack.',
    'Netflix is duplicated across 3 family members with redundant Mobile plans.',
    'Prime + Hotstar overlaps add ₹498/month of avoidable spend.',
    'Redirecting recovered funds accelerates your Nike Shoes goal by 4 months.',
  ],
};

const SEED_FAMILY: FamilyResult = {
  members: [
    { name: 'Aditya', avatar: 'A', count: 4, monthly: 5050, accent: 'purple' },
    { name: 'Mom', avatar: 'M', count: 3, monthly: 1247, accent: 'cyan' },
    { name: 'Dad', avatar: 'D', count: 3, monthly: 998, accent: 'emerald' },
  ],
  overlaps: [
    {
      service: 'Netflix',
      members: [
        { name: 'Aditya', price: 499, plan: 'Mobile' },
        { name: 'Mom', price: 649, plan: 'Basic' },
        { name: 'Dad', price: 799, plan: 'Standard Multi-Screen' },
      ],
      recommendation: "Keep Dad's ₹799 Multi-Screen Plan & Cancel 2 Duplicates",
      saving: 1148,
    },
    {
      service: 'Amazon Prime',
      members: [
        { name: 'Mom', price: 299, plan: 'Monthly' },
        { name: 'Dad', price: 199, plan: 'Annual Prorated' },
      ],
      recommendation: 'Consolidate to 1 Household Account',
      saving: 299,
    },
    {
      service: 'Disney+ Hotstar',
      members: [
        { name: 'Aditya', price: 299, plan: 'Mobile' },
        { name: 'Mom', price: 299, plan: 'Mobile' },
      ],
      recommendation: "Cancel Mom's Duplicate Plan",
      saving: 299,
    },
  ],
  monthlySaving: 1713,
  yearlySaving: 20556,
};

function buildSeedGoal(targetName: string, targetCost: number, monthlySaving: number): GoalResult {
  const months = Math.max(1, Math.ceil(targetCost / Math.max(1, monthlySaving)));
  const timeline = Array.from({ length: months }, (_, i) => {
    const saved = Math.min(targetCost, monthlySaving * (i + 1));
    return { month: i + 1, saved, pct: Math.round((saved / targetCost) * 100) };
  });
  return {
    affordable: monthlySaving > 0,
    months,
    monthlySaving,
    targetName,
    targetCost,
    timeline,
    steps: [
      { label: 'Cancel Adobe Auto-Pay & downgrade', amount: 2693 },
      { label: 'Consolidate Netflix to 1 multi-screen plan', amount: 1148 },
      { label: 'Merge Prime into household account', amount: 299 },
      { label: 'Cancel Mom\u2019s Hotstar duplicate', amount: 299 },
    ],
  };
}

async function postJSON<T>(path: string, body: unknown, fallback: T): Promise<{ data: T; live: boolean }> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);
    const res = await fetch(`${BASE_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!res.ok) throw new Error(`status ${res.status}`);
    const json = (await res.json()) as T;
    return { data: json, live: true };
  } catch {
    return { data: fallback, live: false };
  }
}

export function detectSubscriptions(userId = 'aditya') {
  return postJSON('/api/detect', { userId }, SEED_DETECTION);
}

export function narrateInsights(userId = 'aditya') {
  return postJSON('/api/narrate', { userId }, SEED_NARRATION);
}

export function familyOverlaps(userId = 'aditya') {
  return postJSON('/api/family', { userId }, SEED_FAMILY);
}

export function calculateGoal(targetName: string, targetCost: number, monthlySaving: number) {
  return postJSON(
    '/api/goal',
    { targetName, targetCost, monthlySaving },
    buildSeedGoal(targetName, targetCost, monthlySaving)
  );
}

export function triggerVoiceCall(userId = 'aditya', message?: string) {
  return postJSON('/api/call', { userId, message }, { status: 'queued', message: message ?? 'Voice alert queued' });
}
