"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  ChevronDown,
  ChevronUp,
  Calculator,
  DollarSign,
  Shield,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  BookOpen,
  Target,
} from "lucide-react"
import { formatCurrency, formatPercent, type LoanCalculation } from "@/lib/calculator"

interface EducationalExplainersProps {
  vaLoan: LoanCalculation
  familySize: number
  dtiComparison: {
    conventional: number
    fha: number
  }
}

export function EducationalExplainers({ vaLoan, familySize, dtiComparison }: EducationalExplainersProps) {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({})

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }))
  }

  const explainers = [
    {
      id: "dti-vs-residual",
      title: "DTI vs Residual Income",
      description: "Why VA looks at more than just debt-to-income ratio",
      icon: Calculator,
      content: <DTIvsResidualExplainer vaLoan={vaLoan} familySize={familySize} dtiComparison={dtiComparison} />,
    },
    {
      id: "funding-fee",
      title: "VA Funding Fee",
      description: "One-time fee that replaces monthly mortgage insurance",
      icon: DollarSign,
      content: <FundingFeeExplainer vaLoan={vaLoan} />,
    },
    {
      id: "va-advantages",
      title: "VA Loan Advantages",
      description: "Why VA loans are different from conventional and FHA",
      icon: Shield,
      content: <VAAdvantagesExplainer />,
    },
    {
      id: "qualification-process",
      title: "VA Qualification Process",
      description: "Steps to get approved for your VA loan",
      icon: Target,
      content: <QualificationProcessExplainer vaLoan={vaLoan} />,
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary" />
          Understanding Your VA Loan
        </CardTitle>
        <CardDescription>Learn how VA loans work and why they might be right for you</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {explainers.map((explainer) => (
          <Collapsible
            key={explainer.id}
            open={openSections[explainer.id]}
            onOpenChange={() => toggleSection(explainer.id)}
          >
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between p-4 h-auto bg-muted/50 hover:bg-muted">
                <div className="flex items-center gap-3 text-left">
                  <explainer.icon className="w-5 h-5 text-primary" />
                  <div>
                    <div className="font-medium">{explainer.title}</div>
                    <div className="text-sm text-muted-foreground">{explainer.description}</div>
                  </div>
                </div>
                {openSections[explainer.id] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="pt-4 pb-2">{explainer.content}</div>
            </CollapsibleContent>
          </Collapsible>
        ))}
      </CardContent>
    </Card>
  )
}

function DTIvsResidualExplainer({
  vaLoan,
  familySize,
  dtiComparison,
}: {
  vaLoan: LoanCalculation
  familySize: number
  dtiComparison: { conventional: number; fha: number }
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <Calculator className="w-4 h-4 text-blue-600" />
            <span className="font-medium text-blue-800">Debt-to-Income (DTI)</span>
          </div>
          <div className="space-y-2 text-sm">
            <div>
              Your DTI: <span className="font-medium">{formatPercent(vaLoan.dti)}</span>
            </div>
            <div>Conventional guideline: ≤43%</div>
            <div>FHA guideline: ≤57%</div>
            <div className="text-xs text-blue-700 mt-2">DTI = (Monthly debts + Housing payment) ÷ Gross income</div>
          </div>
        </div>

        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-green-600" />
            <span className="font-medium text-green-800">Residual Income</span>
          </div>
          <div className="space-y-2 text-sm">
            <div>
              Your residual: <span className="font-medium">{formatCurrency(vaLoan.residualIncome.actual)}</span>
            </div>
            <div>
              Required: <span className="font-medium">{formatCurrency(vaLoan.residualIncome.required)}</span>
            </div>
            <div>
              Status:{" "}
              <Badge
                className={vaLoan.residualIncome.passes ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
              >
                {vaLoan.residualIncome.passes ? "Passes" : "Needs Work"}
              </Badge>
            </div>
            <div className="text-xs text-green-700 mt-2">
              Money left after all major expenses for family of {familySize}
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="w-4 h-4 text-amber-600" />
          <span className="font-medium text-amber-800">Why This Matters</span>
        </div>
        <div className="space-y-2 text-sm text-amber-800">
          <p>
            VA loans are unique because they consider your <strong>residual income</strong> - the money you have left
            after paying all your bills. This can help you qualify even if your DTI is higher than conventional
            guidelines.
          </p>
          {vaLoan.dti > 0.41 && vaLoan.residualIncome.passes && (
            <p className="font-medium">
              Your DTI is above 41%, but your strong residual income may still help you qualify for a VA loan!
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

function FundingFeeExplainer({ vaLoan }: { vaLoan: LoanCalculation }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <h4 className="font-medium">Your Funding Fee</h4>
          <div className="space-y-2">
            {vaLoan.fundingFee.exempt ? (
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm">
                  <strong>Waived</strong> - Disabled veteran exemption
                </span>
              </div>
            ) : (
              <>
                <div className="text-lg font-bold text-primary">{formatCurrency(vaLoan.fundingFee.amount)}</div>
                <div className="text-sm text-muted-foreground">
                  {formatPercent(vaLoan.fundingFee.rate)} of loan amount
                </div>
                <div className="text-sm">{vaLoan.fundingFee.financed ? "Financed into loan" : "Paid at closing"}</div>
              </>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="font-medium">What It Replaces</h4>
          <div className="space-y-2 text-sm">
            <div>• Monthly PMI: $0 (vs $150-400/month typical)</div>
            <div>• Upfront PMI: $0</div>
            <div>• MIP (FHA): $0</div>
            <div className="text-green-600 font-medium">Annual savings: {formatCurrency(2400)} typical</div>
          </div>
        </div>
      </div>

      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h4 className="font-medium text-blue-800 mb-2">Funding Fee Tiers</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <div className="font-medium mb-1">First-time use:</div>
            <div>• 0% down: 2.15%</div>
            <div>• 5-9.99% down: 1.50%</div>
            <div>• 10%+ down: 1.25%</div>
          </div>
          <div>
            <div className="font-medium mb-1">Subsequent use:</div>
            <div>• 0% down: 3.30%</div>
            <div>• 5-9.99% down: 1.50%</div>
            <div>• 10%+ down: 1.25%</div>
          </div>
        </div>
      </div>
    </div>
  )
}

function VAAdvantagesExplainer() {
  const advantages = [
    {
      title: "No Down Payment Required",
      description: "Finance 100% of the home's value",
      comparison: "Conventional: 5-20% down, FHA: 3.5% down",
      icon: TrendingUp,
    },
    {
      title: "No Monthly PMI",
      description: "Save $150-400+ per month",
      comparison: "Conventional & FHA: Monthly mortgage insurance required",
      icon: DollarSign,
    },
    {
      title: "Competitive Interest Rates",
      description: "Often lower than conventional loans",
      comparison: "Backed by VA guarantee to lenders",
      icon: TrendingUp,
    },
    {
      title: "No Prepayment Penalties",
      description: "Pay off your loan early without fees",
      comparison: "Some conventional loans have prepayment penalties",
      icon: CheckCircle,
    },
    {
      title: "Assumable Loans",
      description: "Buyer can take over your loan terms",
      comparison: "Most conventional loans are not assumable",
      icon: Shield,
    },
    {
      title: "Foreclosure Protection",
      description: "VA works with you to avoid foreclosure",
      comparison: "Additional support not available with other loan types",
      icon: Shield,
    },
  ]

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {advantages.map((advantage, index) => (
          <div key={index} className="p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-start gap-3">
              <advantage.icon className="w-5 h-5 text-green-600 mt-0.5" />
              <div className="space-y-1">
                <div className="font-medium text-green-800">{advantage.title}</div>
                <div className="text-sm text-green-700">{advantage.description}</div>
                <div className="text-xs text-green-600">{advantage.comparison}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function QualificationProcessExplainer({ vaLoan }: { vaLoan: LoanCalculation }) {
  const steps = [
    {
      step: 1,
      title: "Check Eligibility",
      description: "Verify your military service qualifies you for VA benefits",
      status: vaLoan.eligibility.vaEligible ? "complete" : "pending",
    },
    {
      step: 2,
      title: "Get Certificate of Eligibility (COE)",
      description: "Obtain proof of your VA loan entitlement",
      status: !vaLoan.eligibility.needsCOE ? "complete" : "pending",
    },
    {
      step: 3,
      title: "Find a VA-Approved Lender",
      description: "Choose a lender experienced with VA loans",
      status: "pending",
    },
    {
      step: 4,
      title: "Get Pre-approved",
      description: "Lender reviews your finances and issues pre-approval",
      status: vaLoan.eligibility.financiallyQualified === "likely" ? "ready" : "pending",
    },
    {
      step: 5,
      title: "Find Your Home",
      description: "Search for homes within your budget and VA requirements",
      status: "pending",
    },
    {
      step: 6,
      title: "VA Appraisal",
      description: "VA ensures the home meets minimum property requirements",
      status: "pending",
    },
    {
      step: 7,
      title: "Close on Your Home",
      description: "Finalize the loan and get your keys",
      status: "pending",
    },
  ]

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {steps.map((step) => (
          <div key={step.step} className="flex items-start gap-4 p-3 rounded-lg bg-muted/50">
            <div
              className={`
                flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium
                ${
                  step.status === "complete"
                    ? "bg-green-100 text-green-800"
                    : step.status === "ready"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-gray-100 text-gray-600"
                }
              `}
            >
              {step.status === "complete" ? <CheckCircle className="w-4 h-4" /> : step.step}
            </div>
            <div className="flex-1">
              <div className="font-medium">{step.title}</div>
              <div className="text-sm text-muted-foreground">{step.description}</div>
              {step.status === "ready" && <Badge className="mt-1 bg-blue-100 text-blue-800">Ready to proceed</Badge>}
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
        <div className="flex items-center gap-2 mb-2">
          <Target className="w-4 h-4 text-primary" />
          <span className="font-medium text-primary">Your Current Status</span>
        </div>
        <div className="text-sm">
          {vaLoan.eligibility.financiallyQualified === "likely" && (
            <p className="text-green-700">
              You appear to meet both eligibility and financial requirements for a VA loan. Consider getting
              pre-approved to strengthen your home search.
            </p>
          )}
          {vaLoan.eligibility.financiallyQualified === "maybe" && (
            <p className="text-amber-700">
              You may qualify for a VA loan, but consider working with a lender to optimize your financial profile
              before applying.
            </p>
          )}
          {vaLoan.eligibility.financiallyQualified === "not-yet" && (
            <p className="text-red-700">
              Focus on improving your financial situation before applying. Consider paying down debts or increasing
              income.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
