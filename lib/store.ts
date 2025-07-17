import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface RaindropItem {
  _id: number;
  title: string;
  excerpt: string;
  link: string;
  domain: string;
  cover: string;
  tags: string[];
  created: string;
  type: "link" | "article" | "image" | "video" | "document" | "audio";
  note: string;
}

interface AppState {
  // User preferences only
  readTag: string;
  watchTag: string;

  // Actions
  setReadTag: (tag: string) => void;
  setWatchTag: (tag: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Initial state - only user preferences
      readTag: "#read",
      watchTag: "#watch",

      // Actions
      setReadTag: (tag) => set({ readTag: tag }),
      setWatchTag: (tag) => set({ watchTag: tag }),
    }),
    {
      name: "bookmark-social-storage",
      partialize: (state) => ({
        readTag: state.readTag,
        watchTag: state.watchTag,
      }),
    }
  )
);
