"use client"

import type * as React from "react"
import { useState } from "react"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import type { DateRange } from "react-day-picker"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createRoomBlock } from "@/lib/actions/room-blocks"
import { useRouter } from "next/navigation"

interface Room {
  id: string
  name: string
  room_type: string
}

interface CreateBlockDialogProps {
  rooms: Room[]
  children: React.ReactNode
}

export function CreateBlockDialog({ rooms, children }: CreateBlockDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [roomId, setRoomId] = useState("")
  const [reason, setReason] = useState("")
  const [notes, setNotes] = useState("")
  const [date, setDate] = useState<DateRange | undefined>()

  const handleSubmit = async () => {
    if (!roomId || !date?.from || !date?.to || !reason) return

    setLoading(true)
    try {
      await createRoomBlock({
        roomId,
        startDate: format(date.from, "yyyy-MM-dd"),
        endDate: format(date.to, "yyyy-MM-dd"),
        reason,
      })
      setOpen(false)
      setRoomId("")
      setReason("")
      setNotes("")
      setDate(undefined)
      router.refresh()
    } catch (error) {
      console.error("Failed to create block:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Date Block</DialogTitle>
          <DialogDescription>
            Block a room or bed for specific dates. This prevents bookings during this period.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Room</Label>
            <Select value={roomId} onValueChange={setRoomId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a room" />
              </SelectTrigger>
              <SelectContent>
                {rooms.map((room) => (
                  <SelectItem key={room.id} value={room.id}>
                    {room.name} ({room.room_type})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Dates</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date?.from ? (
                    date.to ? (
                      <>
                        {format(date.from, "LLL dd, y")} - {format(date.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(date.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Select date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={date?.from}
                  selected={date}
                  onSelect={setDate}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>Reason</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger>
                <SelectValue placeholder="Select reason" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ota_sync">OTA Sync (Booking.com, etc.)</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="private">Private Use</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Notes (optional)</Label>
            <Textarea
              placeholder="Additional notes about this block..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading || !roomId || !date?.from || !date?.to || !reason}>
            {loading ? "Creating..." : "Create Block"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
