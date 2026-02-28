import Link from "next/link"
import { ArrowRight, Calculator, TrendingUp, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"

const deductions = [
  {
    category: "Enfants à charge",
    amount: "320\u00A0€ – 480\u00A0€",
    status: "active" as const,
    description: "2 enfants à charge, déduction automatique.",
  },
  {
    category: "Frais de garde",
    amount: "180\u00A0€ – 270\u00A0€",
    status: "active" as const,
    description: "Crèche et garderie, attestation reçue.",
  },
  {
    category: "Titres-services",
    amount: "200\u00A0€ – 300\u00A0€",
    status: "pending" as const,
    description: "150 titres achetés, attestation en attente.",
  },
  {
    category: "Épargne pension",
    amount: "147\u00A0€ – 154\u00A0€",
    status: "pending" as const,
    description: "Versement de 512\u00A0€, attestation manquante.",
  },
]

export default function OptimisationPage() {
  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-foreground sm:text-3xl">
            Optimisation fiscale
          </h1>
          <p className="mt-1 text-muted-foreground">
            {"Détail de vos déductions et réductions identifiées."}
          </p>
        </div>
        <Button asChild>
          <Link href="/wizard">
            <Calculator className="mr-2 h-4 w-4" />
            Refaire une analyse
          </Link>
        </Button>
      </div>

      {/* Summary */}
      <div className="mb-8 rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <TrendingUp className="h-5 w-5 text-accent" />
          <span className="text-sm font-medium text-muted-foreground">
            {"Gain total estimé"}
          </span>
        </div>
        <p className="font-[family-name:var(--font-heading)] text-3xl font-bold text-primary">
          {"847\u00A0€ – 1.204\u00A0€"}
        </p>
      </div>

      {/* Deduction list */}
      <div className="flex flex-col gap-4">
        {deductions.map((d) => (
          <div
            key={d.category}
            className="flex items-center gap-4 rounded-xl border border-border bg-card p-5 shadow-sm"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-card-foreground">
                  {d.category}
                </p>
                <span
                  className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                    d.status === "active"
                      ? "bg-accent/10 text-accent"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {d.status === "active" ? "Confirmé" : "En attente"}
                </span>
              </div>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {d.description}
              </p>
            </div>
            <div className="text-right">
              <p className="font-[family-name:var(--font-heading)] font-bold text-card-foreground">
                {d.amount}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
