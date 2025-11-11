import { useState } from 'react'
import { ClipboardDocumentIcon, CheckIcon } from '@heroicons/react/24/outline'

/**
 * ResultCard - Affiche un résultat de recherche RAD de manière lisible
 */
export function ResultCard({ entry, highlightTerms = [] }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    const text = formatForCopy(entry)
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-white border-2 border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gray-50">
        <div className="flex items-center space-x-3 flex-wrap gap-y-2">
          {/* ID */}
          <span className="text-lg font-mono font-bold text-gray-900">
            {entry.id}
          </span>
          
          {/* Status Badge */}
          <StatusBadge status={entry.change_indicator} />
          
          {/* Type */}
          <span className="text-sm text-gray-600">
            Annex {entry.annex} - {entry.type}
          </span>
        </div>
        
        {/* Copy Button */}
        <button
          onClick={handleCopy}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          title="Copier les détails"
        >
          {copied ? (
            <CheckIcon className="h-5 w-5 text-green-600" />
          ) : (
            <ClipboardDocumentIcon className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Validity Period */}
      {(entry.valid_from || entry.valid_until) && (
        <div className="px-4 py-2 bg-blue-50 text-sm">
          <span className="font-medium text-blue-900">Validité:</span>{' '}
          <span className="text-blue-700">
            {entry.valid_from || '...'} → {entry.valid_until || 'UFN'}
          </span>
        </div>
      )}

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Point/Airspace (Annex 2B) */}
        {entry.point_or_airspace && (
          <Field label="Point/Airspace" mono>
            {highlightText(entry.point_or_airspace, highlightTerms)}
          </Field>
        )}

        {/* Airspace (Annex 2A, 2C) */}
        {entry.airspace && (
          <Field label="Airspace" mono>
            {highlightText(entry.airspace, highlightTerms)}
          </Field>
        )}

        {/* Airway + From/To (Annex 2B) */}
        {entry.airway && (
          <Field label="Airway" mono>
            {entry.from_point && <span className="text-gray-600">{entry.from_point} </span>}
            <span className="font-bold text-primary-600">
              {highlightText(entry.airway, highlightTerms)}
            </span>
            {entry.to_point && <span className="text-gray-600"> {entry.to_point}</span>}
          </Field>
        )}

        {/* DCT From/To (Annex 3B) */}
        {(entry.from_point && entry.to_point && !entry.airway) && (
          <Field label="Direct Route" mono>
            {highlightText(entry.from_point, highlightTerms)} 
            <span className="mx-2 text-gray-400">DCT</span>
            {highlightText(entry.to_point, highlightTerms)}
          </Field>
        )}

        {/* Aerodrome (Annex 3A) */}
        {entry.aerodrome && (
          <Field label="Aerodrome" mono>
            {highlightText(entry.aerodrome, highlightTerms)}
          </Field>
        )}

        {/* DCT ARR/DEP Point (Annex 3A) */}
        {(entry.dct_arr_pt || entry.dct_dep_pt) && (
          <Field label="DCT Point" mono>
            {highlightText(entry.dct_arr_pt || entry.dct_dep_pt, highlightTerms)}
          </Field>
        )}

        {/* First PT STAR / Last PT SID (Annex 3A) */}
        {(entry.first_pt_star || entry.last_pt_sid) && (
          <Field label={entry.first_pt_star ? "First PT STAR / STAR ID" : "Last PT SID / SID ID"} mono>
            {highlightText(entry.first_pt_star || entry.last_pt_sid, highlightTerms)}
          </Field>
        )}

        {/* ARR/DEP FPL Options (Annex 3A) - TRÈS IMPORTANT */}
        {(entry.arr_fpl_option || entry.dep_fpl_options) && (
          <Field label={entry.arr_fpl_option ? "ARR FPL Options" : "DEP FPL Options"}>
            <pre className="p-3 bg-amber-50 rounded-lg text-sm font-mono whitespace-pre-wrap overflow-x-auto border border-amber-200">
              {highlightText(entry.arr_fpl_option || entry.dep_fpl_options, highlightTerms)}
            </pre>
          </Field>
        )}

        {/* Utilization - Le plus important */}
        {entry.utilization && (
          <Field label="Utilization">
            <pre className="p-3 bg-gray-50 rounded-lg text-sm font-mono whitespace-pre-wrap overflow-x-auto border border-gray-200">
              {highlightText(entry.utilization, highlightTerms)}
            </pre>
          </Field>
        )}

        {/* Operational Goal */}
        {entry.operational_goal && (
          <Field label="Operational Goal">
            <p className="text-gray-700 leading-relaxed">
              {entry.operational_goal}
            </p>
          </Field>
        )}

        {/* Time Applicability & Categorisation */}
        <div className="flex flex-wrap gap-4 text-sm">
          {entry.time_applicability && (
            <div>
              <span className="font-medium text-gray-500">Time:</span>{' '}
              <code className="px-2 py-1 bg-gray-100 rounded text-gray-900">
                {entry.time_applicability}
              </code>
            </div>
          )}
          
          {entry.categorisation && (
            <div>
              <span className="font-medium text-gray-500">Category:</span>{' '}
              <span className="px-2 py-1 bg-gray-100 rounded text-gray-900">
                {entry.categorisation}
              </span>
            </div>
          )}
        </div>

        {/* Remarks */}
        {entry.remarks && (
          <div className="pt-3 border-t text-sm">
            <span className="font-medium text-gray-500">Remarks:</span>{' '}
            <span className="text-gray-600">{entry.remarks}</span>
          </div>
        )}

        {/* Footer Metadata */}
        <div className="flex items-center justify-between pt-3 border-t text-xs text-gray-500">
          <div className="flex items-center space-x-4">
            {entry.nas_fab && (
              <span>
                <span className="font-medium">FIR:</span> {entry.nas_fab}
              </span>
            )}
            {entry.atc_unit && (
              <span>
                <span className="font-medium">ATC:</span> {entry.atc_unit}
              </span>
            )}
            {entry.owner && (
              <span>
                <span className="font-medium">Owner:</span> {entry.owner}
              </span>
            )}
          </div>
          {entry.release_date && (
            <span>Released: {entry.release_date}</span>
          )}
        </div>
      </div>
    </div>
  )
}

// Helper Components

function Field({ label, children, mono = false }) {
  return (
    <div>
      <div className="text-sm font-medium text-gray-500 mb-1">{label}:</div>
      <div className={mono ? 'font-mono' : ''}>
        {children}
      </div>
    </div>
  )
}

function StatusBadge({ status }) {
  const getStyle = () => {
    const s = status?.toLowerCase()
    if (s === 'new') return 'bg-green-100 text-green-800 border-green-200'
    if (s === 'amd') return 'bg-blue-100 text-blue-800 border-blue-200'
    if (s === 'del') return 'bg-red-100 text-red-800 border-red-200'
    if (s === 'sus') return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    return 'bg-gray-100 text-gray-800 border-gray-200'
  }

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded border ${getStyle()}`}>
      {status || 'ACTIVE'}
    </span>
  )
}

function highlightText(text, terms) {
  if (!text || !terms || terms.length === 0) {
    return text
  }

  // Simple highlight - in production, use a proper library
  let result = text
  terms.forEach(term => {
    const regex = new RegExp(`(${escapeRegex(term)})`, 'gi')
    result = result.replace(regex, '<mark class="bg-yellow-200 px-0.5">$1</mark>')
  })

  return <span dangerouslySetInnerHTML={{ __html: result }} />
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function formatForCopy(entry) {
  const lines = [
    `ID: ${entry.id}`,
    `Annex: ${entry.annex}`,
    `Type: ${entry.type}`,
    ''
  ]

  if (entry.valid_from || entry.valid_until) {
    lines.push(`Valid: ${entry.valid_from || '...'} → ${entry.valid_until || 'UFN'}`)
    lines.push('')
  }

  if (entry.point_or_airspace) {
    lines.push(`Point/Airspace: ${entry.point_or_airspace}`)
  }

  if (entry.airway) {
    lines.push(`Airway: ${entry.from_point || ''} ${entry.airway} ${entry.to_point || ''}`.trim())
  }

  if (entry.aerodrome) {
    lines.push(`Aerodrome: ${entry.aerodrome}`)
  }

  if (entry.dct_arr_pt || entry.dct_dep_pt) {
    lines.push(`DCT Point: ${entry.dct_arr_pt || entry.dct_dep_pt}`)
  }

  if (entry.first_pt_star) {
    lines.push(`First PT STAR: ${entry.first_pt_star}`)
  }

  if (entry.last_pt_sid) {
    lines.push(`Last PT SID: ${entry.last_pt_sid}`)
  }

  if (entry.arr_fpl_option || entry.dep_fpl_options) {
    lines.push('', 'FPL Options:', entry.arr_fpl_option || entry.dep_fpl_options)
  }

  if (entry.utilization) {
    lines.push('', 'Utilization:', entry.utilization)
  }

  if (entry.operational_goal) {
    lines.push('', 'Operational Goal:', entry.operational_goal)
  }

  if (entry.time_applicability) {
    lines.push('', `Time: ${entry.time_applicability}`)
  }

  if (entry.remarks) {
    lines.push('', `Remarks: ${entry.remarks}`)
  }

  return lines.join('\n')
}
