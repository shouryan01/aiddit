import { Select } from '@base-ui/react/select'
import { Check, ChevronDown, Clock, Flame } from 'lucide-react'
import type { SortMode } from '@/lib/types'
import { cn } from '@/lib/utils'

interface SortSelectProps {
  value: SortMode
  onChange: (value: SortMode) => void
}

const SORT_OPTIONS: { value: SortMode; label: string; icon: typeof Flame }[] = [
  { value: 'new', label: 'New', icon: Clock },
  { value: 'top', label: 'Top', icon: Flame },
]

export function SortSelect({ value, onChange }: SortSelectProps) {
  const activeOption = SORT_OPTIONS.find((o) => o.value === value) ?? SORT_OPTIONS[0]

  return (
    <div className="flex items-center gap-2 py-2">
      <Select.Root
        value={value}
        onValueChange={(val) => {
          if (val === 'new' || val === 'top') {
            onChange(val)
          }
        }}
      >
        <Select.Trigger className="inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-xs font-semibold text-neutral-700 transition-colors hover:bg-[#EAEDEF] focus:outline-none cursor-pointer select-none">
          <span>{activeOption.label}</span>
          <ChevronDown className="size-3.5 text-neutral-500" />
        </Select.Trigger>

        <Select.Portal>
          <Select.Positioner sideOffset={6} align="start" className="z-50">
            <Select.Popup className="min-w-32 rounded-2xl border border-neutral-200 bg-white p-1.5 shadow-lg">
              <div className="px-2.5 py-1 text-[11px] font-semibold text-neutral-400">Sort by</div>
              {SORT_OPTIONS.map((opt) => {
                const Icon = opt.icon
                const selected = opt.value === value
                return (
                  <Select.Item
                    key={opt.value}
                    value={opt.value}
                    className={cn(
                      'flex items-center justify-between gap-3 rounded-xl px-2.5 py-2 text-xs font-medium text-neutral-700 outline-none transition-colors hover:bg-[#EAEDEF] data-[highlighted]:bg-[#EAEDEF] cursor-pointer select-none',
                      selected && 'font-bold text-neutral-900 bg-neutral-100/80',
                    )}
                  >
                    <span className="flex items-center gap-2">
                      <Icon className="size-3.5 text-neutral-500" />
                      <Select.ItemText>{opt.label}</Select.ItemText>
                    </span>
                    <Select.ItemIndicator>
                      <Check className="size-3.5 text-[#FF4500]" />
                    </Select.ItemIndicator>
                  </Select.Item>
                )
              })}
            </Select.Popup>
          </Select.Positioner>
        </Select.Portal>
      </Select.Root>
    </div>
  )
}
