import NodeCache from 'node-cache';

const taskCache = new NodeCache({ stdTTL: 60 });

export function getTaskListCacheKey(userId) {
  return `tasks:${userId}`;
}

export function invalidateTaskListCache(userId) {
  taskCache.del(getTaskListCacheKey(userId));
}

export default taskCache;
