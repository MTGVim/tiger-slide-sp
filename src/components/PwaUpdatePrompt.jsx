import { useEffect, useState } from 'react'
import { registerServiceWorker } from '../utils/serviceWorker'

export function PwaUpdatePrompt() {
  const [offlineReady, setOfflineReady] = useState(false)
  const [updateServiceWorker, setUpdateServiceWorker] = useState(null)
  const needRefresh = Boolean(updateServiceWorker)
  const visible = offlineReady || needRefresh

  useEffect(() => {
    registerServiceWorker({
      onOfflineReady: () => setOfflineReady(true),
      onNeedRefresh: (update) => setUpdateServiceWorker(() => update),
    })
  }, [])

  if (!visible) return null

  function close() {
    setOfflineReady(false)
    setUpdateServiceWorker(null)
  }

  return (
    <div className="fixed inset-x-2 bottom-2 z-50 mx-auto max-w-md rounded-2xl border-2 border-white/80 bg-white/95 p-3 text-violet-950 shadow-2xl shadow-violet-300/50 backdrop-blur sm:inset-x-4 sm:bottom-4 sm:rounded-3xl sm:border-4 sm:p-4">
      <p className="text-sm font-black sm:text-base">
        {needRefresh ? '새 버전이 준비됐어요' : '오프라인 준비 완료'}
      </p>
      <p className="mt-1 text-xs font-semibold text-violet-700 sm:text-sm">
        {needRefresh
          ? '업데이트하면 화면이 한 번 새로고침됩니다. 진행 중이면 나중에 눌러도 됩니다.'
          : '이제 한 번 접속한 뒤에는 인터넷이 없어도 퍼즐을 계속 플레이할 수 있어요.'}
      </p>
      <div className="mt-2 flex flex-wrap justify-end gap-1.5 sm:mt-3 sm:gap-2">
        {needRefresh && (
          <button
            type="button"
            className="rounded-full bg-violet-600 px-3 py-1.5 text-xs font-black text-white shadow-lg shadow-violet-200 transition hover:-translate-y-0.5 hover:bg-violet-700 focus:outline-none focus:ring-4 focus:ring-violet-200 sm:px-4 sm:py-2 sm:text-sm"
            onClick={updateServiceWorker}
          >
            지금 업데이트
          </button>
        )}
        <button
          type="button"
          className="rounded-full border-2 border-violet-200 bg-white px-3 py-1.5 text-xs font-black text-violet-700 transition hover:-translate-y-0.5 hover:border-violet-300 hover:bg-violet-50 focus:outline-none focus:ring-4 focus:ring-violet-100 sm:px-4 sm:py-2 sm:text-sm"
          onClick={close}
        >
          {needRefresh ? '나중에' : '닫기'}
        </button>
      </div>
    </div>
  )
}
