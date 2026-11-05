#!/usr/bin/env python3
"""Build the local 2021 EarthSound slice from NASA GISTEMP v4 sources.
Requires netCDF4 (and its NumPy dependency). Run from project root: python scripts/prepare_gistemp.py
"""
from __future__ import annotations
import csv
import gzip
import json
import shutil
from datetime import date
from pathlib import Path
from urllib.request import urlopen
from netCDF4 import Dataset, num2date
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'public' / 'data' / 'gistemp-2021.json'
GRID_URL = 'https://data.giss.nasa.gov/pub/gistemp/gistemp1200_GHCNv4_ERSSTv5.nc.gz'
GLOBAL_CSV_URL = 'https://data.giss.nasa.gov/gistemp/tabledata_v4/GLB.Ts+dSST.csv'
TMP = Path('/tmp/earthsound-gistemp.nc')
TMP_GZ = Path('/tmp/earthsound-gistemp.nc.gz')


def download(url: str, destination: Path) -> None:
    if destination.exists() and destination.stat().st_size > 1000:
        return
    destination.parent.mkdir(parents=True, exist_ok=True)
    with urlopen(url, timeout=90) as response, destination.open('wb') as output:
        shutil.copyfileobj(response, output)


def main() -> None:
    OUT.parent.mkdir(parents=True, exist_ok=True)
    download(GRID_URL, TMP_GZ)
    if not TMP.exists():
        with gzip.open(TMP_GZ, 'rb') as source, TMP.open('wb') as output:
            shutil.copyfileobj(source, output)
    with urlopen(GLOBAL_CSV_URL, timeout=60) as response:
        rows = list(csv.reader(line.decode('utf-8') for line in response.readlines()))
    header = next(row for row in rows if row and row[0] == 'Year')
    global_row = next(row for row in rows if row and row[0] == '2021')
    global_months = {header[i]: (float(global_row[i]) if global_row[i] not in ('***', '') else None) for i in range(1, 13)}

    with Dataset(TMP) as dataset:
        latitudes = np.asarray(dataset.variables['lat'][:], dtype=float)
        raw_longitudes = np.asarray(dataset.variables['lon'][:], dtype=float)
        longitudes = ((raw_longitudes + 180) % 360) - 180
        lon_order = np.argsort(longitudes)
        longitudes = longitudes[lon_order]
        dates = num2date(dataset.variables['time'][:], dataset.variables['time'].units, calendar=getattr(dataset.variables['time'], 'calendar', 'standard'), only_use_cftime_datetimes=False)
        value_var = dataset.variables['tempanomaly']
        names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        months = []
        for month_number, name in enumerate(names, start=1):
            matching = [index for index, stamp in enumerate(dates) if stamp.year == 2021 and stamp.month == month_number]
            if not matching:
                raise RuntimeError(f'Missing NASA grid for 2021 month {month_number}')
            grid = np.ma.asarray(value_var[matching[0], :, :])[:, lon_order]
            values = [[None if np.ma.is_masked(value) or not np.isfinite(value) else round(float(value), 3) for value in row] for row in grid]
            months.append({'name': name, 'globalAnomalyC': global_months[name], 'grid': values})
        result = {
            'schema': 'earthsound-gistemp-2021-v1',
            'source': GRID_URL,
            'globalSeriesSource': GLOBAL_CSV_URL,
            'accessed': date.today().isoformat(),
            'title': 'NASA GISS Surface Temperature Analysis (GISTEMP v4)',
            'baseline': '1951–1980',
            'units': 'K anomaly; numerically equivalent to °C anomaly',
            'smoothing': '1200 km land-ocean temperature index, regular 2° × 2° grid',
            'latitudes': [round(float(value), 2) for value in latitudes],
            'longitudes': [round(float(value), 2) for value in longitudes],
            'months': months,
        }
    OUT.write_text(json.dumps(result, separators=(',', ':'), ensure_ascii=False), encoding='utf-8')
    print(f'Wrote {OUT} ({OUT.stat().st_size:,} bytes, {len(result["months"])} months)')
    print('2021 global anomalies (°C):', ', '.join(f'{m["name"]}={m["globalAnomalyC"]}' for m in result['months']))


if __name__ == '__main__':
    main()
