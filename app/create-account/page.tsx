"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense } from "react"

function CreateAccountRedirect() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Redirect to sign-up with the same query params preserved
    const from = searchParams.get("from")
    const redirectUrl = from ? `/auth/sign-up?from=${from}` : "/auth/sign-up"
    router.push(redirectUrl)
  }, [router, searchParams])

  // Show loading state while redirecting
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      <div className="flex h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      <p className="mt-4 text-muted-foreground">Redirection en cours...</p>
    </div>
  )
}

function LoadingFallback() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      <div className="flex h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      <p className="mt-4 text-muted-foreground">Chargement...</p>
    </div>
  )
}

export default function CreateAccountPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <CreateAccountRedirect />
    </Suspense>
  )
}
