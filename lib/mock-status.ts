// Helpers para leer/escribir el estado mock en localStorage
const KEY = 'elite_mock_status';

export type MockStatusStore = Record<string, { status: 'aprobado' | 'rechazado'; motivo?: string; at: string }>;

export function getMockStatus(): MockStatusStore {
  if (typeof window === 'undefined') return {};
  try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch { return {}; }
}

export function setMockStatus(id: string, status: 'aprobado' | 'rechazado', motivo?: string) {
  const store = getMockStatus();
  store[id] = { status, motivo, at: new Date().toISOString() };
  localStorage.setItem(KEY, JSON.stringify(store));
}

export function getEffectiveStatus(id: string, originalStatus: string): string {
  const store = getMockStatus();
  return store[id]?.status ?? originalStatus;
}
