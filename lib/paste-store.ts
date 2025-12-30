import { redis } from './redis'

export interface Paste {
  /** Unique identifier for the paste */
  id: string
  /** The content of the paste */
  content: string
  /** Optional time-to-live in seconds */
  ttlSeconds?: number
  /** Optional maximum number of views */
  maxViews?: number
  /** ISO timestamp of creation */
  createdAt: string
  /** Current number of views */
  viewsCount: number
  /** ISO timestamp of expiration, if applicable */
  expiresAt?: string
}

/**
 * Store for managing Paste operations against Redis.
 */
export const pasteStore = {
  /**
   * Creates a new paste in Redis.
   * @param data - The paste data to store.
   * @returns The stored paste data.
   */
  async createPaste(data: {
    id: string
    content: string
    ttlSeconds?: number
    maxViews?: number
    expiresAt?: Date | null
  }) {
    const key = `paste:${data.id}`
    const pipeline = redis.pipeline()

    const pasteData: Record<string, string | number> = {
      id: data.id,
      content: data.content,
      createdAt: new Date().toISOString(),
      viewsCount: 0,
    }

    if (data.ttlSeconds) pasteData.ttlSeconds = data.ttlSeconds
    if (data.maxViews) pasteData.maxViews = data.maxViews
    if (data.expiresAt) pasteData.expiresAt = data.expiresAt.toISOString()

    // Store paste data as a hash
    pipeline.hset(key, pasteData)

    // Set TTL on the key if provided
    if (data.ttlSeconds) {
      pipeline.expire(key, data.ttlSeconds)
    }

    await pipeline.exec()
    return data
  },

  /**
   * Retrieves a paste by its ID.
   * @param id - The unique identifier of the paste.
   * @returns The paste object or null if not found.
   */
  async getPaste(id: string): Promise<Paste | null> {
    const key = `paste:${id}`
    const data = await redis.hgetall(key)

    if (!data || Object.keys(data).length === 0) {
      return null
    }

    return {
      id: data.id,
      content: data.content,
      ttlSeconds: data.ttlSeconds ? parseInt(data.ttlSeconds) : undefined,
      maxViews: data.maxViews ? parseInt(data.maxViews) : undefined,
      createdAt: data.createdAt,
      viewsCount: parseInt(data.viewsCount || '0'),
      expiresAt: data.expiresAt,
    }
  },

  /**
   * Increments the view count for a paste.
   * @param id - The unique identifier of the paste.
   */
  async incrementViews(id: string) {
    const key = `paste:${id}`
    await redis.hincrby(key, 'viewsCount', 1)
  },

  /**
   * Checks the health of the Redis connection.
   * @returns 'PONG' if healthy.
   */
  async checkHealth() {
    return redis.ping()
  },
}
