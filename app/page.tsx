"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/lib/store";
import { NavigationTabs } from "@/components/navigation-tabs";
import { FeedList } from "@/components/feed-list";
import { SettingsDialog } from "@/components/settings-dialog";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { getBookmarksByTag } from "@/lib/actions";

export default function HomePage() {
  const {
    activeTab,
    readTag,
    watchTag,
    isAuthenticated,
    readItems,
    watchItems,
    isLoading,
    error,
    setReadItems,
    setWatchItems,
    setLoading,
    setError,
    setAuthenticated,
  } = useAppStore();

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  // Check authentication on app load
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch("/api/auth/me");
      if (response.ok) {
        const data = await response.json();
        setAuthenticated(data.authenticated);

        if (data.authenticated) {
          // Auto-fetch data if authenticated
          fetchFeedData();
        }
      } else {
        setAuthenticated(false);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setAuthenticated(false);
    }
  };

  const fetchFeedData = async (forceRefresh = false) => {
    if (!isAuthenticated) {
      setError("Please sign in with your Raindrop.io account");
      setSettingsOpen(true);
      return;
    }

    // Don't refetch if we have data and it's not a forced refresh
    if (!forceRefresh && (readItems.length > 0 || watchItems.length > 0)) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [readData, watchData] = await Promise.all([
        getBookmarksByTag(readTag),
        getBookmarksByTag(watchTag),
      ]);

      setReadItems(readData.items);
      setWatchItems(watchData.items);
      setLastRefresh(new Date());
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch bookmarks";

      // Handle authentication errors
      if (
        errorMessage.includes("Authentication required") ||
        errorMessage.includes("Failed to authenticate")
      ) {
        setAuthenticated(false);
        setError("Authentication expired. Please sign in again.");
        setSettingsOpen(true);
        return;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchFeedData(true);
  };

  // Handle archive action
  const handleArchive = async (itemId: number) => {
    if (!isAuthenticated) return;

    try {
      const currentTag = activeTab === "read" ? readTag : watchTag;
      const response = await fetch(`/api/bookmarks/${itemId}/archive`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentTag }),
      });

      if (!response.ok) {
        throw new Error("Failed to archive bookmark");
      }

      // Remove item from current list
      if (activeTab === "read") {
        setReadItems(readItems.filter((item) => item._id !== itemId));
      } else {
        setWatchItems(watchItems.filter((item) => item._id !== itemId));
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to archive bookmark";
      setError(errorMessage);
    }
  };

  // Handle delete action
  const handleDelete = async (itemId: number) => {
    if (!isAuthenticated) return;

    try {
      const response = await fetch(`/api/bookmarks/${itemId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete bookmark");
      }

      // Remove item from current list
      if (activeTab === "read") {
        setReadItems(readItems.filter((item) => item._id !== itemId));
      } else {
        setWatchItems(watchItems.filter((item) => item._id !== itemId));
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete bookmark";
      setError(errorMessage);
    }
  };

  // Initial data fetch when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchFeedData();
    }
  }, [isAuthenticated, readTag, watchTag]);

  // Show settings dialog if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      setSettingsOpen(true);
    }
  }, [isAuthenticated]);

  const currentItems = activeTab === "read" ? readItems : watchItems;
  const currentTag = activeTab === "read" ? readTag : watchTag;

  return (
    <div className="min-h-screen social-container">
      <div className="max-w-2xl mx-auto">
        <NavigationTabs onSettingsClick={() => setSettingsOpen(true)} />

        {/* Refresh button */}
        <div className="flex justify-between items-center px-4 py-3 social-border border-b-0">
          <div className="text-sm text-social-text-muted">
            {lastRefresh && (
              <span>Last updated: {lastRefresh.toLocaleTimeString()}</span>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading || !isAuthenticated}
            className="text-social-text-muted hover:text-social-text"
          >
            <RefreshCw
              className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
            />
          </Button>
        </div>

        <div className="pb-6">
          <FeedList
            items={currentItems}
            isLoading={isLoading}
            error={error}
            feedType={activeTab}
            onArchive={handleArchive}
            onDelete={handleDelete}
            currentTag={currentTag}
          />
        </div>
      </div>

      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </div>
  );
}
