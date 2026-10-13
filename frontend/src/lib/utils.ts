import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCompactNumber(num: number): string {
  const abs = Math.abs(num)
  if (abs >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`
  }
  if (abs >= 1_000) {
    return `${(num / 1_000).toFixed(1).replace(/\.0$/, '')}K`
  }
  return String(num)
}

export function formatRelativeTime(isoDate: string): string {
  const now = Date.now()
  const then = new Date(isoDate).getTime()
  const diffSeconds = Math.max(1, Math.floor((now - then) / 1000))

  if (diffSeconds < 60) {
    return 'just now'
  }
  const minutes = Math.floor(diffSeconds / 60)
  if (minutes < 60) {
    return `${minutes} min. ago`
  }
  const hours = Math.floor(minutes / 60)
  if (hours < 24) {
    return `${hours} hr. ago`
  }
  const days = Math.floor(hours / 24)
  if (days < 30) {
    return `${days} ${days === 1 ? 'day' : 'days'} ago`
  }
  const months = Math.floor(days / 30)
  return `${months} mo. ago`
}
