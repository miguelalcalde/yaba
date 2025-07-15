import type { RaindropItem } from "./store"

const RAINDROP_API_BASE = "https://api.raindrop.io/rest/v1"

export class RaindropAPI {
  private token: string

  constructor(token: string) {
    this.token = token
  }

  private async makeRequest(endpoint: string, options?: RequestInit): Promise<any> {
    const response = await fetch(`${RAINDROP_API_BASE}${endpoint}`, {
      headers: {
        Authorization: `Bearer ${this.token}`,
        "Content-Type": "application/json",
      },
      ...options,
    })

    if (!response.ok) {
      throw new Error(`Raindrop API error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  async getBookmarksByTag(tag: string): Promise<RaindropItem[]> {
    try {
      // Remove # from tag if present
      const cleanTag = tag.startsWith("#") ? tag.slice(1) : tag

      // Search for bookmarks with the specified tag
      const data = await this.makeRequest(`/raindrops/0?search=%23${encodeURIComponent(cleanTag)}`)

      return data.items.map((item: any) => ({
        _id: item._id,
        title: item.title,
        excerpt: item.excerpt || "",
        link: item.link,
        domain: item.domain,
        cover: item.cover || "",
        tags: item.tags || [],
        created: item.created,
        type: item.type || "link",
        // Include note field for progress tracking
        note: item.note || "",
      }))
    } catch (error) {
      console.error("Error fetching bookmarks:", error)
      throw error
    }
  }

  // New method to update bookmark notes for progress tracking
  async updateBookmarkNote(bookmarkId: number, note: string): Promise<void> {
    try {
      await this.makeRequest(`/raindrop/${bookmarkId}`, {
        method: "PUT",
        body: JSON.stringify({ note }),
      })
    } catch (error) {
      console.error("Error updating bookmark note:", error)
      throw error
    }
  }

  // Archive bookmark by updating tags
  async archiveBookmark(bookmarkId: number, currentTag: string): Promise<void> {
    try {
      // Remove # from current tag if present
      const cleanCurrentTag = currentTag.startsWith("#") ? currentTag.slice(1) : currentTag

      // Create archive tag
      const archiveTag = `${cleanCurrentTag}-archive`

      // Get current bookmark to preserve other tags
      const bookmarkData = await this.makeRequest(`/raindrop/${bookmarkId}`)
      const currentTags = bookmarkData.item.tags || []

      // Remove current tag and add archive tag
      const updatedTags = currentTags.filter((tag: string) => tag !== cleanCurrentTag).concat(archiveTag)

      await this.makeRequest(`/raindrop/${bookmarkId}`, {
        method: "PUT",
        body: JSON.stringify({ tags: updatedTags }),
      })
    } catch (error) {
      console.error("Error archiving bookmark:", error)
      throw error
    }
  }

  // Delete bookmark
  async deleteBookmark(bookmarkId: number): Promise<void> {
    try {
      await this.makeRequest(`/raindrop/${bookmarkId}`, {
        method: "DELETE",
      })
    } catch (error) {
      console.error("Error deleting bookmark:", error)
      throw error
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.makeRequest("/user")
      return true
    } catch (error) {
      return false
    }
  }
}
