import { useEffect } from 'react'

export function useWakeLock() {
  useEffect(() => {
    let sentinel: WakeLockSentinel | null = null

    async function acquire() {
      try {
        sentinel = await navigator.wakeLock?.request('screen')
      } catch {
        // silently ignore — wake lock is a best-effort feature
      }
    }

    function onVisibilityChange() {
      if (document.visibilityState === 'visible') acquire()
    }

    acquire()
    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange)
      sentinel?.release()
    }
  }, [])
}
