type FlagKey =
  | "execDashboard"
  | "anomalyAlerts"
  | "experimentalTours";

const DEFAULT_FLAGS: Record<FlagKey, boolean> = {
  execDashboard: true,
  anomalyAlerts: true,
  experimentalTours: true,
};

const STORAGE_KEY = "rabit_feature_flags";

const readStoredFlags = (): Partial<Record<FlagKey, boolean>> => {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
};

const writeStoredFlags = (flags: Partial<Record<FlagKey, boolean>>) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(flags));
  } catch {
    // ignore storage errors in restrictive environments
  }
};

export function getFeatureFlags(): Record<FlagKey, boolean> {
  const stored = readStoredFlags();
  return { ...DEFAULT_FLAGS, ...stored };
}

export function setFeatureFlag(key: FlagKey, value: boolean) {
  const current = readStoredFlags();
  current[key] = value;
  writeStoredFlags(current);
}

export function isFeatureEnabled(key: FlagKey): boolean {
  return getFeatureFlags()[key];
}

export function listFeatureFlags(): Array<{ key: FlagKey; enabled: boolean }> {
  const flags = getFeatureFlags();
  return (Object.keys(flags) as FlagKey[]).map(key => ({
    key,
    enabled: flags[key],
  }));
}
