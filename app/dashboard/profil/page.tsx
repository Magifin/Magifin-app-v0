import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function ProfilPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-foreground sm:text-3xl">
          Profil
        </h1>
        <p className="mt-1 text-muted-foreground">
          {"Gérez vos informations personnelles."}
        </p>
      </div>

      <div className="max-w-lg rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
            JD
          </div>
          <div>
            <p className="font-[family-name:var(--font-heading)] text-lg font-bold text-card-foreground">
              Jean Dupont
            </p>
            <p className="text-sm text-muted-foreground">Membre depuis janvier 2026</p>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-card-foreground">
              Nom complet
            </label>
            <Input defaultValue="Jean Dupont" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-card-foreground">
              Email
            </label>
            <Input type="email" defaultValue="jean@example.com" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-card-foreground">
              {"Numéro national (optionnel)"}
            </label>
            <Input placeholder="XX.XX.XX-XXX.XX" />
          </div>
          <Button className="mt-2 w-full sm:w-auto">Sauvegarder</Button>
        </div>
      </div>
    </div>
  )
}
