const redis = require('redis');

let redisClient = null;

// Initialize Redis connection
const initRedis = async () => {
  try {
    if (process.env.REDIS_URL) {
      redisClient = redis.createClient({
        url: process.env.REDIS_URL
      });

      redisClient.on('error', (err) => {
        console.error('Redis Client Error:', err);
      });

      redisClient.on('connect', () => {
        console.log('Redis connecté avec succès');
      });

      await redisClient.connect();
    }
  } catch (error) {
    console.error('Erreur de connexion Redis:', error);
  }
};

// Get data from cache
const getFromCache = async (key) => {
  if (!redisClient) return null;
  
  try {
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Erreur lors de la récupération du cache:', error);
    return null;
  }
};

// Set data in cache
const setInCache = async (key, data, ttl = 3600) => {
  if (!redisClient) return;
  
  try {
    await redisClient.setEx(key, ttl, JSON.stringify(data));
  } catch (error) {
    console.error('Erreur lors de la mise en cache:', error);
  }
};

// Delete from cache
const deleteFromCache = async (key) => {
  if (!redisClient) return;
  
  try {
    await redisClient.del(key);
  } catch (error) {
    console.error('Erreur lors de la suppression du cache:', error);
  }
};

// Delete pattern from cache
const deletePatternFromCache = async (pattern) => {
  if (!redisClient) return;
  
  try {
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(keys);
    }
  } catch (error) {
    console.error('Erreur lors de la suppression du cache par pattern:', error);
  }
};

// Initialize Redis when module is loaded
initRedis();

module.exports = {
  getFromCache,
  setInCache,
  deleteFromCache,
  deletePatternFromCache
};
