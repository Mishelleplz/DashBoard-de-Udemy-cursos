import { create } from 'zustand'
import type { Course } from '../lib/schema'

export interface FiltersState {
  search: string
  status: string
  category: string
  technology: string
  bucket: string
  onlyWithCurriculum: boolean
  weeklyHours: number
  selectedCourseId: number | null
}

export interface FiltersActions {
  setFilter: <K extends keyof FiltersState>(key: K, value: FiltersState[K]) => void
  setMany: (values: Partial<FiltersState>) => void
  reset: () => void
}

export const DEFAULT_FILTERS: FiltersState = {
  search: '',
  status: 'all',
  category: 'all',
  technology: 'all',
  bucket: 'all',
  onlyWithCurriculum: false,
  weeklyHours: 5,
  selectedCourseId: null,
}

export const useFiltersStore = create<FiltersState & FiltersActions>((set) => ({
  ...DEFAULT_FILTERS,
  setFilter: (key, value) => set({ [key]: value } as Partial<FiltersState>),
  setMany: (values) => set(values),
  reset: () => set({ ...DEFAULT_FILTERS }),
}))

export function filterCourses(courses: Course[], filters: FiltersState): Course[] {
  const needle = filters.search.trim().toLowerCase()
  return courses.filter((course) => {
    if (filters.status !== 'all' && course.status !== filters.status) return false
    if (filters.bucket !== 'all' && course.progressBucket !== filters.bucket) return false
    if (filters.category !== 'all' && course.category !== filters.category) return false
    if (filters.technology !== 'all' && !course.technologies.includes(filters.technology)) {
      return false
    }
    if (filters.onlyWithCurriculum && course.curriculum.length === 0) return false
    if (needle) {
      const haystack = [course.title, ...course.instructors, ...course.technologies]
        .join(' ')
        .toLowerCase()
      if (!haystack.includes(needle)) return false
    }
    return true
  })
}

export function activeFilterCount(filters: FiltersState): number {
  let count = 0
  if (filters.search.trim()) count += 1
  if (filters.status !== 'all') count += 1
  if (filters.category !== 'all') count += 1
  if (filters.technology !== 'all') count += 1
  if (filters.bucket !== 'all') count += 1
  if (filters.onlyWithCurriculum) count += 1
  return count
}
