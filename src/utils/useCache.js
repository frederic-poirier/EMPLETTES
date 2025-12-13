export default function useCache(defaultStaleTime = 1000 * 60 * 60) {
  function writeCache(key, cacheVersion, data) {
    try {
      localStorage.setItem(
        key,
        JSON.stringify({
          time: Date.now(),
          version: cacheVersion,
          data: data,
        })
      );
    } catch (err) {
      console.warn(err);
    }
  }

  function readCache(key, cacheVersion) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;

      const { data, version, time } = JSON.parse(raw);
      if (version !== cacheVersion) {
        localStorage.removeItem(key);
        return null;
      }

      if (defaultStaleTime && Date.now() - time > defaultStaleTime) {
        localStorage.removeItem(key);
        return null;
      }

      return data;
    } catch {
      return null;
    }
  }

  function clearCache(key) {
    try {
      localStorage.removeItem(key);
    } catch (err) {
      console.warn("useCache: clear failed", err);
    }
  }

  return { writeCache, readCache, clearCache };
}
