import Link from "next/link"
import { ArrowRight, ShieldCheck, TrendingUp, Lock, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"

const recommendations = [
  {
    icon: FileText,
    category: "Fiscalite",
    title: "Optimisation fiscale incomplete",
    text: "Un gain estime entre 100\u00A0\u20AC et 400\u00A0\u20AC reste possible.",
    cta: "Completer mon analyse",
    href: "/dashboard",
    disabled: false,
  },
  {
    icon: ShieldCheck,
    category: "Assurance",
    title: "Protection financiere a optimiser",
    text: "Certaines assurances peuvent ameliorer votre protection et votre fiscalite.",
    cta: "Verifier mes assurances",
    href: "/dashboard",
    disabled: false,
  },
  {
    icon: TrendingUp,
    category: "Epargne & Investissement",
    title: "Plan d'investissement",
    text: "Définissez vos objectifs et recevez des recommandations adaptées.",
    cta: "Construire mon plan",
    href: "#",
    disabled: true,
  },
]

export default function WelcomePage() {
  const score = 62

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header bar */}
      <header className="border-b border-border/50 px-6 py-4">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
              <span className="text-xs font-bold text-primary-foreground">M</span>
            </div>
            <span className="font-[family-name:var(--font-heading)] text-lg font-bold tracking-tight text-foreground">
              Magifin
            </span>
          </Link>
          <Link
            href="/dashboard"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            {"Aller au tableau de bord"}
          </Link>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-14">
        {/* Greeting */}
        <div className="mb-12">
          <h1 className="font-[family-name:var(--font-heading)] text-3xl font-bold text-foreground sm:text-4xl">
            {"Bonjour \uD83D\uDC4B"}
          </h1>
          <p className="mt-2 max-w-lg text-base leading-relaxed text-muted-foreground">
            {"Voici les premieres optimisations detectees pour votre situation financiere."}
          </p>
        </div>

        {/* Score section */}
        <div className="mb-14 rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
          <p className="mb-4 text-xs font-medium uppercase tracking-widest text-muted-foreground">
            {"Votre optimisation financiere"}
          </p>
          <div className="flex items-end gap-3">
            <span className="font-[family-name:var(--font-heading)] text-5xl font-extrabold tracking-tight text-primary sm:text-6xl">
              {score}%
            </span>
            <span className="mb-2 text-sm text-muted-foreground">
              {"d'efficacite fiscale"}
            </span>
          </div>
          {/* Progress bar */}
          <div className="mt-5 h-2.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-accent transition-all"
              style={{ width: `${score}%` }}
            />
          </div>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            {"Plusieurs ameliorations simples peuvent augmenter votre efficacite financiere."}
          </p>
        </div>

        {/* Recommendation cards */}
        <div className="mb-14">
          <p className="mb-5 text-xs font-medium uppercase tracking-widest text-muted-foreground">
            {"Recommandations"}
          </p>
          <div className="grid gap-5 sm:grid-cols-3">
            {recommendations.map((rec, i) => (
              <div
                key={i}
                className="flex flex-col rounded-2xl border border-border bg-card p-5 shadow-sm"
              >
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
                    {rec.disabled ? (
                      <Lock className="h-5 w-5 text-muted-foreground/50" />
                    ) : (
                      <rec.icon className="h-5 w-5" />
                    )}
                  </div>
                  <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {rec.category}
                  </span>
                </div>
                <h3 className="mb-1.5 font-[family-name:var(--font-heading)] text-base font-semibold text-card-foreground">
                  {rec.title}
                </h3>
                <p className="mb-5 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {rec.text}
                </p>
                {rec.disabled ? (
                  <span className="inline-flex h-9 items-center justify-center rounded-md bg-muted px-4 text-xs font-medium text-muted-foreground">
                    {rec.cta}
                  </span>
                ) : (
                  <Button size="sm" variant="outline" className="w-full" asChild>
                    <Link href={rec.href}>
                      {rec.cta}
                      <ArrowRight className="ml-2 h-3.5 w-3.5" />
                    </Link>
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="flex flex-col items-center gap-4 text-center">
          <Button size="lg" className="h-12 px-8 text-base" asChild>
            <Link href="/dashboard">
              {"Acceder a mon espace complet"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <p className="max-w-sm text-xs leading-relaxed text-muted-foreground/70">
            {"Estimation indicative basee sur les informations fournies. Magifin ne remplace pas un conseiller fiscal."}
          </p>
        </div>
      </main>
    </div>
  )
}
