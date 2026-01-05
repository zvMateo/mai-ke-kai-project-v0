import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { BlocksList } from "@/components/admin/blocks/blocks-list"
import { CreateBlockDialog } from "@/components/admin/blocks/create-block-dialog"

async function getRoomBlocks() {
  const supabase = await createClient()

  const { data: blocks } = await supabase
    .from("room_blocks")
    .select(`
      *,
      room:rooms(id, name, type)
    `)
    .order("start_date", { ascending: true })

  const { data: rooms } = await supabase.from("rooms").select("id, name, type").eq("is_active", true)

  return { blocks: blocks || [], rooms: rooms || [] }
}

export default async function BlocksPage() {
  const { blocks, rooms } = await getRoomBlocks()

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold">Date Blocks</h1>
          <p className="text-muted-foreground">Block rooms/beds for maintenance, OTA sync, or private use</p>
        </div>
        <CreateBlockDialog rooms={rooms}>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create Block
          </Button>
        </CreateBlockDialog>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Active Blocks</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{blocks.filter((b) => new Date(b.end_date) >= new Date()).length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Booking.com Sync</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{blocks.filter((b) => b.reason === "ota_sync").length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Maintenance</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{blocks.filter((b) => b.reason === "maintenance").length}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Blocks</CardTitle>
          <CardDescription>Manage date blocks across all rooms and beds</CardDescription>
        </CardHeader>
        <CardContent>
          <BlocksList blocks={blocks} rooms={rooms} />
        </CardContent>
      </Card>
    </div>
  )
}
