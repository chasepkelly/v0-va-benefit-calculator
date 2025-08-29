import propertyTaxData from "../data/propertyTax.json"
import homeInsuranceData from "../data/homeInsurance.json"
import residualIncomeData from "../data/residualIncome.json"
import fundingFeeData from "../data/fundingFee.json"
import pmiData from "../data/pmi.json"
import fhaMipData from "../data/fhaMip.json"
import popoversData from "../data/popovers.json"

export const datasets = {
  propertyTax: propertyTaxData,
  homeInsurance: homeInsuranceData,
  residualIncome: residualIncomeData,
  fundingFee: fundingFeeData,
  pmi: pmiData,
  fhaMip: fhaMipData,
  popovers: popoversData,
}

// Helper functions for data access
export function getPropertyTaxRate(state: string): number {
  return datasets.propertyTax.rates[state as keyof typeof datasets.propertyTax.rates] || 0.01
}

export function getHomeInsuranceAvg(state: string): number {
  const stateData = datasets.homeInsurance.states[state as keyof typeof datasets.homeInsurance.states]
  return stateData?.avgAnnual || datasets.homeInsurance.nationalAvgAnnual
}

export function getRegionFromState(state: string): string {
  for (const [region, states] of Object.entries(datasets.residualIncome.zipToRegion)) {
    if (states.includes(state)) {
      return region
    }
  }
  return "South" // Default fallback
}

export function getResidualIncomeRequirement(region: string, familySize: number, loanAmount: number): number {
  const regionData = datasets.residualIncome.regions[region as keyof typeof datasets.residualIncome.regions]
  if (!regionData) return 1000 // Fallback

  const loanTier = loanAmount >= 80000 ? ">=80000" : "<80000"
  const tierData = regionData[loanTier as keyof typeof regionData]

  if (typeof tierData === "object" && tierData !== null) {
    const baseAmount = tierData[Math.min(familySize, 5).toString() as keyof typeof tierData] as number
    const extraDependents = Math.max(0, familySize - 5)
    return baseAmount + extraDependents * regionData["+perDependent"]
  }

  return 1000 // Fallback
}

export function getFundingFeeRate(isFirstUse: boolean, downPaymentPercent: number): number {
  const useType = isFirstUse ? "firstUse" : "subsequent"
  const feeData = datasets.fundingFee.purchase[useType]

  if (downPaymentPercent < 5) return feeData["<5%"]
  if (downPaymentPercent < 10) return feeData["5-9.99%"]
  return feeData[">=10%"]
}

export function getPMIRate(creditScore: number, ltvPercent: number): number {
  let creditTier = "<620"
  if (creditScore >= 760) creditTier = ">=760"
  else if (creditScore >= 740) creditTier = "740-759"
  else if (creditScore >= 720) creditTier = "720-739"
  else if (creditScore >= 700) creditTier = "700-719"
  else if (creditScore >= 680) creditTier = "680-699"
  else if (creditScore >= 660) creditTier = "660-679"
  else if (creditScore >= 640) creditTier = "640-659"
  else if (creditScore >= 620) creditTier = "620-639"

  let ltvTier = "80-85%"
  if (ltvPercent >= 97) ltvTier = ">=97%"
  else if (ltvPercent >= 95) ltvTier = "95-97%"
  else if (ltvPercent >= 90) ltvTier = "90-95%"
  else if (ltvPercent >= 85) ltvTier = "85-90%"

  const tierData = datasets.pmi.factors[ltvTier as keyof typeof datasets.pmi.factors]
  return tierData[creditTier as keyof typeof tierData] || 0.005
}

export function getFHAMIPRate(ltvPercent: number, termYears: number): number {
  const term = termYears === 15 ? "15year" : "30year"
  const mipData = datasets.fhaMip.annualMip[term]

  if (ltvPercent >= 95) return mipData[">=95%"]
  if (ltvPercent >= 90) return mipData["90-95%"]
  return mipData["<90%"]
}
