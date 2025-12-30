export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { pasteStore } from '@/lib/paste-store'

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
