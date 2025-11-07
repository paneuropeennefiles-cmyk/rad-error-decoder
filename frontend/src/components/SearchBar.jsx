import { useState, useEffect } from 'react'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'

/**
 * SearchBar - Barre de recherche principale avec parsing automatique des erreurs
 */
export function SearchBar({ onSearch, isOffline }) {
  const [query, setQuery] = useState('')
  const [parsedInfo, setParsedInfo] = useState(null)

  useEffect(() => {
    // Auto-parse les erreurs eurofpl
    if (query.trim()) {
      const extracted = extractErrorCode(query)
      setParsedInfo(extracted)
    } else {
      setParsedInfo(null)
    }
  }, [query])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (query.trim()) {
      onSearch({
        query: query.trim(),
        parsed: parsedInfo
      })
    }
  }

  const handleClear = () => {
    setQuery('')
    setParsedInfo(null)
    onSearch({ query: '', parsed: null })
  }

  return (
    <div className="w-full max-w-3xl mx-auto">
      <form onSubmit={handleSubmit} className="relative">
        {/* Search Input */}
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Collez l'erreur eurofpl ou cherchez par ID, balise, aérodrome..."
            className="w-full px-4 py-4 pl-12 pr-24 text-lg border-2 border-gray-300 rounded-xl 
                     focus:border-primary-500 focus:ring-4 focus:ring-primary-100 
                     transition-all outline-none"
          />
          
          {/* Search Icon */}
          <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-gray-400" />
          
          {/* Clear Button */}
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-16 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
          
          {/* Offline Indicator in search */}
          {isOffline && (
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-yellow-600 font-medium">
              🟡
            </span>
          )}
        </div>

        {/* Search Button (mobile friendly) */}
        <button
          type="submit"
          className="hidden" // Hidden but accessible for Enter key
        >
          Rechercher
        </button>
      </form>

      {/* Parsed Error Preview */}
      {parsedInfo && parsedInfo.refCode && (
        <div className="mt-3 p-4 bg-primary-50 border border-primary-200 rounded-lg animate-slide-up">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-primary-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-primary-900 mb-2">
                ✓ Erreur eurofpl détectée
              </p>
              <div className="space-y-1 text-sm text-primary-700">
                <div className="flex items-center space-x-2">
                  <span className="font-medium">Code de référence:</span>
                  <code className="px-2 py-0.5 bg-white rounded font-mono text-primary-900">
                    {parsedInfo.refCode}
                  </code>
                </div>
                {parsedInfo.annex && (
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">Annexe:</span>
                    <span className="px-2 py-0.5 bg-white rounded">{parsedInfo.annex}</span>
                  </div>
                )}
                {parsedInfo.points && parsedInfo.points.length > 0 && (
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">Points mentionnés:</span>
                    <span className="px-2 py-0.5 bg-white rounded font-mono">
                      {parsedInfo.points.join(', ')}
                    </span>
                  </div>
                )}
                {parsedInfo.type && (
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">Type:</span>
                    <span className="px-2 py-0.5 bg-white rounded">{parsedInfo.type}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Tips */}
      {!query && (
        <div className="mt-3 text-center">
          <p className="text-sm text-gray-500">
            💡 Astuce: Collez l'erreur complète ou tapez juste le code REF
          </p>
        </div>
      )}
    </div>
  )
}

/**
 * Extrait les informations d'une erreur eurofpl
 */
function extractErrorCode(errorMessage) {
  const info = {
    refCode: null,
    annex: null,
    points: [],
    type: null
  }

  if (!errorMessage) return info

  const upper = errorMessage.toUpperCase()

  // Extraire REF:[CODE]
  const refMatch = upper.match(/REF:\s*\[?([A-Z0-9]+)\]?/i)
  if (refMatch) {
    info.refCode = refMatch[1]
  }

  // Extraire annexe (ex: "RAD ANNEX 2B")
  const annexMatch = upper.match(/ANNEX\s+(\d[A-C]?)/i)
  if (annexMatch) {
    info.annex = annexMatch[1]
  }

  // Extraire balises/points (5 lettres uppercase)
  const pointMatches = upper.match(/\b[A-Z]{5}\b/g)
  if (pointMatches) {
    // Dédupliquer et exclure les mots courants
    const excludeWords = ['ANNEX', 'ROUTE', 'TRAFFIC']
    info.points = [...new Set(pointMatches)].filter(p => !excludeWords.includes(p))
  }

  // Type d'erreur
  if (upper.includes('FORBIDDEN')) {
    info.type = 'FORBIDDEN ROUTE'
  } else if (upper.includes('RESTRICTED')) {
    info.type = 'RESTRICTED'
  } else if (upper.includes('NOT AVAILABLE')) {
    info.type = 'NOT AVAILABLE'
  }

  return info
}
