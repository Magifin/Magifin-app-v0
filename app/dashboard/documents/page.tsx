import {
  CheckCircle2,
  Clock,
  AlertCircle,
  Upload,
  FileText,
} from "lucide-react"
import { Button } from "@/components/ui/button"

const documents = [
  {
    name: "Attestation garde enfants (281.86)",
    category: "Frais de garde",
    status: "received" as const,
    date: "15 jan 2026",
  },
  {
    name: "Attestation titres-services",
    category: "Titres-services",
    status: "pending" as const,
    date: null,
  },
  {
    name: "Attestation epargne pension (281.60)",
    category: "Epargne pension",
    status: "missing" as const,
    date: null,
  },
  {
    name: "Composition de menage",
    category: "Situation familiale",
    status: "received" as const,
    date: "03 dec 2025",
  },
]

const statusConfig = {
  received: {
    icon: CheckCircle2,
    label: "Recu",
    className: "text-accent bg-accent/10",
  },
  pending: {
    icon: Clock,
    label: "En attente",
    className: "text-muted-foreground bg-muted",
  },
  missing: {
    icon: AlertCircle,
    label: "Manquant",
    className: "text-destructive bg-destructive/10",
  },
}

export default function DocumentsPage() {
  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-foreground sm:text-3xl">
            Documents
          </h1>
          <p className="mt-1 text-muted-foreground">
            Gerez vos attestations et justificatifs fiscaux.
          </p>
        </div>
        <Button>
          <Upload className="mr-2 h-4 w-4" />
          Ajouter un document
        </Button>
      </div>

      {/* Document list */}
      <div className="flex flex-col gap-3">
        {documents.map((doc) => {
          const config = statusConfig[doc.status]
          const StatusIcon = config.icon
          return (
            <div
              key={doc.name}
              className="flex items-center gap-4 rounded-xl border border-border bg-card p-5 shadow-sm"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                <FileText className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-card-foreground">{doc.name}</p>
                <p className="text-sm text-muted-foreground">{doc.category}</p>
              </div>
              <div className="flex items-center gap-2">
                {doc.date && (
                  <span className="hidden text-xs text-muted-foreground sm:inline">
                    {doc.date}
                  </span>
                )}
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${config.className}`}
                >
                  <StatusIcon className="h-3 w-3" />
                  {config.label}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
