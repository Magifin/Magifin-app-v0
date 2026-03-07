import Link from "next/link"
import { AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function AuthErrorPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-border/50 px-6 py-4">
        <div className="mx-auto flex max-w-3xl items-center justify-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
              <span className="text-xs font-bold text-primary-foreground">M</span>
            </div>
            <span className="font-[family-name:var(--font-heading)] text-lg font-bold tracking-tight text-foreground">
              Magifin
            </span>
          </Link>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-6 py-16">
        <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
          <AlertTriangle className="h-8 w-8" />
        </div>

        <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-foreground sm:text-3xl text-center text-balance">
          Une erreur est survenue
        </h1>

        <p className="mt-4 text-center text-muted-foreground max-w-sm">
          Nous n&apos;avons pas pu vous authentifier. Le lien a peut-être expiré ou
          est invalide.
        </p>

        <div className="mt-8 flex flex-col gap-3 w-full">
          <Button asChild size="lg" className="w-full">
            <Link href="/auth/login">Réessayer de se connecter</Link>
          </Button>

          <Button asChild variant="outline" size="lg" className="w-full">
            <Link href="/auth/sign-up">Créer un nouveau compte</Link>
          </Button>

          <Button asChild variant="ghost" size="sm" className="w-full">
            <Link href="/">Retour à l&apos;accueil</Link>
          </Button>
        </div>
      </main>
    </div>
  )
}
