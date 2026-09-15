# Dashboard de cursos de Udemy

ETL en Python que limpia el export real de una biblioteca de Udemy (573 cursos, 5 hojas de Excel)
y lo publica como `courses.json`, más un frontend React que lo consume directamente —
sin base de datos ni API, según el brief del sprint de una semana.

```
data/udemy_biblioteca_completa.xlsx   →   etl/  (Python + pytest)   →   frontend/public/courses.json   →   frontend/ (Vite + React + TS)
```

## Puesta en marcha

```bash
# 1. ETL: reconstruye courses.json desde el Excel (un solo comando)
cd etl
pip install -r requirements.txt
python -m udemy_etl.cli          # escribe frontend/public/courses.json
python -m pytest                 # tests del parser de duración, split de tecnologías y del dataset

# 2. Frontend
cd ../frontend
npm install
npm run dev                      # http://localhost:5173
```

Otros comandos del frontend: `npm run build`, `npm run typecheck`, `npm run lint`.

## Contrato de datos (`courses.json`)

El ETL y el frontend se acoplan solo por este shape; el frontend lo valida con Zod al cargarlo
(`frontend/src/lib/schema.ts`).

```jsonc
{
  "contractVersion": "1.0.0",
  "generatedAt": "2026-09-15T13:40:00+00:00",
  "source": "udemy_biblioteca_completa.xlsx",
  "summary": { "courseCount": 573, "totalMinutes": 426018, "watchedMinutes": 12618, "...": "..." },
  "courses": [
    {
      "id": 7014617,
      "title": "GO Programming: The Complete Guide to Golang Development",
      "url": "https://www.udemy.com/course/7014617/",
      "status": "active",              // active | unavailable | practice_exam
      "progress": 100,                  // 0-100
      "progressBucket": "completado",  // completado | en-progreso | sin-empezar
      "sections": 11,
      "lectures": 33,
      "durationMinutes": 296.0,         // null si el export no la trae
      "durationLabel": "4h 56m",
      "remainingMinutes": 0.0,
      "students": 5541,
      "instructors": ["Muhammad Riaz Uddin"],
      "technologies": ["Go (programming language)", "Programming Languages", "Development"],
      "category": "Development",        // última entrada de technologies
      "objectives": ["..."],
      "curriculum": [
        {
          "title": "Introduction to Go",
          "durationMinutes": 19,
          "lectureCount": 3,
          "lessons": [{ "title": "What is Go and Why Use It?", "durationMinutes": 4.77, "freePreview": true }]
        }
      ],
      "exams": [{ "name": "Exam 1", "questions": 75 }],
      "totalQuestions": null,
      "unavailableReason": null
    }
  ]
}
```

## Qué hace el ETL

- Lee las 5 hojas (`Resumen`, `Temario Completo`, `Objetivos de Aprendizaje`, `Cursos No Disponibles`,
  `Exámenes de Práctica`) y las une por `ID Curso`.
- Normaliza los formatos inconsistentes del export: duraciones (`4h 56m`, `19min`, `4:46`, `1:02:33`),
  estudiantes con separador de miles (`25,307`), progreso fuera de rango, nulos y texto libre.
- Separa instructores y tecnologías (`|`), deduplica y deriva la categoría.
- Marca los 12 cursos no disponibles con su motivo y los 8 exámenes de práctica con sus preguntas.
- Deriva un `summary` con los totales que consume el dashboard.

Tests en `etl/tests/`: el parser de duración, el split de tecnologías/instructores, los enteros con
separadores y un test de integración sobre el Excel real.

## Frontend

| Librería | Uso |
| --- | --- |
| Zod | valida `courses.json` al cargarlo; si el contrato se rompe, la UI muestra el error exacto |
| Zustand | store de filtros (búsqueda, estado, avance, categoría, tecnología, temario, ritmo, curso abierto) |
| nuqs | refleja ese store en la query string, así que cualquier vista es compartible por URL |
| TanStack Table | catálogo con orden, paginación y tamaño de página |
| Chart.js | top de tecnologías, estado de avance y horas por categoría |
| Temporal | fecha estimada de término según las horas/semana, con hitos al 25/50/75% |
| Motion | tabs, drawer del temario, filas y skeletons de carga |

La vista principal cubre los tres estados: carga (skeletons animados), vacío (sin coincidencias, con
botón para limpiar filtros) y error (dataset inválido o no descargable, con reintento).

## Fase 2 (fuera de alcance de esta ronda)

- FastAPI + base de datos en lugar de un JSON estático, con el mismo contrato.
- Notas por curso persistidas en backend (hoy ni siquiera en localStorage).
- Recomendador de "qué estudiar ahora" a partir de progreso, duración y tecnologías.
