"use client";

import type { RaindropItem } from "@/lib/store";
import { FeedCard } from "./feed-card";
import { BookOpen } from "lucide-react";
import { useState } from "react";
import { archiveBookmark, deleteBookmark } from "@/lib/actions";
import { useRouter } from "next/navigation";

interface FeedListProps {
  items: RaindropItem[];
  feedType: "read" | "watch";
  currentTag: string;
}

export function FeedList({ items, feedType, currentTag }: FeedListProps) {
  const router = useRouter();
  // Local state to handle progress updates without full refetch
  const [localItems, setLocalItems] = useState<RaindropItem[]>(items);

  const handleProgressUpdate = (updatedItem: RaindropItem) => {
    setLocalItems((prev) =>
      prev.map((item) => (item._id === updatedItem._id ? updatedItem : item))
    );
  };

  const handleArchive = async (itemId: number) => {
    try {
      await archiveBookmark(itemId, currentTag);
      // Remove item from local state for immediate feedback
      setLocalItems((prev) => prev.filter((item) => item._id !== itemId));
      // Refresh the page to get updated data from server
      router.refresh();
    } catch (error) {
      console.error("Failed to archive bookmark:", error);
      // Could add toast notification here
    }
  };

  const handleDelete = async (itemId: number) => {
    try {
      await deleteBookmark(itemId);
      // Remove item from local state for immediate feedback
      setLocalItems((prev) => prev.filter((item) => item._id !== itemId));
      // Refresh the page to get updated data from server
      router.refresh();
    } catch (error) {
      console.error("Failed to delete bookmark:", error);
      // Could add toast notification here
    }
  };

  if (localItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <BookOpen className="w-12 h-12 text-social-text-muted mb-4" />
        <h3 className="text-lg font-semibold text-social-text mb-2">
          No {feedType} items found
        </h3>
        <p className="text-social-text-muted max-w-md">
          No bookmarks found with the configured tag. Try adjusting your tag
          settings or add some bookmarks to Raindrop.io.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 px-0">
      {localItems.map((item) => (
        <FeedCard
          key={item._id}
          item={item}
          onProgressUpdate={handleProgressUpdate}
          onArchive={handleArchive}
          onDelete={handleDelete}
          currentTag={currentTag}
        />
      ))}
    </div>
  );
}
