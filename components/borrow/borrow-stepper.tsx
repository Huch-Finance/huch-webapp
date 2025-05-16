import { Check } from "lucide-react"

interface BorrowStepperProps {
  currentStep: number
}

export function BorrowStepper({ currentStep }: BorrowStepperProps) {
  return (
    <div className="flex items-center justify-between mb-8">
      {[1, 2, 3].map((n, idx, arr) => (
        <div key={n} className="flex items-center flex-1">
          <div className="flex flex-col items-center flex-1">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 ${
                currentStep === n
                  ? "bg-[#7480ff] text-white border-[#7480ff]"
                  : currentStep > n
                    ? "bg-[#7480ff] text-white border-[#7480ff]"
                    : "bg-muted text-white border-gray-300"
              }`}
            >
              {currentStep > n ? <Check size={20} className="text-white" /> : n}
            </div>
            <span className={`mt-2 text-xs ${currentStep === n || currentStep > n ? "text-white" : "text-gray-500"}`}>
              {n === 1 ? "Select skins" : n === 2 ? "Loan amount" : "Confirm"}
            </span>
          </div>
          {idx < arr.length - 1 && (
            <div
              className={`h-1 flex-1 mx-2 rounded ${currentStep > n ? "bg-[#7480ff]" : "bg-gray-300"}`}
              style={{ minWidth: 32 }}
            />
          )}
        </div>
      ))}
    </div>
  )
}
