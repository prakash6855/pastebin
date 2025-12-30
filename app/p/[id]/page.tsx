import { pasteStore } from '@/lib/paste-store'
import { notFound } from 'next/navigation'
import { headers } from 'next/headers'
import Link from 'next/link'
import styles from './Paste.module.css'

async function getCurrentTime(): Promise<Date> {
  const headersList = await headers()
  if (process.env.TEST_MODE === '1') {
    const testNowMs = headersList.get('x-test-now-ms')
    if (testNowMs) {
      const ms = parseInt(testNowMs, 10)
      if (!isNaN(ms)) {
        return new Date(ms)
      }
    }
  }
  return new Date()
}

interface PageProps {
  params: Promise<{ id: string }>
}

/**
 * Page component for viewing a specific paste.
 * Fetches paste data server-side and handles 404s for expired/missing pastes.
 */
export default async function PasteViewPage({ params }: PageProps) {
  const { id } = await params
  const now = await getCurrentTime()

  try {
    const paste = await pasteStore.getPaste(id)

    if (!paste) {
      notFound()
    }

    // Check expiry
    if (paste.expiresAt && new Date(paste.expiresAt) <= now) {
      notFound()
    }

    // Check view limit
    if (paste.maxViews !== undefined && paste.viewsCount >= paste.maxViews) {
      notFound()
    }

    // Increment views
    await pasteStore.incrementViews(id)

    const remainingViews = paste.maxViews !== undefined ? paste.maxViews - paste.viewsCount - 1 : null
    const expiresAt = paste.expiresAt ? new Date(paste.expiresAt).toLocaleString() : null

    return (
      <div className={styles.container}>
        <Link href="/" className={styles.backLink}>
          ← Back to Home
        </Link>

        <div className={styles.content}>
          <header className={styles.header}>
            <h1>Paste #{id.slice(0, 8)}...</h1>
            <div className={styles.stats}>
              {remainingViews !== null && (
                <span>Views left: {remainingViews}</span>
              )}
              {expiresAt && (
                <span>Expires: {expiresAt}</span>
              )}
            </div>
          </header>

          <pre className={styles.pasteContent}>
            {paste.content}
          </pre>
        </div>
      </div>
    )
  } catch (error) {
    console.error('Error fetching paste:', error)
    notFound()
  }
}
