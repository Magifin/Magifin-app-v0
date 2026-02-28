import { Sparkles } from "lucide-react"

interface MagiHintProps {
  message: string
}

export function MagiHint({ message }: MagiHintProps) {
  return (
    <div className="mb-6 flex items-start gap-3 rounded-xl border border-primary/10 bg-primary/[0.03] px-4 py-3">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10">
        <Sparkles className="h-3.5 w-3.5 text-primary" />
      </div>
      <div>
        <p className="text-[13px] font-medium leading-relaxed text-foreground/80">
          {message}
        </p>
        <p className="mt-0.5 text-[11px] text-muted-foreground">Magi</p>
      </div>
    </div>
  )
}
