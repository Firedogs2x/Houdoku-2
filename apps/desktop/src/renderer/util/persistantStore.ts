const storeCache = new Map<string, string | null>();

window.addEventListener('storage', (event) => {
  if (event.key === null) {
    storeCache.clear();
    return;
  }

  if (event.newValue === null) {
    storeCache.delete(event.key);
    return;
  }

  storeCache.set(event.key, event.newValue);
});

export default {
  write(entryName: string, data: unknown) {
    const normalizedData = `${data}`;
    window.localStorage.setItem(entryName, normalizedData);
    storeCache.set(entryName, normalizedData);
  },

  read(entryName: string): string | null {
    if (storeCache.has(entryName)) {
      return storeCache.get(entryName) ?? null;
    }

    const value = window.localStorage.getItem(entryName);
    storeCache.set(entryName, value);
    return value;
  },

  remove(entryName: string): void {
    storeCache.delete(entryName);
    return window.localStorage.removeItem(entryName);
  },
};
