import Link from "next/link"
import { ArrowRight, Shield, Lock, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Hero() {
  return (
    <section className="relative flex min-h-[90vh] flex-col items-center justify-center overflow-hidden px-6 pt-24 pb-20">
      {/* Background subtle pattern */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-accent/5 via-transparent to-transparent" />

      <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center text-center">
        {/* Badge */}
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm text-muted-foreground shadow-sm">
          <Sparkles className="h-3.5 w-3.5 text-accent" />
          <span>Optimisation fiscale pour la Belgique</span>
        </div>

        {/* Headline */}
        <h1 className="font-[family-name:var(--font-heading)] text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl text-balance">
          {"Decouvrez combien d'impots vous pourriez recuperer."}
        </h1>

        {/* Subheadline */}
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl text-pretty">
          {"L'assistant fiscal intelligent qui detecte automatiquement les deductions que vous pourriez avoir manquees."}
        </p>

        {/* CTA */}
        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
          <Button size="lg" className="h-12 px-8 text-base" asChild>
            <Link href="/wizard">
              Estimer mon remboursement
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" size="lg" className="h-12 px-8 text-base" asChild>
            <Link href="#how-it-works">En savoir plus</Link>
          </Button>
        </div>

        {/* Trust badges */}
        <div className="mt-16 flex flex-wrap items-center justify-center gap-6 sm:gap-10">
          <TrustBadge icon={<Shield className="h-4 w-4" />} label="Conforme RGPD" />
          <TrustBadge icon={<Lock className="h-4 w-4" />} label="Donnees securisees" />
          <TrustBadge icon={<Sparkles className="h-4 w-4" />} label="Optimisation intelligente" />
        </div>
      </div>
    </section>
  )
}

function TrustBadge({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/10 text-accent">
        {icon}
      </div>
      <span>{label}</span>
    </div>
  )
}
