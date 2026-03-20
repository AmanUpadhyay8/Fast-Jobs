// src/components/Navbar.jsx
import { Link, useLocation } from 'react-router-dom'

export default function Navbar() {
    const { pathname } = useLocation()

    return (
        <nav className="border-b border-gray-800/60 bg-gray-950/80 backdrop-blur-sm sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">

                {/* Logo + title */}
                <Link to="/" className="flex items-center gap-2.5 group">
                    <div className="w-7 h-7 shrink-0">
                        <svg viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect width="28" height="28" rx="7" fill="#0f766e" />
                            <path
                                d="M7 14.5L11.5 19L21 9"
                                stroke="#ccfbf1"
                                strokeWidth="2.2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                            <path
                                d="M7 9h6M7 14h4"
                                stroke="#5eead4"
                                strokeWidth="2"
                                strokeLinecap="round"
                                opacity="0.6"
                            />
                        </svg>
                    </div>
                    <span className="text-gray-100 font-semibold text-base tracking-tight group-hover:text-teal-400 transition-colors">
                        Fast Jobs
                    </span>
                </Link>

                {/* Nav links */}
                <div className="flex items-center gap-1">
                    <NavLink to="/" label="Jobs" active={pathname === '/'} />
                    <NavLink to="/about" label="About" active={pathname === '/about'} />
                </div>

            </div>
        </nav>
    )
}

function NavLink({ to, label, active }) {
    return (
        <Link
            to={to}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors duration-150
        ${active
                    ? 'text-teal-400 bg-teal-950/50'
                    : 'text-gray-500 hover:text-gray-200 hover:bg-gray-800/60'
                }`}
        >
            {label}
        </Link>
    )
}