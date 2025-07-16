"use client"

import { useState, useEffect } from "react"
import { useAppStore } from "@/lib/store"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CheckCircle, AlertCircle, ExternalLink, LogOut, User, TestTube } from "lucide-react"

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
  const [isTestMode, setIsTestMode] = useState(false)

  // Check authentication status when dialog opens
  useEffect(() => {
    if (open) {
      checkAuthStatus()
    }
  }, [open])

  const checkAuthStatus = async () => {
    try {
      const response = await fetch("/api/auth/me")
      if (response.ok) {
        const data = await response.json()
        if (data.authenticated) {
          setAuthUser(data.user)
          setAuthenticated(true)
          setIsTestMode(data.testMode || false) // Check if we're in test mode
        } else {
          setAuthUser(null)
          setAuthenticated(false)
          setIsTestMode(false)
        }
      } else {
        setAuthUser(null)
        setAuthenticated(false)
        setIsTestMode(false)
      }
    } catch (error) {
      console.error("Auth check failed:", error)
      setAuthUser(null)
      setAuthenticated(false)
      setIsTestMode(false)
    }
  }

  const handleOAuthLogin = () => {
    setIsLoading(true)
    setAuthError(null)
    // Redirect to OAuth flow
    window.location.href = "/api/auth/raindrop"
  }

  const handleLogout = async () => {
    try {
      setIsLoading(true)

      // If in test mode, just clear local state
      if (isTestMode) {
        setAuthUser(null)
        setAuthenticated(false)
        setIsTestMode(false)
        return
      }

      const response = await fetch("/api/auth/logout", { method: "POST" })

      if (response.ok) {
        setAuthUser(null)
        setAuthenticated(false)
        setIsTestMode(false)
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
    setReadTag(localReadTag)
    setWatchTag(localWatchTag)
    onOpenChange(false)
  }

  // Check for auth errors in URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const authError = urlParams.get("auth_error")

    if (authError) {
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
                      {isTestMode ? <TestTube className="w-4 h-4" /> : <User className="w-4 h-4" />}
                      <span>
                        {isTestMode ? "Test Mode: " : "Signed in as "}
                        {authUser.name || authUser.email || "Raindrop User"}
                      </span>
                    </div>
                  </AlertDescription>
                </Alert>

                <Button variant="outline" onClick={handleLogout} disabled={isLoading} className="w-full bg-transparent">
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {isTestMode ? "Clearing..." : "Signing out..."}
                    </>
                  ) : (
                    <>
                      <LogOut className="w-4 h-4 mr-2" />
                      {isTestMode ? "Clear Test Mode" : "Sign Out"}
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
