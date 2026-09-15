"""Transforma el export de Udemy (5 hojas) en el dataset `courses.json`."""

from __future__ import annotations

import datetime as dt
from collections import defaultdict
from pathlib import Path
from typing import Any

import pandas as pd

from .parsers import (
    category_from_technologies,
    clamp_progress,
    clean_text,
    format_duration,
    parse_duration_to_minutes,
    parse_int,
    parse_questions,
    split_instructors,
    split_technologies,
)

SHEET_SUMMARY = "Resumen"
SHEET_CURRICULUM = "Temario Completo"
SHEET_OBJECTIVES = "Objetivos de Aprendizaje"
SHEET_UNAVAILABLE = "Cursos No Disponibles"
SHEET_EXAMS = "Exámenes de Práctica"

STATUS_BY_LABEL = {
    "Activo": "active",
    "No disponible (curso eliminado o en borrador)": "unavailable",
    "Examen de práctica (sin video, solo preguntas)": "practice_exam",
}

CONTRACT_VERSION = "1.0.0"


def _status(label: object) -> str:
    text = clean_text(label) or ""
    return STATUS_BY_LABEL.get(text, "active")


def _progress_bucket(progress: int) -> str:
    if progress >= 100:
        return "completado"
    if progress > 0:
        return "en-progreso"
    return "sin-empezar"


def _build_curriculum(frame: pd.DataFrame) -> dict[int, list[dict[str, Any]]]:
    by_course: dict[int, dict[str, dict[str, Any]]] = defaultdict(dict)
    for row in frame.to_dict("records"):
        course_id = parse_int(row["ID Curso"])
        if course_id is None:
            continue
        section_title = clean_text(row["Sección"]) or "Sin sección"
        sections = by_course[course_id]
        section = sections.get(section_title)
        if section is None:
            section = {
                "title": section_title,
                "durationMinutes": parse_duration_to_minutes(row["Duración Sección"]),
                "lessons": [],
            }
            sections[section_title] = section
        lesson_title = clean_text(row["Lección"])
        if lesson_title is None:
            continue
        section["lessons"].append(
            {
                "title": lesson_title,
                "durationMinutes": parse_duration_to_minutes(row["Duración"]),
                "freePreview": (clean_text(row["Preview Gratis"]) or "").lower() == "sí",
            }
        )
    return {
        course_id: [
            {**section, "lectureCount": len(section["lessons"])}
            for section in sections.values()
        ]
        for course_id, sections in by_course.items()
    }


def _group_text(frame: pd.DataFrame, id_column: str, value_column: str) -> dict[int, list[str]]:
    grouped: dict[int, list[str]] = defaultdict(list)
    for course_id, value in zip(frame[id_column], frame[value_column]):
        key = parse_int(course_id)
        text = clean_text(value)
        if key is None or text is None:
            continue
        if text not in grouped[key]:
            grouped[key].append(text)
    return grouped


def _build_exams(frame: pd.DataFrame) -> dict[int, list[dict[str, Any]]]:
    exams: dict[int, list[dict[str, Any]]] = defaultdict(list)
    for row in frame.to_dict("records"):
        course_id = parse_int(row["ID Curso"])
        name = clean_text(row["Nombre del Examen"])
        if course_id is None or name is None:
            continue
        exams[course_id].append(
            {"name": name, "questions": parse_questions(row["Preguntas del Examen"])}
        )
    return exams


def build_dataset(excel_path: str | Path) -> dict[str, Any]:
    """Lee el Excel completo y devuelve el dataset listo para serializar."""
    excel = pd.ExcelFile(excel_path)
    summary = excel.parse(SHEET_SUMMARY)
    curriculum = _build_curriculum(excel.parse(SHEET_CURRICULUM))
    objectives = _group_text(
        excel.parse(SHEET_OBJECTIVES), "ID Curso", "Objetivo de Aprendizaje"
    )
    exams = _build_exams(excel.parse(SHEET_EXAMS))

    unavailable_frame = excel.parse(SHEET_UNAVAILABLE)
    reasons = {
        parse_int(course_id): clean_text(reason)
        for course_id, reason in zip(unavailable_frame["ID Curso"], unavailable_frame["Motivo"])
    }

    courses: list[dict[str, Any]] = []
    for row in summary.to_dict("records"):
        course_id = parse_int(row["ID Curso"])
        if course_id is None:
            continue
        technologies = split_technologies(row["Tecnologías / Temas (Udemy)"])
        progress = clamp_progress(row["Progreso (%)"])
        duration_minutes = parse_duration_to_minutes(row["Duración Total"])
        status = _status(row["Estado"])
        course_curriculum = curriculum.get(course_id, [])
        total_questions = (
            parse_questions(row["Duración Total"]) if status == "practice_exam" else None
        )

        courses.append(
            {
                "id": course_id,
                "title": clean_text(row["Título"]) or f"Curso {course_id}",
                "url": clean_text(row["URL"]),
                "status": status,
                "progress": progress,
                "progressBucket": _progress_bucket(progress),
                "sections": parse_int(row["Secciones"]) or len(course_curriculum),
                "lectures": parse_int(row["Lecciones"])
                or sum(section["lectureCount"] for section in course_curriculum),
                "durationMinutes": duration_minutes,
                "durationLabel": format_duration(duration_minutes),
                "remainingMinutes": (
                    round(duration_minutes * (100 - progress) / 100, 2)
                    if duration_minutes is not None
                    else None
                ),
                "students": parse_int(row["Estudiantes"]),
                "instructors": split_instructors(row["Instructor(es)"]),
                "technologies": technologies,
                "category": category_from_technologies(technologies),
                "objectives": objectives.get(course_id, []),
                "curriculum": course_curriculum,
                "exams": exams.get(course_id, []),
                "totalQuestions": total_questions,
                "unavailableReason": reasons.get(course_id),
            }
        )

    return {
        "contractVersion": CONTRACT_VERSION,
        "generatedAt": dt.datetime.now(dt.timezone.utc).isoformat(timespec="seconds"),
        "source": Path(excel_path).name,
        "summary": summarize(courses),
        "courses": courses,
    }


def summarize(courses: list[dict[str, Any]]) -> dict[str, Any]:
    total_minutes = sum(c["durationMinutes"] or 0 for c in courses)
    watched_minutes = sum((c["durationMinutes"] or 0) * c["progress"] / 100 for c in courses)
    categories: dict[str, int] = defaultdict(int)
    for course in courses:
        categories[course["category"]] += 1
    return {
        "courseCount": len(courses),
        "activeCount": sum(1 for c in courses if c["status"] == "active"),
        "unavailableCount": sum(1 for c in courses if c["status"] == "unavailable"),
        "practiceExamCount": sum(1 for c in courses if c["status"] == "practice_exam"),
        "completedCount": sum(1 for c in courses if c["progress"] >= 100),
        "inProgressCount": sum(1 for c in courses if 0 < c["progress"] < 100),
        "totalMinutes": round(total_minutes, 2),
        "watchedMinutes": round(watched_minutes, 2),
        "remainingMinutes": round(total_minutes - watched_minutes, 2),
        "lessonCount": sum(
            len(section["lessons"]) for c in courses for section in c["curriculum"]
        ),
        "categoryCount": len(categories),
    }
