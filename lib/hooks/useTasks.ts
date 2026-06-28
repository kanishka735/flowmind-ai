'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  collection,
  query,
  where,
  orderBy,
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
      setTasks([])
      setLoading(false)
      return
    }

    const q = query(
      collection(db, 'tasks'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const taskList: Task[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      } as Task))
      setTasks(taskList)
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
