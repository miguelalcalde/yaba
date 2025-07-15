"use client"

import { useState } from "react"
import { useAppStore } from "@/lib/store"
import { RaindropAPI } from "@/lib/raindrop-api"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CheckCircle, AlertCircle, ExternalLink } from "lucide-react"

interface SettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const { readTag, watchTag, raindropToken, setReadTag, setWatchTag, setRaindropToken } = useAppStore()

  const [localReadTag, setLocalReadTag] = useState(readTag)
  const [localWatchTag, setLocalWatchTag] = useState(watchTag)
  const [localToken, setLocalToken] = useState(raindropToken)
  const [isTestingConnection, setIsTestingConnection] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<"idle" | "success" | "error">("idle")

  const handleSave = () => {
    setReadTag(localReadTag)
    setWatchTag(localWatchTag)
    setRaindropToken(localToken)
    onOpenChange(false)
  }

  const testConnection = async () => {
    if (!localToken.trim()) {
      setConnectionStatus("error")
      return
    }

    setIsTestingConnection(true)
    setConnectionStatus("idle")

    try {
      const api = new RaindropAPI(localToken)
      const isValid = await api.testConnection()
      setConnectionStatus(isValid ? "success" : "error")
    } catch (error) {
      setConnectionStatus("error")
    } finally {
      setIsTestingConnection(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>Configure your Raindrop.io integration and feed tags.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* API Token */}
          <div className="space-y-2">
            <Label htmlFor="token">Raindrop.io API Token</Label>
            <div className="flex gap-2">
              <Input
                id="token"
                type="password"
                placeholder="Enter your API token"
                value={localToken}
                onChange={(e) => {
                  setLocalToken(e.target.value)
                  setConnectionStatus("idle")
                }}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={testConnection}
                disabled={isTestingConnection || !localToken.trim()}
              >
                {isTestingConnection ? <Loader2 className="w-4 h-4 animate-spin" /> : "Test"}
              </Button>
            </div>

            {connectionStatus === "success" && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">Connection successful!</AlertDescription>
              </Alert>
            )}

            {connectionStatus === "error" && (
              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  Connection failed. Please check your API token.
                </AlertDescription>
              </Alert>
            )}

            <p className="text-xs text-muted-foreground">
              Get your API token from{" "}
              <a
                href="https://app.raindrop.io/settings/integrations"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline inline-flex items-center gap-1"
              >
                Raindrop.io Settings
                <ExternalLink className="w-3 h-3" />
              </a>
            </p>
          </div>

          {/* Feed Tags */}
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
