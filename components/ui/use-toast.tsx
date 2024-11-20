import * as React from "react"
import { cn } from "@/lib/utils"

interface ToastProps {
  title: string
  description: string
  variant?: "default" | "destructive"
}

export function toast({ title, description }: ToastProps) {
  // Simple toast implementation
  console.log(`Toast: ${title} - ${description}`)
} 