"use client"

import { useState, useEffect } from "react"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, Shield, Calculator, TrendingUp } from "lucide-react"
import { EligibilityStep } from "@/components/calculator/eligibility-step"
import { AffordabilityStep } from "@/components/calculator/affordability-step"
import { ResultsStep } from "@/components/calculator/results-step"
import type { CalculatorInputs } from "@/lib/calculator"
import { getStateDefaults } from "@/lib/state-utils"

const STEPS = [
  { id: 1, title: "Eligibility", description: "Basic service & family info" },
  { id: 2, title: "Affordability", description: "Income & home details" },
  { id: 3, title: "Results", description: "Your VA buying power" },
]

export default function VACalculatorPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [inputs, setInputs] = useState<CalculatorInputs>({
    // Eligibility defaults
    serviceStatus: "veteran",
    priorVAUsage: false,
    state: "TX",
    familySize: 2,
    coeStatus: "not-sure",

    // Affordability defaults
    homePrice: 400000,
    downPayment: 0,
    downPaymentType: "percent",
    propertyTaxesMonthly: 600,
    homeInsuranceMonthly: 238,
    hoaFees: 0,
    grossMonthlyIncome: 8000,
    monthlyDebts: 800,
    creditScore: 720,
    interestRate: 6.5,
    loanTerm: 30,

    // VA specific defaults
    isDisabledVeteran: false,
    financeFundingFee: true,
  })

  // Update state-based defaults when state changes
  useEffect(() => {
    const stateDefaults = getStateDefaults(inputs.state, inputs.homePrice)
    setInputs((prev) => ({
      ...prev,
      propertyTaxesMonthly: stateDefaults.propertyTaxMonthly,
      homeInsuranceMonthly: stateDefaults.homeInsuranceMonthly,
    }))
  }, [inputs.state, inputs.homePrice])

  const updateInputs = (updates: Partial<CalculatorInputs>) => {
    setInputs((prev) => ({ ...prev, ...updates }))
  }

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const goToStep = (step: number) => {
    setCurrentStep(step)
  }

  const progressPercentage = (currentStep / 3) * 100

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-12 h-12 bg-primary rounded-lg">
              <Shield className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">VA Buying Power Calculator</h1>
              <p className="text-muted-foreground">Find your VA buying power in 60 seconds</p>
            </div>
          </div>

          <div className="text-sm text-muted-foreground mb-4">
            VA looks at more than DTI—<strong>residual income</strong> can help you qualify when others say no.
          </div>

          {/* Progress Bar */}
          <div className="space-y-3">
            <Progress value={progressPercentage} className="h-2" />
            <div className="flex justify-between">
              {STEPS.map((step) => (
                <button
                  key={step.id}
                  onClick={() => goToStep(step.id)}
                  className={`flex items-center gap-2 text-sm transition-colors ${
                    currentStep >= step.id ? "text-primary font-medium" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {currentStep > step.id ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <div
                      className={`w-4 h-4 rounded-full border-2 ${
                        currentStep >= step.id ? "border-primary bg-primary" : "border-muted-foreground"
                      }`}
                    >
                      {currentStep === step.id && <div className="w-full h-full rounded-full bg-primary" />}
                    </div>
                  )}
                  <div className="text-left">
                    <div className="font-medium">{step.title}</div>
                    <div className="text-xs text-muted-foreground">{step.description}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {currentStep === 1 && <EligibilityStep inputs={inputs} updateInputs={updateInputs} onNext={nextStep} />}

        {currentStep === 2 && (
          <AffordabilityStep inputs={inputs} updateInputs={updateInputs} onNext={nextStep} onPrev={prevStep} />
        )}

        {currentStep === 3 && <ResultsStep inputs={inputs} updateInputs={updateInputs} onPrev={prevStep} />}
      </div>

      {/* Footer */}
      <div className="bg-card border-t mt-16">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="flex items-start gap-3">
              <Calculator className="w-5 h-5 text-primary mt-1" />
              <div>
                <h3 className="font-medium text-foreground">Accurate Estimates</h3>
                <p className="text-sm text-muted-foreground">
                  State-specific taxes and insurance with transparent calculations
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-primary mt-1" />
              <div>
                <h3 className="font-medium text-foreground">VA Expertise</h3>
                <p className="text-sm text-muted-foreground">
                  Residual income rules and funding fee calculations built-in
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <TrendingUp className="w-5 h-5 text-primary mt-1" />
              <div>
                <h3 className="font-medium text-foreground">Compare Options</h3>
                <p className="text-sm text-muted-foreground">See how VA stacks up against Conventional and FHA loans</p>
              </div>
            </div>
          </div>

          <div className="text-xs text-muted-foreground space-y-1">
            <p>Estimates only. Not a commitment to lend or credit decision.</p>
            <p>Assumes illustrative interest rate; actual terms vary by lender and profile.</p>
            <p>VA eligibility (COE) is separate from lender approval.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
