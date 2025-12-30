import { redis } from './redis'

export interface Paste {
  id: string
  content: string
  ttlSeconds?: number
  maxViews?: number
  createdAt: string
  viewsCount: number
  expiresAt?: string
}

export const pasteStore = {
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

    pipeline.hset(key, pasteData)

    if (data.ttlSeconds) {
      pipeline.expire(key, data.ttlSeconds)
    }

    await pipeline.exec()
    return data
  },

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

  async incrementViews(id: string) {
    const key = `paste:${id}`
    await redis.hincrby(key, 'viewsCount', 1)
  },

  async checkHealth() {
    return redis.ping()
  },
}
