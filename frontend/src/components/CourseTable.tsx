import {
  createColumnHelper,
  createPaginatedRowModel,
  createSortedRowModel,
  rowPaginationFeature,
  rowSortingFeature,
  sortFn_alphanumeric,
  sortFn_basic,
  sortFn_text,
  tableFeatures,
  useTable,
} from '@tanstack/react-table'
import { motion } from 'motion/react'
import { BUCKET_LABELS, STATUS_LABELS, formatMinutes, formatNumber } from '../lib/format'
import type { Course } from '../lib/schema'
import { useFiltersStore } from '../store/filters'

const features = tableFeatures({
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
  sortFns: {
    alphanumeric: sortFn_alphanumeric,
    text: sortFn_text,
    basic: sortFn_basic,
  },
  rowPaginationFeature,
  paginatedRowModel: createPaginatedRowModel(),
})

const helper = createColumnHelper<typeof features, Course>()

const columns = helper.columns([
  helper.accessor('title', {
    header: 'Curso',
    sortFn: 'text',
    cell: ({ row }) => (
      <div className="max-w-md">
        <p className="truncate font-medium text-slate-100" title={row.original.title}>
          {row.original.title}
        </p>
        <p className="truncate text-xs text-slate-500">
          {row.original.instructors.join(' · ') || 'Sin instructor'}
        </p>
      </div>
    ),
  }),
  helper.accessor('category', {
    header: 'Categoría',
    sortFn: 'text',
    cell: ({ getValue }) => <span className="chip">{getValue()}</span>,
  }),
  helper.accessor('progress', {
    header: 'Avance',
    sortFn: 'basic',
    sortUndefined: 'last',
    cell: ({ row }) => (
      <div className="w-32">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-udemy-border">
          <div
            className="h-full rounded-full bg-udemy-accent"
            style={{ width: `${row.original.progress}%` }}
          />
        </div>
        <span className="text-xs text-slate-400">
          {row.original.progress}% · {BUCKET_LABELS[row.original.progressBucket]}
        </span>
      </div>
    ),
  }),
  helper.accessor('durationMinutes', {
    header: 'Duración',
    sortFn: 'basic',
    sortUndefined: 'last',
    cell: ({ getValue }) => formatMinutes(getValue()),
  }),
  helper.accessor('lectures', {
    header: 'Lecciones',
    sortFn: 'basic',
    cell: ({ getValue }) => formatNumber(getValue()),
  }),
  helper.accessor('students', {
    header: 'Estudiantes',
    sortFn: 'basic',
    sortUndefined: 'last',
    cell: ({ getValue }) => formatNumber(getValue()),
  }),
  helper.accessor('status', {
    header: 'Estado',
    sortFn: 'text',
    cell: ({ getValue }) => {
      const status = getValue()
      const tone =
        status === 'active'
          ? 'text-emerald-300 border-emerald-700/60'
          : status === 'unavailable'
            ? 'text-rose-300 border-rose-800/60'
            : 'text-amber-300 border-amber-700/60'
      return <span className={`chip ${tone}`}>{STATUS_LABELS[status]}</span>
    },
  }),
])

const PAGE_SIZES = [10, 25, 50, 100]

export function CourseTable({ courses }: { courses: Course[] }) {
  const setFilter = useFiltersStore((state) => state.setFilter)
  const table = useTable({
    features,
    columns,
    data: courses,
    getRowId: (course) => String(course.id),
    initialState: { pagination: { pageIndex: 0, pageSize: 25 } },
  })

  const { pageIndex, pageSize } = table.state.pagination

  return (
    <section className="panel overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-udemy-bg/60 text-xs uppercase tracking-wide text-slate-400">
            {table.getHeaderGroups().map((group) => (
              <tr key={group.id}>
                {group.headers.map((header) => {
                  const sorted = header.column.getIsSorted()
                  return (
                    <th key={header.id} className="px-4 py-3 font-medium">
                      <button
                        type="button"
                        className="flex items-center gap-1 transition hover:text-slate-100"
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        <table.FlexRender header={header} />
                        <span aria-hidden>{sorted === 'asc' ? '▲' : sorted === 'desc' ? '▼' : '↕'}</span>
                      </button>
                    </th>
                  )
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row, index) => (
              <motion.tr
                key={row.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.18, delay: Math.min(index * 0.012, 0.25) }}
                className="cursor-pointer border-t border-udemy-border/70 transition hover:bg-udemy-accent/10"
                onClick={() => setFilter('selectedCourseId', row.original.id)}
              >
                {row.getAllCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3 align-top text-slate-300">
                    <table.FlexRender cell={cell} />
                  </td>
                ))}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-udemy-border px-4 py-3 text-xs text-slate-400">
        <span>
          Página {pageIndex + 1} de {Math.max(table.getPageCount(), 1)} ·{' '}
          {formatNumber(table.getRowCount())} cursos
        </span>
        <div className="flex items-center gap-2">
          <select
            className="rounded-lg border border-udemy-border bg-udemy-bg px-2 py-1"
            value={pageSize}
            onChange={(event) => table.setPageSize(Number(event.target.value))}
          >
            {PAGE_SIZES.map((size) => (
              <option key={size} value={size}>
                {size} / página
              </option>
            ))}
          </select>
          <button
            type="button"
            className="rounded-lg border border-udemy-border px-3 py-1 disabled:opacity-40"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Anterior
          </button>
          <button
            type="button"
            className="rounded-lg border border-udemy-border px-3 py-1 disabled:opacity-40"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Siguiente
          </button>
        </div>
      </div>
    </section>
  )
}
