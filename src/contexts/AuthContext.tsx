import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

interface User {
  id: string
  email: string
  name: string
  full_name: string
  role: 'participant' | 'organizer' | 'admin'
  status: string
  phone?: string
  avatar_url?: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (data: SignUpData) => Promise<void>
  signOut: () => Promise<void>
  refreshUser: () => Promise<User | null>
}

interface SignUpData {
  firstName: string
  lastName: string
  email: string
  password: string
  role: 'participant' | 'organizer' | 'admin'
  phone?: string
}

const AuthContext = createContext<AuthContextType | null>(null)

async function fetchProfile(userId: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error || !data) return null

  return {
    id: data.id,
    email: data.email,
    name: data.full_name || data.email,
    full_name: data.full_name || '',
    role: data.role,
    status: data.status,
    phone: data.phone,
    avatar_url: data.avatar_url,
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const loadProfile = useCallback(async (userId: string) => {
    const profile = await fetchProfile(userId)
    setUser(profile)
    return profile
  }, [])

  useEffect(() => {
    // 1. Load initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchProfile(session.user.id).then(p => { setUser(p); setLoading(false) })
      } else {
        setLoading(false)
      }
    })

    // 2. Listen for auth changes — NEVER await Supabase calls inside this callback
    //    (it causes a deadlock in supabase-js). Defer with setTimeout.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const uid = session.user.id
        setTimeout(() => {
          fetchProfile(uid).then(p => setUser(p))
        }, 0)
      } else {
        setUser(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    // Eagerly load profile so caller doesn't depend on onAuthStateChange timing
    if (data.user) {
      await loadProfile(data.user.id)
    }
  }

  const signUp = async (formData: SignUpData): Promise<void> => {
    const fullName = `${formData.firstName} ${formData.lastName}`.trim()

    const { data, error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          full_name: fullName,
          role: formData.role,
          phone: formData.phone || null,
        },
      },
    })
    if (error) throw error

    // If Supabase returned a session (email confirmation disabled), load profile
    if (data.session?.user) {
      await loadProfile(data.session.user.id)
      return
    }

    // No session — email confirmation is enabled at project level.
    // The DB trigger already auto-confirmed the email, so sign in directly.
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password,
    })
    if (signInError) throw signInError
    if (signInData.user) {
      await loadProfile(signInData.user.id)
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  const refreshUser = async () => {
    if (!user?.id) return null
    const profile = await fetchProfile(user.id)
    if (profile) setUser(profile)
    return profile
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
