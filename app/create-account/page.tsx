"use client"

import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, ArrowRight, User, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useUser } from "@/lib/user-store"
import { track } from "@/lib/track"

function CreateAccountForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { setUser } = useUser()

  const [firstName, setFirstName] = useState("")
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Check if user came from dashboard link
  const fromDashboard = searchParams.get("from") === "dashboard"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!firstName.trim()) return

    setIsSubmitting(true)

    // Create user in localStorage
    const newUser = {
      firstName: firstName.trim(),
      email: email.trim() || undefined,
      createdAt: new Date().toISOString(),
    }

    setUser(newUser)

    // Track account creation
    track("account_created", { hasEmail: !!email.trim() })

    // Redirect to dashboard
    router.push("/dashboard")
  }

  const canSubmit = firstName.trim().length > 0

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-border/50 px-6 py-4">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Link>
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
              <span className="text-xs font-bold text-primary-foreground">M</span>
            </div>
            <span className="font-[family-name:var(--font-heading)] text-lg font-bold tracking-tight text-foreground">
              Magifin
            </span>
          </Link>
          <div className="w-16" />
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-6 py-16">
        <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Sparkles className="h-8 w-8" />
        </div>

        <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-foreground sm:text-3xl text-center text-balance">
          {"Créez votre espace Magifin"}
        </h1>

        {fromDashboard && (
          <p className="mt-3 text-center text-sm text-muted-foreground">
            {"Créez votre espace pour accéder au dashboard."}
          </p>
        )}

        <p className="mt-3 text-center text-muted-foreground">
          {"En quelques secondes, accédez à votre optimisation fiscale personnalisée."}
        </p>

        <form onSubmit={handleSubmit} className="mt-10 w-full">
          <div className="flex flex-col gap-5">
            <div>
              <Label
                htmlFor="firstName"
                className="mb-2 block text-sm font-medium text-foreground"
              >
                {"Prénom"} <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="firstName"
                  type="text"
                  placeholder="Votre prénom"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="pl-10"
                  autoFocus
                  required
                />
              </div>
            </div>

            <div>
              <Label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-foreground"
              >
                {"Email"} <span className="text-muted-foreground text-xs">(optionnel)</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="votre@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <p className="mt-1.5 text-xs text-muted-foreground">
                {"Pour recevoir vos rappels fiscaux et mises à jour."}
              </p>
            </div>
          </div>

          <Button
            type="submit"
            size="lg"
            className="mt-8 w-full"
            disabled={!canSubmit || isSubmitting}
          >
            {isSubmitting ? "Création en cours..." : "Créer mon espace"}
            {!isSubmitting && <ArrowRight className="ml-2 h-4 w-4" />}
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          {"Gratuit · Sans engagement · Vos données restent privées"}
        </p>
      </main>
    </div>
  )
}

export default function CreateAccountPage() {
  return (
    <Suspense fallback={<CreateAccountFallback />}>
      <CreateAccountForm />
    </Suspense>
  )
}

function CreateAccountFallback() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary animate-pulse">
        <Sparkles className="h-8 w-8" />
      </div>
      <p className="mt-4 text-muted-foreground">Chargement...</p>
    </div>
  )
}
