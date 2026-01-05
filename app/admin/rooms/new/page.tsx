import { RoomForm } from "@/components/admin/room-form"

export default function NewRoomPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold">Create New Room</h1>
        <p className="text-muted-foreground">Add a new room to your inventory</p>
      </div>

      <RoomForm mode="create" />
    </div>
  )
}
