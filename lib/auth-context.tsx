"use client"

import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User, Session } from "@supabase/supabase-js"
import type { Profile } from "@/lib/supabase/types"

interface AuthContextType {
  user: User | null
  profile: Profile | null
  session: Session | null
  isLoading: boolean
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Use ref to store the supabase client - stable across renders
  const supabaseRef = useRef(createClient())

  console.log("[v0] AuthProvider render: user=", !!user, "isLoading=", isLoading, "session=", !!session)

  const fetchProfile = useCallback(async (userId: string) => {
    console.log("[v0] fetchProfile: fetching for userId=", userId)
    try {
      const { data, error } = await supabaseRef.current
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single()
      
      if (error) {
        console.log("[v0] fetchProfile: error=", error.message)
        setProfile(null)
        return
      }

      console.log("[v0] fetchProfile: success, setting profile")
      if (data) {
        setProfile(data as Profile)
      } else {
        setProfile(null)
      }
    } catch (error) {
      console.error("[v0] fetchProfile: exception=", error instanceof Error ? error.message : "unknown")
      setProfile(null)
    }
  }, [])

  const refreshProfile = useCallback(async () => {
    if (user) {
      await fetchProfile(user.id)
    }
  }, [user, fetchProfile])

  const signOut = useCallback(async () => {
    console.log("[v0] signOut: called")
    await supabaseRef.current.auth.signOut()
    setUser(null)
    setProfile(null)
    setSession(null)
  }, [])

  useEffect(() => {
    console.log("[v0] AuthProvider useEffect: mounting")
    // Track if component is mounted to prevent state updates after unmount
    let isMounted = true
    let isInitializing = true

    const initializeAuth = async () => {
      try {
        console.log("[v0] AuthProvider: getting initial session")
        const { data: { session: initialSession }, error } = await supabaseRef.current.auth.getSession()
        
        if (!isMounted) {
          console.log("[v0] AuthProvider: component unmounted, skipping state update")
          return
        }
        
        if (error) {
          console.log("[v0] AuthProvider: getSession error=", error.message)
          setIsLoading(false)
          isInitializing = false
          return
        }

        console.log("[v0] AuthProvider: initial session=", !!initialSession)
        if (initialSession?.user) {
          console.log("[v0] AuthProvider: user found, setting user and fetching profile")
          setSession(initialSession)
          setUser(initialSession.user)
          await fetchProfile(initialSession.user.id)
        } else {
          console.log("[v0] AuthProvider: no session, clearing user and profile")
          setSession(null)
          setUser(null)
          setProfile(null)
        }
        
        if (isMounted) {
          console.log("[v0] AuthProvider: setting isLoading=false")
          setIsLoading(false)
          isInitializing = false
        }
      } catch (error) {
        console.error("[v0] AuthProvider: exception during init=", error instanceof Error ? error.message : "unknown")
        if (isMounted) {
          setIsLoading(false)
          isInitializing = false
        }
      }
    }

    initializeAuth()

    // Listen for auth state changes (sign in, sign out, token refresh)
    console.log("[v0] AuthProvider: subscribing to onAuthStateChange")
    const { data: { subscription } } = supabaseRef.current.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log("[v0] AuthProvider: onAuthStateChange event=", event, "hasSession=", !!newSession)
        
        if (!isMounted) {
          console.log("[v0] AuthProvider: component unmounted, skipping state update for", event)
          return
        }
        
        // Don't process auth events while initializing to avoid race conditions
        if (isInitializing) {
          console.log("[v0] AuthProvider: still initializing, skipping event", event)
          return
        }

        setSession(newSession)
        setUser(newSession?.user ?? null)
        
        if (newSession?.user) {
          console.log("[v0] AuthProvider: session updated, fetching profile")
          await fetchProfile(newSession.user.id)
        } else {
          console.log("[v0] AuthProvider: session cleared, clearing profile")
          setProfile(null)
        }
      }
    )

    return () => {
      console.log("[v0] AuthProvider: unmounting, unsubscribing from auth changes")
      isMounted = false
      subscription.unsubscribe()
    }
  }, [fetchProfile])

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        isLoading,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
