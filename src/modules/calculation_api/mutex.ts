import { Mutex } from 'async-mutex';
 
const mutexMap = new Map<string, Mutex>();
 
/**
* Generates a unique key for locking based on productId and assessmentId.
*/
export function getMutexKey(productId: string, assessmentId: string): string {
  return `${productId}-${assessmentId}`;
}
/**
* Returns a singleton mutex per key to ensure exclusive execution.
*/
export function getOrCreateMutex(key: string): Mutex {
  if (!mutexMap.has(key)) {
    mutexMap.set(key, new Mutex());
  }
  return mutexMap.get(key)!;
}