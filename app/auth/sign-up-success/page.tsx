import Link from "next/link"
import { Mail, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function SignUpSuccessPage() {
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
        <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/10 text-accent">
          <Mail className="h-8 w-8" />
        </div>

        <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-foreground sm:text-3xl text-center text-balance">
          Vérifiez votre email
        </h1>

        <p className="mt-4 text-center text-muted-foreground max-w-sm">
          Nous vous avons envoyé un email de confirmation. Cliquez sur le lien pour
          activer votre compte et accéder à Magifin.
        </p>

        <div className="mt-8 rounded-xl border border-border bg-card p-6 w-full">
          <h2 className="font-medium text-foreground mb-2">Prochaines étapes</h2>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
            <li>Ouvrez votre boîte email</li>
            <li>Cliquez sur le lien de confirmation</li>
            <li>Connectez-vous à votre compte</li>
          </ol>
        </div>

        <div className="mt-8 flex flex-col gap-3 w-full">
          <Button asChild size="lg" className="w-full">
            <Link href="/auth/login">
              Se connecter
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>

          <Button asChild variant="ghost" size="sm" className="w-full">
            <Link href="/">Retour à l&apos;accueil</Link>
          </Button>
        </div>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          Vous n&apos;avez pas reçu l&apos;email ? Vérifiez vos spams ou{" "}
          <Link href="/auth/sign-up" className="text-accent hover:underline">
            réessayez
          </Link>
          .
        </p>
      </main>
    </div>
  )
}
