"use client"
import { CyberpunkContainer } from "@/components/layout/cyberpunk-container"
import { Calendar, DollarSign, Percent, Clock, Shield, Wallet, ArrowRight } from "lucide-react"

interface LoanSummaryProps {
  skins: Array<{
    id: number
    name: string
    value: number
    image: string
  }>
  totalSkinValue: number
  loanAmount: number
  interestRate: number
  loanDuration: number
  repaymentAmount: number
  dueDate: Date
}

export function LoanSummary({
  skins,
  totalSkinValue,
  loanAmount,
  interestRate,
  loanDuration,
  repaymentAmount,
  dueDate,
}: LoanSummaryProps) {
  const loanPercentage = Math.round((loanAmount / totalSkinValue) * 100)

  return (
    <div className="space-y-6">
      <CyberpunkContainer className="overflow-hidden">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Left column - Visual summary */}
          <div className="md:w-1/2 space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-bold mb-2">Loan Overview</h3>
              <div className="flex justify-center items-center gap-4 mb-4">
                <div className="w-20 h-20 rounded-full bg-[#2A2A2A] flex items-center justify-center">
                  <DollarSign size={32} className="text-[#5D5FEF]" />
                </div>
                <ArrowRight size={24} className="text-gray-400" />
                <div className="w-20 h-20 rounded-full bg-[#2A2A2A] flex items-center justify-center">
                  <Wallet size={32} className="text-[#5D5FEF]" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-[#2A2A2A] p-3 rounded-lg">
                  <div className="flex justify-center mb-2">
                    <DollarSign size={18} className="text-[#5D5FEF]" />
                  </div>
                  <div className="text-sm text-gray-400">Loan</div>
                  <div className="font-bold text-[#5D5FEF]">{loanAmount} $</div>
                </div>

                <div className="bg-[#2A2A2A] p-3 rounded-lg">
                  <div className="flex justify-center mb-2">
                    <Percent size={18} className="text-[#5D5FEF]" />
                  </div>
                  <div className="text-sm text-gray-400">Interest</div>
                  <div className="font-bold">{interestRate}%</div>
                </div>

                <div className="bg-[#2A2A2A] p-3 rounded-lg">
                  <div className="flex justify-center mb-2">
                    <Clock size={18} className="text-[#5D5FEF]" />
                  </div>
                  <div className="text-sm text-gray-400">Duration</div>
                  <div className="font-bold">{loanDuration} days</div>
                </div>
              </div>
            </div>

            {/* Loan to Value Ratio */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Loan to Value Ratio</span>
                <span className="text-[#5D5FEF] font-bold">{loanPercentage}%</span>
              </div>
              <div className="h-2 bg-[#2A2A2A] rounded-full overflow-hidden">
                <div className="h-full bg-[#5D5FEF]" style={{ width: `${loanPercentage}%` }}></div>
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>0%</span>
                <span>100%</span>
              </div>
            </div>

            {/* Due date */}
            <div className="bg-[#2A2A2A] p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Calendar size={18} className="text-[#5D5FEF]" />
                <span className="font-medium">Due Date</span>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[#5D5FEF]">
                  {dueDate.toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
                <div className="text-sm text-gray-400">{loanDuration} days from today</div>
              </div>
            </div>
          </div>

          {/* Right column - Loan details */}
          <div className="md:w-1/2 space-y-4">
            <h3 className="text-lg font-bold">Loan Details</h3>

            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-[#2A2A2A]">
                <span className="text-gray-400">Collateral</span>
                <span className="font-medium">{skins.length} skins</span>
              </div>

              <div className="max-h-32 overflow-y-auto pr-1 space-y-2">
                {skins.map((skin) => (
                  <div key={skin.id} className="flex items-center gap-2 bg-[#2A2A2A]/30 p-2 rounded-md">
                    <div className="w-8 h-8 rounded-md overflow-hidden flex-shrink-0">
                      <img
                        src={skin.image || "/placeholder.svg"}
                        alt={skin.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs truncate">{skin.name}</p>
                    </div>
                    <span className="text-xs text-[#5D5FEF]">{skin.value} $</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between py-2 border-b border-[#2A2A2A]">
                <span className="text-gray-400">Total collateral value</span>
                <span className="font-medium">{totalSkinValue} $</span>
              </div>

              <div className="flex justify-between py-2 border-b border-[#2A2A2A]">
                <span className="text-gray-400">Loan amount</span>
                <span className="font-medium text-[#5D5FEF]">{loanAmount} $</span>
              </div>

              <div className="flex justify-between py-2 border-b border-[#2A2A2A]">
                <span className="text-gray-400">Interest rate</span>
                <span className="font-medium">{interestRate}%</span>
              </div>

              <div className="flex justify-between py-2 border-b border-[#2A2A2A]">
                <span className="text-gray-400">Interest amount</span>
                <span className="font-medium">{repaymentAmount - loanAmount} $</span>
              </div>

              <div className="flex justify-between py-2 border-b border-[#2A2A2A]">
                <span className="text-gray-400">Total to repay</span>
                <span className="font-bold text-[#5D5FEF]">{repaymentAmount} $</span>
              </div>
            </div>

            {/* Security information */}
            <div className="bg-[#2A2A2A]/50 p-3 rounded-lg flex items-start gap-2">
              <Shield size={18} className="text-[#5D5FEF] mt-0.5 flex-shrink-0" />
              <div className="text-xs text-gray-400">
                Your skins will be securely stored in our smart contract until you repay your loan. You can repay at any
                time before the due date to get your skins back.
              </div>
            </div>
          </div>
        </div>
      </CyberpunkContainer>

      {/* Terms and conditions */}
      <div className="text-sm text-gray-400 p-4 bg-[#2A2A2A]/30 rounded-lg">
        <p>
          By clicking on "Borrow", you accept the terms and conditions of the service and confirm that you have read our
          privacy policy. You understand that failure to repay the loan by the due date may result in the loss of your
          understand that failure to repay the loan by the due date may result in the loss of your collateral. Huch will
          take ownership of your skins if the loan is not repaid in full by the due date.
        </p>
      </div>
    </div>
  )
}
