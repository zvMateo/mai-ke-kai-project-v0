"use client"

import { useEffect } from "react"
import { useUserStore } from "@/lib/stores/user-store"
import { createClient } from "@/lib/supabase/client"

export function UserInitializer() {
  const { setUser, setProfile, setLoading, refreshUser } = useUserStore()

  useEffect(() => {
    let mounted = true

    async function loadUser() {
      try {
        const supabase = createClient()
        
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!mounted) return

        if (user) {
          setUser(user)

          const { data: profile } = await supabase
            .from("users")
            .select("*")
            .eq("id", user.id)
            .single()

          if (profile && mounted) {
            setProfile(profile)
          }
        }

        setLoading(false)
      } catch (error) {
        console.error("Error loading user:", error)
        if (mounted) setLoading(false)
      }
    }

    loadUser()

    const supabase = createClient()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: string, session: any) => {
        if (!mounted) return

        if (event === "SIGNED_IN") {
          if (session?.user) {
            setUser(session.user)
            
            const { data: profile } = await supabase
              .from("users")
              .select("*")
              .eq("id", session.user.id)
              .single()
            
            if (profile) {
              setProfile(profile)
            }
          }
        } else if (event === "SIGNED_OUT") {
          setUser(null)
          setProfile(null)
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [setUser, setProfile, setLoading])

  return null
}
