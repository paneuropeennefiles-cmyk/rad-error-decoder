import { useState } from 'react'

/**
 * Header component - Shows app title, RAD version info, and info modal
 */
export function Header({ cycle, version }) {
  const [showInfo, setShowInfo] = useState(false)

  return (
    <>
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo & Title */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
                <span className="text-white text-xl font-bold">✈️</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  RAD Error Decoder
                </h1>
                <p className="text-xs text-gray-500">
                  EUROCONTROL Route Availability Document
                </p>
              </div>
            </div>

            {/* Version Info & Help Button */}
            <div className="flex items-center space-x-4">
              {/* RAD Version Badge */}
              {cycle && (
                <div className="hidden sm:block">
                  <div className="text-xs text-gray-500">Cycle AIRAC</div>
                  <div className="font-mono font-semibold text-blue-600">
                    {cycle} {version && `v${version}`}
                  </div>
                </div>
              )}

              {/* Info Button */}
              <button
                onClick={() => setShowInfo(true)}
                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                aria-label="Information"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Info Modal */}
      {showInfo && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowInfo(false)}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                À propos de RAD Error Decoder
              </h2>
              <button
                onClick={() => setShowInfo(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="px-6 py-4 space-y-4">
              <section>
                <h3 className="font-semibold text-gray-900 mb-2">🎯 But de l'application</h3>
                <p className="text-gray-700 text-sm">
                  Cette application permet de décoder rapidement les erreurs de plan de vol en référençant
                  le RAD (Route Availability Document) d'EUROCONTROL. Le fichier Excel RAD est trop lourd
                  pour être consulté sur smartphone - cette app résout ce problème !
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-gray-900 mb-2">🔍 Comment utiliser</h3>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li className="flex items-start">
                    <span className="font-mono bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs mr-2 mt-0.5">1</span>
                    <span>Collez une erreur eurofpl complète (ex: "RS: TRAFFIC VIA OMASI IS ON FORBIDDEN ROUTE REF:[LSLF1139C]...")</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-mono bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs mr-2 mt-0.5">2</span>
                    <span>Ou cherchez directement par ID (LS2857), balise (OMASI), aérodrome (LSGG), ou airway (L856)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-mono bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs mr-2 mt-0.5">3</span>
                    <span>Les résultats s'affichent instantanément avec tous les détails de la règle</span>
                  </li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold text-gray-900 mb-2">📱 Mode hors-ligne</h3>
                <p className="text-gray-700 text-sm">
                  Une fois chargée, l'application fonctionne entièrement hors-ligne. Vous pouvez l'installer
                  comme une application native sur votre smartphone (bouton "Ajouter à l'écran d'accueil").
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-gray-900 mb-2">🔄 Mise à jour</h3>
                <p className="text-gray-700 text-sm">
                  Le RAD est mis à jour tous les 28 jours (cycle AIRAC). Vérifiez régulièrement que vous
                  utilisez la version actuelle affichée en haut à droite.
                </p>
                {cycle && (
                  <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm">
                      <span className="font-medium text-blue-900">Version actuelle:</span>{' '}
                      <span className="font-mono text-blue-700">{cycle} {version && `v${version}`}</span>
                    </p>
                  </div>
                )}
              </section>

              <section>
                <h3 className="font-semibold text-gray-900 mb-2">ℹ️ Informations</h3>
                <p className="text-gray-700 text-sm">
                  Données source: <a href="https://www.nm.eurocontrol.int/RAD/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">EUROCONTROL RAD</a>
                </p>
                <p className="text-gray-700 text-sm mt-1">
                  Cette application est un outil non-officiel créé pour faciliter la consultation du RAD.
                </p>
              </section>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-200">
              <button
                onClick={() => setShowInfo(false)}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
