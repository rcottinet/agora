import * as React from 'react'
import { cn } from '@/utils'

export interface CellVisual {
  className: string
  content?: React.ReactNode
  clickable?: boolean
  pulse?: boolean
}

interface BoardProps {
  boardSize: number
  getCell: (r: number, c: number) => CellVisual
  onCellClick?: (r: number, c: number) => void
  /** Small caption under the board. */
  caption?: React.ReactNode
  className?: string
}

const ROW_LABELS = 'ABCDEFGHIJ'

/**
 * A square, mobile-first game grid rendered in the app's neobrutalist style.
 * The parent decides how each cell looks via `getCell`, keeping this component
 * dumb and reusable across the placement, own-fleet and tracking views.
 */
export function Board({ boardSize, getCell, onCellClick, caption, className }: BoardProps) {
  const indices = Array.from({ length: boardSize }, (_, i) => i)

  return (
    <div className={cn('w-full max-w-[min(88vw,420px)] mx-auto', className)}>
      <div className="flex">
        {/* corner spacer */}
        <div className="w-5 shrink-0" />
        <div
          className="grid flex-1 mb-1"
          style={{ gridTemplateColumns: `repeat(${boardSize}, minmax(0, 1fr))` }}
        >
          {indices.map((c) => (
            <div key={c} className="text-center text-[10px] font-mono font-bold text-foreground/60">
              {c + 1}
            </div>
          ))}
        </div>
      </div>

      <div className="flex">
        <div className="flex flex-col w-5 shrink-0">
          {indices.map((r) => (
            <div
              key={r}
              className="flex-1 flex items-center justify-center text-[10px] font-mono font-bold text-foreground/60"
            >
              {ROW_LABELS[r]}
            </div>
          ))}
        </div>

        <div
          className="grid flex-1 gap-[2px] border-2 border-border rounded-base bg-border p-[2px] shadow-shadow overflow-hidden"
          style={{ gridTemplateColumns: `repeat(${boardSize}, minmax(0, 1fr))` }}
        >
          {indices.map((r) =>
            indices.map((c) => {
              const v = getCell(r, c)
              return (
                <button
                  key={`${r}-${c}`}
                  type="button"
                  disabled={!v.clickable}
                  onClick={() => v.clickable && onCellClick?.(r, c)}
                  className={cn(
                    'aspect-square flex items-center justify-center text-sm sm:text-base font-bold select-none transition-colors',
                    v.clickable ? 'cursor-pointer' : 'cursor-default',
                    v.pulse && 'animate-pulse',
                    v.className
                  )}
                >
                  {v.content}
                </button>
              )
            })
          )}
        </div>
      </div>

      {caption ? (
        <p className="mt-2 text-center text-xs font-mono uppercase tracking-widest text-foreground/60">
          {caption}
        </p>
      ) : null}
    </div>
  )
}
