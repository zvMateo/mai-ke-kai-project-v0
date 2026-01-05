"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Gift, Loader2, CheckCircle2 } from "lucide-react"
import { redeemLoyaltyPoints } from "@/lib/actions/users"

interface RedeemDialogProps {
  reward: {
    id: string
    name: string
    description: string
    points: number
  }
  userPoints: number
  canRedeem: boolean
}

export function LoyaltyRedeemDialog({ reward, userPoints, canRedeem }: RedeemDialogProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleRedeem = async () => {
    setIsLoading(true)
    try {
      await redeemLoyaltyPoints(reward.points, `Canje: ${reward.name}`)
      setIsSuccess(true)
      setTimeout(() => {
        setIsOpen(false)
        setIsSuccess(false)
        router.refresh()
      }, 2000)
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button size="sm" disabled={!canRedeem}>
            Canjear
          </Button>
        </DialogTrigger>
        <DialogContent>
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">Canje Exitoso!</h3>
            <p className="text-muted-foreground">Recibiras un email con los detalles de tu recompensa.</p>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" disabled={!canRedeem}>
          Canjear
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-primary" />
            Canjear Recompensa
          </DialogTitle>
          <DialogDescription>Estas a punto de canjear puntos por esta recompensa.</DialogDescription>
        </DialogHeader>

        <div className="py-6">
          <div className="bg-muted/50 rounded-lg p-4 mb-4">
            <h4 className="font-semibold mb-1">{reward.name}</h4>
            <p className="text-sm text-muted-foreground">{reward.description}</p>
          </div>

          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Tus puntos actuales</span>
            <span className="font-medium">{userPoints.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center text-sm mt-2">
            <span className="text-muted-foreground">Costo de canje</span>
            <span className="font-medium text-red-600">-{reward.points}</span>
          </div>
          <hr className="my-3" />
          <div className="flex justify-between items-center">
            <span className="font-medium">Puntos restantes</span>
            <span className="font-bold text-primary">{userPoints - reward.points}</span>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleRedeem} disabled={isLoading}>
            {isLoading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
            Confirmar Canje
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
