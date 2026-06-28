import {
  signInWithPopup,
  GoogleAuthProvider,
  signInAnonymously,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth'
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from './config'

const googleProvider = new GoogleAuthProvider()

// Create or update user document in Firestore
async function upsertUser(user: User, isGuest = false) {
  const userRef = doc(db, 'users', user.uid)
  const snap = await getDoc(userRef)

  if (!snap.exists()) {
    await setDoc(userRef, {
      uid: user.uid,
      displayName: user.displayName || (isGuest ? 'Guest User' : 'Anonymous'),
      email: user.email || null,
      photoURL: user.photoURL || null,
      isGuest,
      productivityScore: 0,
      createdAt: serverTimestamp(),
    })
  }
}

export async function signInWithGoogle() {
  const result = await signInWithPopup(auth, googleProvider)
  await upsertUser(result.user, false)
  return result.user
}

export async function signInAsGuest() {
  const result = await signInAnonymously(auth)
  await upsertUser(result.user, true)
  return result.user
}

export async function signOut() {
  await firebaseSignOut(auth)
}

export { onAuthStateChanged, auth }
