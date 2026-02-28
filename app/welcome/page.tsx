import Link from "next/link"
import { ArrowRight, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function WelcomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6">
      <div className="flex max-w-md flex-col items-center gap-8 text-center">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
            <span className="text-base font-bold text-primary-foreground">M</span>
          </div>
          <span className="font-[family-name:var(--font-heading)] text-2xl font-bold tracking-tight text-foreground">
            Magifin
          </span>
        </div>

        {/* Success icon */}
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/10">
          <CheckCircle2 className="h-8 w-8 text-accent" />
        </div>

        {/* Title */}
        <div>
          <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-foreground sm:text-3xl text-balance">
            {"Votre espace est prêt"}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {"Votre analyse fiscale a été sauvegardée. Vous pouvez maintenant suivre vos optimisations, ajouter vos documents et maximiser votre remboursement."}
          </p>
        </div>

        {/* What's next */}
        <div className="flex w-full flex-col gap-3 rounded-xl border border-border/60 bg-muted/30 px-5 py-4">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            {"Prochaines étapes"}
          </p>
          <ul className="flex flex-col gap-2.5">
            <li className="flex items-start gap-2 text-left">
              <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                1
              </span>
              <span className="text-sm text-foreground/80">
                {"Consultez votre tableau de bord personnalisé"}
              </span>
            </li>
            <li className="flex items-start gap-2 text-left">
              <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                2
              </span>
              <span className="text-sm text-foreground/80">
                {"Ajoutez vos attestations fiscales"}
              </span>
            </li>
            <li className="flex items-start gap-2 text-left">
              <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                3
              </span>
              <span className="text-sm text-foreground/80">
                {"Suivez vos optimisations en temps réel"}
              </span>
            </li>
          </ul>
        </div>

        {/* CTA */}
        <Button size="lg" className="h-12 w-full px-8 text-base" asChild>
          <Link href="/dashboard">
            {"Accéder à mon espace"}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  )
}
