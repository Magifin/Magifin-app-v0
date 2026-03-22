"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { DashboardHeader } from "@/components/dashboard/header"

export default function ProfilPage() {
  const router = useRouter()
  const { user: authUser, profile, isLoading, refreshProfile } = useAuth()
  const [authInitialized, setAuthInitialized] = useState(false)
  
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  // Ensure auth initializes within reasonable time
  useEffect(() => {
    if (!isLoading) {
      setAuthInitialized(true)
    }
    
    const timeout = setTimeout(() => {
      if (!authInitialized) {
        setAuthInitialized(true)
      }
    }, 2000)
    
    return () => clearTimeout(timeout)
  }, [isLoading, authInitialized])

  // Initialize form with user data
  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name || "")
      setLastName(profile.last_name || "")
      setEmail(profile.email || "")
    } else if (authUser) {
      setEmail(authUser.email || "")
    }
  }, [profile, authUser])

  const initials = (firstName + (lastName ? " " + lastName : ""))
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  const handleSave = async () => {
    if (!authUser) return
    
    setIsSaving(true)
    setMessage(null)

    try {
      const response = await fetch("/api/profile/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: firstName || null,
          last_name: lastName || null,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update profile")
      }

      // Refresh the profile data
      await refreshProfile()
      setMessage({ type: "success", text: "Profil mis à jour avec succès" })
      setTimeout(() => setMessage(null), 3000)
    } catch (error) {
      console.error("[v0] Error updating profile:", error)
      setMessage({ type: "error", text: "Erreur lors de la mise à jour du profil" })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading && !authInitialized) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!authUser) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-muted-foreground mb-4">Vous devez être connecté pour accéder à cette page</p>
        <Button onClick={() => router.push("/auth/login")}>Se connecter</Button>
      </div>
    )
  }

  return (
    <div>
      <DashboardHeader
        title="Profil"
        description="Gérez vos informations personnelles."
      />

      <div className="max-w-lg rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
            {initials || "U"}
          </div>
          <div>
            <p className="font-[family-name:var(--font-heading)] text-lg font-bold text-card-foreground">
              {firstName && lastName ? `${firstName} ${lastName}` : firstName || "Utilisateur"}
            </p>
            <p className="text-sm text-muted-foreground">{email}</p>
          </div>
        </div>

        {message && (
          <div
            className={`mb-4 rounded-lg p-3 text-sm ${
              message.type === "success"
                ? "bg-accent/10 text-accent"
                : "bg-destructive/10 text-destructive"
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="flex flex-col gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-card-foreground">
              Prénom
            </label>
            <Input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Votre prénom"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-card-foreground">
              Nom
            </label>
            <Input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Votre nom"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-card-foreground">
              Email
            </label>
            <Input type="email" value={email} disabled />
            <p className="mt-1 text-xs text-muted-foreground">
              L'email ne peut pas être changé
            </p>
          </div>
          <Button onClick={handleSave} disabled={isSaving} className="mt-2 w-full sm:w-auto">
            {isSaving ? "Sauvegarde..." : "Sauvegarder"}
          </Button>
        </div>
      </div>
    </div>
  )
}
