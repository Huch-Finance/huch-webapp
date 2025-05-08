"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, Circle, Target, Gift } from "lucide-react"

interface Challenge {
  id: number
  title: string
  description: string
  reward: number
  progress: number
  total: number
  completed: boolean
}

interface DailyChallengesProps {
  challenges: Challenge[]
  onClaimReward: (challengeId: number) => void
}

export function DailyChallenges({ challenges, onClaimReward }: DailyChallengesProps) {
  const [expandedChallenge, setExpandedChallenge] = useState<number | null>(null)

  const toggleExpand = (id: number) => {
    setExpandedChallenge(expandedChallenge === id ? null : id)
  }

  const completedChallenges = challenges.filter((c) => c.completed).length
  const totalChallenges = challenges.length

  return (
    <Card className="border-muted">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="text-primary" />
            <span>Défis Quotidiens</span>
          </div>
          <span className="text-sm font-medium">
            {completedChallenges}/{totalChallenges}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progression globale */}
        <div className="space-y-2">
          <Progress value={(completedChallenges / totalChallenges) * 100} className="h-2" />
          {completedChallenges === totalChallenges ? (
            <div className="text-center text-sm text-primary font-medium">
              Tous les défis complétés ! Revenez demain pour de nouveaux défis.
            </div>
          ) : (
            <div className="text-center text-sm text-muted-foreground">
              Complétez tous les défis pour un bonus de 50 points !
            </div>
          )}
        </div>

        {/* Liste des défis */}
        <div className="space-y-3">
          {challenges.map((challenge) => (
            <div
              key={challenge.id}
              className={`bg-muted rounded-lg p-3 transition-all duration-300 cursor-pointer ${
                expandedChallenge === challenge.id ? "ring-1 ring-primary" : ""
              }`}
              onClick={() => toggleExpand(challenge.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {challenge.completed ? (
                    <CheckCircle size={18} className="text-primary" />
                  ) : (
                    <Circle size={18} className="text-muted-foreground" />
                  )}
                  <span className={`font-medium ${challenge.completed ? "text-primary" : ""}`}>{challenge.title}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    {challenge.progress}/{challenge.total}
                  </span>
                </div>
              </div>

              {expandedChallenge === challenge.id && (
                <div className="mt-3 space-y-3 animate-appear">
                  <p className="text-sm text-muted-foreground">{challenge.description}</p>

                  <Progress value={(challenge.progress / challenge.total) * 100} className="h-1.5" />

                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1 text-sm">
                      <Gift size={14} className="text-primary" />
                      <span>{challenge.reward} points</span>
                    </div>

                    {challenge.completed && (
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          onClaimReward(challenge.id)
                        }}
                        className="h-8 bg-primary hover:bg-primary/90 text-black"
                      >
                        Réclamer
                      </Button>
                    )}
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
