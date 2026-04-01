import { openDB } from 'idb'

const DB_NAME = 'email-manager'
const DB_VERSION = 1

async function getDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('senders')) {
        db.createObjectStore('senders', { keyPath: 'email' })
      }
      if (!db.objectStoreNames.contains('classifications')) {
        db.createObjectStore('classifications', { keyPath: 'email' })
      }
      if (!db.objectStoreNames.contains('meta')) {
        db.createObjectStore('meta', { keyPath: 'key' })
      }
    }
  })
}

export async function cacheSenders(userId, senders) {
  const db = await getDB()
  const tx = db.transaction('senders', 'readwrite')
  for (const sender of senders) {
    await tx.store.put({ ...sender, userId })
  }
  await tx.done
  await setMeta(`senders_ts_${userId}`, Date.now())
}

export async function getCachedSenders(userId) {
  const ts = await getMeta(`senders_ts_${userId}`)
  if (!ts) return null // Never synced before
  const db = await getDB()
  const all = await db.getAll('senders')
  return all.filter(s => s.userId === userId)
}

export async function cacheClassifications(classifications) {
  const db = await getDB()
  const tx = db.transaction('classifications', 'readwrite')
  for (const [email, category] of Object.entries(classifications)) {
    await tx.store.put({ email, category, updatedAt: Date.now() })
  }
  await tx.done
}

export async function getCachedClassifications() {
  const db = await getDB()
  const all = await db.getAll('classifications')
  const result = {}
  for (const item of all) {
    result[item.email] = item.category
  }
  return result
}

async function setMeta(key, value) {
  const db = await getDB()
  await db.put('meta', { key, value })
}

async function getMeta(key) {
  const db = await getDB()
  const item = await db.get('meta', key)
  return item?.value || null
}

export async function clearCache() {
  const db = await getDB()
  const tx1 = db.transaction('senders', 'readwrite')
  await tx1.store.clear()
  await tx1.done
  const tx2 = db.transaction('classifications', 'readwrite')
  await tx2.store.clear()
  await tx2.done
  const tx3 = db.transaction('meta', 'readwrite')
  await tx3.store.clear()
  await tx3.done
}
