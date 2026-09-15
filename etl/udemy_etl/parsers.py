"""Parsers para los formatos inconsistentes del export de Udemy."""

from __future__ import annotations

import math
import re

_NBSP = "\u00a0"

_DURATION_TOKEN = re.compile(r"(\d+(?:[.,]\d+)?)\s*(hrs?|hours?|h|mins?|minutes?|m|s|segs?)\b")
_CLOCK = re.compile(r"^\d{1,3}(?::\d{1,2}){1,2}$")
_QUESTIONS = re.compile(r"(\d[\d.,]*)\s*(questions?|preguntas?)", re.IGNORECASE)
_NUMBER = re.compile(r"\d[\d.,]*")


def _clean(value: object) -> str:
    if value is None:
        return ""
    if isinstance(value, float) and math.isnan(value):
        return ""
    return str(value).replace(_NBSP, " ").strip()


def parse_duration_to_minutes(value: object) -> float | None:
    """Convierte las duraciones de Udemy a minutos.

    Acepta ``"4h 56m"``, ``"2 hr 5min"``, ``"19min"``, ``"4:46"`` (mm:ss),
    ``"1:02:33"`` (hh:mm:ss) y números sueltos (minutos). Devuelve ``None``
    cuando el valor está vacío o no contiene ninguna duración
    (por ejemplo ``"300 questions"``).
    """
    text = _clean(value)
    if not text:
        return None

    if _CLOCK.match(text):
        parts = [int(p) for p in text.split(":")]
        if len(parts) == 2:
            minutes, seconds = parts
            return round(minutes + seconds / 60, 4)
        hours, minutes, seconds = parts
        return round(hours * 60 + minutes + seconds / 60, 4)

    if _QUESTIONS.search(text):
        return None

    total = 0.0
    found = False
    for amount, unit in _DURATION_TOKEN.findall(text.lower()):
        number = float(amount.replace(",", "."))
        unit = unit.rstrip(".")
        if unit.startswith("h"):
            total += number * 60
        elif unit.startswith("s"):
            total += number / 60
        else:
            total += number
        found = True
    if found:
        return round(total, 4)

    bare = re.fullmatch(r"\d+(?:[.,]\d+)?", text)
    if bare:
        return round(float(text.replace(",", ".")), 4)
    return None


def format_duration(minutes: float | None) -> str | None:
    """Formatea minutos como ``"4h 56m"`` (o ``"56m"`` si dura menos de una hora)."""
    if minutes is None:
        return None
    total = int(round(minutes))
    hours, mins = divmod(total, 60)
    return f"{hours}h {mins}m" if hours else f"{mins}m"


def split_technologies(value: object) -> list[str]:
    """Separa la columna ``Tecnologías / Temas`` en una lista limpia y sin duplicados."""
    text = _clean(value)
    if not text:
        return []
    seen: dict[str, str] = {}
    for raw in re.split(r"[|/,;]|\band\b", text):
        item = re.sub(r"\s+", " ", raw).strip(" -·")
        if not item or item.lower() in {"nan", "none", "n/a"}:
            continue
        seen.setdefault(item.casefold(), item)
    return list(seen.values())


def split_instructors(value: object) -> list[str]:
    """Separa instructores; el export los une con ``|``."""
    text = _clean(value)
    if not text:
        return []
    seen: dict[str, str] = {}
    for raw in text.split("|"):
        item = re.sub(r"\s+", " ", raw).strip()
        if item and item.lower() != "nan":
            seen.setdefault(item.casefold(), item)
    return list(seen.values())


def parse_int(value: object) -> int | None:
    """Lee enteros escritos como ``"5,541"``, ``"25.307"``, ``12.0`` o ``"300 questions"``."""
    if isinstance(value, bool):
        return None
    if isinstance(value, (int, float)):
        if isinstance(value, float) and math.isnan(value):
            return None
        return int(value)
    text = _clean(value)
    if not text:
        return None
    match = _NUMBER.search(text)
    if not match:
        return None
    digits = re.sub(r"[.,]", "", match.group())
    return int(digits) if digits else None


def parse_questions(value: object) -> int | None:
    """Extrae el número de preguntas de textos como ``"75 questions"``."""
    text = _clean(value)
    if not text:
        return None
    match = _QUESTIONS.search(text)
    if match:
        return int(re.sub(r"[.,]", "", match.group(1)))
    return parse_int(text)


def clamp_progress(value: object) -> int:
    """Normaliza el progreso al rango 0-100."""
    number = parse_int(value)
    if number is None:
        return 0
    return max(0, min(100, number))


def category_from_technologies(technologies: list[str]) -> str:
    """Udemy deja la categoría al final de la lista de temas."""
    return technologies[-1] if technologies else "Sin categoría"


def clean_text(value: object) -> str | None:
    text = _clean(value)
    return re.sub(r"\s+", " ", text) or None
