import {
  Leaf,
  Zap,
  Clock,
  Navigation,
  Fuel,
  CheckCircle2,
  TrendingDown,
} from 'lucide-react';
import { calculateDynamicMetrics } from '../services/routingService';

export default function RouteCard({
  route,
  vehicle,
  isMetric,
  isSelected,
  onSelect,
  baselineMetrics, // typically fastest route metrics for comparison
}) {
  const metrics = calculateDynamicMetrics(route, vehicle, isMetric);

  const isEco = route.badgeType === 'eco';
  const isFastest = route.badgeType === 'fastest';
  const isShortest = route.badgeType === 'shortest';

 // Calculate savings against the fastest route baseline using precise values.

let co2DiffPercent = 0;
let fuelDiffPercent = 0;

if (baselineMetrics) {
const baselineCo2 = Number(
baselineMetrics.rawCo2 ?? baselineMetrics.totalCo2
);

const routeCo2 = Number(
metrics.rawCo2 ?? metrics.totalCo2
);

const baselineFuel = Number(
baselineMetrics.rawFuel ?? baselineMetrics.totalFuel
);

const routeFuel = Number(
metrics.rawFuel ?? metrics.totalFuel
);

if (baselineCo2 > 0) {
co2DiffPercent =
((routeCo2 - baselineCo2) / baselineCo2) * 100;
}

if (baselineFuel > 0) {
fuelDiffPercent =
((routeFuel - baselineFuel) / baselineFuel) * 100;
}
}


if (baselineMetrics && baselineMetrics.totalFuel > 0) {
  const baselineFuel = Number(baselineMetrics.totalFuel);
  const routeFuel = Number(metrics.totalFuel);

  fuelDiffPercent =
    ((routeFuel - baselineFuel) / baselineFuel) * 100;
}

// Round only for display
const displayedCo2DiffPercent = Math.round(co2DiffPercent);
const displayedFuelDiffPercent = Math.round(fuelDiffPercent);

  // Eco Score Color Helper
  const getScoreBadgeClass = (score) => {
    if (score >= 90) return 'score-green';
    if (score >= 75) return 'score-amber';
    return 'score-orange';
  };
  // Format extra eco-route time into hours and minutes
const formatExtraTime = (minutes) => {
  const totalMinutes = Math.max(0, Math.round(minutes || 0));
  const hours = Math.floor(totalMinutes / 60);
  const remainingMinutes = totalMinutes % 60;

  if (hours > 0) {
    return `+${hours}h ${remainingMinutes}m`;
  }

  return `+${remainingMinutes}m`;
};

  return (
    <div
      className={`route-card ${isSelected ? 'selected' : ''} ${isEco ? 'card-eco' : ''}`}
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelect()}
    >
      {/* Top Header with Title & Badge */}
      <div className="card-header">
        <div className="title-area">
          <div className="route-type-row">
            {isEco && <Leaf className="badge-icon text-emerald-400" size={18} />}
            {isFastest && <Zap className="badge-icon text-blue-400" size={18} />}
            {isShortest && <Navigation className="badge-icon text-amber-400" size={18} />}
            <h3 className="route-title">{route.name}</h3>
          </div>
          <span className={`route-badge ${route.badgeType}`}>
            {route.tag}
          </span>
        </div>

        {/* Eco Score Gauge */}
        <div className="eco-score-badge-wrapper" title={`Eco Score: ${metrics.ecoScore}/100`}>
          <div className={`eco-score-pill ${getScoreBadgeClass(metrics.ecoScore)}`}>
            <span className="score-label">Eco Score</span>
            <span className="score-value">{metrics.ecoScore}</span>
            <span className="score-max">/100</span>
          </div>
        </div>
      </div>

      {/* Main Metric Stats Grid */}
      <div className="card-metrics-grid">
        {/* Estimated Travel Time */}
        <div className="metric-box">
          <div className="metric-header">
            <Clock size={14} className="metric-icon" />
            <span className="metric-title">Travel Time</span>
          </div>
          <div className="metric-val">{metrics.timeFormatted}</div>
          <div className="metric-sub">
            {isFastest && <span className="sub-fastest">Fastest transit</span>}
            {isEco && (
              <span className="sub-neutral">
  {formatExtraTime(
    route.baseDurationMinutes -
      (baselineMetrics
        ? baselineMetrics.rawMinutes || route.baseDurationMinutes
        : route.baseDurationMinutes)
  )}{' '}
  eco pacing
</span>
            )}
            {isShortest && <span className="sub-warning">Local speed zones</span>}
          </div>
        </div>

        {/* Distance */}
        <div className="metric-box">
          <div className="metric-header">
            <Navigation size={14} className="metric-icon" />
            <span className="metric-title">Distance</span>
          </div>
          <div className="metric-val">
            {metrics.distance} <span className="metric-unit">{metrics.distanceUnit}</span>
          </div>
          <div className="metric-sub">
            {isShortest && <span className="sub-highlight">Minimum distance</span>}
            {!isShortest && <span>{route.elevationGainMeters || 0}m climb</span>}
          </div>
        </div>

        {/* Fuel / Energy Consumption */}
        <div className="metric-box">
          <div className="metric-header">
            <Fuel size={14} className="metric-icon" />
            <span className="metric-title">Est. {metrics.fuelUnit === 'kWh' ? 'Energy' : 'Fuel'}</span>
          </div>
          <div className="metric-val">
            {metrics.totalFuel}{' '}
            <span className="metric-unit">{metrics.fuelUnit}</span>
          </div>
          <div className="metric-sub">
            {fuelDiffPercent < 0 ? (
              <span className="sub-green">
                <TrendingDown size={12} className="inline-icon" />
                {Math.abs(displayedFuelDiffPercent)}% fuel saved
              </span>
            ) : (
              <span>Est. ₹{metrics.estimatedCost} cost</span>            )}
          </div>
        </div>

        {/* Estimated CO2 Emissions */}
        <div className={`metric-box ${isEco ? 'highlight-green-box' : ''}`}>
          <div className="metric-header">
            <Leaf size={14} className="metric-icon" />
            <span className="metric-title">CO2 Emission</span>
          </div>
          <div className="metric-val">
            {metrics.totalCo2} <span className="metric-unit">kg</span>
          </div>
          <div className="metric-sub">
            {co2DiffPercent < 0 ? (
              <span className="sub-green font-semibold">
                <TrendingDown size={12} className="inline-icon" />
                {Math.abs(displayedCo2DiffPercent)}% CO2 Cut
              </span>
            ) : isFastest ? (
              <span className="sub-gray">Baseline emissions</span>
            ) : (
              <span className="sub-amber">Vs fastest baseline</span>
            )}
          </div>
        </div>
      </div>

      {/* Summary note & selection footer */}
      <div className="card-footer">
        <p className="route-summary-text">{route.summary}</p>
        <div className="card-selection-action">
          {isSelected ? (
            <span className="active-selected-tag">
              <CheckCircle2 size={15} className="text-emerald-400" /> Active on Map
            </span>
          ) : (
            <span className="select-prompt">Click to preview route on map</span>
          )}
        </div>
      </div>
    </div>
  );
}
