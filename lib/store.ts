import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface RaindropItem {
  _id: number
  title: string
  excerpt: string
  link: string
  domain: string
  cover: string
  tags: string[]
  created: string
  type: "link" | "article" | "image" | "video" | "document" | "audio"
  note: string
}

interface AppState {
  // Feed configuration
  readTag: string
  watchTag: string

  // Authentication state
  isAuthenticated: boolean

  // Feed data
  readItems: RaindropItem[]
  watchItems: RaindropItem[]

  // UI state
  activeTab: "read" | "watch"
  isLoading: boolean
  error: string | null

  // Actions
  setReadTag: (tag: string) => void
  setWatchTag: (tag: string) => void
  setAuthenticated: (authenticated: boolean) => void
  setActiveTab: (tab: "read" | "watch") => void
  setReadItems: (items: RaindropItem[]) => void
  setWatchItems: (items: RaindropItem[]) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Initial state
      readTag: "#read",
      watchTag: "#watch",
      isAuthenticated: false,
      readItems: [],
      watchItems: [],
      activeTab: "read",
      isLoading: false,
      error: null,

      // Actions
      setReadTag: (tag) => set({ readTag: tag }),
      setWatchTag: (tag) => set({ watchTag: tag }),
      setAuthenticated: (authenticated) => set({ isAuthenticated: authenticated }),
      setActiveTab: (tab) => set({ activeTab: tab }),
      setReadItems: (items) => set({ readItems: items }),
      setWatchItems: (items) => set({ watchItems: items }),
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
    }),
    {
      name: "bookmark-social-storage",
      partialize: (state) => ({
        readTag: state.readTag,
        watchTag: state.watchTag,
        // Note: We don't persist isAuthenticated - it's checked on app load
      }),
    },
  ),
)
