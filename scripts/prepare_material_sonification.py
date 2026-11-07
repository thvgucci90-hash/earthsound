#!/usr/bin/env python3
"""Generate the small local data snapshot used by NASA material sonification.

Run from the project root after installing requirements-data.txt:
    python scripts/prepare_material_sonification.py
Only official NASA Ozone Watch, NOAA GML and NASA GISTEMP tables are downloaded.
No video pixels, missing-value interpolation or synthetic observations are used.
"""
from __future__ import annotations

import csv
import json
from datetime import date
from io import StringIO
from time import sleep
from urllib.error import URLError
from pathlib import Path
from urllib.request import Request, urlopen

import pandas as pd

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'src' / 'data' / 'materialSonificationSeries.ts'
OZONE_URL = 'https://ozonewatch.gsfc.nasa.gov/statistics/annual_data.html'
CO2_URL = 'https://gml.noaa.gov/webdata/ccgg/trends/co2/co2_mm_mlo.csv'
GISTEMP_URL = 'https://data.giss.nasa.gov/gistemp/tabledata_v4/GLB.Ts+dSST.csv'
USER_AGENT = 'EarthSound scientific sonification data preparation'
MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']


def download_text(url: str) -> str:
    request = Request(url, headers={'User-Agent': USER_AGENT})
    last_error: Exception | None = None
    for attempt in range(3):
        try:
            with urlopen(request, timeout=60) as response:
                if response.status != 200:
                    raise RuntimeError(f'HTTP {response.status} while downloading {url}')
                return response.read().decode('utf-8', 'replace')
        except (URLError, TimeoutError) as error:
            last_error = error
            if attempt < 2:
                sleep(2 ** attempt)
    raise RuntimeError(f'Unable to download official source after three attempts: {url}') from last_error


def as_number(value: object) -> float | None:
    if value is None or pd.isna(value):
        return None
    try:
        number = float(str(value).strip())
    except (TypeError, ValueError):
        return None
    if not pd.notna(number):
        return None
    return number


def as_year(value: object) -> int | None:
    try:
        return int(float(str(value).strip()))
    except (TypeError, ValueError):
        return None


def ozone_annual_series() -> tuple[list[dict[str, object]], list[dict[str, object]], list[dict[str, object]]]:
    tables = pd.read_html(StringIO(download_text(OZONE_URL)))
    if not tables:
        raise RuntimeError('NASA Ozone Watch annual table was not found')
    table = tables[0]
    by_year: dict[int, tuple[str | None, float | None, str | None, float | None]] = {}
    for row in table.itertuples(index=False, name=None):
        year = as_year(row[0] if row else None)
        if year is None:
            continue
        max_area_date = str(row[1]).strip() if len(row) > 1 and pd.notna(row[1]) else None
        max_area = as_number(row[2] if len(row) > 2 else None)
        min_ozone_date = str(row[3]).strip() if len(row) > 3 and pd.notna(row[3]) else None
        min_ozone = as_number(row[4] if len(row) > 4 else None)
        by_year[year] = (max_area_date, max_area, min_ozone_date, min_ozone)

    def build(start: int, end: int, metric: str) -> list[dict[str, object]]:
        points: list[dict[str, object]] = []
        for year in range(start, end + 1):
            record = by_year.get(year)
            if metric == 'minimum':
                value = record[3] if record else None
                detail = record[2] if record else None
            else:
                value = record[1] if record else None
                detail = record[0] if record else None
            point: dict[str, object] = {'label': str(year), 'year': year, 'value': value}
            if detail:
                point['detail'] = detail
            points.append(point)
        return points

    return build(1979, 2018, 'minimum'), build(1979, 2004, 'minimum'), build(1979, 2004, 'area')


def co2_monthly_series() -> list[dict[str, object]]:
    text = download_text(CO2_URL)
    header_index = next((i for i, line in enumerate(text.splitlines()) if line.startswith('year,month,')), None)
    if header_index is None:
        raise RuntimeError('NOAA Mauna Loa monthly CSV header was not found')
    reader = csv.DictReader(text.splitlines()[header_index:])
    points: list[dict[str, object]] = []
    for row in reader:
        year = as_year(row.get('year'))
        month = as_year(row.get('month'))
        if year is None or month is None or not (1980 <= year <= 2014) or (year == 2014 and month > 9):
            continue
        value = as_number(row.get('average'))
        if value is not None and value < 0:
            value = None
        points.append({'label': f'{year}-{month:02d}', 'year': year, 'month': month, 'value': value})
    if len(points) < 300:
        raise RuntimeError(f'NOAA CO₂ series unexpectedly short: {len(points)} monthly points')
    return points


def gistemp_rows() -> list[dict[str, str]]:
    lines = download_text(GISTEMP_URL).splitlines()
    header_index = next((i for i, line in enumerate(lines) if line.startswith('Year,Jan,Feb,')), None)
    if header_index is None:
        raise RuntimeError('NASA GISTEMP CSV header was not found')
    return list(csv.DictReader(lines[header_index:]))


def gistemp_series() -> tuple[list[dict[str, object]], list[dict[str, object]]]:
    rows = gistemp_rows()
    annual: dict[int, float | None] = {}
    monthly: list[dict[str, object]] = []
    for row in rows:
        year = as_year(row.get('Year'))
        if year is None:
            continue
        annual[year] = as_number(row.get('J-D'))
        for month_index, month_name in enumerate(MONTHS, start=1):
            value = as_number(row.get(month_name))
            monthly.append({'label': f'{year}-{month_index:02d}', 'year': year, 'month': month_index, 'value': value})

    temperature_rolling: list[dict[str, object]] = []
    for start in range(1880, 2018):
        window = [annual.get(year) for year in range(start, start + 5)]
        value = None if any(item is None for item in window) else round(sum(item for item in window if item is not None) / 5, 4)
        temperature_rolling.append({'label': f'{start}–{start + 4}', 'year': start, 'value': value})

    available_months = [index for index, point in enumerate(monthly) if int(point['year']) >= 1880 and point['value'] is not None]
    if not available_months:
        raise RuntimeError('NASA GISTEMP monthly series has no numeric values')
    last_available_index = max(available_months)
    climate_monthly = [point for point in monthly[:last_available_index + 1] if int(point['year']) >= 1880]
    if len(temperature_rolling) < 130:
        raise RuntimeError('NASA GISTEMP data did not contain the expected historical coverage')
    return temperature_rolling, climate_monthly


def main() -> None:
    ozone_min, ozone_sequence_min, ozone_area = ozone_annual_series()
    co2 = co2_monthly_series()
    temperature_rolling, climate_monthly = gistemp_series()
    snapshot = {
        'schema': 'earthsound-material-sonification-v1',
        'accessed': date.today().isoformat(),
        'sources': {'ozoneAnnual': OZONE_URL, 'co2Monthly': CO2_URL, 'gistempGlobal': GISTEMP_URL},
        'series': {
            'ozoneAnnualMinimum': ozone_min,
            'ozoneSequenceAnnualMinimum': ozone_sequence_min,
            'ozoneSequenceAnnualMaximumArea': ozone_area,
            'co2MaunaLoaMonthly': co2,
            'temperatureGistempFiveYearRollingMean': temperature_rolling,
            'climateSpiralGistempMonthly': climate_monthly,
        },
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    rendered = '/* Generated by scripts/prepare_material_sonification.py; do not edit by hand. */\n'
    rendered += 'export const materialSonificationSnapshot = ' + json.dumps(snapshot, ensure_ascii=False, separators=(',', ':')) + ' as const;\n'
    OUT.write_text(rendered, encoding='utf-8')
    print(f'Wrote {OUT} ({OUT.stat().st_size:,} bytes)')
    for name, points in snapshot['series'].items():
        print(f'{name}: {len(points)} points')
    print(f"Accessed: {snapshot['accessed']}")


if __name__ == '__main__':
    main()
