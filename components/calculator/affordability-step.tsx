"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { HelpCircle, DollarSign, Percent, Edit3 } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { type CalculatorInputs, formatCurrency, formatPercent } from "@/lib/calculator"
import { getStateDefaults } from "@/lib/state-utils"
import { datasets } from "@/lib/data"

interface AffordabilityStepProps {
  inputs: CalculatorInputs
  updateInputs: (updates: Partial<CalculatorInputs>) => void
  onNext: () => void
  onPrev: () => void
}

export function AffordabilityStep({ inputs, updateInputs, onNext, onPrev }: AffordabilityStepProps) {
  const stateDefaults = getStateDefaults(inputs.state, inputs.homePrice)
  const isComplete = inputs.homePrice > 0 && inputs.grossMonthlyIncome > 0

  const handleDownPaymentChange = (value: string, type: "dollar" | "percent") => {
    const numValue = Number.parseFloat(value) || 0
    updateInputs({
      downPayment: numValue,
      downPaymentType: type,
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Step 2: Affordability Snapshot
            <Badge variant="secondary">Required</Badge>
          </CardTitle>
          <CardDescription>Tell us about your target home and financial situation</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Home Price */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Label htmlFor="home-price">Target Home Price</Label>
              <Popover>
                <PopoverTrigger>
                  <HelpCircle className="w-4 h-4 text-muted-foreground" />
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <p className="text-sm">{datasets.popovers.purchasePrice}</p>
                </PopoverContent>
              </Popover>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-muted-foreground" />
              <Input
                id="home-price"
                type="number"
                value={inputs.homePrice}
                onChange={(e) => updateInputs({ homePrice: Number.parseFloat(e.target.value) || 0 })}
                className="text-lg font-medium"
              />
            </div>
            <Slider
              value={[inputs.homePrice]}
              onValueChange={([value]) => updateInputs({ homePrice: value })}
              max={1000000}
              min={100000}
              step={10000}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>$100K</span>
              <span>$1M</span>
            </div>
          </div>

          {/* Down Payment */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Label>Down Payment</Label>
              <Popover>
                <PopoverTrigger>
                  <HelpCircle className="w-4 h-4 text-muted-foreground" />
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <p className="text-sm">{datasets.popovers.downPayment}</p>
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Dollar Amount</Label>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                  <Input
                    type="number"
                    value={
                      inputs.downPaymentType === "dollar"
                        ? inputs.downPayment
                        : (inputs.homePrice * inputs.downPayment) / 100
                    }
                    onChange={(e) => handleDownPaymentChange(e.target.value, "dollar")}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Percentage</Label>
                <div className="flex items-center gap-2">
                  <Percent className="w-4 h-4 text-muted-foreground" />
                  <Input
                    type="number"
                    value={
                      inputs.downPaymentType === "percent"
                        ? inputs.downPayment
                        : ((inputs.downPayment / inputs.homePrice) * 100).toFixed(1)
                    }
                    onChange={(e) => handleDownPaymentChange(e.target.value, "percent")}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Property Taxes */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Label htmlFor="property-taxes">Monthly Property Taxes</Label>
              <Badge variant="outline" className="text-xs">
                Auto from {inputs.state} avg • editable
              </Badge>
              <Popover>
                <PopoverTrigger>
                  <HelpCircle className="w-4 h-4 text-muted-foreground" />
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <p className="text-sm">{datasets.popovers.taxesAuto}</p>
                </PopoverContent>
              </Popover>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-muted-foreground" />
              <Input
                id="property-taxes"
                type="number"
                value={inputs.propertyTaxesMonthly}
                onChange={(e) => updateInputs({ propertyTaxesMonthly: Number.parseFloat(e.target.value) || 0 })}
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => updateInputs({ propertyTaxesMonthly: stateDefaults.propertyTaxMonthly })}
              >
                <Edit3 className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Based on {formatPercent(stateDefaults.propertyTaxRate)} effective rate for {inputs.state}
            </p>
          </div>

          {/* Home Insurance */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Label htmlFor="home-insurance">Monthly Home Insurance</Label>
              <Badge variant="outline" className="text-xs">
                Auto from {inputs.state} avg • editable
              </Badge>
              <Popover>
                <PopoverTrigger>
                  <HelpCircle className="w-4 h-4 text-muted-foreground" />
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <p className="text-sm">{datasets.popovers.insuranceAuto}</p>
                </PopoverContent>
              </Popover>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-muted-foreground" />
              <Input
                id="home-insurance"
                type="number"
                value={inputs.homeInsuranceMonthly}
                onChange={(e) => updateInputs({ homeInsuranceMonthly: Number.parseFloat(e.target.value) || 0 })}
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => updateInputs({ homeInsuranceMonthly: stateDefaults.homeInsuranceMonthly })}
              >
                <Edit3 className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Based on {formatCurrency(stateDefaults.homeInsuranceAnnual)} annual average for {inputs.state}
            </p>
          </div>

          {/* HOA Fees */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Label htmlFor="hoa-fees">HOA/Condo Fees (Optional)</Label>
              <Popover>
                <PopoverTrigger>
                  <HelpCircle className="w-4 h-4 text-muted-foreground" />
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <p className="text-sm">{datasets.popovers.hoa}</p>
                </PopoverContent>
              </Popover>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-muted-foreground" />
              <Input
                id="hoa-fees"
                type="number"
                value={inputs.hoaFees}
                onChange={(e) => updateInputs({ hoaFees: Number.parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>

          {/* Income */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Label htmlFor="gross-income">Gross Monthly Income</Label>
              <Popover>
                <PopoverTrigger>
                  <HelpCircle className="w-4 h-4 text-muted-foreground" />
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <p className="text-sm">{datasets.popovers.grossIncome}</p>
                </PopoverContent>
              </Popover>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-muted-foreground" />
              <Input
                id="gross-income"
                type="number"
                value={inputs.grossMonthlyIncome}
                onChange={(e) => updateInputs({ grossMonthlyIncome: Number.parseFloat(e.target.value) || 0 })}
                className="text-lg font-medium"
              />
            </div>
          </div>

          {/* Monthly Debts */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Label htmlFor="monthly-debts">Total Monthly Debts</Label>
              <Popover>
                <PopoverTrigger>
                  <HelpCircle className="w-4 h-4 text-muted-foreground" />
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <p className="text-sm">{datasets.popovers.monthlyDebts}</p>
                </PopoverContent>
              </Popover>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-muted-foreground" />
              <Input
                id="monthly-debts"
                type="number"
                value={inputs.monthlyDebts}
                onChange={(e) => updateInputs({ monthlyDebts: Number.parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>

          {/* Credit Score */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Label htmlFor="credit-score">Credit Score (Optional)</Label>
              <Popover>
                <PopoverTrigger>
                  <HelpCircle className="w-4 h-4 text-muted-foreground" />
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <p className="text-sm">{datasets.popovers.creditScore}</p>
                </PopoverContent>
              </Popover>
            </div>
            <Input
              id="credit-score"
              type="number"
              min="300"
              max="850"
              value={inputs.creditScore}
              onChange={(e) => updateInputs({ creditScore: Number.parseInt(e.target.value) || 720 })}
              className="w-32"
            />
          </div>

          {/* Interest Rate */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Label htmlFor="interest-rate">Interest Rate (%)</Label>
              <Popover>
                <PopoverTrigger>
                  <HelpCircle className="w-4 h-4 text-muted-foreground" />
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <p className="text-sm">{datasets.popovers.interestRate}</p>
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Input
                id="interest-rate"
                type="number"
                step="0.1"
                value={inputs.interestRate}
                onChange={(e) => updateInputs({ interestRate: Number.parseFloat(e.target.value) || 6.5 })}
                className="w-32"
              />
              <Slider
                value={[inputs.interestRate]}
                onValueChange={([value]) => updateInputs({ interestRate: value })}
                max={10}
                min={3}
                step={0.1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>3%</span>
                <span>10%</span>
              </div>
            </div>
          </div>

          {/* VA Specific Options */}
          <div className="space-y-4 p-4 bg-muted rounded-lg">
            <h3 className="font-medium text-foreground">VA Loan Options</h3>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="disabled-veteran">Disabled Veteran</Label>
                <p className="text-sm text-muted-foreground">Exempt from VA funding fee</p>
              </div>
              <Switch
                id="disabled-veteran"
                checked={inputs.isDisabledVeteran}
                onCheckedChange={(checked) => updateInputs({ isDisabledVeteran: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="finance-funding-fee">Finance Funding Fee</Label>
                <p className="text-sm text-muted-foreground">Roll the one-time fee into your loan</p>
              </div>
              <Switch
                id="finance-funding-fee"
                checked={inputs.financeFundingFee}
                onCheckedChange={(checked) => updateInputs({ financeFundingFee: checked })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrev} size="lg">
          Back to Eligibility
        </Button>
        <Button onClick={onNext} disabled={!isComplete} size="lg" className="min-w-32">
          See My Results
        </Button>
      </div>
    </div>
  )
}
