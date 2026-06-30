#!/usr/bin/env python3
"""Subset Partido municipalities from source boundary GeoJSON and enrich with MADIA metadata."""

from __future__ import annotations

import json
import math
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
REPO = ROOT / "data" / "repository"
OUT = ROOT / "data" / "geojson"

MUNICIPALITY_META = {
    "0501711000": {
        "municipality_id": "MADIA-MUN-CAR",
        "municipality_slug": "caramoan",
        "municipality_page_route": "/municipalities/caramoan",
    },
    "0501714000": {
        "municipality_id": "MADIA-MUN-GAR",
        "municipality_slug": "garchitorena",
        "municipality_page_route": "/municipalities/garchitorena",
    },
    "0501715000": {
        "municipality_id": "MADIA-MUN-GOA",
        "municipality_slug": "goa",
        "municipality_page_route": "/municipalities/goa",
    },
    "0501717000": {
        "municipality_id": "MADIA-MUN-LAG",
        "municipality_slug": "lagonoy",
        "municipality_page_route": "/municipalities/lagonoy",
    },
    "0501729000": {
        "municipality_id": "MADIA-MUN-PRE",
        "municipality_slug": "presentacion",
        "municipality_page_route": "/municipalities/presentacion",
    },
    "0501731000": {
        "municipality_id": "MADIA-MUN-SAG",
        "municipality_slug": "sagnay",
        "municipality_page_route": "/municipalities/sagnay",
    },
    "0501733000": {
        "municipality_id": "MADIA-MUN-SJO",
        "municipality_slug": "san-jose",
        "municipality_page_route": "/municipalities/san-jose",
    },
    "0501735000": {
        "municipality_id": "MADIA-MUN-SIR",
        "municipality_slug": "siruma",
        "municipality_page_route": "/municipalities/siruma",
    },
    "0501736000": {
        "municipality_id": "MADIA-MUN-TIG",
        "municipality_slug": "tigaon",
        "municipality_page_route": "/municipalities/tigaon",
    },
    "0501737000": {
        "municipality_id": "MADIA-MUN-TIN",
        "municipality_slug": "tinambac",
        "municipality_page_route": "/municipalities/tinambac",
    },
}


def ring_centroid(ring: list[list[float]]) -> tuple[float, float]:
    if len(ring) < 3:
        return 0.0, 0.0
    area = 0.0
    cx = 0.0
    cy = 0.0
    for i in range(len(ring) - 1):
        x0, y0 = ring[i]
        x1, y1 = ring[i + 1]
        f = x0 * y1 - x1 * y0
        area += f
        cx += (x0 + x1) * f
        cy += (y0 + y1) * f
    area *= 0.5
    if area == 0:
        xs = [p[0] for p in ring]
        ys = [p[1] for p in ring]
        return sum(xs) / len(xs), sum(ys) / len(ys)
    return cx / (6 * area), cy / (6 * area)


def geometry_centroid(geometry: dict) -> tuple[float, float]:
    gtype = geometry["type"]
    coords = geometry["coordinates"]
    if gtype == "Polygon":
        return ring_centroid(coords[0])
    if gtype == "MultiPolygon":
        best = None
        best_area = -1.0
        for polygon in coords:
            ring = polygon[0]
            xs = [p[0] for p in ring]
            ys = [p[1] for p in ring]
            area = (max(xs) - min(xs)) * (max(ys) - min(ys))
            if area > best_area:
                best_area = area
                best = ring_centroid(ring)
        return best or (0.0, 0.0)
    return 0.0, 0.0


def bbox(geometry: dict) -> list[float]:
    xs: list[float] = []
    ys: list[float] = []

    def walk(obj):
        if isinstance(obj, list):
            if obj and isinstance(obj[0], (int, float)):
                xs.append(float(obj[0]))
                ys.append(float(obj[1]))
            else:
                for item in obj:
                    walk(item)

    walk(geometry.get("coordinates", []))
    return [min(xs), min(ys), max(xs), max(ys)] if xs else [0, 0, 0, 0]


def simplify_coords(coords, tolerance: float):
    if tolerance <= 0:
        return coords
    if isinstance(coords[0], (int, float)):
        return coords
    step = max(1, int(1 / tolerance))
    return [simplify_coords(c, tolerance) for i, c in enumerate(coords) if i % step == 0]


def load_summaries() -> dict[str, dict]:
    path = REPO / "municipality_map_summaries.json"
    if not path.exists():
        return {}
    data = json.loads(path.read_text(encoding="utf-8"))
    return {item["official_psgc_code"]: item for item in data}


def enrich_feature(feature: dict, summaries: dict[str, dict]) -> dict:
    props = feature["properties"]
    psgc = str(props.get("psgc_code") or props.get("ADM3_PCODE") or "")
    meta = MUNICIPALITY_META.get(psgc, {})
    summary = summaries.get(psgc, {})
    lon, lat = geometry_centroid(feature["geometry"])
    box = bbox(feature["geometry"])
    name = props.get("ADM3_EN") or props.get("psgc_name") or summary.get("municipality_name", "")
    ascii_name = (
        summary.get("municipality_name")
        or name.replace("ñ", "n").replace("Ñ", "N")
    )
    return {
        "type": "Feature",
        "geometry": feature["geometry"],
        "properties": {
            "municipality_id": meta.get("municipality_id", ""),
            "municipality_name": name,
            "municipality_name_ascii": ascii_name,
            "municipality_slug": meta.get("municipality_slug", ""),
            "official_psgc_code": psgc,
            "centroid_latitude": round(lat, 6),
            "centroid_longitude": round(lon, 6),
            "label_latitude": round(lat, 6),
            "label_longitude": round(lon, 6),
            "bounding_box": box,
            "geometry_type": feature["geometry"]["type"],
            "boundary_source": "Philippine Boundaries & PSGC v2026.4.13.0 (subset)",
            "boundary_source_date": "2026-06-16",
            "boundary_accuracy": "indicative_administrative",
            "source_license": "MIT (code); data attribution PSA/NAMRIA — confirm redistribution terms",
            "required_attribution": "© PSA / NAMRIA administrative boundaries via bendlikeabamboo/barangay-boundaries-repository",
            "date_validated": "2026-06-29",
            "verification_status": "partially_verified",
            "cover_photo_record_id": summary.get("cover_photo_id"),
            "short_description": summary.get("short_description", ""),
            "municipality_page_route": meta.get("municipality_page_route", ""),
            "featured_attraction": summary.get("featured_attraction"),
            "attraction_count": summary.get("attraction_count", 0),
            "accommodation_count": summary.get("accommodation_count", 0),
            "restaurant_count": summary.get("restaurant_count", 0),
            "verified_transportation_route_count": summary.get(
                "verified_transportation_route_count", 0
            ),
            "tourism_service_count": summary.get("tourism_service_count", 0),
            "overall_data_verification_status": summary.get(
                "overall_data_verification_status", "PARTIALLY VERIFIED"
            ),
        },
    }


def main() -> int:
    source = REPO / "municipalities.geojson"
    if not source.exists():
        print("Missing municipalities.geojson — download boundary source first.", file=sys.stderr)
        return 1

    OUT.mkdir(parents=True, exist_ok=True)
    geo = json.loads(source.read_text(encoding="utf-8"))
    summaries = load_summaries()
    psgc_codes = set(MUNICIPALITY_META.keys())
    features = []
    for feature in geo["features"]:
        psgc = str(feature["properties"].get("psgc_code", ""))
        if psgc in psgc_codes:
            features.append(enrich_feature(feature, summaries))

    if len(features) != 10:
        print(f"Expected 10 municipalities, found {len(features)}", file=sys.stderr)
        return 1

    master = {"type": "FeatureCollection", "features": features}
    (OUT / "partido_municipalities_master.geojson").write_text(
        json.dumps(master, separators=(",", ":")), encoding="utf-8"
    )

    web_features = []
    for feature in features:
        web_features.append(
            {
                "type": "Feature",
                "geometry": feature["geometry"],
                "properties": feature["properties"],
            }
        )
    (OUT / "partido_municipalities_web.geojson").write_text(
        json.dumps({"type": "FeatureCollection", "features": web_features}, separators=(",", ":")),
        encoding="utf-8",
    )

    light_features = []
    for feature in features:
        light_geom = {
            "type": feature["geometry"]["type"],
            "coordinates": simplify_coords(feature["geometry"]["coordinates"], 0.002),
        }
        light_features.append(
            {
                "type": "Feature",
                "geometry": light_geom,
                "properties": {
                    k: feature["properties"][k]
                    for k in [
                        "municipality_id",
                        "municipality_name",
                        "municipality_slug",
                        "official_psgc_code",
                        "centroid_latitude",
                        "centroid_longitude",
                        "municipality_page_route",
                    ]
                },
            }
        )
    (OUT / "partido_municipalities_light.geojson").write_text(
        json.dumps({"type": "FeatureCollection", "features": light_features}, separators=(",", ":")),
        encoding="utf-8",
    )

    centroids = []
    for feature in features:
        p = feature["properties"]
        centroids.append(
            {
                "municipality_id": p["municipality_id"],
                "municipality_name": p["municipality_name"],
                "municipality_slug": p["municipality_slug"],
                "official_psgc_code": p["official_psgc_code"],
                "centroid_latitude": p["centroid_latitude"],
                "centroid_longitude": p["centroid_longitude"],
                "label_latitude": p["label_latitude"],
                "label_longitude": p["label_longitude"],
            }
        )
    import csv

    with (OUT / "partido_municipality_centroids.csv").open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=list(centroids[0].keys()))
        writer.writeheader()
        writer.writerows(centroids)

    print(f"Wrote {len(features)} Partido municipality boundaries to {OUT}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
