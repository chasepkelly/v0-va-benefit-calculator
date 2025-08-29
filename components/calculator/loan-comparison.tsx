"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Calculator, TrendingUp, TrendingDown, ChevronDown, ChevronUp, Info, Clock, DollarSign } from "lucide-react"
import { type ComparisonResult, formatCurrency, formatPercent } from "@/lib/calculator"

interface LoanComparisonProps {
  results: ComparisonResult
  creditScore: number
  loanTerm: number
}

export function LoanComparison({ results, creditScore, loanTerm }: LoanComparisonProps) {
  const [showAssumptions, setShowAssumptions] = useState(false)
  const [selectedView, setSelectedView] = useState<"monthly" | "lifetime">("monthly")

  const { va, conventional, fha } = results

  // Calculate lifetime savings
  const lifetimeVAvsConv = (conventional.monthlyPayment.total - va.monthlyPayment.total) * 12 * loanTerm
  const lifetimeVAvsF = (fha.monthlyPayment.total - va.monthlyPayment.total) * 12 * loanTerm

  // PMI drop information for conventional
  const pmiDropInfo = conventional.pmi.canDrop
    ? {
        scheduledMonth: conventional.pmi.scheduledDropMonth,
        requestedMonth: conventional.pmi.dropMonth,
        monthlyPMI: conventional.pmi.monthlyAmount,
      }
    : null

  // FHA MIP cancellation info
  const fhaCancellation = fha.mip.cancellationRule

  return (
    <div className="space-y-6">
      {/* Comparison Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-primary" />
                Loan Comparison
              </CardTitle>
              <CardDescription>See how VA stacks up against other loan options</CardDescription>
            </div>
            <Tabs value={selectedView} onValueChange={(value) => setSelectedView(value as any)}>
              <TabsList>
                <TabsTrigger value="monthly">Monthly</TabsTrigger>
                <TabsTrigger value="lifetime">Lifetime</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          {selectedView === "monthly" ? (
            <MonthlyComparison results={results} pmiDropInfo={pmiDropInfo} fhaCancellation={fhaCancellation} />
          ) : (
            <LifetimeComparison
              results={results}
              lifetimeVAvsConv={lifetimeVAvsConv}
              lifetimeVAvsF={lifetimeVAvsF}
              loanTerm={loanTerm}
            />
          )}
        </CardContent>
      </Card>

      {/* Detailed Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            VA Loan Advantages
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* No PMI Advantage */}
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="w-4 h-4 text-green-600" />
                <span className="font-medium text-green-800">No PMI Required</span>
              </div>
              <div className="space-y-1 text-sm">
                <div>
                  Monthly savings: <span className="font-medium">{formatCurrency(conventional.pmi.monthlyAmount)}</span>
                </div>
                <div>
                  Annual savings:{" "}
                  <span className="font-medium">{formatCurrency(conventional.pmi.monthlyAmount * 12)}</span>
                </div>
                {pmiDropInfo && (
                  <div className="text-xs text-green-700 mt-2">
                    Conventional PMI would drop after {Math.round(pmiDropInfo.scheduledMonth / 12)} years
                  </div>
                )}
              </div>
            </div>

            {/* Down Payment Flexibility */}
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-4 h-4 text-blue-600" />
                <span className="font-medium text-blue-800">$0 Down Payment</span>
              </div>
              <div className="space-y-1 text-sm">
                <div>VA allows 100% financing</div>
                <div>Conventional typically requires 5-20% down</div>
                <div>FHA requires minimum 3.5% down</div>
              </div>
            </div>

            {/* Residual Income */}
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="flex items-center gap-2 mb-2">
                <Calculator className="w-4 h-4 text-purple-600" />
                <span className="font-medium text-purple-800">Residual Income Focus</span>
              </div>
              <div className="space-y-1 text-sm">
                <div>VA considers leftover cash after bills</div>
                <div>More flexible than strict DTI limits</div>
                <div>
                  Current residual: <span className="font-medium">{formatCurrency(va.residualIncome.actual)}</span>
                </div>
              </div>
            </div>

            {/* Funding Fee vs PMI */}
            <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-amber-600" />
                <span className="font-medium text-amber-800">One-Time vs Monthly Cost</span>
              </div>
              <div className="space-y-1 text-sm">
                <div>
                  VA: One-time funding fee {va.fundingFee.exempt ? "(waived)" : formatCurrency(va.fundingFee.amount)}
                </div>
                <div>Conventional: Monthly PMI {formatCurrency(conventional.pmi.monthlyAmount)}</div>
                <div>FHA: Both UFMIP + monthly MIP</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assumptions & Methodology */}
      <Collapsible open={showAssumptions} onOpenChange={setShowAssumptions}>
        <CollapsibleTrigger asChild>
          <Button variant="outline" className="w-full bg-transparent">
            <Info className="w-4 h-4 mr-2" />
            {showAssumptions ? "Hide" : "Show"} Assumptions & Methodology
            {showAssumptions ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <Card className="mt-4">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">Shared Assumptions</h4>
                  <div className="space-y-2 text-sm">
                    <div>Same purchase price, down payment, and interest rate</div>
                    <div>Same property taxes and insurance</div>
                    <div>Credit score: {creditScore}</div>
                    <div>Loan term: {loanTerm} years</div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-3">Product-Specific Details</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <strong>Conventional:</strong> PMI based on credit/LTV grid
                    </div>
                    <div>
                      <strong>FHA:</strong> {formatPercent(fha.ufmip.rate)} UFMIP +{" "}
                      {formatPercent((fha.mip.monthlyAmount * 12) / fha.loanAmount)} annual MIP
                    </div>
                    <div>
                      <strong>VA:</strong>{" "}
                      {va.fundingFee.exempt
                        ? "No funding fee (disabled veteran)"
                        : `${formatPercent(va.fundingFee.rate)} funding fee`}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Important Notes</h4>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <div>• PMI/MIP rates are illustrative and vary by lender</div>
                  <div>• Actual qualification depends on full underwriting review</div>
                  <div>• Interest rates shown are for comparison purposes only</div>
                  <div>• VA eligibility requires Certificate of Eligibility (COE)</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}

function MonthlyComparison({
  results,
  pmiDropInfo,
  fhaCancellation,
}: {
  results: ComparisonResult
  pmiDropInfo: any
  fhaCancellation: string
}) {
  const { va, conventional, fha } = results

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="text-left py-3 font-medium">Payment Component</th>
            <th className="text-right py-3 text-primary font-bold">VA Loan</th>
            <th className="text-right py-3 font-medium">Conventional</th>
            <th className="text-right py-3 font-medium">FHA</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-muted">
            <td className="py-2">Principal & Interest</td>
            <td className="text-right py-2 font-medium">{formatCurrency(va.monthlyPayment.principalInterest)}</td>
            <td className="text-right py-2">{formatCurrency(conventional.monthlyPayment.principalInterest)}</td>
            <td className="text-right py-2">{formatCurrency(fha.monthlyPayment.principalInterest)}</td>
          </tr>
          <tr className="border-b border-muted">
            <td className="py-2">Property Taxes</td>
            <td className="text-right py-2">{formatCurrency(va.monthlyPayment.propertyTaxes)}</td>
            <td className="text-right py-2">{formatCurrency(conventional.monthlyPayment.propertyTaxes)}</td>
            <td className="text-right py-2">{formatCurrency(fha.monthlyPayment.propertyTaxes)}</td>
          </tr>
          <tr className="border-b border-muted">
            <td className="py-2">Home Insurance</td>
            <td className="text-right py-2">{formatCurrency(va.monthlyPayment.homeInsurance)}</td>
            <td className="text-right py-2">{formatCurrency(conventional.monthlyPayment.homeInsurance)}</td>
            <td className="text-right py-2">{formatCurrency(fha.monthlyPayment.homeInsurance)}</td>
          </tr>
          <tr className="border-b border-muted">
            <td className="py-2">HOA Fees</td>
            <td className="text-right py-2">{formatCurrency(va.monthlyPayment.hoa)}</td>
            <td className="text-right py-2">{formatCurrency(conventional.monthlyPayment.hoa)}</td>
            <td className="text-right py-2">{formatCurrency(fha.monthlyPayment.hoa)}</td>
          </tr>
          <tr className="border-b border-muted">
            <td className="py-2">
              <div className="flex items-center gap-1">
                PMI/MIP
                {pmiDropInfo && (
                  <Badge variant="outline" className="text-xs">
                    Drops yr {Math.round(pmiDropInfo.scheduledMonth / 12)}
                  </Badge>
                )}
              </div>
            </td>
            <td className="text-right py-2 text-green-600 font-medium">$0</td>
            <td className="text-right py-2">
              <div className="space-y-1">
                <div>{formatCurrency(conventional.monthlyPayment.pmi)}</div>
                {pmiDropInfo && (
                  <div className="text-xs text-muted-foreground">
                    Then $0 after {Math.round(pmiDropInfo.scheduledMonth / 12)} years
                  </div>
                )}
              </div>
            </td>
            <td className="text-right py-2">
              <div className="space-y-1">
                <div>{formatCurrency(fha.monthlyPayment.mip)}</div>
                <div className="text-xs text-muted-foreground">{fhaCancellation}</div>
              </div>
            </td>
          </tr>
          <tr className="border-t-2 border-primary bg-primary/5">
            <td className="py-3 font-bold">Total Monthly Payment</td>
            <td className="text-right py-3 font-bold text-primary text-lg">
              {formatCurrency(va.monthlyPayment.total)}
            </td>
            <td className="text-right py-3 font-bold">{formatCurrency(conventional.monthlyPayment.total)}</td>
            <td className="text-right py-3 font-bold">{formatCurrency(fha.monthlyPayment.total)}</td>
          </tr>
          <tr className="bg-green-50">
            <td className="py-2 font-medium text-green-800">Monthly Savings vs VA</td>
            <td className="text-right py-2 text-green-600 font-bold">—</td>
            <td className="text-right py-2 text-green-600 font-bold">
              {formatCurrency(conventional.monthlyPayment.total - va.monthlyPayment.total)}
            </td>
            <td className="text-right py-2 text-green-600 font-bold">
              {formatCurrency(fha.monthlyPayment.total - va.monthlyPayment.total)}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

function LifetimeComparison({
  results,
  lifetimeVAvsConv,
  lifetimeVAvsF,
  loanTerm,
}: {
  results: ComparisonResult
  lifetimeVAvsConv: number
  lifetimeVAvsF: number
  loanTerm: number
}) {
  const { va, conventional, fha } = results

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="text-center p-4 bg-primary/5 rounded-lg border border-primary/20">
          <div className="text-2xl font-bold text-primary mb-1">
            {formatCurrency(va.monthlyPayment.total * 12 * loanTerm)}
          </div>
          <div className="text-sm font-medium text-primary">VA Loan</div>
          <div className="text-xs text-muted-foreground">{loanTerm}-year total</div>
        </div>

        <div className="text-center p-4 bg-muted rounded-lg">
          <div className="text-2xl font-bold text-foreground mb-1">
            {formatCurrency(conventional.monthlyPayment.total * 12 * loanTerm)}
          </div>
          <div className="text-sm font-medium">Conventional</div>
          <div className="text-xs text-red-600 font-medium">+{formatCurrency(lifetimeVAvsConv)} more</div>
        </div>

        <div className="text-center p-4 bg-muted rounded-lg">
          <div className="text-2xl font-bold text-foreground mb-1">
            {formatCurrency(fha.monthlyPayment.total * 12 * loanTerm)}
          </div>
          <div className="text-sm font-medium">FHA</div>
          <div className="text-xs text-red-600 font-medium">+{formatCurrency(lifetimeVAvsF)} more</div>
        </div>
      </div>

      <div className="p-4 bg-green-50 rounded-lg border border-green-200">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-5 h-5 text-green-600" />
          <span className="font-medium text-green-800">Lifetime VA Loan Savings</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-lg font-bold text-green-800">{formatCurrency(lifetimeVAvsConv)}</div>
            <div className="text-sm text-green-700">vs Conventional over {loanTerm} years</div>
          </div>
          <div>
            <div className="text-lg font-bold text-green-800">{formatCurrency(lifetimeVAvsF)}</div>
            <div className="text-sm text-green-700">vs FHA over {loanTerm} years</div>
          </div>
        </div>
      </div>
    </div>
  )
}
