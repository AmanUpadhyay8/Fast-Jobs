// src/store/filterStore.js
import { create } from 'zustand'

export const useFilterStore = create(set => ({
    level: '',
    maxAge: null,
    search: '',
    setLevel: level => set({ level }),
    setMaxAge: maxAge => set({ maxAge }),
    setSearch: search => set({ search }),
    reset: () => set({ level: '', maxAge: null, search: '' }),
}))