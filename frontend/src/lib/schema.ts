import { z } from 'zod'

export const courseStatusSchema = z.enum(['active', 'unavailable', 'practice_exam'])
export const progressBucketSchema = z.enum(['completado', 'en-progreso', 'sin-empezar'])

export const lessonSchema = z.object({
  title: z.string(),
  durationMinutes: z.number().nonnegative().nullable(),
  freePreview: z.boolean(),
})

export const sectionSchema = z.object({
  title: z.string(),
  durationMinutes: z.number().nonnegative().nullable(),
  lectureCount: z.number().int().nonnegative(),
  lessons: z.array(lessonSchema),
})

export const examSchema = z.object({
  name: z.string(),
  questions: z.number().int().nonnegative().nullable(),
})

export const courseSchema = z.object({
  id: z.number().int(),
  title: z.string().min(1),
  url: z.string().nullable(),
  status: courseStatusSchema,
  progress: z.number().min(0).max(100),
  progressBucket: progressBucketSchema,
  sections: z.number().int().nonnegative(),
  lectures: z.number().int().nonnegative(),
  durationMinutes: z.number().nonnegative().nullable(),
  durationLabel: z.string().nullable(),
  remainingMinutes: z.number().nonnegative().nullable(),
  students: z.number().int().nonnegative().nullable(),
  instructors: z.array(z.string()),
  technologies: z.array(z.string()),
  category: z.string(),
  objectives: z.array(z.string()),
  curriculum: z.array(sectionSchema),
  exams: z.array(examSchema),
  totalQuestions: z.number().int().nonnegative().nullable(),
  unavailableReason: z.string().nullable(),
})

export const summarySchema = z.object({
  courseCount: z.number().int().nonnegative(),
  activeCount: z.number().int().nonnegative(),
  unavailableCount: z.number().int().nonnegative(),
  practiceExamCount: z.number().int().nonnegative(),
  completedCount: z.number().int().nonnegative(),
  inProgressCount: z.number().int().nonnegative(),
  totalMinutes: z.number().nonnegative(),
  watchedMinutes: z.number().nonnegative(),
  remainingMinutes: z.number().nonnegative(),
  lessonCount: z.number().int().nonnegative(),
  categoryCount: z.number().int().nonnegative(),
})

export const datasetSchema = z.object({
  contractVersion: z.string(),
  generatedAt: z.string(),
  source: z.string(),
  summary: summarySchema,
  courses: z.array(courseSchema).min(1),
})

export type Lesson = z.infer<typeof lessonSchema>
export type Section = z.infer<typeof sectionSchema>
export type Course = z.infer<typeof courseSchema>
export type CourseStatus = z.infer<typeof courseStatusSchema>
export type ProgressBucket = z.infer<typeof progressBucketSchema>
export type Summary = z.infer<typeof summarySchema>
export type Dataset = z.infer<typeof datasetSchema>
