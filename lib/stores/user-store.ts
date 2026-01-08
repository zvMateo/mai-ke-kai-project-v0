import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import { User as SupabaseUser } from "@supabase/supabase-js"

export interface UserProfile {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  nationality: string | null
  role: "guest" | "volunteer" | "admin" | "staff"
  loyalty_points: number
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface UserState {
  user: SupabaseUser | null
  profile: UserProfile | null
  isAuthenticated: boolean
  isLoading: boolean
  
  setUser: (user: SupabaseUser | null) => void
  setProfile: (profile: UserProfile | null) => void
  setLoading: (loading: boolean) => void
  logout: () => void
  refreshUser: () => Promise<void>
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      profile: null,
      isAuthenticated: false,
      isLoading: true,

      setUser: (user) => {
        set({
          user,
          isAuthenticated: !!user,
          isLoading: false,
        })
      },

      setProfile: (profile) => {
        set({ profile })
      },

      setLoading: (isLoading) => {
        set({ isLoading })
      },

      logout: () => {
        set({
          user: null,
          profile: null,
          isAuthenticated: false,
          isLoading: false,
        })
      },

      refreshUser: async () => {
        const { createClient } = await import("@/lib/supabase/client")
        const supabase = createClient()
        
        try {
          const { data: { user } } = await supabase.auth.getUser()
          
          if (user) {
            const { data: profile } = await supabase
              .from("users")
              .select("*")
              .eq("id", user.id)
              .single()
            
            set({
              user,
              profile: profile as UserProfile,
              isAuthenticated: true,
              isLoading: false,
            })
          } else {
            set({
              user: null,
              profile: null,
              isAuthenticated: false,
              isLoading: false,
            })
          }
        } catch (error) {
          console.error("Error refreshing user:", error)
          set({ isLoading: false })
        }
      },
    }),
    {
      name: "user-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        profile: state.profile,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
