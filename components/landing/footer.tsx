import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-card px-6 py-16">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
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
              {"La plateforme d'optimisation financière intelligente pour les contribuables belges."}
            </p>
          </div>

          {/* Column 1 — Produits */}
          <div>
            <h4 className="mb-4 text-sm font-semibold text-card-foreground">
              Produits
            </h4>
            <ul className="flex flex-col gap-3">
              <li>
                <Link href="/wizard" className="text-sm text-muted-foreground hover:text-foreground">
                  Optimisation fiscale
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
                  Finance personnelle
                </Link>
              </li>
              <li>
                <a
                  href="https://www.assurances-maron.be/devis-epargne-pension"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Assurances
                </a>
              </li>
              <li>
                <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2 — Ressources */}
          <div>
            <h4 className="mb-4 text-sm font-semibold text-card-foreground">
              Ressources
            </h4>
            <ul className="flex flex-col gap-3">
              <li>
                <Link href="/#how-it-works" className="text-sm text-muted-foreground hover:text-foreground">
                  Comment ça marche
                </Link>
              </li>
              <li>
                <Link href="/#faq" className="text-sm text-muted-foreground hover:text-foreground">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
                  {"Sécurité & données"}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3 — Légal */}
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
                  {"Conditions d'utilisation"}
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

        <div className="mt-12 border-t border-border/50 pt-8 text-center text-sm text-muted-foreground">
          {"© 2026 Magifin. Tous droits réservés."}
        </div>
      </div>
    </footer>
  )
}
