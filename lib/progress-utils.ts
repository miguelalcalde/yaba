export interface VideoProgress {
  type: "video"
  timestamp: number // seconds
  lastUpdated: string
  platform: string
}

export interface ProgressData {
  video?: VideoProgress
}

// Parse progress data from markdown note
export function parseProgressFromNote(note: string): ProgressData | null {
  if (!note) return null

  const progressMatch = note.match(/<!-- BOOKMARK_PROGRESS\s*([\s\S]*?)\s*-->/)
  if (!progressMatch) return null

  try {
    return JSON.parse(progressMatch[1])
  } catch (error) {
    console.error("Error parsing progress data:", error)
    return null
  }
}

// Update progress data in markdown note
export function updateProgressInNote(note: string, progressData: ProgressData): string {
  const progressComment = `<!-- BOOKMARK_PROGRESS\n${JSON.stringify(progressData, null, 2)}\n-->`

  // Remove existing progress data
  const noteWithoutProgress = note.replace(/<!-- BOOKMARK_PROGRESS\s*[\s\S]*?\s*-->\s*/g, "")

  // Add new progress data at the beginning
  return progressComment + (noteWithoutProgress ? "\n\n" + noteWithoutProgress : "")
}

// Generate resume URL with timestamp
export function generateResumeUrl(originalUrl: string, timestamp: number, platform: string): string {
  try {
    const url = new URL(originalUrl)

    switch (platform) {
      case "youtube":
        // Handle both youtube.com and youtu.be URLs
        if (url.hostname === "youtu.be") {
          url.searchParams.set("t", timestamp.toString())
        } else if (url.hostname.includes("youtube.com")) {
          url.searchParams.set("t", timestamp.toString())
        }
        break

      case "vimeo":
        // Vimeo uses #t=XmYs format
        url.hash = `t=${Math.floor(timestamp / 60)}m${timestamp % 60}s`
        break

      case "spotify":
        url.searchParams.set("t", timestamp.toString())
        break

      case "twitch":
        // Twitch uses ?t=XhYmZs format for VODs
        const hours = Math.floor(timestamp / 3600)
        const minutes = Math.floor((timestamp % 3600) / 60)
        const seconds = timestamp % 60
        let timeParam = ""
        if (hours > 0) timeParam += `${hours}h`
        if (minutes > 0) timeParam += `${minutes}m`
        if (seconds > 0) timeParam += `${seconds}s`
        if (timeParam) url.searchParams.set("t", timeParam)
        break

      default:
        // For unknown platforms, try the generic ?t= parameter
        url.searchParams.set("t", timestamp.toString())
    }

    return url.toString()
  } catch (error) {
    console.error("Error generating resume URL:", error)
    return originalUrl
  }
}

// Detect video platform from URL
export function detectVideoPlatform(url: string): string {
  try {
    const urlObj = new URL(url)

    if (urlObj.hostname.includes("youtube.com") || urlObj.hostname === "youtu.be") {
      return "youtube"
    } else if (urlObj.hostname.includes("vimeo.com")) {
      return "vimeo"
    } else if (urlObj.hostname.includes("spotify.com")) {
      return "spotify"
    } else if (urlObj.hostname.includes("twitch.tv")) {
      return "twitch"
    }

    return "unknown"
  } catch (error) {
    return "unknown"
  }
}

// Format seconds to MM:SS or HH:MM:SS
export function formatTimestamp(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  if (hours > 0) {
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  return `${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
}

// Parse timestamp string to seconds
export function parseTimestamp(timeString: string): number {
  const parts = timeString.split(":").map(Number)

  if (parts.length === 2) {
    // MM:SS format
    return parts[0] * 60 + parts[1]
  } else if (parts.length === 3) {
    // HH:MM:SS format
    return parts[0] * 3600 + parts[1] * 60 + parts[2]
  }

  return 0
}
