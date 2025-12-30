export function getCurrentTime(): Date {
  if (process.env.TEST_MODE === '1') {
    const testNowMs = process.env['x-test-now-ms'] || '0'
    const ms = parseInt(testNowMs, 10)
    if (!isNaN(ms)) {
      return new Date(ms)
    }
  }
  return new Date()
}
