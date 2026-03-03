import Link from "next/link"
import { ArrowRight, Calculator, PiggyBank, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"

const products = [
  {
    id: "tax-optimization",
    title: "Déclaration Fiscale & Optimisation",
    description:
      "Estimez votre gain fiscal potentiel en quelques minutes. Notre algorithme analyse votre situation et identifie les déductions que vous pourriez avoir manquées.",
    icon: Calculator,
    href: "/wizard",
    cta: "Commencer l'analyse",
    active: true,
  },
  {
    id: "personal-finance",
    title: "Outils de Finance Personnelle",
    description:
      "Gérez votre budget, suivez vos dépenses et planifiez votre épargne avec des outils intelligents adaptés à votre situation.",
    icon: PiggyBank,
    href: "#",
    cta: "Bientôt disponible",
    active: false,
  },
  {
    id: "insurance-comparison",
    title: "Comparaison & Courtage d'Assurances",
    description:
      "Comparez les meilleures offres d'assurance et trouvez la couverture idéale au meilleur prix grâce à notre réseau de partenaires.",
    icon: ShieldCheck,
    href: "#",
    cta: "Bientôt disponible",
    active: false,
  },
]

export function ProductEntry() {
  return (
    <section id="products" className="px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-accent">
            Nos solutions
          </p>
          <h2 className="font-[family-name:var(--font-heading)] text-3xl font-bold tracking-tight text-foreground sm:text-4xl text-balance">
            Les 3 piliers de Magifin
          </h2>
          <p className="mt-4 mx-auto max-w-2xl text-muted-foreground">
            {"Une suite complète d'outils pour optimiser vos finances personnelles en Belgique."}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {products.map((product) => (
            <div
              key={product.id}
              className={`group relative flex flex-col justify-between rounded-2xl border bg-card p-8 shadow-sm transition-all ${
                product.active
                  ? "border-primary/30 hover:border-accent/30 hover:shadow-md"
                  : "border-border opacity-75"
              }`}
            >
              {!product.active && (
                <div className="absolute top-4 right-4">
                  <span className="inline-block rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                    Bientôt
                  </span>
                </div>
              )}
              <div>
                <div
                  className={`mb-6 flex h-12 w-12 items-center justify-center rounded-xl ${
                    product.active
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <product.icon className="h-5 w-5" />
                </div>
                <h3 className="mb-2 font-[family-name:var(--font-heading)] text-xl font-bold text-card-foreground">
                  {product.title}
                </h3>
                <p className="mb-8 leading-relaxed text-muted-foreground">
                  {product.description}
                </p>
              </div>
              {product.active ? (
                <Button className="w-full" size="lg" asChild>
                  <Link href={product.href}>
                    {product.cta}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              ) : (
                <Button
                  className="w-full"
                  size="lg"
                  variant="outline"
                  disabled
                >
                  {product.cta}
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
