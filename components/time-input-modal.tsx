"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Clock } from "lucide-react"
import { formatTimestamp, parseTimestamp } from "@/lib/progress-utils"

interface TimeInputModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentTimestamp?: number
  onSave: (timestamp: number) => void
  title: string
}

export function TimeInputModal({ open, onOpenChange, currentTimestamp = 0, onSave, title }: TimeInputModalProps) {
  const [timeInput, setTimeInput] = useState(formatTimestamp(currentTimestamp))
  const [isValid, setIsValid] = useState(true)

  const handleTimeChange = (value: string) => {
    setTimeInput(value)

    // Validate time format (MM:SS or HH:MM:SS)
    const timeRegex = /^(\d{1,2}):([0-5]\d)(?::([0-5]\d))?$/
    setIsValid(timeRegex.test(value))
  }

  const handleSave = () => {
    if (!isValid) return

    const seconds = parseTimestamp(timeInput)
    onSave(seconds)
    onOpenChange(false)
  }

  const handleOpenChange = (open: boolean) => {
    if (open) {
      // Reset to current timestamp when opening
      setTimeInput(formatTimestamp(currentTimestamp))
      setIsValid(true)
    }
    onOpenChange(open)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Save Progress
          </DialogTitle>
          <DialogDescription className="line-clamp-2">Set your current progress for: {title}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="timestamp">Current Time</Label>
            <Input
              id="timestamp"
              placeholder="MM:SS or HH:MM:SS"
              value={timeInput}
              onChange={(e) => handleTimeChange(e.target.value)}
              className={!isValid ? "border-red-500" : ""}
            />
            {!isValid && <p className="text-sm text-red-600">Please enter a valid time format (MM:SS or HH:MM:SS)</p>}
            <p className="text-xs text-muted-foreground">Examples: 5:30, 1:23:45</p>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!isValid || !timeInput.trim()}>
            Save Progress
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
