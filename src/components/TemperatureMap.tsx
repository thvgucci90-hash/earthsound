import { anomalyColor, regions, type RegionId, type TemperatureDataset } from '../lib/temperature';

export function TemperatureMap({ dataset, monthIndex, region, label, description }: {
  dataset: TemperatureDataset;
  monthIndex: number;
  region: RegionId;
  label: string;
  description: string;
}) {
  const month = dataset.months[monthIndex];
  if (!month) return null;
  const bounds = region === 'global' ? null : regions[region];
  const xStart = bounds ? ((bounds.west + 180) / 360) * 720 : 0;
  const xWidth = bounds ? ((bounds.east - bounds.west) / 360) * 720 : 0;
  const yStart = bounds ? ((90 - bounds.north) / 180) * 360 : 0;
  const yHeight = bounds ? ((bounds.north - bounds.south) / 180) * 360 : 0;

  return <div className="temperature-map-frame">
    <svg viewBox="0 0 720 360" role="img" aria-labelledby="temperature-map-title temperature-map-desc" className="temperature-map-svg">
      <title id="temperature-map-title">{label}</title>
      <desc id="temperature-map-desc">{description}</desc>
      <rect x="0" y="0" width="720" height="360" fill="#081622" />
      {month.grid.map((row, rowIndex) => row.map((value, colIndex) => value === null ? null : (
        <rect key={`${rowIndex}-${colIndex}`} x={((dataset.longitudes[colIndex] ?? -179) + 180) * 2 - 2} y={(90 - (dataset.latitudes[rowIndex] ?? 0)) * 2 - 2} width="4.2" height="4.2" fill={anomalyColor(value)} />
      )))}
      <g className="map-graticule" aria-hidden="true">
        {[60, 30, 0, -30, -60].map((latitude) => <line key={`lat-${latitude}`} x1="0" x2="720" y1={((90 - latitude) / 180) * 360} y2={((90 - latitude) / 180) * 360} />)}
        {[-120, -60, 0, 60, 120].map((longitude) => <line key={`lon-${longitude}`} y1="0" y2="360" x1={((longitude + 180) / 360) * 720} x2={((longitude + 180) / 360) * 720} />)}
      </g>
      {bounds && <rect className="map-region-highlight" x={xStart} y={yStart} width={xWidth} height={yHeight} rx="2" />}
      <rect className="map-frame-outline" x="0.5" y="0.5" width="719" height="359" />
    </svg>
    <div className="map-corner-label"><span>NASA / GISS</span><span>2° × 2°</span></div>
  </div>;
}
