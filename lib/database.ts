import { createClient } from "@libsql/client"

// Database client singleton
let db: ReturnType<typeof createClient> | null = null

export function getDatabase() {
  if (!db) {
    if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN) {
      throw new Error(
        "Missing Turso database configuration. Please add TURSO_DATABASE_URL and TURSO_AUTH_TOKEN to your environment variables.",
      )
    }

    db = createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    })
  }
  return db
}

// Database types
export interface User {
  id: number
  raindrop_user_id: number
  email: string | null
  name: string | null
  created_at: string
  updated_at: string
}

export interface OAuthToken {
  id: number
  user_id: number
  access_token: string
  refresh_token: string | null
  token_type: string
  expires_at: string | null
  scope: string | null
  created_at: string
  updated_at: string
}

export interface UserSession {
  id: string
  user_id: number
  expires_at: string
  created_at: string
  last_accessed: string
}

// Database operations
export class DatabaseService {
  private db = getDatabase()

  // User operations
  async createOrUpdateUser(raindropUserId: number, email?: string, name?: string): Promise<User> {
    const now = new Date().toISOString()

    // Try to update existing user first
    const existingUser = await this.db.execute({
      sql: "SELECT * FROM users WHERE raindrop_user_id = ?",
      args: [raindropUserId],
    })

    if (existingUser.rows.length > 0) {
      // Update existing user
      await this.db.execute({
        sql: "UPDATE users SET email = ?, name = ?, updated_at = ? WHERE raindrop_user_id = ?",
        args: [email || null, name || null, now, raindropUserId],
      })

      const updatedUser = await this.db.execute({
        sql: "SELECT * FROM users WHERE raindrop_user_id = ?",
        args: [raindropUserId],
      })

      return updatedUser.rows[0] as any
    } else {
      // Create new user
      const result = await this.db.execute({
        sql: "INSERT INTO users (raindrop_user_id, email, name, created_at, updated_at) VALUES (?, ?, ?, ?, ?) RETURNING *",
        args: [raindropUserId, email || null, name || null, now, now],
      })

      return result.rows[0] as any
    }
  }

  async getUserById(id: number): Promise<User | null> {
    const result = await this.db.execute({
      sql: "SELECT * FROM users WHERE id = ?",
      args: [id],
    })

    return (result.rows[0] as User) || null
  }

  // OAuth token operations
  async saveOAuthToken(
    userId: number,
    tokenData: {
      access_token: string
      refresh_token?: string
      token_type?: string
      expires_in?: number
      scope?: string
    },
  ): Promise<void> {
    const now = new Date().toISOString()
    const expiresAt = tokenData.expires_in ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString() : null

    // Delete existing tokens for this user
    await this.db.execute({
      sql: "DELETE FROM oauth_tokens WHERE user_id = ?",
      args: [userId],
    })

    // Insert new token
    await this.db.execute({
      sql: `INSERT INTO oauth_tokens 
            (user_id, access_token, refresh_token, token_type, expires_at, scope, created_at, updated_at) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        userId,
        tokenData.access_token,
        tokenData.refresh_token || null,
        tokenData.token_type || "Bearer",
        expiresAt,
        tokenData.scope || null,
        now,
        now,
      ],
    })
  }

  async getOAuthToken(userId: number): Promise<OAuthToken | null> {
    const result = await this.db.execute({
      sql: "SELECT * FROM oauth_tokens WHERE user_id = ? ORDER BY created_at DESC LIMIT 1",
      args: [userId],
    })

    return (result.rows[0] as OAuthToken) || null
  }

  // Session operations
  async createSession(userId: number, sessionId: string, expiresAt: Date): Promise<void> {
    const now = new Date().toISOString()

    await this.db.execute({
      sql: "INSERT INTO user_sessions (id, user_id, expires_at, created_at, last_accessed) VALUES (?, ?, ?, ?, ?)",
      args: [sessionId, userId, expiresAt.toISOString(), now, now],
    })
  }

  async getSession(sessionId: string): Promise<(UserSession & { user: User }) | null> {
    const result = await this.db.execute({
      sql: `SELECT 
              s.id, s.user_id, s.expires_at, s.created_at, s.last_accessed,
              u.id as user_id, u.raindrop_user_id, u.email, u.name, u.created_at as user_created_at, u.updated_at as user_updated_at
            FROM user_sessions s 
            JOIN users u ON s.user_id = u.id 
            WHERE s.id = ? AND s.expires_at > datetime('now')`,
      args: [sessionId],
    })

    if (result.rows.length === 0) return null

    const row = result.rows[0] as any
    return {
      id: row.id,
      user_id: row.user_id,
      expires_at: row.expires_at,
      created_at: row.created_at,
      last_accessed: row.last_accessed,
      user: {
        id: row.user_id,
        raindrop_user_id: row.raindrop_user_id,
        email: row.email,
        name: row.name,
        created_at: row.user_created_at,
        updated_at: row.user_updated_at,
      },
    }
  }

  async updateSessionAccess(sessionId: string): Promise<void> {
    const now = new Date().toISOString()
    await this.db.execute({
      sql: "UPDATE user_sessions SET last_accessed = ? WHERE id = ?",
      args: [now, sessionId],
    })
  }

  async deleteSession(sessionId: string): Promise<void> {
    await this.db.execute({
      sql: "DELETE FROM user_sessions WHERE id = ?",
      args: [sessionId],
    })
  }

  async cleanupExpiredSessions(): Promise<void> {
    await this.db.execute({
      sql: 'DELETE FROM user_sessions WHERE expires_at <= datetime("now")',
      args: [],
    })
  }
}
