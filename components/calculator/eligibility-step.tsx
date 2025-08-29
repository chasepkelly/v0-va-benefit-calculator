"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Badge } from "@/components/ui/badge"
import { HelpCircle, CheckCircle, AlertCircle } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import type { CalculatorInputs } from "@/lib/calculator"
import { US_STATES } from "@/lib/state-utils"
import { datasets } from "@/lib/data"

interface EligibilityStepProps {
  inputs: CalculatorInputs
  updateInputs: (updates: Partial<CalculatorInputs>) => void
  onNext: () => void
}

export function EligibilityStep({ inputs, updateInputs, onNext }: EligibilityStepProps) {
  const isComplete = inputs.serviceStatus && inputs.state && inputs.familySize > 0

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Step 1: Eligibility Basics
            <Badge variant="secondary">Required</Badge>
          </CardTitle>
          <CardDescription>Let's confirm your VA loan eligibility and get some basic information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Service Status */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Label htmlFor="service-status">Service Status</Label>
              <Popover>
                <PopoverTrigger>
                  <HelpCircle className="w-4 h-4 text-muted-foreground" />
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <p className="text-sm">
                    Your current or former military service status. This helps determine your VA loan eligibility and
                    funding fee tier.
                  </p>
                </PopoverContent>
              </Popover>
            </div>
            <RadioGroup
              value={inputs.serviceStatus}
              onValueChange={(value) => updateInputs({ serviceStatus: value as any })}
              className="grid grid-cols-2 gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="veteran" id="veteran" />
                <Label htmlFor="veteran">Veteran</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="active" id="active" />
                <Label htmlFor="active">Active Duty</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="guard" id="guard" />
                <Label htmlFor="guard">National Guard</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="reserve" id="reserve" />
                <Label htmlFor="reserve">Reserves</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="surviving-spouse" id="surviving-spouse" />
                <Label htmlFor="surviving-spouse">Surviving Spouse</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Prior VA Usage */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Label>Have you used your VA loan benefit before?</Label>
              <Popover>
                <PopoverTrigger>
                  <HelpCircle className="w-4 h-4 text-muted-foreground" />
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <p className="text-sm">{datasets.popovers.firstVsSubsequent}</p>
                </PopoverContent>
              </Popover>
            </div>
            <RadioGroup
              value={inputs.priorVAUsage ? "yes" : "no"}
              onValueChange={(value) => updateInputs({ priorVAUsage: value === "yes" })}
              className="flex gap-6"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="first-time" />
                <Label htmlFor="first-time">No, first time</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="used-before" />
                <Label htmlFor="used-before">Yes, used before</Label>
              </div>
            </RadioGroup>
          </div>

          {/* State */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Label htmlFor="state">State</Label>
              <Popover>
                <PopoverTrigger>
                  <HelpCircle className="w-4 h-4 text-muted-foreground" />
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <p className="text-sm">
                    Where you're planning to buy. We'll use this to estimate property taxes and insurance costs.
                  </p>
                </PopoverContent>
              </Popover>
            </div>
            <Select value={inputs.state} onValueChange={(value) => updateInputs({ state: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select your state" />
              </SelectTrigger>
              <SelectContent>
                {US_STATES.map((state) => (
                  <SelectItem key={state.code} value={state.code}>
                    {state.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Family Size */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Label htmlFor="family-size">Family Size</Label>
              <Popover>
                <PopoverTrigger>
                  <HelpCircle className="w-4 h-4 text-muted-foreground" />
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <p className="text-sm">
                    Total number of people in your household, including yourself. This affects VA's residual income
                    requirements.
                  </p>
                </PopoverContent>
              </Popover>
            </div>
            <Input
              id="family-size"
              type="number"
              min="1"
              max="10"
              value={inputs.familySize}
              onChange={(e) => updateInputs({ familySize: Number.parseInt(e.target.value) || 1 })}
              className="w-32"
            />
          </div>

          {/* COE Status */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Label>Certificate of Eligibility (COE) Status</Label>
              <Popover>
                <PopoverTrigger>
                  <HelpCircle className="w-4 h-4 text-muted-foreground" />
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <p className="text-sm">{datasets.popovers.coe}</p>
                </PopoverContent>
              </Popover>
            </div>
            <RadioGroup
              value={inputs.coeStatus}
              onValueChange={(value) => updateInputs({ coeStatus: value as any })}
              className="space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="coe-yes" />
                <Label htmlFor="coe-yes" className="flex items-center gap-2">
                  Yes, I have my COE
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="coe-no" />
                <Label htmlFor="coe-no" className="flex items-center gap-2">
                  No, I don't have it yet
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="not-sure" id="coe-not-sure" />
                <Label htmlFor="coe-not-sure" className="flex items-center gap-2">
                  Not sure what this is
                  <HelpCircle className="w-4 h-4 text-blue-600" />
                </Label>
              </div>
            </RadioGroup>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-end">
        <Button onClick={onNext} disabled={!isComplete} size="lg" className="min-w-32">
          Continue to Affordability
        </Button>
      </div>
    </div>
  )
}
