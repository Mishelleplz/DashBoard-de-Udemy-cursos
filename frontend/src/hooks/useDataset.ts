import { useCallback, useEffect, useState } from 'react'
import { DatasetError, loadDataset } from '../lib/dataset'
import type { Dataset } from '../lib/schema'

export type DatasetStatus = 'loading' | 'ready' | 'error'

export interface DatasetResult {
  status: DatasetStatus
  dataset: Dataset | null
  error: DatasetError | null
  reload: () => void
}

export function useDataset(): DatasetResult {
  const [status, setStatus] = useState<DatasetStatus>('loading')
  const [dataset, setDataset] = useState<Dataset | null>(null)
  const [error, setError] = useState<DatasetError | null>(null)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    setStatus('loading')
    setError(null)

    loadDataset(controller.signal)
      .then((data) => {
        setDataset(data)
        setStatus('ready')
      })
      .catch((cause: unknown) => {
        if (cause instanceof DOMException && cause.name === 'AbortError') return
        setError(
          cause instanceof DatasetError
            ? cause
            : new DatasetError('Error inesperado al cargar el dataset', String(cause)),
        )
        setStatus('error')
      })

    return () => controller.abort()
  }, [attempt])

  const reload = useCallback(() => setAttempt((value) => value + 1), [])

  return { status, dataset, error, reload }
}
