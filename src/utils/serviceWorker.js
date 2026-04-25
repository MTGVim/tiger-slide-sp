export function registerServiceWorker({ onOfflineReady, onNeedRefresh } = {}) {
  if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return undefined

  let refreshing = false
  let userAcceptedUpdate = false

  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!userAcceptedUpdate || refreshing) return
    refreshing = true
    window.location.reload()
  })

  window.addEventListener('load', () => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`, { scope: import.meta.env.BASE_URL }).then((registration) => {
      function notifyUpdate(worker) {
        if (!worker) return
        onNeedRefresh?.(() => {
          userAcceptedUpdate = true
          worker.postMessage({ type: 'SKIP_WAITING' })
        })
      }

      if (registration.waiting) {
        notifyUpdate(registration.waiting)
        return
      }

      registration.addEventListener('updatefound', () => {
        const nextWorker = registration.installing
        if (!nextWorker) return

        nextWorker.addEventListener('statechange', () => {
          if (nextWorker.state !== 'installed') return

          if (navigator.serviceWorker.controller) {
            notifyUpdate(nextWorker)
            return
          }

          onOfflineReady?.()
        })
      })
    }).catch(() => {})
  })

  return () => navigator.serviceWorker.getRegistration().then((registration) => registration?.unregister())
}
