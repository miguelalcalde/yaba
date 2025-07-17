"use server";

import { cookies } from "next/headers";
import { RaindropAPI } from "./raindrop-api";
import type { RaindropItem } from "./store";

export async function updateBookmarkProgress(bookmarkId: number, note: string) {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get("session")?.value;

    if (!sessionId) {
      throw new Error("Authentication required");
    }

    const api = await RaindropAPI.fromSession(sessionId);
    if (!api) {
      throw new Error("Failed to authenticate with Raindrop");
    }

    await api.updateBookmarkNote(bookmarkId, note);

    return { success: true };
  } catch (error) {
    console.error("Error updating bookmark progress:", error);
    throw error;
  }
}

export async function getBookmarksByTag(
  tag: string
): Promise<{ items: RaindropItem[] }> {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get("session")?.value;

    if (!sessionId) {
      throw new Error("Authentication required");
    }

    const api = await RaindropAPI.fromSession(sessionId);
    if (!api) {
      throw new Error("Failed to authenticate with Raindrop");
    }

    const bookmarks = await api.getBookmarksByTag(tag);
    return { items: bookmarks };
  } catch (error) {
    console.error("Error fetching bookmarks:", error);
    throw error;
  }
}
