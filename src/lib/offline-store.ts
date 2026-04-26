// Lightweight offline cache + queued action store using localStorage
// (IndexedDB-style API kept simple to avoid extra deps)

const CACHE_PREFIX = "mamacare:cache:";
const QUEUE_KEY = "mamacare:queue";

export type QueuedAction = {
  id: string;
  type: "book_appointment" | "log_symptom" | "community_post" | "journal_entry";
  payload: Record<string, unknown>;
  createdAt: number;
};

export const offlineCache = {
  set<T>(key: string, value: T) {
    try {
      localStorage.setItem(CACHE_PREFIX + key, JSON.stringify({ value, ts: Date.now() }));
    } catch {
      // ignore quota errors
    }
  },
  get<T>(key: string): T | null {
    try {
      const raw = localStorage.getItem(CACHE_PREFIX + key);
      if (!raw) return null;
      return (JSON.parse(raw).value as T) ?? null;
    } catch {
      return null;
    }
  },
  remove(key: string) {
    localStorage.removeItem(CACHE_PREFIX + key);
  },
};

export const actionQueue = {
  list(): QueuedAction[] {
    try {
      return JSON.parse(localStorage.getItem(QUEUE_KEY) || "[]");
    } catch {
      return [];
    }
  },
  enqueue(action: Omit<QueuedAction, "id" | "createdAt">) {
    const queued: QueuedAction = {
      ...action,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
    };
    const all = actionQueue.list();
    all.push(queued);
    localStorage.setItem(QUEUE_KEY, JSON.stringify(all));
    return queued;
  },
  clear() {
    localStorage.removeItem(QUEUE_KEY);
  },
  remove(id: string) {
    const remaining = actionQueue.list().filter((a) => a.id !== id);
    localStorage.setItem(QUEUE_KEY, JSON.stringify(remaining));
  },
};

// Mock emergency contacts (3 contacts)
export const EMERGENCY_CONTACTS = [
  { name: "Mama Adaeze (Mom)", phone: "+234 803 123 4567", relation: "Mother" },
  { name: "Kwame (Husband)", phone: "+234 802 555 1212", relation: "Spouse" },
  { name: "Dr. Achieng", phone: "+254 712 998 877", relation: "OB/GYN" },
];
