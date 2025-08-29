"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown } from "lucide-react"
import { formatCurrency } from "@/lib/calculator"

interface DeltaChipProps {
  current: number
  previous: number
  label?: string
  format?: "currency" | "percent"
  className?: string
}

export function DeltaChip({ current, previous, label, format = "currency", className = "" }: DeltaChipProps) {
  const [showAnimation, setShowAnimation] = useState(false)
  const delta = current - previous
  const isPositive = delta > 0
  const isZero = Math.abs(delta) < 0.01

  useEffect(() => {
    if (!isZero) {
      setShowAnimation(true)
      const timer = setTimeout(() => setShowAnimation(false), 2000)
      return () => clearTimeout(timer)
    }
  }, [current, previous, isZero])

  if (isZero) return null

  const formatValue = (value: number) => {
    if (format === "currency") return formatCurrency(Math.abs(value))
    return `${Math.abs(value).toFixed(2)}%`
  }

  const Icon = isPositive ? TrendingUp : TrendingDown
  const colorClass = isPositive
    ? "bg-red-100 text-red-800 border-red-200"
    : "bg-green-100 text-green-800 border-green-200"
  const sign = isPositive ? "+" : "-"

  return (
    <Badge
      className={`
        ${colorClass} 
        ${showAnimation ? "animate-pulse" : ""} 
        transition-all duration-300 
        ${className}
      `}
    >
      <Icon className="w-3 h-3 mr-1" />
      {sign}
      {formatValue(delta)}
      {label && ` ${label}`}
    </Badge>
  )
}
