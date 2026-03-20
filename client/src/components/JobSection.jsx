// src/components/JobSection.jsx
import JobCard from './JobCard'

export default function JobSection({ title, jobs, highlight = false }) {
    if (jobs.length === 0) return null

    return (
        <div>
            <div className="flex items-center gap-3 mb-3">
                <h2 className={`text-sm font-medium ${highlight ? 'text-teal-400' : 'text-gray-500'}`}>
                    {title}
                </h2>
                <span className={`text-xs px-2 py-0.5 rounded-full ${highlight
                        ? 'bg-teal-950 text-teal-400 border border-teal-800'
                        : 'bg-gray-800 text-gray-500'
                    }`}>
                    {jobs.length}
                </span>
                <div className={`flex-1 h-px ${highlight ? 'bg-teal-900/50' : 'bg-gray-800'}`} />
            </div>

            <div className="space-y-2">
                {jobs.map(job => (
                    <JobCard key={job._id} job={job} />
                ))}
            </div>
        </div>
    )
}