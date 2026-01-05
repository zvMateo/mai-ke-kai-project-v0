import { notFound } from "next/navigation"
import { RoomForm } from "@/components/admin/room-form"
import { getRoomById } from "@/lib/actions/rooms"

export default async function EditRoomPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  try {
    const room = await getRoomById(id)
    return (
      <div className="space-y-6">
        <div>
          <h1 className="font-heading text-3xl font-bold">Edit Room</h1>
          <p className="text-muted-foreground">Update room information</p>
        </div>

        <RoomForm room={room} mode="edit" />
      </div>
    )
  } catch (error) {
    notFound()
  }
}
