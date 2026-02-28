import { ClipboardList, Search, FileCheck } from "lucide-react"

const steps = [
  {
    number: "01",
    icon: ClipboardList,
    title: "Repondez a quelques questions",
    description:
      "Un questionnaire simple et rapide sur votre situation familiale et financiere pour identifier les opportunites.",
  },
  {
    number: "02",
    icon: Search,
    title: "Magifin detecte vos optimisations fiscales",
    description:
      "Notre algorithme analyse votre profil et identifie toutes les deductions auxquelles vous avez droit.",
  },
  {
    number: "03",
    icon: FileCheck,
    title: "Recevez votre estimation et les actions a prendre",
    description:
      "Un rapport clair avec le montant estime de votre remboursement et les demarches a suivre.",
  },
]

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="border-t border-border/50 bg-card px-6 py-24"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-accent">
            Comment ca marche
          </p>
          <h2 className="font-[family-name:var(--font-heading)] text-3xl font-bold tracking-tight text-card-foreground sm:text-4xl text-balance">
            Trois etapes simples vers votre remboursement
          </h2>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {steps.map((step) => (
            <div key={step.number} className="group relative flex flex-col">
              <div className="mb-6 flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                  <step.icon className="h-5 w-5" />
                </div>
                <span className="font-[family-name:var(--font-heading)] text-4xl font-bold text-border">
                  {step.number}
                </span>
              </div>
              <h3 className="mb-3 text-lg font-semibold text-card-foreground">
                {step.title}
              </h3>
              <p className="leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
