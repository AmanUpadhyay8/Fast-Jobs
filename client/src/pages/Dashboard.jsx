// src/pages/Dashboard.jsx
import { useJobs } from '../hooks/useJobs'
import { useAnalytics } from '../hooks/useAnalytics'
import FilterBar from '../components/FilterBar'
import JobSection from '../components/JobSection'
import AnalyticsCard from '../components/AnalyticsCard'
import Skeleton from '../components/Skeleton'

export default function Dashboard() {
    const { data, isLoading, isError } = useJobs()
    const { data: analytics } = useAnalytics()

    const newJobs = data?.jobs.filter(j => j.isRecent) ?? []
    const olderJobs = data?.jobs.filter(j => !j.isRecent) ?? []

    return (
        <div className="min-h-screen bg-gray-950 text-gray-100">
            <div className="max-w-7xl mx-auto px-6 py-8">

                {/* Header - Removed and moved to the Navbar component */}


                <div className="flex gap-8">

                    {/* Main column */}
                    <div className="flex-1 min-w-0 space-y-6">

                        <FilterBar />

                        {isLoading && <Skeleton />}

                        {isError && (
                            <div className="text-center py-16 text-gray-600">
                                <p className="text-sm">Failed to load jobs. Is the backend running?</p>
                            </div>
                        )}

                        {!isLoading && !isError && data?.jobs.length === 0 && (
                            <div className="text-center py-16 text-gray-600">
                                <p className="text-sm">No jobs found. Try adjusting your filters.</p>
                            </div>
                        )}

                        {!isLoading && !isError && (
                            <div className="space-y-8">
                                <JobSection
                                    title="New — last 24 hours"
                                    jobs={newJobs}
                                    highlight
                                />
                                <JobSection
                                    title="Older listings"
                                    jobs={olderJobs}
                                />
                            </div>
                        )}

                    </div>

                    {/* Analytics sidebar */}
                    <aside className="w-72 shrink-0 hidden lg:block">
                        <AnalyticsCard data={analytics} />
                    </aside>

                </div>
            </div>
        </div>
    )
}