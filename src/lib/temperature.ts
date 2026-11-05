export type TemperatureMonth = {
  name: string;
  globalAnomalyC: number | null;
  grid: (number | null)[][];
};
export type TemperatureDataset = {
  schema: string;
  title: string;
  source: string;
  baseline: string;
  units: string;
  latitudes: number[];
  longitudes: number[];
  months: TemperatureMonth[];
};
export type RegionId = 'global' | 'northAmerica' | 'southAmerica' | 'europe' | 'africa' | 'asia' | 'oceania' | 'antarctica' | 'arctic';
export type RegionBounds = { south: number; north: number; west: number; east: number };

export const regions: Record<Exclude<RegionId, 'global'>, RegionBounds> = {
  northAmerica: { south: 5, north: 83, west: -170, east: -30 },
  southAmerica: { south: -56, north: 13, west: -82, east: -34 },
  europe: { south: 35, north: 72, west: -12, east: 45 },
  africa: { south: -35, north: 37, west: -18, east: 52 },
  asia: { south: 5, north: 77, west: 45, east: 180 },
  oceania: { south: -50, north: 0, west: 110, east: 180 },
  antarctica: { south: -90, north: -60, west: -180, east: 180 },
  arctic: { south: 60, north: 90, west: -180, east: 180 },
};

export function regionAverageC(dataset: TemperatureDataset, monthIndex: number, region: RegionId): number | null {
  const month = dataset.months[monthIndex];
  if (!month) return null;
  if (region === 'global') return month.globalAnomalyC;
  const bounds = regions[region];
  let weighted = 0;
  let totalWeight = 0;
  dataset.latitudes.forEach((latitude, row) => {
    if (latitude < bounds.south || latitude > bounds.north) return;
    const weight = Math.cos((latitude * Math.PI) / 180);
    dataset.longitudes.forEach((longitude, col) => {
      if (longitude < bounds.west || longitude > bounds.east) return;
      const value = month.grid[row]?.[col];
      if (value === null || value === undefined || !Number.isFinite(value)) return;
      weighted += value * weight;
      totalWeight += weight;
    });
  });
  return totalWeight ? weighted / totalWeight : null;
}

export function regionSeriesC(dataset: TemperatureDataset, region: RegionId) {
  return dataset.months.map((_, index) => regionAverageC(dataset, index, region));
}

export function regionAnnualMeanC(dataset: TemperatureDataset, region: RegionId): number | null {
  const values = regionSeriesC(dataset, region).filter((value): value is number => value !== null && Number.isFinite(value));
  if (!values.length) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function celsiusAnomalyToFahrenheit(value: number | null | undefined) {
  return value === null || value === undefined || !Number.isFinite(value) ? null : value * 1.8;
}

export function anomalyColor(celsius: number | null | undefined) {
  if (celsius === null || celsius === undefined || !Number.isFinite(celsius)) return 'transparent';
  const amount = Math.max(-2.2, Math.min(2.2, celsius));
  const stops = amount < 0
    ? { start: [29, 84, 151], end: [17, 30, 49], t: (amount + 2.2) / 2.2 }
    : { start: [17, 30, 49], end: [219, 90, 43], t: amount / 2.2 };
  const rgb = stops.start.map((start, index) => {
    const end = stops.end[index] ?? start;
    return Math.round(start + (end - start) * stops.t);
  });
  return `rgb(${rgb[0]} ${rgb[1]} ${rgb[2]})`;
}

export function anomalyToTone(valueC: number | null | undefined) {
  const value = Math.max(-2.2, Math.min(2.2, valueC ?? 0));
  const normalized = (value + 2.2) / 4.4;
  return {
    frequency: Math.round(165 + normalized * 495),
    intensity: Number((0.08 + normalized * 0.13).toFixed(3)),
  };
}
