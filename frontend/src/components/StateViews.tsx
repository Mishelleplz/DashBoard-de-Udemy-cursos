import { motion } from 'motion/react'
import type { DatasetError } from '../lib/dataset'

export function LoadingView() {
  return (
    <div className="space-y-4" role="status" aria-live="polite" aria-busy="true">
      <p className="text-sm text-slate-400">Cargando y validando courses.json…</p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <motion.div
            key={index}
            className="panel h-24"
            animate={{ opacity: [0.35, 0.8, 0.35] }}
            transition={{ duration: 1.4, repeat: Infinity, delay: index * 0.12 }}
          />
        ))}
      </div>
      <motion.div
        className="panel h-80"
        animate={{ opacity: [0.35, 0.8, 0.35] }}
        transition={{ duration: 1.4, repeat: Infinity }}
      />
    </div>
  )
}

export function ErrorView({ error, onRetry }: { error: DatasetError; onRetry: () => void }) {
  return (
    <div className="panel space-y-3 p-8 text-center" role="alert">
      <h2 className="text-lg font-semibold text-rose-300">{error.message}</h2>
      {error.detail && <p className="text-sm text-slate-400">{error.detail}</p>}
      <p className="text-sm text-slate-400">
        Regenera el dataset con <code className="text-udemy-accent2">python -m udemy_etl.cli</code>{' '}
        y vuelve a intentarlo.
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="rounded-lg bg-udemy-accent px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
      >
        Reintentar
      </button>
    </div>
  )
}

export function EmptyView({ onReset }: { onReset: () => void }) {
  return (
    <motion.div
      className="panel space-y-3 p-10 text-center"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h2 className="text-lg font-semibold text-slate-200">Ningún curso coincide con los filtros</h2>
      <p className="text-sm text-slate-400">
        Prueba con otra búsqueda o limpia los filtros para ver los 573 cursos.
      </p>
      <button
        type="button"
        onClick={onReset}
        className="rounded-lg border border-udemy-border px-4 py-2 text-sm text-slate-200 transition hover:border-udemy-accent"
      >
        Limpiar filtros
      </button>
    </motion.div>
  )
}
