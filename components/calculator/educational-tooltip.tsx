"use client"

import { HelpCircle } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { datasets } from "@/lib/data"

interface EducationalTooltipProps {
  content: keyof typeof datasets.popovers
  className?: string
}

export function EducationalTooltip({ content, className = "" }: EducationalTooltipProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className={`p-0 h-auto ${className}`}>
          <HelpCircle className="w-4 h-4 text-muted-foreground hover:text-foreground transition-colors" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" side="top" align="start">
        <div className="space-y-2">
          <p className="text-sm leading-relaxed">{datasets.popovers[content]}</p>
        </div>
      </PopoverContent>
    </Popover>
  )
}
