import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-card px-6 py-16">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-12 md:flex-row md:justify-between">
          {/* Brand */}
          <div className="max-w-xs">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <span className="text-sm font-bold text-primary-foreground">M</span>
              </div>
              <span className="font-[family-name:var(--font-heading)] text-xl font-bold tracking-tight text-card-foreground">
                Magifin
              </span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              {"La plateforme d\u2019optimisation financière intelligente pour les contribuables belges."}
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-wrap gap-12">
            <div>
              <h4 className="mb-4 text-sm font-semibold text-card-foreground">
                Produit
              </h4>
              <ul className="flex flex-col gap-3">
                <li>
                  <Link href="/wizard" className="text-sm text-muted-foreground hover:text-foreground">
                    Optimisation fiscale
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard/assistant" className="text-sm text-muted-foreground hover:text-foreground">
                    Assistant IA
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 text-sm font-semibold text-card-foreground">
                {"Légal"}
              </h4>
              <ul className="flex flex-col gap-3">
                <li>
                  <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
                    {"Politique de confidentialité"}
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
                    {"Conditions d\u2019utilisation"}
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
                    RGPD
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-border/50 pt-8 text-center text-sm text-muted-foreground">
          {"© 2026 Magifin. Tous droits réservés."}
        </div>
      </div>
    </footer>
  )
}
