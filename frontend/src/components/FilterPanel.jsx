import { useState } from 'react'

/**
 * FilterPanel component - Allows users to filter RAD results
 */
export function FilterPanel({ filters, onChange, stats }) {
  const [isExpanded, setIsExpanded] = useState(false)

  const handleFilterChange = (filterType, value) => {
    const newFilters = {
      ...filters,
      [filterType]: value === filters[filterType] ? null : value
    }
    onChange(newFilters)
  }

  const clearAllFilters = () => {
    onChange({
      annex: null,
      nasFab: null,
      changeStatus: null
    })
  }

  const activeFilterCount = Object.values(filters).filter(v => v !== null).length

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      {/* Filter Header - Always Visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50 transition-colors rounded-lg"
      >
        <div className="flex items-center space-x-3">
          <svg
            className="w-5 h-5 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
            />
          </svg>
          <span className="font-medium text-gray-900">Filtres</span>
          {activeFilterCount > 0 && (
            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
              {activeFilterCount}
            </span>
          )}
        </div>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Filter Options - Collapsible */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-gray-100">
          {/* Annex Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Annexe RAD
            </label>
            <div className="flex flex-wrap gap-2">
              {['2A', '2B', '3A', '3B'].map((annex) => (
                <button
                  key={annex}
                  onClick={() => handleFilterChange('annex', annex)}
                  className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                    filters.annex === annex
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                  }`}
                >
                  Annex {annex}
                </button>
              ))}
            </div>
          </div>

          {/* NAS/FAB Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type de restriction
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleFilterChange('nasFab', 'NAS')}
                className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                  filters.nasFab === 'NAS'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                }`}
              >
                NAS (National Airspace)
              </button>
              <button
                onClick={() => handleFilterChange('nasFab', 'FAB')}
                className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                  filters.nasFab === 'FAB'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                }`}
              >
                FAB (Functional Airspace Block)
              </button>
            </div>
          </div>

          {/* Change Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Statut de modification
            </label>
            <div className="flex flex-wrap gap-2">
              {['NEW', 'MODIFIED', 'DELETED'].map((status) => (
                <button
                  key={status}
                  onClick={() => handleFilterChange('changeStatus', status)}
                  className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                    filters.changeStatus === status
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                  }`}
                >
                  {status === 'NEW' && '🆕 Nouveau'}
                  {status === 'MODIFIED' && '✏️ Modifié'}
                  {status === 'DELETED' && '🗑️ Supprimé'}
                </button>
              ))}
            </div>
          </div>

          {/* Clear Filters Button */}
          {activeFilterCount > 0 && (
            <div className="pt-2">
              <button
                onClick={clearAllFilters}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                ✕ Effacer tous les filtres
              </button>
            </div>
          )}

          {/* Stats (if available) */}
          {stats && (
            <div className="pt-2 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                {stats.totalEntries} entrées dans le RAD
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
