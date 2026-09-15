import { datasetSchema, type Dataset } from './schema'

export const DATASET_URL = `${import.meta.env.BASE_URL}courses.json`

export class DatasetError extends Error {
  readonly detail?: string

  constructor(message: string, detail?: string) {
    super(message)
    this.name = 'DatasetError'
    this.detail = detail
  }
}

export async function loadDataset(signal?: AbortSignal): Promise<Dataset> {
  let payload: unknown
  try {
    const response = await fetch(DATASET_URL, { signal })
    if (!response.ok) {
      throw new DatasetError(
        'No se pudo descargar courses.json',
        `El servidor respondió ${response.status} ${response.statusText}`,
      )
    }
    payload = await response.json()
  } catch (error) {
    if (error instanceof DatasetError) throw error
    if (error instanceof DOMException && error.name === 'AbortError') throw error
    throw new DatasetError(
      'No se pudo leer courses.json',
      error instanceof Error ? error.message : String(error),
    )
  }

  const result = datasetSchema.safeParse(payload)
  if (!result.success) {
    const [first] = result.error.issues
    throw new DatasetError(
      'El dataset no cumple el contrato de datos',
      first ? `${first.path.join('.') || 'raíz'}: ${first.message}` : undefined,
    )
  }
  return result.data
}
