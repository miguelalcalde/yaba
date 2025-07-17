"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { RaindropAPI } from "./raindrop-api";
import { DatabaseService } from "./database";
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

export async function checkAuthStatus(): Promise<{
  authenticated: boolean;
  user?: { id: number; name: string; email: string };
}> {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get("session")?.value;

    if (!sessionId) {
      return { authenticated: false };
    }

    const db = new DatabaseService();
    const session = await db.getSession(sessionId);

    if (!session) {
      return { authenticated: false };
    }

    // Update last accessed time
    await db.updateSessionAccess(sessionId);

    return {
      authenticated: true,
      user: {
        id: session.user.id,
        name: session.user.name || "",
        email: session.user.email || "",
      },
    };
  } catch (error) {
    console.error("Auth check error:", error);
    return { authenticated: false };
  }
}

export async function logoutUser(): Promise<{ success: boolean }> {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get("session")?.value;

    if (sessionId) {
      const db = new DatabaseService();
      await db.deleteSession(sessionId);
    }

    // Clear the session cookie
    cookieStore.delete("session");

    return { success: true };
  } catch (error) {
    console.error("Logout error:", error);
    return { success: false };
  }
}

export async function archiveBookmark(
  itemId: number,
  currentTag: string
): Promise<{ success: boolean }> {
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

    await api.archiveBookmark(itemId, currentTag);
    return { success: true };
  } catch (error) {
    console.error("Error archiving bookmark:", error);
    throw error;
  }
}

export async function deleteBookmark(
  itemId: number
): Promise<{ success: boolean }> {
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

    await api.deleteBookmark(itemId);
    return { success: true };
  } catch (error) {
    console.error("Error deleting bookmark:", error);
    throw error;
  }
}

export async function refreshPage(formData: FormData) {
  const { revalidatePath } = await import("next/cache");
  const tab = formData.get("tab") as string;

  // Revalidate the current page to fetch fresh data
  revalidatePath("/");

  // Redirect back to the same tab
  redirect(`/?tab=${tab || "read"}`);
}
