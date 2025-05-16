"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Gift, Lock, CheckCircle } from "lucide-react"

interface SeasonalReward {
  id: number
  level: number
  name: string
  description: string
  image: string
  claimed: boolean
  locked: boolean
}

interface SeasonalRewardsProps {
  currentLevel: number
  seasonEndDate: string
  rewards: SeasonalReward[]
  onClaimReward: (rewardId: number) => void
}

export function SeasonalRewards({ currentLevel, seasonEndDate, rewards, onClaimReward }: SeasonalRewardsProps) {
  return (
    <Card className="border-muted">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="text-primary" />
            <span>Seasonal Rewards</span>
          </div>
          <span className="text-sm font-medium">Level {currentLevel}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground text-center">The season ends on {seasonEndDate}</div>

        <div className="grid grid-cols-1 gap-4">
          {rewards.map((reward) => (
            <div
              key={reward.id}
              className={`relative bg-muted rounded-lg p-4 border ${
                reward.claimed
                  ? "border-primary/50"
                  : reward.locked
                    ? "border-muted opacity-70"
                    : "border-primary animate-pulse"
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-md bg-card overflow-hidden flex-shrink-0">
                  <img
                    src={reward.image || "/placeholder.svg"}
                    alt={reward.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{reward.name}</span>
                    {reward.claimed && <CheckCircle size={16} className="text-primary" />}
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{reward.description}</p>

                  <div className="flex items-center justify-between">
                    <div className="text-sm">Niveau {reward.level}</div>

                    {reward.locked ? (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Lock size={14} />
                        <span>Locked</span>
                      </div>
                    ) : reward.claimed ? (
                      <div className="text-sm text-primary">Claimed</div>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => onClaimReward(reward.id)}
                        className="h-8 bg-primary hover:bg-primary/90 text-black"
                      >
                        <Gift size={14} className="mr-1" />
                        Claim
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {reward.locked && (
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm rounded-lg flex items-center justify-center">
                  <div className="flex flex-col items-center gap-2">
                    <Lock size={24} className="text-white/70" />
                    <span className="text-white/70 font-medium">Level {reward.level} required</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
