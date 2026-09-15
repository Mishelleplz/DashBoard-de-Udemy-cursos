"""Entry point del ETL: Excel de Udemy -> courses.json."""

from __future__ import annotations

import argparse
import json
from pathlib import Path

from .transform import build_dataset

REPO_ROOT = Path(__file__).resolve().parents[2]
DEFAULT_EXCEL = REPO_ROOT / "data" / "udemy_biblioteca_completa.xlsx"
DEFAULT_OUTPUT = REPO_ROOT / "frontend" / "public" / "courses.json"


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Genera courses.json desde el export de Udemy.")
    parser.add_argument("--excel", type=Path, default=DEFAULT_EXCEL, help="Ruta al .xlsx de Udemy")
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT, help="Ruta del JSON de salida")
    parser.add_argument("--indent", type=int, default=None, help="Indentación del JSON (por defecto compacto)")
    args = parser.parse_args(argv)

    dataset = build_dataset(args.excel)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    with args.output.open("w", encoding="utf-8") as handle:
        json.dump(dataset, handle, ensure_ascii=False, indent=args.indent)

    summary = dataset["summary"]
    size_mb = args.output.stat().st_size / 1_000_000
    print(
        f"{args.output} · {summary['courseCount']} cursos · "
        f"{summary['lessonCount']} lecciones · {size_mb:.1f} MB"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
