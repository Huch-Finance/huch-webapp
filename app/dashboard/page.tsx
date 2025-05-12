"use client"

import { useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { useActiveLoans, Loan } from "@/hooks/use-active-loans"
import { LoadingOverlay } from "@/components/loading-overlay"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarDays, Clock, AlertTriangle, CheckCircle, RefreshCw, DollarSign, Wallet } from "lucide-react"
import Image from "next/image"
import { formatDistanceToNow, format, parseISO, differenceInDays } from "date-fns"
import { fr } from "date-fns/locale"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SteamAuthButton } from "@/components/steam-auth-button"
import { CyberpunkContainer } from "@/components/cyberpunk-container"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

export default function DashboardPage() {
  const { isAuthenticated, isLoading: privyLoading, profile } = useAuth()
  const { loans, isLoading: loansLoading, error, lastUpdated, refreshLoans, repayLoan } = useActiveLoans()
  
  // État pour le modal de remboursement
  const [repaymentDialogOpen, setRepaymentDialogOpen] = useState(false)
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null)
  const [repaymentAmount, setRepaymentAmount] = useState<number>(0)
  const [isProcessing, setIsProcessing] = useState(false)
  
  // État de chargement global
  const isLoading = privyLoading || loansLoading
  
  // Filtrer les prêts par statut
  const activeLoans = loans.filter(loan => loan.status === 'active')
  const completedLoans = loans.filter(loan => loan.status === 'completed')
  
  // Fonction pour calculer le temps restant jusqu'à l'échéance
  const getRemainingTime = (dueDate: string) => {
    const now = new Date()
    const due = parseISO(dueDate)
    const daysRemaining = differenceInDays(due, now)
    
    if (daysRemaining <= 0) {
      return { text: "Expiré", variant: "destructive" as const }
    } else if (daysRemaining <= 3) {
      return { text: `${daysRemaining} jour${daysRemaining > 1 ? 's' : ''} restant${daysRemaining > 1 ? 's' : ''}`, variant: "warning" as const }
    } else {
      return { text: `${daysRemaining} jours restants`, variant: "default" as const }
    }
  }
  
  // Fonction pour ouvrir le modal de remboursement
  const handleOpenRepayment = (loan: Loan) => {
    setSelectedLoan(loan)
    setRepaymentAmount(loan.totalToRepay - (loan.totalToRepay * (loan.repaymentProgress || 0) / 100))
    setRepaymentDialogOpen(true)
  }
  
  // Fonction pour effectuer le remboursement
  const handleRepay = async () => {
    if (!selectedLoan || repaymentAmount <= 0) return
    
    setIsProcessing(true)
    try {
      await repayLoan(selectedLoan.id, repaymentAmount)
      setRepaymentDialogOpen(false)
    } catch (error) {
      console.error("Erreur lors du remboursement:", error)
    } finally {
      setIsProcessing(false)
    }
  }
  
  // Afficher le chargement
  if (isLoading) {
    return <LoadingOverlay message="Chargement de vos prêts..." isLoading={true} />
  }
  
  // Si l'utilisateur n'est pas connecté
  if (!isAuthenticated) {
    return (
      <div className="container mx-auto py-10 px-4">
        <Card className="w-full max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Tableau de bord</CardTitle>
            <CardDescription>Connectez-vous pour voir vos prêts actifs</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <p className="text-muted-foreground mb-6">Vous devez être connecté pour accéder à votre tableau de bord</p>
            <SteamAuthButton />
          </CardContent>
        </Card>
      </div>
    )
  }
  
  return (
    <>
      <Navbar />
      <main className="pt-20 pb-16 min-h-screen">
        <div className="container mx-auto py-10 px-4">
          <div className="flex items-center justify-between mb-6">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-[#5D5FEF] to-[#9B5DE5] bg-clip-text text-transparent">Tableau de bord</h1>
              <p className="text-sm text-muted-foreground">Gérez vos prêts et suivez vos remboursements</p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={refreshLoans} 
              className="flex items-center gap-2 bg-[#1f1f23] border-[#2a3548] hover:bg-[#2a3548] text-white"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Actualiser</span>
            </Button>
          </div>
      
      {lastUpdated && (
        <p className="text-sm text-muted-foreground mb-6">
          Dernière mise à jour: {format(parseISO(lastUpdated), "dd MMMM yyyy à HH:mm", { locale: fr })}
        </p>
      )}
      
      <Tabs defaultValue="active" className="w-full">
        <TabsList className="mb-6 bg-[#1f1f23] border border-[#2a3548] p-1">
          <TabsTrigger 
            value="active" 
            className="relative data-[state=active]:bg-[#2a3548] data-[state=active]:text-white data-[state=active]:shadow-none"
          >
            Prêts actifs
            {activeLoans.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-[#5D5FEF] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {activeLoans.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger 
            value="completed"
            className="data-[state=active]:bg-[#2a3548] data-[state=active]:text-white data-[state=active]:shadow-none"
          >
            Prêts remboursés
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="active">
          {activeLoans.length === 0 ? (
            <CyberpunkContainer>
              <div className="pt-6 flex flex-col items-center justify-center py-10">
                <p className="text-muted-foreground mb-4">Vous n'avez pas de prêts actifs</p>
                <Button 
                  asChild
                  className="bg-gradient-to-r from-[#5D5FEF] to-[#9B5DE5] text-white hover:from-[#4A4CD9] hover:to-[#8A4BD0]"
                >
                  <a href="/borrow">Obtenir un prêt</a>
                </Button>
              </div>
            </CyberpunkContainer>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeLoans.map(loan => {
                const remainingTime = getRemainingTime(loan.dueDate)
                return (
                  <CyberpunkContainer key={loan.id} className="overflow-hidden relative group">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-[#1f1f23] rotate-45 transform translate-x-10 -translate-y-10 z-10"></div>
                    <div className="relative h-40 bg-gradient-to-b from-[#1f1f23] to-[#0f0f13] border-b border-[#2a3548]">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Image 
                          src={loan.skinImageUrl} 
                          alt={loan.skinName}
                          width={200}
                          height={150}
                          className="object-contain max-h-full p-2"
                        />
                      </div>
                      <div className="absolute top-2 right-2 bg-[#0f0f13]/90 text-white px-2 py-1 rounded-sm text-xs border border-[#2a3548] z-20">
                        {loan.skinName}
                      </div>
                    </div>
                    
                    <div className="p-4 pb-2">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xl font-bold text-white">{loan.loanAmount} <span className="text-[#5D5FEF]">USDC</span></span>
                        <span className={`text-xs px-2 py-1 rounded-sm border ${
                          remainingTime.variant === "destructive" ? "bg-red-900/20 border-red-700 text-red-400" :
                          remainingTime.variant === "warning" ? "bg-amber-900/20 border-amber-700 text-amber-400" :
                          "bg-green-900/20 border-green-700 text-green-400"
                        }`}>
                          {remainingTime.text}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-400 mb-4">
                        <Clock className="h-3 w-3" />
                        <span>Prêt sur {loan.duration} jours</span>
                      </div>
                    
                      <div className="space-y-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Montant à rembourser:</span>
                          <span className="font-medium text-white">{loan.totalToRepay} USDC</span>
                        </div>
                        
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Date d'échéance:</span>
                          <span className="font-medium text-white">{format(parseISO(loan.dueDate), "dd/MM/yyyy")}</span>
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Progression:</span>
                            <span className="font-medium text-[#5D5FEF]">{loan.repaymentProgress || 0}%</span>
                          </div>
                          <div className="h-2 bg-[#1f1f23] rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-[#5D5FEF] to-[#9B5DE5]" 
                              style={{ width: `${loan.repaymentProgress || 0}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 pt-2">
                      <Button 
                        className="w-full bg-[#1f1f23] border border-[#2a3548] hover:bg-[#2a3548] text-white group-hover:bg-gradient-to-r group-hover:from-[#5D5FEF] group-hover:to-[#9B5DE5] transition-all duration-300" 
                        onClick={() => handleOpenRepayment(loan)}
                      >
                        Rembourser
                      </Button>
                    </div>
                  </CyberpunkContainer>
                )
              })}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="completed">
          {completedLoans.length === 0 ? (
            <CyberpunkContainer>
              <div className="pt-6 flex flex-col items-center justify-center py-10">
                <p className="text-muted-foreground">Vous n'avez pas encore remboursé de prêts</p>
              </div>
            </CyberpunkContainer>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {completedLoans.map(loan => (
                <CyberpunkContainer key={loan.id} className="overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-[#1f1f23] rotate-45 transform translate-x-10 -translate-y-10 z-10"></div>
                  <div className="relative h-40 bg-gradient-to-b from-[#1f1f23] to-[#0f0f13] border-b border-[#2a3548]">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Image 
                        src={loan.skinImageUrl} 
                        alt={loan.skinName}
                        width={200}
                        height={150}
                        className="object-contain max-h-full p-2 opacity-70"
                      />
                    </div>
                    <div className="absolute top-2 right-2 bg-[#0f0f13]/90 text-white px-2 py-1 rounded-sm text-xs border border-[#2a3548] z-20">
                      {loan.skinName}
                    </div>
                    <div className="absolute top-0 left-0 w-full h-full bg-[#0f0f13]/40 flex items-center justify-center">
                      <div className="bg-gradient-to-r from-[#5D5FEF] to-[#9B5DE5] text-white px-4 py-2 rounded-sm flex items-center gap-2 transform -rotate-12 border border-white/20">
                        <CheckCircle className="h-4 w-4" />
                        <span className="font-bold">Remboursé</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 pb-2">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xl font-bold text-white">{loan.loanAmount} <span className="text-[#5D5FEF]">USDC</span></span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-400 mb-4">
                      <CalendarDays className="h-3 w-3" />
                      <span>Remboursé le {format(parseISO(loan.dueDate), "dd/MM/yyyy")}</span>
                    </div>
                  
                    <div className="space-y-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Montant remboursé:</span>
                        <span className="font-medium text-white">{loan.totalToRepay} USDC</span>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Intérêts payés:</span>
                        <span className="font-medium text-[#5D5FEF]">{(loan.totalToRepay - loan.loanAmount).toFixed(2)} USDC</span>
                      </div>
                      
                      <div className="h-2 bg-[#1f1f23] rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-[#5D5FEF] to-[#9B5DE5] w-full"></div>
                      </div>
                    </div>
                  </div>
                </CyberpunkContainer>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Modal de remboursement */}
      <Dialog open={repaymentDialogOpen} onOpenChange={setRepaymentDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-[#0f0f13] border border-[#2a3548] text-white shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold bg-gradient-to-r from-[#5D5FEF] to-[#9B5DE5] bg-clip-text text-transparent">
              Rembourser votre prêt
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Remboursez votre prêt pour récupérer votre skin CS2.
            </DialogDescription>
          </DialogHeader>
          
          {selectedLoan && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-4 bg-[#1f1f23] p-3 rounded-md border border-[#2a3548]">
                <div className="h-16 w-16 relative">
                  <Image 
                    src={selectedLoan.skinImageUrl} 
                    alt={selectedLoan.skinName}
                    fill
                    className="object-contain"
                  />
                </div>
                <div>
                  <h4 className="font-medium text-white">{selectedLoan.skinName}</h4>
                  <p className="text-sm text-gray-400">
                    Prêt de <span className="text-[#5D5FEF] font-medium">{selectedLoan.loanAmount} USDC</span>
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="amount" className="text-gray-300">Montant à rembourser</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#5D5FEF]" />
                  <Input
                    id="amount"
                    type="number"
                    value={repaymentAmount}
                    onChange={(e) => setRepaymentAmount(parseFloat(e.target.value))}
                    className="pl-10 bg-[#1f1f23] border-[#2a3548] text-white focus:border-[#5D5FEF] focus:ring-[#5D5FEF]/20"
                    step="0.01"
                    min="0.01"
                    max={selectedLoan.totalToRepay - (selectedLoan.totalToRepay * (selectedLoan.repaymentProgress || 0) / 100)}
                  />
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">
                    Montant restant à rembourser:
                  </span>
                  <span className="text-[#5D5FEF]">
                    {(selectedLoan.totalToRepay - (selectedLoan.totalToRepay * (selectedLoan.repaymentProgress || 0) / 100)).toFixed(2)} USDC
                  </span>
                </div>
              </div>
              
              <div className="bg-[#1f1f23] border border-[#5D5FEF]/30 rounded-md p-3 flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-[#5D5FEF] flex-shrink-0 mt-0.5" />
                <p className="text-sm text-gray-300">
                  Le remboursement complet de votre prêt vous permettra de récupérer votre skin CS2. Les remboursements partiels sont possibles mais ne libèrent pas votre garantie.
                </p>
              </div>
            </div>
          )}
          
          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={() => setRepaymentDialogOpen(false)} 
              disabled={isProcessing}
              className="bg-[#1f1f23] border-[#2a3548] hover:bg-[#2a3548] text-white"
            >
              Annuler
            </Button>
            <Button 
              onClick={handleRepay} 
              disabled={isProcessing || !repaymentAmount || repaymentAmount <= 0}
              className="bg-gradient-to-r from-[#5D5FEF] to-[#9B5DE5] text-white hover:from-[#4A4CD9] hover:to-[#8A4BD0]"
            >
              {isProcessing ? "Traitement..." : "Rembourser"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
        </div>
      </main>
      <Footer />
    </>
  )
}
