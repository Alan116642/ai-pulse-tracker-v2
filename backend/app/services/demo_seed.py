from __future__ import annotations

import json
from pathlib import Path
from typing import Any


def load_demo_payload(seed_path: Path) -> dict[str, Any]:
    with seed_path.open("r", encoding="utf-8") as file:
        return json.load(file)
