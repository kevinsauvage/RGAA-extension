import { vi } from 'vitest';

type StorageArea = {
  get: ReturnType<typeof vi.fn>;
  set: ReturnType<typeof vi.fn>;
};

export interface ChromeMock {
  local: Record<string, unknown>;
  sync: Record<string, unknown>;
  reset: () => void;
}

function createStorageArea(store: Record<string, unknown>): StorageArea {
  return {
    get: vi.fn(async (keys?: string | string[] | Record<string, unknown> | null) => {
      if (keys == null) return { ...store };
      if (typeof keys === 'string') return { [keys]: store[keys] };
      if (Array.isArray(keys)) {
        const result: Record<string, unknown> = {};
        for (const key of keys) result[key] = store[key];
        return result;
      }
      const result: Record<string, unknown> = {};
      for (const key of Object.keys(keys)) result[key] = store[key];
      return result;
    }),
    set: vi.fn(async (items: Record<string, unknown>) => {
      Object.assign(store, items);
    }),
  };
}

/** In-memory chrome.storage mock for unit tests. */
export function installChromeMock(): ChromeMock {
  const local: Record<string, unknown> = {};
  const sync: Record<string, unknown> = {};
  const localArea = createStorageArea(local);
  const syncArea = createStorageArea(sync);

  const chromeMock = {
    storage: {
      local: localArea,
      sync: syncArea,
    },
    runtime: {
      onInstalled: { addListener: vi.fn() },
      onMessage: { addListener: vi.fn() },
    },
    sidePanel: {
      setPanelBehavior: vi.fn().mockResolvedValue(undefined),
      open: vi.fn().mockResolvedValue(undefined),
    },
  };

  vi.stubGlobal('chrome', chromeMock);

  return {
    local,
    sync,
    reset: () => {
      for (const key of Object.keys(local)) delete local[key];
      for (const key of Object.keys(sync)) delete sync[key];
    },
  };
}
