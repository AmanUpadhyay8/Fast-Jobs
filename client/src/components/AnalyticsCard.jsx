// src/components/AnalyticsCard.jsx
import {
    BarChart, Bar, XAxis, YAxis, Tooltip,
    ResponsiveContainer, Cell
} from 'recharts'

export default function AnalyticsCard({ data }) {
    if (!data) return (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-4 animate-pulse">
            <div className="h-4 bg-gray-800 rounded w-1/2" />
            <div className="h-32 bg-gray-800 rounded" />
        </div>
    )

    const { total, newCount, topCompany, byCompany } = data

    // Calculate chart height dynamically so every company gets enough room
    const chartHeight = Math.max(200, (byCompany?.length ?? 0) * 28)

    return (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-5 sticky top-6">

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-2">
                <StatBox label="Total" value={total} />
                <StatBox label="New" value={newCount} highlight />
                <StatBox label="Companies" value={byCompany?.length ?? 0} />
            </div>

            {/* Top company */}
            {topCompany && (
                <div className="bg-gray-800/60 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">Top company</p>
                    <p className="text-sm font-medium text-teal-400 truncate">{topCompany.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{topCompany.count} openings</p>
                </div>
            )}

            {/* Chart */}
            <div>
                <p className="text-xs text-gray-500 mb-3">Openings by company</p>
                <ResponsiveContainer width="100%" height={chartHeight}>
                    <BarChart
                        data={byCompany}
                        layout="vertical"
                        margin={{ top: 0, right: 8, left: 0, bottom: 0 }}
                    >
                        <XAxis
                            type="number"
                            tick={{ fill: '#6b7280', fontSize: 10 }}
                            axisLine={false}
                            tickLine={false}
                            allowDecimals={false}
                        />
                        <YAxis
                            type="category"
                            dataKey="name"
                            tick={{ fill: '#9ca3af', fontSize: 11 }}
                            axisLine={false}
                            tickLine={false}
                            width={90}
                            interval={0}   // ← force every label to show, no skipping
                            tickFormatter={name => name.length > 12 ? name.slice(0, 12) + '…' : name}
                        />
                        <Tooltip
                            contentStyle={{
                                background: '#111827',
                                border: '1px solid #1f2937',
                                borderRadius: '8px',
                                fontSize: '12px',
                                color: '#e5e7eb',
                            }}
                            itemStyle={{ color: '#ffffff' }}   // ← white value on hover
                            labelStyle={{ color: '#9ca3af' }}  // ← gray label on hover
                            cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                        />
                        <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                            {byCompany?.map((_, i) => (
                                <Cell
                                    key={i}
                                    fill={i === 0 ? '#2dd4bf' : '#1f2937'}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

        </div>
    )
}

function StatBox({ label, value, highlight = false }) {
    return (
        <div className="bg-gray-800/60 rounded-lg p-3 text-center">
            <p className={`text-lg font-semibold ${highlight ? 'text-teal-400' : 'text-gray-200'}`}>
                {value ?? 0}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
        </div>
    )
}