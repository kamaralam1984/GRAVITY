import { useState, useEffect, useCallback } from "react"
import { adminApi, DashboardStats, FamilyItem, DeviceItem, SOSAlert } from "./api"

export function useDashboard() {
  const [data, setData] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    try {
      setLoading(true)
      const d = await adminApi.dashboard()
      setData(d)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetch() }, [fetch])
  return { data, loading, error, refetch: fetch }
}

export function useFamilies(initialPlan?: string) {
  const [families, setFamilies] = useState<FamilyItem[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [plan, setPlan] = useState(initialPlan)

  const fetch = useCallback(async (skip = 0) => {
    try {
      setLoading(true)
      const d = await adminApi.families(skip, 20, plan)
      setFamilies(d.families)
      setTotal(d.total)
    } catch {
    } finally {
      setLoading(false)
    }
  }, [plan])

  useEffect(() => { fetch() }, [fetch])
  return { families, total, loading, setPlan, refetch: fetch }
}

export function useDevices(initialStatus?: string) {
  const [devices, setDevices] = useState<DeviceItem[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState(initialStatus)

  const fetch = useCallback(async (skip = 0) => {
    try {
      setLoading(true)
      const d = await adminApi.devices(skip, 20, status)
      setDevices(d.devices)
      setTotal(d.total)
    } catch {
    } finally {
      setLoading(false)
    }
  }, [status])

  useEffect(() => { fetch() }, [fetch])
  return { devices, total, loading, setStatus, refetch: fetch }
}

export function useSosAlerts(filterStatus?: string) {
  const [alerts, setAlerts] = useState<SOSAlert[]>([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    try {
      setLoading(true)
      const d = await adminApi.sosAlerts(filterStatus)
      setAlerts(d.alerts)
    } catch {
    } finally {
      setLoading(false)
    }
  }, [filterStatus])

  useEffect(() => { fetch() }, [fetch])

  const resolve = async (id: number) => {
    await adminApi.resolveSOS(id)
    fetch()
  }

  return { alerts, loading, refetch: fetch, resolve }
}
