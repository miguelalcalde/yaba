"use client"

import { useState, useEffect } from "react"
import { useAppStore } from "@/lib/store"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CheckCircle, AlertCircle, ExternalLink, LogOut, User } from "lucide-react"

interface SettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface AuthUser {
  id: number
  name: string | null
  email: string | null
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const { readTag, watchTag, setReadTag, setWatchTag, setAuthenticated } = useAppStore()

  const [localReadTag, setLocalReadTag] = useState(readTag)
  const [localWatchTag, setLocalWatchTag] = useState(watchTag)
  const [isLoading, setIsLoading] = useState(false)
  const [authUser, setAuthUser] = useState<AuthUser | null>(null)
  const [authError, setAuthError] = useState<string | null>(null)

  // Check authentication status when dialog opens
  useEffect(() => {
    if (open) {
      console.log("Settings dialog opened, checking auth status...")
      checkAuthStatus()
    }
  }, [open])

  const checkAuthStatus = async () => {
    console.log("Checking authentication status...")
    try {
      const response = await fetch("/api/auth/me")
      console.log("Auth check response status:", response.status)

      if (response.ok) {
        const data = await response.json()
        console.log("Auth check response data:", data)

        if (data.authenticated) {
          console.log("User is authenticated:", data.user)
          setAuthUser(data.user)
          setAuthenticated(true)
        } else {
          console.log("User is not authenticated")
          setAuthUser(null)
          setAuthenticated(false)
        }
      } else {
        console.log("Auth check failed with status:", response.status)
        setAuthUser(null)
        setAuthenticated(false)
      }
    } catch (error) {
      console.error("Auth check failed with error:", error)
      setAuthUser(null)
      setAuthenticated(false)
    }
  }

  const handleOAuthLogin = () => {
    console.log("=== OAuth Login Button Clicked ===")
    console.log("Current page URL:", window.location.href)
    console.log("Redirecting browser to /api/auth/raindrop for OAuth flow ⬆️")

    setIsLoading(true)
    setAuthError(null)

    // IMPORTANT: perform a full-page redirect (no pre-flight fetch).
    window.location.href = "/api/auth/raindrop"
  }

  const handleLogout = async () => {
    console.log("Logout button clicked")
    try {
      setIsLoading(true)
      const response = await fetch("/api/auth/logout", { method: "POST" })
      console.log("Logout response status:", response.status)

      if (response.ok) {
        console.log("Logout successful")
        setAuthUser(null)
        setAuthenticated(false)
      } else {
        throw new Error("Logout failed")
      }
    } catch (error) {
      console.error("Logout error:", error)
      setAuthError("Failed to logout. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = () => {
    console.log("Saving settings:", { readTag: localReadTag, watchTag: localWatchTag })
    setReadTag(localReadTag)
    setWatchTag(localWatchTag)
    onOpenChange(false)
  }

  // Check for auth errors in URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const authError = urlParams.get("auth_error")

    if (authError) {
      console.log("Auth error found in URL:", authError)
      let errorMessage = "Authentication failed"
      switch (authError) {
        case "access_denied":
          errorMessage = "Access was denied. Please try again."
          break
        case "invalid_state":
          errorMessage = "Security validation failed. Please try again."
          break
        case "callback_failed":
          errorMessage = "Authentication callback failed. Please try again."
          break
        case "missing_parameters":
          errorMessage = "Missing required parameters. Please try again."
          break
      }

      setAuthError(errorMessage)

      // Clean up URL
      const newUrl = new URL(window.location.href)
      newUrl.searchParams.delete("auth_error")
      window.history.replaceState({}, "", newUrl.toString())
    }
  }, [])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>Configure your Raindrop.io integration and feed tags.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Authentication Section */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Raindrop.io Authentication</Label>

            {authUser ? (
              <div className="space-y-3">
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span>Signed in as {authUser.name || authUser.email || "Raindrop User"}</span>
                    </div>
                  </AlertDescription>
                </Alert>

                <Button variant="outline" onClick={handleLogout} disabled={isLoading} className="w-full bg-transparent">
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Signing out...
                    </>
                  ) : (
                    <>
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Connect your Raindrop.io account to access your bookmarks securely.
                </p>

                <Button onClick={handleOAuthLogin} disabled={isLoading} className="w-full">
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Connect Raindrop.io
                    </>
                  )}
                </Button>
              </div>
            )}

            {authError && (
              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">{authError}</AlertDescription>
              </Alert>
            )}
          </div>

          {/* Feed Tags Section */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="readTag">Read Feed Tag</Label>
              <Input
                id="readTag"
                placeholder="#read"
                value={localReadTag}
                onChange={(e) => setLocalReadTag(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="watchTag">Watch Feed Tag</Label>
              <Input
                id="watchTag"
                placeholder="#watch"
                value={localWatchTag}
                onChange={(e) => setLocalWatchTag(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
