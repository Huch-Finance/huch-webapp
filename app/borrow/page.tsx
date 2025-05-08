"use client"

import { useState } from "react"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { ArrowLeft, ArrowRight, Info, X } from "lucide-react"
import { SuccessModal } from "@/components/success-modal"
import { SelectedSkinsSummary } from "@/components/selected-skins-summary"
import { Badge } from "@/components/ui/badge"
import { CyberpunkContainer } from "@/components/cyberpunk-container"
import { LoanSummary } from "@/components/loan-summary"
import { AuthRequired } from "@/components/auth-required"
import { BorrowStepper } from "@/components/borrow-stepper"
import { Footer } from "@/components/footer"

// Mocked skin data
const SKINS = [
  {
    id: 1,
    name: "Glock-18 | Neo Noir (Minimal Wear)",
    value: 76,
    image:
      "https://community.fastly.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgposbaqKAxf0Ob3djFN79eJmo-Chcj4OrzZgiUEvJJz3ujEoomijAHg8kI_N2mgI4HBIVc7ZVzX-FW6wujsg5fptJ_J1zI97WjKBCQa/330x192",
  },
  {
    id: 2,
    name: "AWP | Dragon Lore",
    value: 1712,
    image:
      "https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot621FAR17P7NdTRH-t26q4SZlvD7PYTQgXtu5Mx2gv2PrdSijAWwqkVtN272JIGdJw46YVrYqVO3xLy-gJC9u5vByCBh6ygi7WGdwUKTYdRD8A/360fx360f",
  },
  {
    id: 3,
    name: "Karambit | Fade",
    value: 987,
    image:
      "https://imageproxy.waxpeer.com/insecure/rs:fit:552:384:0/g:nowe/f:webp/plain/https://steamcommunity-a.akamaihd.net/economy/image/class/730/311484762",
  },
  {
    id: 4,
    name: "M4A4 | Howl",
    value: 1253,
    image:
      "https://community.fastly.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpou-6kejhjxszFJTwT09S5g4yCmfDLP7LWnn8f6pIl2-yYp9SnjA23-BBuNW-iLI-XJgFsZQyG_VW2lOq918e8uszLn2wj5HeAvkVdtQ/330x192",
  },
  {
    id: 5,
    name: "Butterfly Knife | Doppler",
    value: 726,
    image:
      "https://steamcommunity-a.akamaihd.net/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf0ebcZThQ6tCvq4GGqPP7I6vdk3lu-M1wmeyVyoD8j1yg5RA-amD2I4DAdFU4ZlzW_VHsxOro1Ja6tJvNnCBjuSZw4SuOy0S_0EpSLrs4jN2yK_Y",
  },
  {
    id: 6,
    name: "AK-47 | Fire Serpent (Field-Tested)",
    value: 850,
    image:
      "https://community.fastly.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot7HxfDhjxszOeC9H_9mkhIWFg8j1OO-GqWlD6dN-teTE8YXghRq2-UpoazrzIYPDewdtY1jSrwDqkL2905C7uZvAyXA26Ckj4SvenkPin1gSOWBtMceQ/360fx360f",
  },
]

export default function Emprunter() {
  const [step, setStep] = useState(1)
  const [selectedSkins, setSelectedSkins] = useState<number[]>([])
  const [loanPercentage, setLoanPercentage] = useState(50)
  const [loanDuration, setLoanDuration] = useState(30)
  const [showSuccessModal, setShowSuccessModal] = useState(false)

  const selectedSkinsData = selectedSkins
    .map((id) => SKINS.find((skin) => skin.id === id))
    .filter(Boolean) as typeof SKINS
  const totalSkinValue = selectedSkinsData.reduce((total, skin) => total + skin.value, 0)
  const loanAmount = Math.round(totalSkinValue * (loanPercentage / 100))
  const interestRate = Number.parseFloat((3 * (loanDuration / 30)).toFixed(1)) // 3% par mois, change avec le rate que tu veux.
  const repaymentAmount = Math.round(loanAmount * (1 + interestRate / 100))
  const dueDate = new Date(Date.now() + loanDuration * 24 * 60 * 60 * 1000)

  const handleSelectSkin = (id: number) => {
    setSelectedSkins((prev) => {
      if (prev.includes(id)) {
        return prev.filter((skinId) => skinId !== id)
      } else {
        return [...prev, id]
      }
    })
  }

  const handleRemoveSkin = (id: number) => {
    setSelectedSkins((prev) => prev.filter((skinId) => skinId !== id))
  }

  const handleNextStep = () => {
    if (step < 3) {
      setStep(step + 1)
    } else {
      setShowSuccessModal(true)
    }
  }

  const handlePrevStep = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const handleLoanPercentageChange = (value: number[]) => {
    setLoanPercentage(value[0])
  }

  return (
    <main className="min-h-screen flex flex-col bg-gradient-to-b from-[#0f0f13] to-[#1a1a1f] relative z-10">
      <div className="scanlines"></div>
      <Navbar />

      <section className="pt-24 pb-16 px-4 flex-1">
        <div className="container mx-auto max-w-4xl">
          <AuthRequired
            title="Connect to borrow"
            description="You need to connect your account to access the borrowing feature and use your CS2 skins as collateral."
          >
            <BorrowStepper currentStep={step} />

            {/* Step 1: Select Skin */}
            {step === 1 && (
              <div className="animate-appear">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl md:text-3xl font-bold">
                    Select <span className="text-[#5D5FEF] neon-text">skins</span>
                  </h2>
                  {selectedSkins.length > 0 && (
                    <Badge className="bg-[#5D5FEF] text-white">
                      {selectedSkins.length} {selectedSkins.length > 1 ? "skins selected" : "skin selected"}
                    </Badge>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {SKINS.map((skin) => (
                        <Card
                          key={skin.id}
                          className={`cursor-pointer transition-all duration-300 hover:scale-105 bg-[#1E1E1E] ${
                            selectedSkins.includes(skin.id)
                              ? "border-[#5D5FEF] neon-pulse"
                              : "border-[#2A2A2A] hover:border-[#5D5FEF]/50"
                          }`}
                          onClick={() => handleSelectSkin(skin.id)}
                        >
                          <CardContent className="p-4">
                            <div className="aspect-video relative overflow-hidden rounded-md mb-4">
                              <img
                                src={skin.image || "/placeholder.svg"}
                                alt={skin.name}
                                className="w-full h-full object-cover"
                              />
                              {selectedSkins.includes(skin.id) && (
                                <div className="absolute top-2 right-2 bg-[#5D5FEF] text-white text-xs font-bold px-2 py-1 rounded">
                                  Selected
                                </div>
                              )}
                            </div>
                            <h3 className="font-medium mb-1">{skin.name}</h3>
                            <p className="text-[#5D5FEF] font-bold">{skin.value} $</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <SelectedSkinsSummary skins={selectedSkinsData} onRemove={handleRemoveSkin} />

                    {selectedSkins.length > 0 && (
                      <CyberpunkContainer className="bg-[#1E1E1E]">
                        <div className="flex justify-between mb-2">
                          <span>Total value:</span>
                          <span className="font-bold text-[#5D5FEF]">{totalSkinValue} $</span>
                        </div>
                        <div className="flex justify-between mb-2">
                          <span>Loan range:</span>
                          <span className="font-bold">
                            {Math.round(totalSkinValue * 0.3)} $ - {Math.round(totalSkinValue * 0.7)} $
                          </span>
                        </div>
                      </CyberpunkContainer>
                    )}

                    <Button
                      onClick={handleNextStep}
                      disabled={selectedSkins.length === 0}
                      className="w-full bg-[#5D5FEF] hover:bg-[#4A4CDF] text-white neon-pulse"
                    >
                      Next
                      <ArrowRight className="ml-2" />
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Loan Amount */}
            {step === 2 && selectedSkinsData.length > 0 && (
              <div className="animate-appear">
                <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
                  Loan <span className="text-[#5D5FEF]">amount</span>
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <Card className="border border-[#2A2A2A] bg-[#1E1E1E]">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-medium">Selected skins</h3>
                        <Badge className="bg-[#5D5FEF] text-white">
                          {selectedSkins.length} {selectedSkins.length > 1 ? "skins" : "skin"}
                        </Badge>
                      </div>

                      <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                        {selectedSkinsData.map((skin) => (
                          <div key={skin.id} className="flex items-center gap-3 bg-[#2A2A2A] p-2 rounded-md">
                            <div className="w-12 h-12 rounded-md overflow-hidden flex-shrink-0">
                              <img
                                src={skin.image || "/placeholder.svg"}
                                alt={skin.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">{skin.name}</p>
                              <p className="text-[#5D5FEF] text-xs">{skin.value} $</p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-gray-400 hover:text-white"
                              onClick={() => handleRemoveSkin(skin.id)}
                            >
                              <X size={16} />
                            </Button>
                          </div>
                        ))}
                      </div>

                      <div className="mt-4 pt-3 border-t border-[#2A2A2A] flex justify-between items-center">
                        <span className="text-sm text-gray-400">Total value :</span>
                        <span className="font-bold text-[#5D5FEF]">{totalSkinValue} $</span>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="space-y-8">
                    <div>
                      <div className="flex justify-between mb-2">
                        <label className="text-sm text-gray-400">Loan percentage</label>
                        <span className="text-[#5D5FEF] font-bold">{loanPercentage}%</span>
                      </div>
                      <Slider
                        defaultValue={[50]}
                        min={30}
                        max={65}
                        step={1}
                        onValueChange={handleLoanPercentageChange}
                        className="my-4"
                      />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>30%</span>
                        <span>65%</span>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <label className="text-sm text-gray-400">Loan Duration</label>
                        <span className="text-[#5D5FEF] font-bold">{loanDuration} days</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 my-4">
                        {[30, 60, 90].map((days) => (
                          <button
                            key={days}
                            onClick={() => setLoanDuration(days)}
                            className={`py-2 px-4 rounded-md text-center transition-colors ${
                              loanDuration === days
                                ? "bg-[#5D5FEF] text-white font-medium"
                                : "bg-[#2A2A2A] text-gray-300 hover:bg-[#3A3A3A]"
                            }`}
                          >
                            {days} days
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 bg-[#2A2A2A]/80 rounded-lg">
                      <div className="flex justify-between mb-2">
                        <span>Total value :</span>
                        <span className="font-bold">{totalSkinValue} $</span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span>Loan amount:</span>
                        <span className="font-bold text-[#5D5FEF]">{loanAmount} $</span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span>Interest rate:</span>
                        <span>
                          {interestRate}% for {loanDuration} days
                        </span>
                      </div>
                      <div className="flex justify-between font-bold">
                        <span>Amount to repay:</span>
                        <span>{repaymentAmount} $</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 p-3 bg-[#1E1E1E] rounded-lg border border-[#2A2A2A]">
                      <Info size={16} className="text-[#5D5FEF] flex-shrink-0" />
                      <p className="text-sm text-gray-400">
                        You will receive {loanAmount} $ in USDC to your wallet. Your skins will be kept until repayment.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex justify-between">
                  <Button
                    variant="outline"
                    onClick={handlePrevStep}
                    className="border-[#2A2A2A] text-gray-400 hover:text-white hover:border-white"
                  >
                    <ArrowLeft className="mr-2" />
                    Previous
                  </Button>

                  <Button onClick={handleNextStep} className="bg-[#5D5FEF] hover:bg-[#4A4CDF] text-white">
                    Next
                    <ArrowRight className="ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Confirmation */}
            {step === 3 && selectedSkinsData.length > 0 && (
              <div className="animate-appear">
                <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
                  <span className="text-[#5D5FEF]">Confirm</span> loan
                </h2>

                <LoanSummary
                  skins={selectedSkinsData}
                  totalSkinValue={totalSkinValue}
                  loanAmount={loanAmount}
                  interestRate={interestRate}
                  loanDuration={loanDuration}
                  repaymentAmount={repaymentAmount}
                  dueDate={dueDate}
                />

                <div className="mt-8 flex justify-between">
                  <Button
                    variant="outline"
                    onClick={handlePrevStep}
                    className="border-[#2A2A2A] text-gray-400 hover:text-white hover:border-white"
                  >
                    <ArrowLeft className="mr-2" />
                    Previous
                  </Button>

                  <Button onClick={handleNextStep} className="bg-[#5D5FEF] hover:bg-[#4A4CDF] text-white">
                    Borrow
                    <ArrowRight className="ml-2" />
                  </Button>
                </div>
              </div>
            )}
          </AuthRequired>
        </div>
      </section>

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        loanAmount={loanAmount}
        skinNames={selectedSkinsData.map((skin) => skin.name)}
        loanDuration={loanDuration}
      />

      <Footer />
    </main>
  )
}
