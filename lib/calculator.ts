import { getFundingFeeRate, getResidualIncomeRequirement, getPMIRate, getFHAMIPRate, getRegionFromState } from "./data"

export interface CalculatorInputs {
  // Eligibility
  serviceStatus: "veteran" | "active" | "guard" | "reserve" | "surviving-spouse"
  priorVAUsage: boolean
  state: string
  familySize: number
  coeStatus: "yes" | "no" | "not-sure"

  // Affordability
  homePrice: number
  downPayment: number
  downPaymentType: "dollar" | "percent"
  propertyTaxesMonthly: number
  homeInsuranceMonthly: number
  hoaFees: number
  grossMonthlyIncome: number
  monthlyDebts: number
  creditScore: number
  interestRate: number
  loanTerm: number

  // VA specific
  isDisabledVeteran: boolean
  financeFundingFee: boolean
}

export interface LoanCalculation {
  loanAmount: number
  fundingFee: {
    rate: number
    amount: number
    financed: boolean
    exempt: boolean
  }
  monthlyPayment: {
    principalInterest: number
    propertyTaxes: number
    homeInsurance: number
    hoa: number
    pmi: number
    total: number
  }
  dti: number
  residualIncome: {
    required: number
    actual: number
    passes: boolean
    region: string
  }
  eligibility: {
    vaEligible: boolean
    financiallyQualified: "likely" | "maybe" | "not-yet"
    needsCOE: boolean
  }
}

export interface ComparisonResult {
  va: LoanCalculation
  conventional: ConventionalLoan
  fha: FHALoan
}

export interface ConventionalLoan {
  loanAmount: number
  monthlyPayment: {
    principalInterest: number
    propertyTaxes: number
    homeInsurance: number
    hoa: number
    pmi: number
    total: number
  }
  pmi: {
    monthlyAmount: number
    canDrop: boolean
    dropMonth?: number
    scheduledDropMonth: number
  }
  dti: number
}

export interface FHALoan {
  loanAmount: number
  ufmip: {
    rate: number
    amount: number
    financed: boolean
  }
  monthlyPayment: {
    principalInterest: number
    propertyTaxes: number
    homeInsurance: number
    hoa: number
    mip: number
    total: number
  }
  mip: {
    monthlyAmount: number
    cancellationRule: string
  }
  dti: number
}

// Core calculation functions
export function calculateMonthlyPI(loanAmount: number, rate: number, termYears: number): number {
  const monthlyRate = rate / 100 / 12
  const numPayments = termYears * 12

  if (monthlyRate === 0) {
    return loanAmount / numPayments
  }

  return (
    (loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments))) / (Math.pow(1 + monthlyRate, numPayments) - 1)
  )
}

export function calculateVALoan(inputs: CalculatorInputs): LoanCalculation {
  // Calculate down payment amount
  const downPaymentAmount =
    inputs.downPaymentType === "percent" ? inputs.homePrice * (inputs.downPayment / 100) : inputs.downPayment

  // Base loan amount
  const baseLoanAmount = inputs.homePrice - downPaymentAmount

  // Calculate funding fee
  const downPaymentPercent = (downPaymentAmount / inputs.homePrice) * 100
  const fundingFeeRate = inputs.isDisabledVeteran ? 0 : getFundingFeeRate(!inputs.priorVAUsage, downPaymentPercent)
  const fundingFeeAmount = baseLoanAmount * fundingFeeRate

  // Final loan amount (with or without financed funding fee)
  const finalLoanAmount = inputs.financeFundingFee ? baseLoanAmount + fundingFeeAmount : baseLoanAmount

  // Monthly P&I
  const monthlyPI = calculateMonthlyPI(finalLoanAmount, inputs.interestRate, inputs.loanTerm)

  // Total monthly payment
  const totalMonthlyPayment = monthlyPI + inputs.propertyTaxesMonthly + inputs.homeInsuranceMonthly + inputs.hoaFees

  // DTI calculation
  const dti = (inputs.monthlyDebts + totalMonthlyPayment) / inputs.grossMonthlyIncome

  // Residual income calculation
  const region = getRegionFromState(inputs.state)
  const requiredResidualIncome = getResidualIncomeRequirement(region, inputs.familySize, finalLoanAmount)

  // Simplified residual income calculation (actual would be more complex)
  const estimatedLivingExpenses = inputs.grossMonthlyIncome * 0.4 // Rough estimate
  const actualResidualIncome =
    inputs.grossMonthlyIncome - inputs.monthlyDebts - totalMonthlyPayment - estimatedLivingExpenses

  const residualPasses = actualResidualIncome >= requiredResidualIncome

  // Enhanced residual requirement for high DTI
  const enhancedResidualRequired = dti > 0.41 ? requiredResidualIncome * 1.2 : requiredResidualIncome
  const enhancedResidualPasses = actualResidualIncome >= enhancedResidualRequired

  // Eligibility determination
  const vaEligible = inputs.serviceStatus !== "surviving-spouse" || true // Simplified
  const needsCOE = inputs.coeStatus !== "yes"

  let financiallyQualified: "likely" | "maybe" | "not-yet" = "not-yet"
  if (dti <= 0.41 && residualPasses) {
    financiallyQualified = "likely"
  } else if (dti > 0.41 && enhancedResidualPasses) {
    financiallyQualified = "maybe"
  } else if (residualPasses) {
    financiallyQualified = "maybe"
  }

  return {
    loanAmount: finalLoanAmount,
    fundingFee: {
      rate: fundingFeeRate,
      amount: fundingFeeAmount,
      financed: inputs.financeFundingFee,
      exempt: inputs.isDisabledVeteran,
    },
    monthlyPayment: {
      principalInterest: monthlyPI,
      propertyTaxes: inputs.propertyTaxesMonthly,
      homeInsurance: inputs.homeInsuranceMonthly,
      hoa: inputs.hoaFees,
      pmi: 0, // VA loans have no PMI
      total: totalMonthlyPayment,
    },
    dti,
    residualIncome: {
      required: enhancedResidualRequired,
      actual: actualResidualIncome,
      passes: enhancedResidualPasses,
      region,
    },
    eligibility: {
      vaEligible,
      financiallyQualified,
      needsCOE,
    },
  }
}

export function calculateConventionalLoan(inputs: CalculatorInputs): ConventionalLoan {
  // Calculate down payment amount
  const downPaymentAmount =
    inputs.downPaymentType === "percent" ? inputs.homePrice * (inputs.downPayment / 100) : inputs.downPayment

  const loanAmount = inputs.homePrice - downPaymentAmount
  const ltvPercent = (loanAmount / inputs.homePrice) * 100

  // Monthly P&I
  const monthlyPI = calculateMonthlyPI(loanAmount, inputs.interestRate, inputs.loanTerm)

  // PMI calculation
  const pmiRate = getPMIRate(inputs.creditScore, ltvPercent)
  const monthlyPMI = ltvPercent > 80 ? (loanAmount * pmiRate) / 12 : 0

  // PMI drop calculations
  const scheduledDropMonth = calculatePMIDropMonth(loanAmount, inputs.homePrice, monthlyPI, 0.78)
  const requestedDropMonth = calculatePMIDropMonth(loanAmount, inputs.homePrice, monthlyPI, 0.8)

  // Total monthly payment
  const totalMonthlyPayment =
    monthlyPI + inputs.propertyTaxesMonthly + inputs.homeInsuranceMonthly + inputs.hoaFees + monthlyPMI

  // DTI calculation
  const dti = (inputs.monthlyDebts + totalMonthlyPayment) / inputs.grossMonthlyIncome

  return {
    loanAmount,
    monthlyPayment: {
      principalInterest: monthlyPI,
      propertyTaxes: inputs.propertyTaxesMonthly,
      homeInsurance: inputs.homeInsuranceMonthly,
      hoa: inputs.hoaFees,
      pmi: monthlyPMI,
      total: totalMonthlyPayment,
    },
    pmi: {
      monthlyAmount: monthlyPMI,
      canDrop: ltvPercent > 80,
      dropMonth: requestedDropMonth,
      scheduledDropMonth,
    },
    dti,
  }
}

export function calculateFHALoan(inputs: CalculatorInputs): FHALoan {
  // Calculate down payment amount
  const downPaymentAmount =
    inputs.downPaymentType === "percent" ? inputs.homePrice * (inputs.downPayment / 100) : inputs.downPayment

  const baseLoanAmount = inputs.homePrice - downPaymentAmount
  const ltvPercent = (baseLoanAmount / inputs.homePrice) * 100

  // UFMIP calculation
  const ufmipRate = 0.0175 // Current rate
  const ufmipAmount = baseLoanAmount * ufmipRate
  const finalLoanAmount = baseLoanAmount + ufmipAmount // Assume financed

  // Monthly P&I
  const monthlyPI = calculateMonthlyPI(finalLoanAmount, inputs.interestRate, inputs.loanTerm)

  // Annual MIP calculation
  const mipRate = getFHAMIPRate(ltvPercent, inputs.loanTerm)
  const monthlyMIP = (finalLoanAmount * mipRate) / 12

  // MIP cancellation rule
  const cancellationRule = inputs.loanTerm === 30 && ltvPercent >= 90 ? "Life of loan" : "11 years"

  // Total monthly payment
  const totalMonthlyPayment =
    monthlyPI + inputs.propertyTaxesMonthly + inputs.homeInsuranceMonthly + inputs.hoaFees + monthlyMIP

  // DTI calculation
  const dti = (inputs.monthlyDebts + totalMonthlyPayment) / inputs.grossMonthlyIncome

  return {
    loanAmount: finalLoanAmount,
    ufmip: {
      rate: ufmipRate,
      amount: ufmipAmount,
      financed: true,
    },
    monthlyPayment: {
      principalInterest: monthlyPI,
      propertyTaxes: inputs.propertyTaxesMonthly,
      homeInsurance: inputs.homeInsuranceMonthly,
      hoa: inputs.hoaFees,
      mip: monthlyMIP,
      total: totalMonthlyPayment,
    },
    mip: {
      monthlyAmount: monthlyMIP,
      cancellationRule,
    },
    dti,
  }
}

export function calculateAllLoans(inputs: CalculatorInputs): ComparisonResult {
  return {
    va: calculateVALoan(inputs),
    conventional: calculateConventionalLoan(inputs),
    fha: calculateFHALoan(inputs),
  }
}

// Helper function to calculate when PMI drops
function calculatePMIDropMonth(loanAmount: number, homePrice: number, monthlyPI: number, targetLTV: number): number {
  const targetBalance = homePrice * targetLTV
  let balance = loanAmount
  let month = 0

  // Simplified calculation - doesn't account for interest rate changes
  const monthlyPrincipal = monthlyPI * 0.3 // Rough estimate of principal portion

  while (balance > targetBalance && month < 360) {
    balance -= monthlyPrincipal
    month++
  }

  return month
}

// Utility functions for formatting
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatPercent(decimal: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "percent",
    minimumFractionDigits: 1,
    maximumFractionDigits: 2,
  }).format(decimal)
}

// Calculate maximum home price for a target payment
export function calculateMaxPrice(targetPayment: number, inputs: Omit<CalculatorInputs, "homePrice">): number {
  let low = 100000
  let high = 2000000
  let iterations = 0
  const maxIterations = 50

  while (low < high && iterations < maxIterations) {
    const mid = Math.floor((low + high) / 2)
    const testInputs = { ...inputs, homePrice: mid }
    const result = calculateVALoan(testInputs)

    if (result.monthlyPayment.total < targetPayment) {
      low = mid + 1
    } else {
      high = mid
    }
    iterations++
  }

  return Math.max(low - 1, 0)
}
