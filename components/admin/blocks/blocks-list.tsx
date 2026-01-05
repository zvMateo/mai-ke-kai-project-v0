"use client"

import { useState } from "react"
import { format } from "date-fns"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { deleteRoomBlock } from "@/lib/actions/room-blocks"
import { useRouter } from "next/navigation"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface Block {
  id: string
  room_id: string
  bed_id: string | null
  start_date: string
  end_date: string
  reason: string
  notes: string | null
  room?: { id: string; name: string; room_type: string }
}

interface Room {
  id: string
  name: string
  room_type: string
}

interface BlocksListProps {
  blocks: Block[]
  rooms: Room[]
}

const reasonLabels: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  maintenance: { label: "Maintenance", variant: "destructive" },
  ota_sync: { label: "OTA Sync", variant: "default" },
  private: { label: "Private Use", variant: "secondary" },
  other: { label: "Other", variant: "outline" },
}

export function BlocksList({ blocks, rooms }: BlocksListProps) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  const handleDelete = async (blockId: string) => {
    setLoading(blockId)
    try {
      await deleteRoomBlock(blockId)
      router.refresh()
    } catch (error) {
      console.error("Failed to delete block:", error)
    } finally {
      setLoading(null)
    }
  }

  if (blocks.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No date blocks created yet</p>
        <p className="text-sm text-muted-foreground mt-1">Create a block to prevent bookings during specific dates</p>
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Room</TableHead>
          <TableHead>Dates</TableHead>
          <TableHead>Reason</TableHead>
          <TableHead>Notes</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {blocks.map((block) => {
          const isActive = new Date(block.end_date) >= new Date()
          const isPast = new Date(block.end_date) < new Date()
          const reason = reasonLabels[block.reason] || reasonLabels.other

          return (
            <TableRow key={block.id} className={isPast ? "opacity-50" : ""}>
              <TableCell className="font-medium">{block.room?.name || "Unknown Room"}</TableCell>
              <TableCell>
                {format(new Date(block.start_date), "MMM d")} - {format(new Date(block.end_date), "MMM d, yyyy")}
              </TableCell>
              <TableCell>
                <Badge variant={reason.variant}>{reason.label}</Badge>
              </TableCell>
              <TableCell className="max-w-[200px] truncate">{block.notes || "-"}</TableCell>
              <TableCell>
                {isActive ? (
                  <Badge variant="default" className="bg-seafoam text-seafoam-foreground">
                    Active
                  </Badge>
                ) : (
                  <Badge variant="secondary">Expired</Badge>
                )}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" disabled={loading === block.id}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Block?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will remove the date block and make the room available for bookings during this period.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(block.id)}>Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
