/**
 * OfflineIndicator component - Shows a banner when the app is offline
 */
export function OfflineIndicator({ isOffline }) {
  if (!isOffline) return null

  return (
    <div className="bg-yellow-50 border-b border-yellow-200">
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-center space-x-2 text-sm">
          <svg
            className="w-5 h-5 text-yellow-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414"
            />
          </svg>
          <span className="font-medium text-yellow-800">
            Mode hors-ligne
          </span>
          <span className="text-yellow-700 hidden sm:inline">
            - Les données en cache sont utilisées
          </span>
        </div>
      </div>
    </div>
  )
}
