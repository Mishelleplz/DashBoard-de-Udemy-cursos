import { HoursByCategoryChart, ProgressChart, TechnologiesChart } from './Charts'
import { StudyPlanner } from './StudyPlanner'
import type { Course } from '../lib/schema'

export function Charts({ courses }: { courses: Course[] }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <TechnologiesChart courses={courses} />
      <ProgressChart courses={courses} />
      <HoursByCategoryChart courses={courses} />
      <StudyPlanner courses={courses} />
    </div>
  )
}
