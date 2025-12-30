import { pasteStore } from '@/lib/paste-store'
import { NextRequest, NextResponse } from 'next/server'
import { nanoid } from 'nanoid'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { content, ttl_seconds, max_views } = body

    // Validation
    if (!content || typeof content !== 'string' || content.trim() === '') {
      return NextResponse.json({ error: 'Content is required and must be a non-empty string' }, { status: 400 })
    }

    if (ttl_seconds !== undefined && (typeof ttl_seconds !== 'number' || ttl_seconds < 1 || !Number.isInteger(ttl_seconds))) {
      return NextResponse.json({ error: 'ttl_seconds must be an integer >= 1' }, { status: 400 })
    }

    if (max_views !== undefined && (typeof max_views !== 'number' || max_views < 1 || !Number.isInteger(max_views))) {
      return NextResponse.json({ error: 'max_views must be an integer >= 1' }, { status: 400 })
    }

    // Generate unique id
    const id = nanoid(10)

    // Calculate expires_at if ttl_seconds provided
    const createdAt = new Date()
    const expiresAt = ttl_seconds ? new Date(createdAt.getTime() + ttl_seconds * 1000) : null

    // Create paste
    const paste = await pasteStore.createPaste({
      id,
      content,
      ttlSeconds: ttl_seconds,
      maxViews: max_views,
      expiresAt,
    })

    // Construct URL
    const url = `${request.nextUrl.origin}/pastes/${id}`

    return NextResponse.json({ id, url })
  } catch (error) {
    console.error('Error creating paste:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
