'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { Task } from '@/lib/types'

export function useTasks(userId: string | undefined) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTasks([])
      setLoading(false)
      return
    }

    const q = query(
      collection(db, 'tasks'),
      where('userId', '==', userId)
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const taskList: Task[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      } as Task))
      
      // Client-side sorting to bypass the need for a composite index
      taskList.sort((a, b) => {
        // Handle Firestore Timestamps (they might be null during optimistic updates)
        // @ts-expect-error - Firestore timestamp typing might not match perfectly
        const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : (a.createdAt?.seconds ? a.createdAt.seconds * 1000 : Date.now());
        // @ts-expect-error - Firestore timestamp typing might not match perfectly
        const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : (b.createdAt?.seconds ? b.createdAt.seconds * 1000 : Date.now());
        return timeB - timeA;
      })
      
      setTasks(taskList)
      setLoading(false)
    }, (error) => {
      console.error("Firestore sync error in useTasks:", error)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [userId])

  const createTask = useCallback(async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    await addDoc(collection(db, 'tasks'), {
      ...taskData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
  }, [])

  const updateTask = useCallback(async (taskId: string, updates: Partial<Task>) => {
    const taskRef = doc(db, 'tasks', taskId)
    await updateDoc(taskRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    })
  }, [])

  const deleteTask = useCallback(async (taskId: string) => {
    await deleteDoc(doc(db, 'tasks', taskId))
  }, [])

  const completeTask = useCallback(async (taskId: string) => {
    const taskRef = doc(db, 'tasks', taskId)
    await updateDoc(taskRef, {
      status: 'completed',
      progress: 100,
      completedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
  }, [])

  return { tasks, loading, createTask, updateTask, deleteTask, completeTask }
}
