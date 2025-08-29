"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, AlertCircle, Shield } from "lucide-react"
import { type CalculatorInputs, calculateAllLoans, formatCurrency, formatPercent } from "@/lib/calculator"
import { LoanComparison } from "./loan-comparison"
import { DeltaChip } from "./delta-chip"
import { EducationalExplainers } from "./educational-explainers"
import { AuditRibbon } from "./audit-ribbon"
import { useState, useEffect } from "react"

interface ResultsStepProps {
  inputs: CalculatorInputs
  updateInputs: (updates: Partial<CalculatorInputs>) => void
  onPrev: () => void
}

export function ResultsStep({ inputs, onPrev }: ResultsStepProps) {
  const [previousResults, setPreviousResults] = useState<ReturnType<typeof calculateAllLoans> | null>(null)
  const results = calculateAllLoans(inputs)
  const { va, conventional, fha } = results

  // Track changes for delta chips
  useEffect(() => {
    if (previousResults) {
      // Small delay to show the change
      const timer = setTimeout(() => setPreviousResults(results), 100)
      return () => clearTimeout(timer)
    } else {
      setPreviousResults(results)
    }
  }, [inputs.homePrice, inputs.interestRate, inputs.state]) // Track key changes

  const getEligibilityBadge = () => {
    if (va.eligibility.vaEligible && va.eligibility.financiallyQualified === "likely") {
      return <Badge className="bg-green-100 text-green-800 border-green-200">Likely VA-Eligible</Badge>
    }
    if (va.eligibility.vaEligible && va.eligibility.financiallyQualified === "maybe") {
      return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">May Qualify</Badge>
    }
    return <Badge className="bg-red-100 text-red-800 border-red-200">Needs Review</Badge>
  }

  return (
    <div className="space-y-6">
      {/* Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Your VA Buying Power Results
            {getEligibilityBadge()}
          </CardTitle>
          <CardDescription>Based on your information, here's what your VA benefit can do for you</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="text-3xl font-bold text-primary">{formatCurrency(va.monthlyPayment.total)}</div>
                {previousResults && (
                  <DeltaChip
                    current={va.monthlyPayment.total}
                    previous={previousResults.va.monthlyPayment.total}
                    label="/mo"
                  />
                )}
              </div>
              <div className="text-sm text-muted-foreground">Estimated Monthly Payment</div>
              <div className="text-xs text-muted-foreground mt-1">PITI + HOA</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-foreground mb-2">{formatPercent(va.dti)}</div>
              <div className="text-sm text-muted-foreground">Debt-to-Income Ratio</div>
              <div className="text-xs text-muted-foreground mt-1">
                {va.dti <= 0.41 ? "Within guidelines" : "Above 41% - residual income matters"}
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-accent mb-2">$0</div>
              <div className="text-sm text-muted-foreground">Monthly PMI</div>
              <div className="text-xs text-muted-foreground mt-1">VA loans have no PMI</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* VA Advantages */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Why VA Helps You
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <div className="font-medium">
                  No PMI saves {formatCurrency(conventional.monthlyPayment.pmi * 12)} annually
                </div>
                <div className="text-sm text-muted-foreground">
                  Conventional loans would add {formatCurrency(conventional.monthlyPayment.pmi)}/month in PMI
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              {va.residualIncome.passes ? (
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
              )}
              <div>
                <div className="font-medium">
                  Residual income: {formatCurrency(va.residualIncome.actual)}
                  {va.residualIncome.passes ? " (passes)" : " (needs improvement)"}
                </div>
                <div className="text-sm text-muted-foreground">
                  Required for {va.residualIncome.region} region, family of {inputs.familySize}:{" "}
                  {formatCurrency(va.residualIncome.required)}
                </div>
              </div>
            </div>

            {!inputs.isDisabledVeteran && (
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <div className="font-medium">
                    Funding fee: {formatCurrency(va.fundingFee.amount)}
                    {inputs.financeFundingFee ? " (financed)" : " (paid upfront)"}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {formatPercent(va.fundingFee.rate)} one-time fee replaces monthly PMI
                  </div>
                </div>
              </div>
            )}

            {inputs.isDisabledVeteran && (
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <div className="font-medium">Funding fee waived - disabled veteran exemption</div>
                  <div className="text-sm text-muted-foreground">
                    Saves {formatCurrency(va.loanAmount * 0.0215)} compared to standard funding fee
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Loan Comparison */}
      <LoanComparison results={results} creditScore={inputs.creditScore} loanTerm={inputs.loanTerm} />

      <EducationalExplainers
        vaLoan={va}
        familySize={inputs.familySize}
        dtiComparison={{
          conventional: conventional.dti,
          fha: fha.dti,
        }}
      />

      {/* COE Status */}
      {va.eligibility.needsCOE && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-600" />
              Next Step: Get Your COE
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                You'll need a Certificate of Eligibility (COE) to proceed with your VA loan. Here's what you need based
                on your service:
              </p>
              <div className="space-y-2">
                {inputs.serviceStatus === "veteran" && (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">DD-214 (Member 4 copy)</span>
                  </div>
                )}
                {inputs.serviceStatus === "active" && (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Statement of Service signed by personnel office</span>
                  </div>
                )}
                {(inputs.serviceStatus === "guard" || inputs.serviceStatus === "reserve") && (
                  <>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm">NGB Form 22 (for Guard) or NGB Form 23 (for Reserves)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm">Copy of retirement points statement</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <AuditRibbon
        results={results}
        inputs={{
          state: inputs.state,
          homePrice: inputs.homePrice,
          creditScore: inputs.creditScore,
          loanTerm: inputs.loanTerm,
          familySize: inputs.familySize,
        }}
      />

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrev} size="lg">
          Back to Affordability
        </Button>
        <div className="space-x-4">
          <Button size="lg" className="bg-primary hover:bg-primary/90">
            Book Free VA Strategy Call
          </Button>
          <Button variant="outline" size="lg">
            Get Full Report
          </Button>
        </div>
      </div>
    </div>
  )
}
