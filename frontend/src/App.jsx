import { useState, useEffect } from 'react'
import { SearchBar } from './components/SearchBar'
import { ResultCard } from './components/ResultCard'
import { FilterPanel } from './components/FilterPanel'
import { Header } from './components/Header'
import { OfflineIndicator } from './components/OfflineIndicator'
import { RADSearchEngine } from './services/searchEngine'
import './App.css'

function App() {
  // State
  const [radData, setRadData] = useState(null)
  const [searchEngine, setSearchEngine] = useState(null)
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isOffline, setIsOffline] = useState(!navigator.onLine)
  const [filters, setFilters] = useState({
    annex: null,
    nasFab: null,
    changeStatus: null
  })

  // Load RAD data on mount
  useEffect(() => {
    loadRADData()
    
    // Listen for online/offline events
    window.addEventListener('online', () => setIsOffline(false))
    window.addEventListener('offline', () => setIsOffline(true))
    
    return () => {
      window.removeEventListener('online', () => setIsOffline(false))
      window.removeEventListener('offline', () => setIsOffline(true))
    }
  }, [])

  const loadRADData = async () => {
    try {
      setLoading(true)
      
      // Try to load from cache first (IndexedDB)
      // For now, just load from public folder
      const response = await fetch(`${import.meta.env.BASE_URL}rad-data.json`)
      if (!response.ok) {
        throw new Error('Failed to load RAD data')
      }
      
      const data = await response.json()
      setRadData(data)
      
      // Initialize search engine
      const engine = new RADSearchEngine(data)
      setSearchEngine(engine)
      
      setLoading(false)
    } catch (err) {
      console.error('Error loading RAD:', err)
      setError(err.message)
      setLoading(false)
    }
  }

  const handleSearch = ({ query, parsed }) => {
    if (!searchEngine || !query.trim()) {
      setResults([])
      return
    }

    try {
      let searchResults

      // If we have a parsed error with reference code
      if (parsed?.refCode) {
        searchResults = searchEngine.searchByReference(parsed.refCode)
      } else {
        // Regular search
        searchResults = searchEngine.search(query, filters)
      }

      setResults(searchResults)
    } catch (err) {
      console.error('Search error:', err)
      setError('Erreur lors de la recherche')
    }
  }

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters)
    // Re-trigger search with new filters if there's an active search
    // This would need the last query stored in state
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement du RAD...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Erreur</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadRADData}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Réessayer
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header 
        cycle={radData?.metadata?.cycle} 
        version={radData?.metadata?.version}
      />

      {/* Offline Indicator */}
      <OfflineIndicator isOffline={isOffline} />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Search Bar */}
        <div className="mb-8">
          <SearchBar onSearch={handleSearch} isOffline={isOffline} />
        </div>

        {/* Filters */}
        <div className="mb-6">
          <FilterPanel 
            filters={filters} 
            onChange={handleFilterChange}
            stats={searchEngine?.getStats()}
          />
        </div>

        {/* Results */}
        <div className="space-y-4">
          {results.length > 0 ? (
            <>
              <div className="text-sm text-gray-600 mb-4">
                {results.length} résultat{results.length > 1 ? 's' : ''} trouvé{results.length > 1 ? 's' : ''}
              </div>
              {results.map((result, index) => (
                <ResultCard 
                  key={`${result.id}-${index}`} 
                  entry={result}
                  highlightTerms={[]} // TODO: extract search terms
                />
              ))}
            </>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                Commencez votre recherche
              </h3>
              <p className="text-gray-500 max-w-md mx-auto">
                Collez une erreur eurofpl complète, ou cherchez par ID, balise, 
                aérodrome, route...
              </p>
              
              {/* Examples */}
              <div className="mt-8 max-w-2xl mx-auto">
                <p className="text-sm font-medium text-gray-700 mb-3">Exemples de recherche:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-left">
                  <ExampleSearch query="LS2857" description="ID de règle" />
                  <ExampleSearch query="OMASI" description="Balise/Point" />
                  <ExampleSearch query="LSGG" description="Aérodrome" />
                  <ExampleSearch query="L856" description="Airway" />
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 py-6 border-t border-gray-200 bg-white">
        <div className="container mx-auto px-4 text-center text-sm text-gray-600">
          <p>
            RAD Error Decoder - Données EUROCONTROL - 
            <a 
              href="https://github.com/paneuropeennefiles-cmyk/rad-error-decoder" 
              className="text-primary-600 hover:text-primary-700 ml-1"
              target="_blank"
              rel="noopener noreferrer"
            >
              Source sur GitHub
            </a>
          </p>
        </div>
      </footer>
    </div>
  )
}

// Example search component
function ExampleSearch({ query, description }) {
  return (
    <div className="p-3 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-colors cursor-pointer">
      <code className="text-sm font-mono text-primary-600">{query}</code>
      <p className="text-xs text-gray-500 mt-1">{description}</p>
    </div>
  )
}

export default App
