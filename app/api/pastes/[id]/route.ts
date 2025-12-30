import { pasteStore } from '@/lib/paste-store'
import { NextRequest, NextResponse } from 'next/server'

/**
 * Helper to get the current time, supporting deterministic testing.
 * Checks for `x-test-now-ms` header if `TEST_MODE` is enabled.
 */
function getCurrentTime(request: NextRequest): Date {
  if (process.env.TEST_MODE === '1') {
    const testNowMs = request.headers.get('x-test-now-ms')
    if (testNowMs) {
      const ms = parseInt(testNowMs, 10)
      if (!isNaN(ms)) {
        return new Date(ms)
      }
    }
  }
  return new Date()
}

/**
 * Retrieve a paste by ID.
 * Checks for expiry and view limits before returning.
 * Increments view count on success.
 */
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const now = getCurrentTime(request)

    // Find the paste
    const paste = await pasteStore.getPaste(id)

    if (!paste) {
      return NextResponse.json({ error: 'Paste not found' }, { status: 404 })
    }

    // Check expiry
    if (paste.expiresAt && new Date(paste.expiresAt) <= now) {
      return NextResponse.json({ error: 'Paste expired' }, { status: 404 })
    }

    // Check view limit
    if (paste.maxViews !== undefined && paste.viewsCount >= paste.maxViews) {
      return NextResponse.json({ error: 'View limit exceeded' }, { status: 404 })
    }

    // Increment views
    await pasteStore.incrementViews(id)

    // Calculate remaining views
    const remainingViews = paste.maxViews !== undefined ? paste.maxViews - paste.viewsCount - 1 : null

    return NextResponse.json({
      content: paste.content,
      remaining_views: remainingViews,
      expires_at: paste.expiresAt || null,
    })
  } catch (error) {
    console.error('Error fetching paste:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
