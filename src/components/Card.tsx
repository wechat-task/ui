import type { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`border border-slate-200 rounded-lg p-6 bg-white ${className}`}>
      {children}
    </div>
  )
}
