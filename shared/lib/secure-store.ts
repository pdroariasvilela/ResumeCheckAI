type SecureStoreLike = {
  getItemAsync: (key: string) => Promise<string | null>;
  setItemAsync: (key: string, value: string) => Promise<void>;
  deleteItemAsync: (key: string) => Promise<void>;
};

const memoryStore = new Map<string, string>();

async function getSecureStoreModule(): Promise<SecureStoreLike | null> {
  try {
    const module = await import("expo-secure-store");
    return module as SecureStoreLike;
  } catch {
    return null;
  }
}

export async function secureSetItem(key: string, value: string): Promise<void> {
  const secureStore = await getSecureStoreModule();
  if (!secureStore) {
    memoryStore.set(key, value);
    return;
  }
  await secureStore.setItemAsync(key, value);
}

export async function secureGetItem(key: string): Promise<string | null> {
  const secureStore = await getSecureStoreModule();
  if (!secureStore) {
    return memoryStore.get(key) ?? null;
  }
  return secureStore.getItemAsync(key);
}

export async function secureDeleteItem(key: string): Promise<void> {
  const secureStore = await getSecureStoreModule();
  if (!secureStore) {
    memoryStore.delete(key);
    return;
  }
  await secureStore.deleteItemAsync(key);
}

export async function secureSetJson<T>(key: string, value: T): Promise<void> {
  await secureSetItem(key, JSON.stringify(value));
}

export async function secureGetJson<T>(key: string): Promise<T | null> {
  const value = await secureGetItem(key);
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}
