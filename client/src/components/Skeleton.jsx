// src/components/Skeleton.jsx
export default function Skeleton() {
    return (
        <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
                <div
                    key={i}
                    className="bg-gray-900 border border-gray-800 rounded-lg p-4 animate-pulse"
                >
                    <div className="h-4 bg-gray-800 rounded w-2/3 mb-3" />
                    <div className="flex gap-2">
                        <div className="h-3 bg-gray-800 rounded w-16" />
                        <div className="h-3 bg-gray-800 rounded w-20" />
                        <div className="h-3 bg-gray-800 rounded w-12" />
                    </div>
                </div>
            ))}
        </div>
    )
}