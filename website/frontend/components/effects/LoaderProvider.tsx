'use client'

import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { usePathname } from 'next/navigation'
import dynamic from 'next/dynamic'

const KVLTrackLoader = dynamic(() => import('./KVLTrackLoader'), { ssr: false })

interface LoaderCtx {
  show: () => void
  hide: () => void
}

const Ctx = createContext<LoaderCtx>({ show: () => {}, hide: () => {} })

export const useLoader = () => useContext(Ctx)

const INITIAL_MS = 2400  // show on first load
const NAV_MS     = 550   // show on route change

export default function LoaderProvider({ children }: { children: React.ReactNode }) {
  const [visible, setVisible]   = useState(true)
  const pathname                = usePathname()
  const prevPath                = useRef(pathname)
  const initialDone             = useRef(false)
  const timer                   = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearTimer = () => {
    if (timer.current) { clearTimeout(timer.current); timer.current = null }
  }

  // Initial page load – show for INITIAL_MS
  useEffect(() => {
    timer.current = setTimeout(() => {
      setVisible(false)
      initialDone.current = true
    }, INITIAL_MS)
    return clearTimer
  }, [])

  // Route change – brief flash
  useEffect(() => {
    if (!initialDone.current)       return
    if (pathname === prevPath.current) return
    prevPath.current = pathname
    setVisible(true)
    clearTimer()
    timer.current = setTimeout(() => setVisible(false), NAV_MS)
    return clearTimer
  }, [pathname])

  const show = useCallback(() => { clearTimer(); setVisible(true) }, [])
  const hide = useCallback(() => { clearTimer(); setVisible(false) }, [])

  return (
    <Ctx.Provider value={{ show, hide }}>
      <KVLTrackLoader isVisible={visible} />
      {children}
    </Ctx.Provider>
  )
}
