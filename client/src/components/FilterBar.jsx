// src/components/FilterBar.jsx
import { useState, useRef, useEffect } from 'react'
import { useFilterStore } from '../store/filterStore'

const LEVELS = [
    { value: '', label: 'All levels' },
    { value: 'intern', label: 'Intern' },
    { value: 'sde', label: 'SDE' },
    { value: 'senior', label: 'Senior' },
    { value: 'staff', label: 'Staff' },
    { value: 'principal', label: 'Principal' },
]

const TIME_FILTERS = [
    { value: null, label: 'Any time' },
    { value: 24, label: 'Last 24h' },
    { value: 48, label: 'Last 48h' },
    { value: 72, label: 'Last 72h' },
]

function Dropdown({ options, value, onChange, placeholder }) {
    const [open, setOpen] = useState(false)
    const ref = useRef(null)

    const selected = options.find(o => o.value === value)

    // Close on outside click
    useEffect(() => {
        function handleClick(e) {
            if (ref.current && !ref.current.contains(e.target)) {
                setOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClick)
        return () => document.removeEventListener('mousedown', handleClick)
    }, [])

    return (
        <div ref={ref} className="relative">
            <button
                onClick={() => setOpen(o => !o)}
                className={`flex items-center gap-2 bg-gray-900 border rounded-lg px-3 py-2 text-sm transition-all duration-150 cursor-pointer min-w-32
          ${open
                        ? 'border-teal-600 text-gray-100'
                        : 'border-gray-800 text-gray-400 hover:border-gray-600 hover:text-gray-200'
                    }`}
            >
                <span className="flex-1 text-left">
                    {selected?.label || placeholder}
                </span>
                <svg
                    className={`w-3.5 h-3.5 shrink-0 transition-transform duration-150 ${open ? 'rotate-180 text-teal-400' : ''}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {open && (
                <div className="absolute top-full left-0 mt-1.5 w-full min-w-36 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-50 overflow-hidden">
                    {options.map(option => {
                        const isActive = option.value === value
                        return (
                            <button
                                key={option.label}
                                onClick={() => { onChange(option.value); setOpen(false) }}
                                className={`w-full text-left px-3 py-2 text-sm transition-colors duration-100
                  ${isActive
                                        ? 'text-teal-400 bg-teal-950/60'
                                        : 'text-gray-400 hover:text-gray-100 hover:bg-gray-800'
                                    }`}
                            >
                                {option.label}
                            </button>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

export default function FilterBar() {
    const { level, maxAge, search, setLevel, setMaxAge, setSearch, reset } = useFilterStore()

    const hasActiveFilters = level || maxAge || search

    return (
        <div className="flex flex-wrap items-center gap-3">

            {/* Search */}
            <input
                type="text"
                placeholder="Search company..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-teal-600 transition-colors w-44"
            />

            {/* Level dropdown */}
            <Dropdown
                options={LEVELS}
                value={level}
                onChange={setLevel}
                placeholder="All levels"
            />

            {/* Time dropdown */}
            <Dropdown
                options={TIME_FILTERS}
                value={maxAge}
                onChange={val => setMaxAge(val)}
                placeholder="Any time"
            />

            {/* Clear */}
            {hasActiveFilters && (
                <button
                    onClick={reset}
                    className="text-xs text-gray-500 hover:text-gray-300 transition-colors underline underline-offset-2"
                >
                    Clear filters
                </button>
            )}

        </div>
    )
}