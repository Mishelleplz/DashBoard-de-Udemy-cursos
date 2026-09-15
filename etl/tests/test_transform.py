from pathlib import Path

import pandas as pd
import pytest

from udemy_etl.transform import build_dataset

EXCEL = Path(__file__).resolve().parents[2] / "data" / "udemy_biblioteca_completa.xlsx"


@pytest.fixture(scope="module")
def dataset():
    if not EXCEL.exists():
        pytest.skip(f"Falta el export de Udemy en {EXCEL}")
    return build_dataset(EXCEL)


def test_dataset_has_every_course_from_the_summary_sheet(dataset):
    expected = len(pd.read_excel(EXCEL, "Resumen"))
    assert dataset["summary"]["courseCount"] == expected
    assert len({course["id"] for course in dataset["courses"]}) == expected


def test_courses_are_normalized(dataset):
    for course in dataset["courses"]:
        assert course["status"] in {"active", "unavailable", "practice_exam"}
        assert 0 <= course["progress"] <= 100
        assert isinstance(course["technologies"], list)
        assert course["durationMinutes"] is None or course["durationMinutes"] > 0


def test_curriculum_and_objectives_are_attached(dataset):
    by_id = {course["id"]: course for course in dataset["courses"]}
    go_course = by_id[7014617]
    assert go_course["curriculum"][0]["title"] == "Introduction to Go"
    assert go_course["curriculum"][0]["lessons"][0]["freePreview"] is True
    assert go_course["objectives"]


def test_practice_exams_and_unavailable_courses_keep_their_metadata(dataset):
    by_id = {course["id"]: course for course in dataset["courses"]}
    exam = by_id[7160771]
    assert exam["status"] == "practice_exam"
    assert exam["totalQuestions"] == 300
    assert len(exam["exams"]) == 4

    removed = by_id[6008398]
    assert removed["status"] == "unavailable"
    assert removed["unavailableReason"]
