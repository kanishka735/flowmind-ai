'use client'

import { useState, useEffect } from 'react'
import { User } from 'firebase/auth'
import { onAuthStateChanged, auth } from '@/lib/firebase/auth'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  return { user, loading, isGuest: user?.isAnonymous ?? false }
}
