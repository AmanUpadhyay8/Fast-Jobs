// src/hooks/useAnalytics.js
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL

export function useAnalytics() {
    return useQuery({
        queryKey: ['analytics'],
        queryFn: async () => {
            const { data } = await axios.get(`${API}/api/analytics`)
            return data
        },
        staleTime: 1000 * 60 * 10,  // analytics can be stale for 10 mins
    })
}