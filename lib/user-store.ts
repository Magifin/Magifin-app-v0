"use client"

import { useSyncExternalStore, useCallback } from "react"

// === Types ===
export interface MagifinUser {
  firstName: string
  email?: string
  createdAt: string
}

const STORAGE_KEY = "magifin_user_v1"

// === Store implementation ===
type Listener = () => void

function createUserStore() {
  let user: MagifinUser | null = null
  let isHydrated = false
  const listeners = new Set<Listener>()

  const getSnapshot = (): MagifinUser | null => user
  const getServerSnapshot = (): MagifinUser | null => null

  const subscribe = (listener: Listener) => {
    listeners.add(listener)
    return () => listeners.delete(listener)
  }

  const emit = () => {
    listeners.forEach((l) => l())
  }

  const persist = () => {
    if (typeof window !== "undefined") {
      try {
        if (user) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
        } else {
          localStorage.removeItem(STORAGE_KEY)
        }
      } catch {
        // ignore storage errors
      }
    }
  }

  const hydrate = () => {
    if (isHydrated || typeof window === "undefined") return
    isHydrated = true
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        user = JSON.parse(stored) as MagifinUser
        emit()
      }
    } catch {
      // ignore parse errors
    }
  }

  const setUser = (newUser: MagifinUser) => {
    user = newUser
    persist()
    emit()
  }

  const clearUser = () => {
    user = null
    persist()
    emit()
  }

  return {
    getSnapshot,
    getServerSnapshot,
    subscribe,
    hydrate,
    setUser,
    clearUser,
    isHydrated: () => isHydrated,
  }
}

const store = createUserStore()

/**
 * Hook to access and manage the current Magifin user.
 * Provides SSR-safe hydration guard.
 */
export function useUser() {
  const user = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getServerSnapshot
  )

  // Hydrate on mount
  if (typeof window !== "undefined" && !store.isHydrated()) {
    store.hydrate()
  }

  const setUser = useCallback((newUser: MagifinUser) => {
    store.setUser(newUser)
  }, [])

  const clearUser = useCallback(() => {
    store.clearUser()
  }, [])

  return {
    user,
    setUser,
    clearUser,
    isLoggedIn: user !== null,
  }
}

/**
 * Check if user exists (for non-React contexts).
 * Useful for SSR-safe checks.
 */
export function getUserFromStorage(): MagifinUser | null {
  if (typeof window === "undefined") return null
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored) as MagifinUser
    }
  } catch {
    // ignore
  }
  return null
}
