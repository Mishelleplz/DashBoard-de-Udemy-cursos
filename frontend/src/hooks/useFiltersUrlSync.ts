import { useEffect, useRef } from 'react'
import { parseAsBoolean, parseAsFloat, parseAsInteger, parseAsString, useQueryStates } from 'nuqs'
import { DEFAULT_FILTERS, useFiltersStore, type FiltersState } from '../store/filters'

const parsers = {
  q: parseAsString.withDefault(DEFAULT_FILTERS.search),
  estado: parseAsString.withDefault(DEFAULT_FILTERS.status),
  categoria: parseAsString.withDefault(DEFAULT_FILTERS.category),
  tecnologia: parseAsString.withDefault(DEFAULT_FILTERS.technology),
  avance: parseAsString.withDefault(DEFAULT_FILTERS.bucket),
  conTemario: parseAsBoolean.withDefault(DEFAULT_FILTERS.onlyWithCurriculum),
  horas: parseAsFloat.withDefault(DEFAULT_FILTERS.weeklyHours),
  curso: parseAsInteger,
}

type QueryValues = {
  q: string
  estado: string
  categoria: string
  tecnologia: string
  avance: string
  conTemario: boolean
  horas: number
  curso: number | null
}

function toFilters(values: QueryValues): FiltersState {
  return {
    search: values.q,
    status: values.estado,
    category: values.categoria,
    technology: values.tecnologia,
    bucket: values.avance,
    onlyWithCurriculum: values.conTemario,
    weeklyHours: values.horas,
    selectedCourseId: values.curso,
  }
}

function toQuery(filters: FiltersState): QueryValues {
  return {
    q: filters.search,
    estado: filters.status,
    categoria: filters.category,
    tecnologia: filters.technology,
    avance: filters.bucket,
    conTemario: filters.onlyWithCurriculum,
    horas: filters.weeklyHours,
    curso: filters.selectedCourseId,
  }
}

/**
 * Mantiene el estado de filtros (Zustand) y la URL (nuqs) en el mismo valor:
 * la URL hidrata el store al montar y cada cambio del store se refleja en la query string.
 */
export function useFiltersUrlSync(): void {
  const [query, setQuery] = useQueryStates(parsers, { history: 'replace' })
  const hydrated = useRef(false)

  useEffect(() => {
    if (hydrated.current) return
    hydrated.current = true
    useFiltersStore.getState().setMany(toFilters(query as QueryValues))
  }, [query])

  useEffect(() => {
    if (!hydrated.current) return
    return useFiltersStore.subscribe((state) => {
      void setQuery(toQuery(state))
    })
  }, [setQuery])
}
