function createCache() {
    const cache = {};
  
    function set(key, value, ttl = 60000) {
      const expireTime = Date.now() + ttl;
      cache[key] = { value, expireTime };
    }
  
    function get(key) {
      const cachedItem = cache[key];
      if (!cachedItem) return null;
  
      const { value, expireTime } = cachedItem;
      if (Date.now() > expireTime) {
        delete cache[key];
        return null;
      }
  
      return value;
    }
  
    function deleteCache(key) {
      delete cache[key];
    }
  
    return { set, get, delete: deleteCache };
  }
  
  module.exports = { createCache };  