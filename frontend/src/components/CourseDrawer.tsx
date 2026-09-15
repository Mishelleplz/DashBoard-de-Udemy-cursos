import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { STATUS_LABELS, formatMinutes, formatNumber } from '../lib/format'
import type { Course } from '../lib/schema'

interface Props {
  course: Course | null
  onClose: () => void
}

export function CourseDrawer({ course, onClose }: Props) {
  const [openSection, setOpenSection] = useState<string | null>(null)

  useEffect(() => {
    setOpenSection(course?.curriculum[0]?.title ?? null)
  }, [course])

  useEffect(() => {
    if (!course) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [course, onClose])

  return (
    <AnimatePresence>
      {course && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-xl flex-col border-l border-udemy-border bg-udemy-panel"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 260, damping: 30 }}
            role="dialog"
            aria-modal="true"
            aria-label={course.title}
          >
            <header className="flex items-start justify-between gap-4 border-b border-udemy-border p-5">
              <div>
                <h2 className="text-lg font-semibold text-slate-100">{course.title}</h2>
                <p className="mt-1 text-xs text-slate-400">
                  {course.instructors.join(' · ') || 'Sin instructor'} ·{' '}
                  {STATUS_LABELS[course.status]}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-udemy-border px-3 py-1 text-sm text-slate-300 transition hover:border-udemy-accent"
              >
                Cerrar
              </button>
            </header>

            <div className="flex-1 space-y-5 overflow-y-auto p-5">
              <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                <Stat label="Avance" value={`${course.progress}%`} />
                <Stat label="Duración" value={formatMinutes(course.durationMinutes)} />
                <Stat label="Lecciones" value={formatNumber(course.lectures)} />
                <Stat label="Estudiantes" value={formatNumber(course.students)} />
              </dl>

              {course.unavailableReason && (
                <p className="rounded-lg border border-rose-900/60 bg-rose-950/30 p-3 text-sm text-rose-200">
                  {course.unavailableReason}
                </p>
              )}

              {course.technologies.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {course.technologies.map((tech) => (
                    <span key={tech} className="chip">
                      {tech}
                    </span>
                  ))}
                </div>
              )}

              {course.exams.length > 0 && (
                <section>
                  <h3 className="mb-2 text-sm font-semibold text-slate-200">
                    Exámenes de práctica ({formatNumber(course.totalQuestions)} preguntas)
                  </h3>
                  <ul className="space-y-1 text-sm text-slate-400">
                    {course.exams.map((exam) => (
                      <li key={exam.name} className="flex justify-between gap-3">
                        <span>{exam.name}</span>
                        <span>{formatNumber(exam.questions)} preguntas</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              <section>
                <h3 className="mb-2 text-sm font-semibold text-slate-200">
                  Temario ({course.curriculum.length} secciones)
                </h3>
                {course.curriculum.length === 0 ? (
                  <p className="text-sm text-slate-500">Este curso no tiene temario en el export.</p>
                ) : (
                  <ul className="space-y-2">
                    {course.curriculum.map((section) => {
                      const open = openSection === section.title
                      return (
                        <li key={section.title} className="rounded-lg border border-udemy-border">
                          <button
                            type="button"
                            className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm text-slate-200"
                            onClick={() => setOpenSection(open ? null : section.title)}
                          >
                            <span className="truncate">{section.title}</span>
                            <span className="shrink-0 text-xs text-slate-500">
                              {section.lectureCount} · {formatMinutes(section.durationMinutes)}
                            </span>
                          </button>
                          <AnimatePresence initial={false}>
                            {open && (
                              <motion.ul
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden border-t border-udemy-border text-sm"
                              >
                                {section.lessons.map((lesson, index) => (
                                  <li
                                    key={`${lesson.title}-${index}`}
                                    className="flex justify-between gap-3 px-3 py-1.5 text-slate-400"
                                  >
                                    <span className="truncate">
                                      {lesson.title}
                                      {lesson.freePreview && (
                                        <span className="ml-2 text-xs text-udemy-accent2">
                                          preview
                                        </span>
                                      )}
                                    </span>
                                    <span className="shrink-0 text-xs">
                                      {formatMinutes(lesson.durationMinutes)}
                                    </span>
                                  </li>
                                ))}
                              </motion.ul>
                            )}
                          </AnimatePresence>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </section>

              {course.url && (
                <a
                  href={course.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block rounded-lg bg-udemy-accent px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
                >
                  Abrir en Udemy
                </a>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-udemy-border p-2">
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd className="text-sm font-medium text-slate-100">{value}</dd>
    </div>
  )
}
