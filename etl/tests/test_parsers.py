import math

import pytest

from udemy_etl.parsers import (
    category_from_technologies,
    clamp_progress,
    format_duration,
    parse_duration_to_minutes,
    parse_int,
    parse_questions,
    split_instructors,
    split_technologies,
)


@pytest.mark.parametrize(
    ("raw", "expected"),
    [
        ("4h 56m", 296),
        ("46h 8m", 2768),
        ("19min", 19),
        ("2hr 5min", 125),
        ("3hr", 180),
        ("4:46", 4 + 46 / 60),
        ("1:02:33", 62 + 33 / 60),
        (45, 45),
    ],
)
def test_parse_duration_to_minutes(raw, expected):
    assert parse_duration_to_minutes(raw) == pytest.approx(expected, abs=0.01)


@pytest.mark.parametrize("raw", [None, "", "nan", float("nan"), "300 questions", "Sin datos"])
def test_parse_duration_returns_none_for_missing_or_non_duration(raw):
    assert parse_duration_to_minutes(raw) is None


def test_format_duration():
    assert format_duration(296) == "4h 56m"
    assert format_duration(19) == "19m"
    assert format_duration(None) is None


def test_split_technologies_trims_and_dedupes():
    raw = "Node.Js | Typescript |  Next.js | node.js | Web Development | Development"
    assert split_technologies(raw) == [
        "Node.Js",
        "Typescript",
        "Next.js",
        "Web Development",
        "Development",
    ]


@pytest.mark.parametrize("raw", [None, "", float("nan"), "  |  | nan"])
def test_split_technologies_handles_missing(raw):
    assert split_technologies(raw) == []


def test_category_is_last_technology():
    techs = split_technologies("Docker | Software Development Tools | Development")
    assert category_from_technologies(techs) == "Development"
    assert category_from_technologies([]) == "Sin categoría"


def test_split_instructors():
    raw = "Alvaro Chirou | Ciberseguridad Hacking Seguridad Informática"
    assert split_instructors(raw) == [
        "Alvaro Chirou",
        "Ciberseguridad Hacking Seguridad Informática",
    ]


def test_parse_int_handles_thousand_separators_and_nulls():
    assert parse_int("5,541") == 5541
    assert parse_int("25.307") == 25307
    assert parse_int(12.0) == 12
    assert parse_int(float("nan")) is None
    assert parse_int("") is None


def test_parse_questions():
    assert parse_questions("300 questions") == 300
    assert parse_questions("75 preguntas") == 75
    assert parse_questions(None) is None


def test_clamp_progress():
    assert clamp_progress(100) == 100
    assert clamp_progress(-5) == 0
    assert clamp_progress(140) == 100
    assert clamp_progress(math.nan) == 0
