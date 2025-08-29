"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, ChevronUp, FileText, Calculator, Database } from "lucide-react"
import { type ComparisonResult, formatCurrency, formatPercent } from "@/lib/calculator"
import { datasets } from "@/lib/data"

interface AuditRibbonProps {
  results: ComparisonResult
  inputs: {
    state: string
    homePrice: number
    creditScore: number
    loanTerm: number
    familySize: number
  }
}

export function AuditRibbon({ results, inputs }: AuditRibbonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<"formulas" | "data" | "assumptions">("formulas")

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button variant="outline" className="w-full bg-transparent">
          <FileText className="w-4 h-4 mr-2" />
          {isOpen ? "Hide" : "Show"} Calculation Details & Transparency
          {isOpen ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-primary" />
              Calculation Audit Trail
            </CardTitle>
            <CardDescription>Complete transparency into how your numbers were calculated</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-6">
              <Button
                variant={activeTab === "formulas" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveTab("formulas")}
              >
                Formulas
              </Button>
              <Button
                variant={activeTab === "data" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveTab("data")}
              >
                Data Sources
              </Button>
              <Button
                variant={activeTab === "assumptions" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveTab("assumptions")}
              >
                Assumptions
              </Button>
            </div>

            {activeTab === "formulas" && <FormulasTab results={results} inputs={inputs} />}
            {activeTab === "data" && <DataSourcesTab inputs={inputs} />}
            {activeTab === "assumptions" && <AssumptionsTab results={results} inputs={inputs} />}
          </CardContent>
        </Card>
      </CollapsibleContent>
    </Collapsible>
  )
}

function FormulasTab({ results, inputs }: { results: ComparisonResult; inputs: any }) {
  const { va, conventional, fha } = results

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-primary/5 rounded-lg">
          <h4 className="font-medium text-primary mb-3">VA Loan Calculations</h4>
          <div className="space-y-2 text-sm">
            <div>
              <strong>Loan Amount:</strong> ${inputs.homePrice.toLocaleString()} - ${0} down = $
              {va.loanAmount.toLocaleString()}
            </div>
            <div>
              <strong>Funding Fee:</strong> {formatPercent(va.fundingFee.rate)} × ${va.loanAmount.toLocaleString()} = $
              {va.fundingFee.amount.toLocaleString()}
            </div>
            <div>
              <strong>Monthly P&I:</strong> PMT({formatPercent(6.5 / 100)}/12, {inputs.loanTerm * 12}, $
              {va.loanAmount.toLocaleString()}) = {formatCurrency(va.monthlyPayment.principalInterest)}
            </div>
            <div>
              <strong>DTI:</strong> ({formatCurrency(800)} + {formatCurrency(va.monthlyPayment.total)}) ÷{" "}
              {formatCurrency(8000)} = {formatPercent(va.dti)}
            </div>
          </div>
        </div>

        <div className="p-4 bg-muted rounded-lg">
          <h4 className="font-medium mb-3">Conventional Loan</h4>
          <div className="space-y-2 text-sm">
            <div>
              <strong>PMI Rate:</strong> Credit {inputs.creditScore}, LTV{" "}
              {Math.round((conventional.loanAmount / inputs.homePrice) * 100)}% = {formatPercent(0.005)} annual
            </div>
            <div>
              <strong>Monthly PMI:</strong> ${conventional.loanAmount.toLocaleString()} × {formatPercent(0.005)} ÷ 12 ={" "}
              {formatCurrency(conventional.monthlyPayment.pmi)}
            </div>
            <div>
              <strong>PMI Drops:</strong> At 78% LTV (scheduled) or 80% LTV (requested)
            </div>
          </div>
        </div>

        <div className="p-4 bg-muted rounded-lg">
          <h4 className="font-medium mb-3">FHA Loan</h4>
          <div className="space-y-2 text-sm">
            <div>
              <strong>UFMIP:</strong> {formatPercent(fha.ufmip.rate)} × ${fha.loanAmount.toLocaleString()} = $
              {fha.ufmip.amount.toLocaleString()}
            </div>
            <div>
              <strong>Annual MIP:</strong> {formatPercent((fha.mip.monthlyAmount * 12) / fha.loanAmount)} of loan amount
            </div>
            <div>
              <strong>MIP Duration:</strong> {fha.mip.cancellationRule}
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
        <h4 className="font-medium text-amber-800 mb-2">Residual Income Calculation</h4>
        <div className="text-sm text-amber-700 space-y-1">
          <div>
            <strong>Formula:</strong> Gross Income - Taxes - Debts - Housing - Living Expenses = Residual Income
          </div>
          <div>
            <strong>Your Calculation:</strong> {formatCurrency(8000)} - {formatCurrency(2000)} - {formatCurrency(800)} -{" "}
            {formatCurrency(va.monthlyPayment.total)} - {formatCurrency(3200)} ={" "}
            {formatCurrency(va.residualIncome.actual)}
          </div>
          <div>
            <strong>Required for {va.residualIncome.region}:</strong> {formatCurrency(va.residualIncome.required)}{" "}
            (family of {inputs.familySize})
          </div>
        </div>
      </div>
    </div>
  )
}

function DataSourcesTab({ inputs }: { inputs: any }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <Database className="w-4 h-4" />
            Property Tax Data
          </h4>
          <div className="space-y-2 text-sm">
            <div>
              <strong>Source:</strong> {datasets.propertyTax.version}
            </div>
            <div>
              <strong>{inputs.state} Rate:</strong>{" "}
              {formatPercent(datasets.propertyTax.rates[inputs.state as keyof typeof datasets.propertyTax.rates])}
            </div>
            <div>
              <strong>Annual Tax:</strong> ${inputs.homePrice.toLocaleString()} ×{" "}
              {formatPercent(datasets.propertyTax.rates[inputs.state as keyof typeof datasets.propertyTax.rates])} = $
              {Math.round(
                inputs.homePrice * datasets.propertyTax.rates[inputs.state as keyof typeof datasets.propertyTax.rates],
              ).toLocaleString()}
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <Database className="w-4 h-4" />
            Home Insurance Data
          </h4>
          <div className="space-y-2 text-sm">
            <div>
              <strong>Source:</strong> {datasets.homeInsurance.version}
            </div>
            <div>
              <strong>{inputs.state} Average:</strong> $
              {datasets.homeInsurance.states[
                inputs.state as keyof typeof datasets.homeInsurance.states
              ]?.avgAnnual.toLocaleString() || datasets.homeInsurance.nationalAvgAnnual.toLocaleString()}{" "}
              annually
            </div>
            <div>
              <strong>Monthly:</strong> $
              {Math.round(
                (datasets.homeInsurance.states[inputs.state as keyof typeof datasets.homeInsurance.states]?.avgAnnual ||
                  datasets.homeInsurance.nationalAvgAnnual) / 12,
              ).toLocaleString()}
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <Database className="w-4 h-4" />
            VA Residual Income
          </h4>
          <div className="space-y-2 text-sm">
            <div>
              <strong>Source:</strong> {datasets.residualIncome.version}
            </div>
            <div>
              <strong>Region:</strong> {inputs.state} maps to South region
            </div>
            <div>
              <strong>Family Size:</strong> {inputs.familySize} people
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <Database className="w-4 h-4" />
            Funding Fee & PMI
          </h4>
          <div className="space-y-2 text-sm">
            <div>
              <strong>VA Funding Fee:</strong> {datasets.fundingFee.version}
            </div>
            <div>
              <strong>PMI Grid:</strong> {datasets.pmi.version}
            </div>
            <div>
              <strong>FHA MIP:</strong> {datasets.fhaMip.version}
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h4 className="font-medium text-blue-800 mb-2">Data Update Schedule</h4>
        <div className="text-sm text-blue-700 space-y-1">
          <div>• Property tax rates: Updated annually from Tax Foundation</div>
          <div>• Home insurance: Updated annually from NAIC reports</div>
          <div>• VA requirements: Updated when VA publishes changes</div>
          <div>• PMI/MIP rates: Updated quarterly or when lenders report changes</div>
        </div>
      </div>
    </div>
  )
}

function AssumptionsTab({ results, inputs }: { results: ComparisonResult; inputs: any }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="font-medium mb-3">Shared Assumptions</h4>
          <div className="space-y-2 text-sm">
            <div>• Same purchase price across all loan types</div>
            <div>• Same interest rate for comparison purposes</div>
            <div>• Same property taxes and insurance</div>
            <div>• Credit score: {inputs.creditScore}</div>
            <div>• Loan term: {inputs.loanTerm} years</div>
            <div>• No rate buy-downs or points</div>
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-3">Calculation Limitations</h4>
          <div className="space-y-2 text-sm">
            <div>• Interest rates are illustrative only</div>
            <div>• PMI rates vary by lender and MI company</div>
            <div>• Actual qualification requires full underwriting</div>
            <div>• Property taxes vary by county/municipality</div>
            <div>• Insurance costs depend on coverage and deductibles</div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <h4 className="font-medium text-green-800 mb-2">VA Loan Specific</h4>
          <div className="text-sm text-green-700 space-y-1">
            <div>• Funding fee rates current as of 2024</div>
            <div>• Disabled veteran exemption assumed if indicated</div>
            <div>• Residual income based on VA regional tables</div>
            <div>• No PMI ever required on VA loans</div>
          </div>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h4 className="font-medium text-gray-800 mb-2">Conventional Loan Specific</h4>
          <div className="text-sm text-gray-700 space-y-1">
            <div>• PMI rates based on credit score and LTV</div>
            <div>• PMI cancellation at 78% LTV (automatic) or 80% LTV (requested)</div>
            <div>• Assumes conforming loan limits</div>
            <div>• No lender-specific overlays included</div>
          </div>
        </div>

        <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
          <h4 className="font-medium text-orange-800 mb-2">FHA Loan Specific</h4>
          <div className="text-sm text-orange-700 space-y-1">
            <div>• UFMIP assumed to be financed</div>
            <div>• Annual MIP based on LTV and loan term</div>
            <div>• MIP cancellation rules as of 2024</div>
            <div>• Assumes standard FHA loan limits</div>
          </div>
        </div>
      </div>
    </div>
  )
}
