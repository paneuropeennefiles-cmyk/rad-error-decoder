import Fuse from 'fuse.js'

/**
 * RADSearchEngine - Moteur de recherche pour les données RAD
 * Utilise Fuse.js pour recherche floue performante
 */
export class RADSearchEngine {
  constructor(radData) {
    if (!radData || !radData.annexes) {
      throw new Error('Invalid RAD data structure')
    }

    this.data = this._flattenData(radData)
    this.metadata = radData.metadata
    this.initFuse()
  }

  /**
   * Aplatit toutes les annexes en un seul tableau
   */
  _flattenData(radData) {
    const allEntries = []
    
    for (const [annexKey, entries] of Object.entries(radData.annexes)) {
      if (Array.isArray(entries)) {
        allEntries.push(...entries)
      }
    }
    
    console.log(`📊 Loaded ${allEntries.length} RAD entries`)
    return allEntries
  }

  /**
   * Initialize Fuse.js search engine
   */
  initFuse() {
    const fuseOptions = {
      keys: [
        { name: 'id', weight: 3 },              // ID exact très important
        { name: 'point_or_airspace', weight: 2 },
        { name: 'airspace', weight: 2 },
        { name: 'airway', weight: 2 },
        { name: 'from_point', weight: 1.5 },
        { name: 'to_point', weight: 1.5 },
        { name: 'aerodrome', weight: 2 },
        { name: 'utilization', weight: 1 },
        { name: 'operational_goal', weight: 0.8 },
        { name: 'nas_fab', weight: 1 },
        { name: 'searchable_text', weight: 0.5 },
      ],
      threshold: 0.3,              // 0 = exact, 1 = tout matcher
      includeScore: true,
      includeMatches: true,
      minMatchCharLength: 2,
      ignoreLocation: true,        // Cherche partout dans le texte
      useExtendedSearch: false
    }

    this.fuse = new Fuse(this.data, fuseOptions)
    console.log('✅ Search engine initialized')
  }

  /**
   * Recherche principale
   * @param {string} query - Terme de recherche
   * @param {object} options - Options de filtre
   * @returns {Array} Résultats de recherche
   */
  search(query, options = {}) {
    const {
      annex = null,          // Filtrer par annexe
      nasFab = null,         // Filtrer par pays/FIR
      changeStatus = null,   // Filtrer par statut (NEW, AMD, etc.)
      limit = 50             // Limite de résultats
    } = options

    if (!query || query.trim().length < 2) {
      return []
    }

    const cleanQuery = query.trim()

    // Recherche avec Fuse
    let results = this.fuse.search(cleanQuery, { limit: limit * 2 }) // Plus de marge

    // Appliquer les filtres additionnels
    results = results.filter(result => {
      const item = result.item

      if (annex && item.annex !== annex) return false
      if (nasFab && !item.nas_fab?.includes(nasFab)) return false
      if (changeStatus && item.change_indicator?.toUpperCase() !== changeStatus) return false

      return true
    })

    // Limiter les résultats
    results = results.slice(0, limit)

    // Extraire les items et ajouter le score
    return results.map(result => ({
      ...result.item,
      _score: result.score,
      _matches: result.matches
    }))
  }

  /**
   * Recherche par ID exact
   * @param {string} id - ID de la règle
   * @returns {Array} Résultats
   */
  searchById(id) {
    const normalized = id.trim().toUpperCase()
    return this.data.filter(entry => 
      entry.id?.toUpperCase() === normalized
    )
  }

  /**
   * Recherche par référence eurofpl (ex: [LSLF1139C])
   * @param {string} refCode - Code de référence
   * @returns {Array} Résultats
   */
  searchByReference(refCode) {
    // Nettoyer le code (enlever crochets, espaces)
    const cleanCode = refCode.replace(/[\[\]\s]/g, '').trim().toUpperCase()
    
    // Chercher dans les IDs
    const results = this.searchById(cleanCode)
    
    if (results.length > 0) {
      console.log(`✅ Found reference: ${cleanCode}`)
      return results
    }

    console.log(`⚠️ Reference not found: ${cleanCode}`)
    return []
  }

  /**
   * Recherche avancée avec parsing d'erreur eurofpl
   * @param {string} errorMessage - Message d'erreur complet
   * @returns {Array} Résultats
   */
  searchByError(errorMessage) {
    const extracted = this._extractErrorInfo(errorMessage)
    
    // Priorité 1: Code de référence
    if (extracted.refCode) {
      const byRef = this.searchByReference(extracted.refCode)
      if (byRef.length > 0) return byRef
    }

    // Priorité 2: Recherche par points mentionnés
    if (extracted.points.length > 0) {
      const query = extracted.points.join(' ')
      return this.search(query, { 
        annex: extracted.annex,
        limit: 20 
      })
    }

    // Fallback: recherche texte intégral
    return this.search(errorMessage, { limit: 20 })
  }

  /**
   * Extrait les informations d'une erreur eurofpl
   * @private
   */
  _extractErrorInfo(errorMessage) {
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

    // Extraire annexe
    const annexMatch = upper.match(/ANNEX\s+(\d[A-C]?)/i)
    if (annexMatch) {
      info.annex = annexMatch[1]
    }

    // Extraire balises/points (5 lettres uppercase)
    const pointMatches = upper.match(/\b[A-Z]{5}\b/g)
    if (pointMatches) {
      // Dédupliquer et exclure mots courants
      const excludeWords = ['ANNEX', 'ROUTE', 'TRAFFIC', 'ERROR']
      info.points = [...new Set(pointMatches)].filter(p => !excludeWords.includes(p))
    }

    // Type d'erreur
    if (upper.includes('FORBIDDEN')) info.type = 'FORBIDDEN'
    if (upper.includes('RESTRICTED')) info.type = 'RESTRICTED'
    if (upper.includes('NOT AVAILABLE')) info.type = 'NOT_AVAILABLE'

    return info
  }

  /**
   * Suggestions auto-complete
   * @param {string} partialQuery - Requête partielle
   * @param {number} limit - Nombre de suggestions
   * @returns {Array} Suggestions d'IDs
   */
  getSuggestions(partialQuery, limit = 5) {
    if (partialQuery.length < 2) return []

    const results = this.search(partialQuery, { limit: limit * 2 })
    
    // Extraire IDs uniques
    const suggestions = results
      .map(r => r.id)
      .filter((id, idx, arr) => arr.indexOf(id) === idx)
      .slice(0, limit)

    return suggestions
  }

  /**
   * Statistiques pour dashboard/filtres
   * @returns {object} Stats
   */
  getStats() {
    const stats = {
      total: this.data.length,
      byAnnex: {},
      byCountry: {},
      byStatus: {}
    }

    this.data.forEach(entry => {
      // Par annexe
      const annex = entry.annex || 'unknown'
      const annexKey = `annex${annex.toLowerCase().replace(/[^a-z0-9]/g, '')}_`
      stats.byAnnex[annexKey] = (stats.byAnnex[annexKey] || 0) + 1

      // Par pays/FIR
      if (entry.nas_fab) {
        const countries = entry.nas_fab.split(/[,\s]+/)
        countries.forEach(c => {
          if (c.trim()) {
            stats.byCountry[c.trim()] = (stats.byCountry[c.trim()] || 0) + 1
          }
        })
      }

      // Par statut
      const status = entry.change_indicator?.toUpperCase() || 'ACTIVE'
      stats.byStatus[status] = (stats.byStatus[status] || 0) + 1
    })

    return stats
  }

  /**
   * Recherche dans une annexe spécifique
   * @param {string} annex - Numéro d'annexe
   * @param {string} query - Terme de recherche
   * @returns {Array} Résultats
   */
  searchInAnnex(annex, query) {
    return this.search(query, { annex, limit: 100 })
  }

  /**
   * Obtenir toutes les entrées d'une annexe
   * @param {string} annex - Numéro d'annexe
   * @returns {Array} Entrées
   */
  getAnnexEntries(annex) {
    return this.data.filter(entry => entry.annex === annex)
  }

  /**
   * Obtenir les métadonnées du RAD
   * @returns {object} Métadonnées
   */
  getMetadata() {
    return this.metadata
  }
}

export default RADSearchEngine
