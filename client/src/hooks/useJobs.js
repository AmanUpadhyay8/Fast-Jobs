// src/hooks/useJobs.js
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { useFilterStore } from '../store/filterStore'

const API = import.meta.env.VITE_API_URL

export function useJobs() {
    const { level, maxAge, search } = useFilterStore()

    return useQuery({
        queryKey: ['jobs', level, maxAge, search],
        queryFn: async () => {
            const params = new URLSearchParams()
            if (level) params.set('level', level)
            if (maxAge) params.set('maxAge', maxAge)
            if (search) params.set('company', search)
            const { data } = await axios.get(`${API}/api/jobs?${params}`)
            return data
        },
    })
}