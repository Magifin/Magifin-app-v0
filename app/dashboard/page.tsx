"use client"

import {
  TrendingUp,
  CheckCircle2,
  FileText,
  ArrowRight,
  Clock,
  AlertCircle,
} from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { useOptimizations } from "@/lib/useOptimizations"
import { formatMoneyRange } from "@/lib/formatMoney"
import type { Simulation } from "@/lib/supabase/types"
import { UnsavedSimulationBanner } from "@/components/unsaved-simulation-banner"

const checklistItems = [
  { label: "Compléter le questionnaire fiscal", done: true },
  { label: "Vérifier les frais de garde", done: true },
  { label: "Ajouter les attestations titres-services", done: false },
  { label: "Confirmer l'épargne pension", done: false },
  { label: "Télécharger le rapport fiscal", done: false },
]

const documents = [
  { name: "Attestation garde enfants", status: "received" as const },
  { name: "Attestation titres-services", status: "pending" as const },
  { name: "Attestation épargne pension (281.60)", status: "missing" as const },
]

const nextActions = [
  {
    title: "Compléter vos documents",
    description: "2 documents restent à fournir pour finaliser votre dossier.",
    href: "/dashboard/documents",
  },
  {
    title: "Consulter l'assistant IA",
    description: "Posez vos questions sur votre situation fiscale à Magi.",
    href: "/dashboard/assistant",
  },
]

export default function DashboardPage() {
  const { profile } = useAuth()
  const { results, hasWizardData } = useOptimizations()
  const [latestSimulation, setLatestSimulation] = useState<Simulation | null>(null)
  const [isLoadingSimulation, setIsLoadingSimulation] = useState(true)

  // Fetch latest saved simulation
  useEffect(() => {
    const fetchLatestSimulation = async () => {
      try {
        const res = await fetch("/api/simulations/list")
        const data = await res.json()
        if (res.ok && data.simulations && data.simulations.length > 0) {
          setLatestSimulation(data.simulations[0])
        }
      } catch (error) {
        console.error("Error fetching latest simulation:", error)
      } finally {
        setIsLoadingSimulation(false)
      }
    }

    fetchLatestSimulation()
  }, [])

  // Determine what to show: latest saved simulation or wizard data
  const hasData = latestSimulation || hasWizardData
  const estimatedGain = latestSimulation ? {
    min: latestSimulation.tax_result?.refundOrBalance || 0,
    max: latestSimulation.tax_result?.refundOrBalance || 0,
  } : results

  const greeting = profile?.full_name 
    ? `Bonjour, ${profile.full_name.split(' ')[0]}`
    : "Bonjour"

  return (
    <div>
      <UnsavedSimulationBanner />

      <div className="mb-8">
        <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-foreground sm:text-3xl">
          {greeting}
        </h1>
        <p className="mt-1 text-muted-foreground">
          {"Voici un aperçu de votre optimisation fiscale."}
        </p>
      </div>

      {/* Estimated gain card */}
      <div className="mb-8 rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-1 flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4 text-accent" />
              {latestSimulation ? "Gain de votre dernière simulation" : "Gain fiscal estimé"}
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-[family-name:var(--font-heading)] text-4xl font-bold text-primary sm:text-5xl">
                {hasData && !isLoadingSimulation
                  ? formatMoneyRange(estimatedGain.min, estimatedGain.max)
                  : "---"}
              </span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {latestSimulation
                ? `Simulation du ${new Date(latestSimulation.created_at).toLocaleDateString("fr-BE")}`
                : hasWizardData
                ? "Estimation basée sur votre profil actuel"
                : "Complétez le questionnaire pour voir votre estimation"}
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <Button asChild>
              <Link href={latestSimulation ? `/wizard?resume=${btoa(JSON.stringify(latestSimulation.wizard_answers))}&simulationId=${latestSimulation.id}` : "/wizard"}>
                {hasData ? "Mettre à jour" : "Commencer"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            {latestSimulation && (
              <Button variant="outline" asChild>
                <Link href={`/dashboard/simulations/${latestSimulation.id}`}>
                  Voir détails
                </Link>
              </Button>
            )}
          </div>
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
                      ? "Reçu"
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
              {"Gérer les documents"}
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
