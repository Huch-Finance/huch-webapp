"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"

interface SelectedSkinsSummaryProps {
  skins: Array<{
    id: number
    name: string
    value: number
    image: string
  }>
  onRemove: (id: number) => void
  className?: string
}

export function SelectedSkinsSummary({ skins, onRemove, className = "" }: SelectedSkinsSummaryProps) {
  const totalValue = skins.reduce((total, skin) => total + skin.value, 0)

  if (skins.length === 0) {
    return null
  }

  return (
    <Card className={`border border-[#2A2A2A] bg-[#1E1E1E] ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium">Selected skins</h3>
          <Badge variant="outline" className="bg-[#5D5FEF]/10 text-[#5D5FEF] border-[#5D5FEF]">
            {skins.length} {skins.length > 1 ? "skins" : "skin"}
          </Badge>
        </div>

        <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
          {skins.map((skin) => (
            <div key={skin.id} className="flex items-center gap-3 bg-[#2A2A2A] p-2 rounded-md">
              <div className="w-12 h-12 rounded-md overflow-hidden flex-shrink-0">
                <img src={skin.image || "/placeholder.svg"} alt={skin.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{skin.name}</p>
                <p className="text-[#5D5FEF] text-xs">{skin.value} $</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-gray-400 hover:text-white"
                onClick={() => onRemove(skin.id)}
              >
                <X size={16} />
              </Button>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-3 border-t border-[#2A2A2A] flex justify-between items-center">
          <span className="text-sm text-gray-400">Total value :</span>
          <span className="font-bold text-[#5D5FEF]">{totalValue} $</span>
        </div>
      </CardContent>
    </Card>
  )
}
