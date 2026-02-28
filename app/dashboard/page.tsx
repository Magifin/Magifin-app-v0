import {
  TrendingUp,
  CheckCircle2,
  FileText,
  ArrowRight,
  Clock,
  AlertCircle,
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

const checklistItems = [
  { label: "Completer le questionnaire fiscal", done: true },
  { label: "Verifier les frais de garde", done: true },
  { label: "Ajouter les attestations titres-services", done: false },
  { label: "Confirmer l'epargne pension", done: false },
  { label: "Telecharger le rapport fiscal", done: false },
]

const documents = [
  { name: "Attestation garde enfants", status: "received" as const },
  { name: "Attestation titres-services", status: "pending" as const },
  { name: "Attestation epargne pension (281.60)", status: "missing" as const },
]

const nextActions = [
  {
    title: "Completer vos documents",
    description: "2 documents restent a fournir pour finaliser votre dossier.",
    href: "/dashboard/documents",
  },
  {
    title: "Consulter l'assistant IA",
    description: "Posez vos questions sur votre situation fiscale a Magi.",
    href: "/dashboard/assistant",
  },
]

export default function DashboardPage() {
  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-foreground sm:text-3xl">
          Bonjour, Jean
        </h1>
        <p className="mt-1 text-muted-foreground">
          Voici un apercu de votre optimisation fiscale.
        </p>
      </div>

      {/* Estimated gain card */}
      <div className="mb-8 rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-1 flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4 text-accent" />
              Gain fiscal estime
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-[family-name:var(--font-heading)] text-4xl font-bold text-primary sm:text-5xl">
                847{"€"}
              </span>
              <span className="text-lg text-muted-foreground">
                {"- 1.204€"}
              </span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Estimation basee sur votre profil actuel
            </p>
          </div>
          <Button asChild>
            <Link href="/wizard">
              Mettre a jour
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Checklist */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm lg:col-span-1">
          <h2 className="mb-4 font-[family-name:var(--font-heading)] font-bold text-card-foreground">
            Checklist optimisation
          </h2>
          <ul className="flex flex-col gap-3">
            {checklistItems.map((item) => (
              <li key={item.label} className="flex items-start gap-2.5">
                <CheckCircle2
                  className={`mt-0.5 h-4 w-4 shrink-0 ${
                    item.done ? "text-accent" : "text-muted-foreground/30"
                  }`}
                />
                <span
                  className={`text-sm ${
                    item.done
                      ? "text-muted-foreground line-through"
                      : "text-card-foreground"
                  }`}
                >
                  {item.label}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Document status */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm lg:col-span-1">
          <h2 className="mb-4 font-[family-name:var(--font-heading)] font-bold text-card-foreground">
            Statut des documents
          </h2>
          <ul className="flex flex-col gap-3">
            {documents.map((doc) => (
              <li key={doc.name} className="flex items-start gap-2.5">
                {doc.status === "received" ? (
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                ) : doc.status === "pending" ? (
                  <Clock className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                ) : (
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                )}
                <div>
                  <p className="text-sm text-card-foreground">{doc.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {doc.status === "received"
                      ? "Recu"
                      : doc.status === "pending"
                        ? "En attente"
                        : "Manquant"}
                  </p>
                </div>
              </li>
            ))}
          </ul>
          <Button variant="outline" size="sm" className="mt-4 w-full" asChild>
            <Link href="/dashboard/documents">
              <FileText className="mr-2 h-3.5 w-3.5" />
              Gerer les documents
            </Link>
          </Button>
        </div>

        {/* Next actions */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm lg:col-span-1">
          <h2 className="mb-4 font-[family-name:var(--font-heading)] font-bold text-card-foreground">
            Prochaines actions
          </h2>
          <div className="flex flex-col gap-4">
            {nextActions.map((action) => (
              <Link
                key={action.title}
                href={action.href}
                className="group flex items-start gap-3 rounded-lg border border-border p-3 transition-colors hover:border-primary/30 hover:bg-primary/5"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium text-card-foreground">
                    {action.title}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {action.description}
                  </p>
                </div>
                <ArrowRight className="mt-1 h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
