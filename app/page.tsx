'use client'

import { useState } from 'react'
import styles from './Home.module.css'

export default function Home() {
  const [content, setContent] = useState('')
  const [ttlSeconds, setTtlSeconds] = useState('')
  const [maxViews, setMaxViews] = useState('')
  const [result, setResult] = useState<{ id: string; url: string } | null>(null)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setResult(null)
    setIsLoading(true)

    try {
      const response = await fetch('/api/pastes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          ttl_seconds: ttlSeconds ? parseInt(ttlSeconds) : undefined,
          max_views: maxViews ? parseInt(maxViews) : undefined,
        }),
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || 'Failed to create paste')
      }

      const data = await response.json()
      setResult(data)
      setContent('')
      setTtlSeconds('')
      setMaxViews('')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.main}>
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="content">
              Paste Your Content
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              placeholder="Enter your text, code, or any content here..."
              className={styles.textarea}
            />
          </div>

          <div className={styles.inputRow}>
            <div className={styles.inputGroup}>
              <label className={styles.label} htmlFor="ttl">
                Time to Live (seconds)
              </label>
              <input
                id="ttl"
                type="number"
                value={ttlSeconds}
                onChange={(e) => setTtlSeconds(e.target.value)}
                min="1"
                placeholder="Optional"
                className={styles.input}
              />
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label} htmlFor="maxViews">
                Max Views
              </label>
              <input
                id="maxViews"
                type="number"
                value={maxViews}
                onChange={(e) => setMaxViews(e.target.value)}
                min="1"
                placeholder="Optional"
                className={styles.input}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={styles.submitButton}
          >
            {isLoading ? (
              <>
                Creating...
                <span className={styles.loading}></span>
              </>
            ) : (
              'Create'
            )}
          </button>
        </form>

        {result && (
          <div className={styles.result}>
            <h3>✅ Paste Created Successfully!</h3>
            <p><strong>Paste ID:</strong> {result.id}</p>
            <p><strong>Share URL:</strong></p>
            <div className={styles.url}>
              <a href={result.url} target="_blank" rel="noopener noreferrer">
                {result.url}
              </a>
            </div>
            <button
              onClick={() => copyToClipboard(result.url)}
              className={styles.copyButton}
            >
              {copied ? '✅ Copied!' : '📋 Copy URL'}
            </button>
          </div>
        )}

        {error && (
          <div className={styles.error}>
            <h3>❌ Error</h3>
            <p>{error}</p>
          </div>
        )}
      </div>
    </div>
  )
}
