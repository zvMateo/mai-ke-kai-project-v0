import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Plus, Award } from "lucide-react"

async function getGuests() {
  const supabase = await createClient()

  const { data: guests } = await supabase.from("users").select("*").order("created_at", { ascending: false }).limit(50)

  return guests || []
}

export default async function GuestsPage() {
  const guests = await getGuests()

  const roleColors: Record<string, string> = {
    guest: "bg-blue-100 text-blue-800",
    staff: "bg-purple-100 text-purple-800",
    admin: "bg-red-100 text-red-800",
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold">Guests</h1>
          <p className="text-muted-foreground">Manage guest profiles and information</p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Add Guest
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search guests by name, email, or nationality..." className="pl-10" />
          </div>
        </CardContent>
      </Card>

      {/* Guests Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Guests</CardTitle>
        </CardHeader>
        <CardContent>
          {guests.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No guests registered yet</p>
              <p className="text-sm text-muted-foreground mt-1">Guests will appear here when they create accounts</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Nationality</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Points</TableHead>
                    <TableHead>Joined</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {guests.map((guest) => (
                    <TableRow key={guest.id}>
                      <TableCell className="font-medium">{guest.full_name || "—"}</TableCell>
                      <TableCell>{guest.email}</TableCell>
                      <TableCell>{guest.phone || "—"}</TableCell>
                      <TableCell>{guest.nationality || "—"}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={roleColors[guest.role]}>
                          {guest.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Award className="w-4 h-4 text-coral" />
                          {guest.loyalty_points}
                        </div>
                      </TableCell>
                      <TableCell>{new Date(guest.created_at).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
