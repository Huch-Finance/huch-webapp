import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Check, Loader2, AlertCircle } from "lucide-react"
import { SteamItem } from "@/hooks/use-steam-inventory"

interface BorrowCancelModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: SteamItem | null
  onClose: () => void
}

export function BorrowCancelModal({
  open,
  onOpenChange,
  item,
  onClose
}: BorrowCancelModalProps) {
  // States
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Fonction pour fermer le modal
  const handleClose = () => {
    setError(null);
    onClose();
    onOpenChange(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-[#0f1420] border border-[#1f2937]">
        <DialogHeader>
          <DialogTitle className="text-center">Trade Canceled</DialogTitle>
          <DialogDescription className="text-center">
            Your trade offer has been canceled successfully
          </DialogDescription>
        </DialogHeader>
        
        {/* Contenu principal */}
        <div className="py-6">
          <div className="flex flex-col items-center justify-center gap-6">
            {/* Icône de succès */}
            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
              <Check className="h-8 w-8 text-green-500" />
            </div>
            
            {/* Détails de l'item */}
            {item && (
              <div className="flex flex-col items-center gap-2">
                <div className="relative w-20 h-20 overflow-hidden rounded-md">
                  <Image
                    src={item.imageUrl}
                    alt={item.market_hash_name}
                    fill
                    className="object-cover"
                  />
                </div>
                <p className="text-sm font-medium">{item.market_hash_name}</p>
              </div>
            )}
            
            {/* Message de confirmation */}
            <p className="text-center text-sm text-gray-400">
              The trade offer for this item has been canceled. You can start a new loan process if you wish.
            </p>
            
            {/* Message d'erreur */}
            {error && (
              <div className="flex items-center gap-2 text-red-500">
                <AlertCircle className="h-4 w-4" />
                <p className="text-sm">{error}</p>
              </div>
            )}
          </div>
        </div>
        
        <DialogFooter className="flex-col sm:flex-row sm:justify-center gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            className="w-full sm:w-auto border-[#1f2937] bg-[#1f2937] text-gray-400 hover:bg-[#2a3548] hover:text-white"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Closing...
              </>
            ) : (
              "Close"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
