import Link from "next/link"
import { ArrowRight, Calculator, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export function ProductEntry() {
  return (
    <section id="products" className="px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-accent">
            Nos solutions
          </p>
          <h2 className="font-[family-name:var(--font-heading)] text-3xl font-bold tracking-tight text-foreground sm:text-4xl text-balance">
            Choisissez votre point de départ
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Tax Optimization Card */}
          <div className="group relative flex flex-col justify-between rounded-2xl border border-border bg-card p-8 shadow-sm transition-all hover:border-accent/30 hover:shadow-md">
            <div>
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <Calculator className="h-5 w-5" />
              </div>
              <h3 className="mb-2 font-[family-name:var(--font-heading)] text-xl font-bold text-card-foreground">
                Optimisation fiscale
              </h3>
              <p className="mb-8 leading-relaxed text-muted-foreground">
                {"Estimez votre gain fiscal potentiel en quelques minutes. Notre algorithme analyse votre situation et identifie les déductions que vous pourriez avoir manquées."}
              </p>
            </div>
            <Button className="w-full" size="lg" asChild>
              <Link href="/wizard">
                {"Commencer l\u2019analyse"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          {/* AI Assistant Card */}
          <div className="group relative flex flex-col justify-between rounded-2xl border border-border bg-card p-8 shadow-sm transition-all hover:border-accent/30 hover:shadow-md">
            <div>
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                <MessageCircle className="h-5 w-5" />
              </div>
              <h3 className="mb-2 font-[family-name:var(--font-heading)] text-xl font-bold text-card-foreground">
                Assistant IA Magi
              </h3>
              <p className="mb-8 leading-relaxed text-muted-foreground">
                {"Posez vos questions financières à Magi, votre assistant intelligent. Obtenez des réponses personnalisées et des conseils adaptés à votre situation."}
              </p>
            </div>
            <Button variant="outline" className="w-full" size="lg" asChild>
              <Link href="/dashboard/assistant">
                Discuter avec Magi
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
