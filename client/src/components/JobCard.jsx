// src/components/JobCard.jsx
import { formatDistanceToNow } from 'date-fns'

const LEVEL_COLORS = {
    intern: 'bg-blue-950 text-blue-400 border border-blue-800',
    sde: 'bg-teal-950 text-teal-400 border border-teal-800',
    senior: 'bg-purple-950 text-purple-400 border border-purple-800',
    staff: 'bg-amber-950 text-amber-400 border border-amber-800',
    principal: 'bg-red-950 text-red-400 border border-red-800',
}

const TIER_COLORS = {
    premium: 'text-yellow-400 bg-yellow-950/60 border border-yellow-800/60',
    good: 'text-blue-400 bg-blue-950/60 border border-blue-800/60',
    startup: 'text-orange-400 bg-orange-950/60 border border-orange-800/60',
}

const TIER_LABELS = {
    premium: 'Premium',
    good: 'Good',
    startup: 'Startup',
}

export default function JobCard({ job }) {
    const postedAgo = formatDistanceToNow(new Date(job.postedAt), { addSuffix: true })
    const levelColor = LEVEL_COLORS[job.level] || LEVEL_COLORS.sde
    const tierColor = TIER_COLORS[job.tier] || TIER_COLORS.good
    const tierLabel = TIER_LABELS[job.tier] || 'Good'

    return (
        <div className="group bg-gray-900 border border-gray-800 rounded-lg p-4 hover:border-teal-500/50 transition-all duration-200">

            {/* Top row — job link + tier badge */}
            <div className="flex items-start justify-between gap-3">

                <a href={job.applyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-teal-400 hover:text-teal-300 font-medium text-sm leading-snug group-hover:underline underline-offset-2 transition-colors"
                >
                    {job.company} — {job.title}
                </a>
                <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full ${tierColor}`}>
                    {tierLabel}
                </span>
            </div>

            {/* Bottom row — level, city, time, remote */}
            <div className="flex flex-wrap items-center gap-2 mt-2.5">
                <span className={`text-xs px-2 py-0.5 rounded-full ${levelColor}`}>
                    {job.level}
                </span>
                {job.city && (
                    <span className="text-xs text-gray-500">
                        {job.city}
                    </span>
                )}
                <span className="text-xs text-gray-600">{postedAgo}</span>
                {job.isRemote && (
                    <span className="shrink-0 text-xs bg-green-950 text-green-400 border border-green-800 px-2 py-0.5 rounded-full">
                        Remote
                    </span>
                )}
            </div>

        </div>
    )
}