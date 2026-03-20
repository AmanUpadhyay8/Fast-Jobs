// src/pages/About.jsx
export default function About() {
    return (
        <div className="max-w-2xl mx-auto px-6 py-16">

            {/* Header */}
            <div className="mb-12">
                <h1 className="text-2xl font-semibold text-gray-100 tracking-tight mb-3">
                    About Fast Jobs
                </h1>
                <p className="text-gray-400 leading-relaxed">
                    A personal job tracker built to surface the latest openings from top
                    product companies and startups — without the noise of job boards.
                </p>
            </div>

            {/* How it works */}
            <div className="space-y-8">
                <Section title="How it works">
                    <p className="text-gray-400 leading-relaxed">
                        Fast Jobs runs an automated scraper twice daily that pulls fresh job
                        listings and filters them against a curated whitelist of top product-focused
                        companies. Only roles posted within the last 48 hours surface at the top —
                        older listings are still accessible below.
                    </p>
                </Section>

                <Section title="Data sources">
                    <div className="space-y-3">
                        {/*
                           <SourceRow
                            name="The Job Exchange"
                            description="Primary source — scraped twice daily for India-based roles"
                            badge="active"
                        /> 
                        */}
                        <SourceRow
                            name="JSearch via RapidAPI"
                            description="Source — aggregates LinkedIn, Indeed, Glassdoor"
                            badge="active"
                        />
                    </div>
                </Section>

                <Section title="Company tiers">
                    <div className="space-y-2">
                        <TierRow
                            tier="Premium"
                            color="text-teal-400 bg-teal-950/60 border border-teal-800"
                            description="FAANG, top-tier product companies, unicorns"
                        />
                        <TierRow
                            tier="Good"
                            color="text-purple-400 bg-purple-950/60 border border-purple-800"
                            description="Strong product companies, well-funded startups"
                        />
                        <TierRow
                            tier="Startup"
                            color="text-amber-400 bg-amber-950/60 border border-amber-800"
                            description="High-growth Indian startups"
                        />
                    </div>
                </Section>

                <Section title="Tech stack">
                    <div className="flex flex-wrap gap-2">
                        {['React', 'Vite', 'Tailwind CSS', 'Node.js', 'Express', 'MongoDB', 'GitHub Actions', 'Render', 'Vercel'].map(t => (
                            <span
                                key={t}
                                className="text-xs text-gray-400 bg-gray-800 border border-gray-700 px-2.5 py-1 rounded-full"
                            >
                                {t}
                            </span>
                        ))}
                    </div>
                </Section>
                <Section title="Future work">
                    <div className="space-y-2">
                        <p className="text-sm text-gray-400 leading-relaxed">
                            Fast Jobs is a work in progress. Future plans include:
                        </p>
                        <ul className="space-y-2">
                            <li className="text-sm text-gray-400 leading-relaxed">
                                Adding more job sources
                            </li>
                            <li className="text-sm text-gray-400 leading-relaxed">
                                Adding more company tiers
                            </li>
                            <li className="text-sm text-gray-400 leading-relaxed">
                                Adding more job analytics
                            </li>
                        </ul>
                    </div>
                </Section>
                <Section title="">
                    <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-400">Made with ❤️ by</span>
                        <span className="text-sm text-gray-200 font-medium">
                            <a href="https://www.linkedin.com/in/aman-upadhyay8/" target="_blank" rel="noopener noreferrer">
                                Aman Upadhyay
                            </a>
                        </span>
                    </div>
                </Section>
            </div>

        </div>
    )
}

function Section({ title, children }) {
    return (
        <div>
            <h2 className="text-sm font-medium text-gray-300 mb-3 uppercase tracking-wider">
                {title}
            </h2>
            {children}
        </div>
    )
}

function SourceRow({ name, description, badge }) {
    return (
        <div className="flex items-start justify-between gap-4 bg-gray-900 border border-gray-800 rounded-lg p-3">
            <div>
                <p className="text-sm text-gray-200 font-medium">{name}</p>
                <p className="text-xs text-gray-500 mt-0.5">{description}</p>
            </div>
            {badge === 'active' && (
                <span className="shrink-0 text-xs text-green-400 bg-green-950/60 border border-green-800 px-2 py-0.5 rounded-full">
                    active
                </span>
            )}
        </div>
    )
}

function TierRow({ tier, color, description }) {
    return (
        <div className="flex items-center gap-3">
            <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium shrink-0 ${color}`}>
                {tier}
            </span>
            <span className="text-sm text-gray-500">{description}</span>
        </div>
    )
}