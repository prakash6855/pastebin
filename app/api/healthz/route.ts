export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { pasteStore } from '@/lib/paste-store'

/**
 * Health check endpoint.
 * Verifies that the application can connect to the persistence layer (Redis).
 * @returns JSON response with { ok: true } if healthy, 500 otherwise.
 */
export async function GET() {
  try {
    // lightweight, safe DB ping
    await pasteStore.checkHealth()
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Database connection failed:', error)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
