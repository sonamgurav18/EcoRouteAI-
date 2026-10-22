import {
  Sparkles,
  Bot,
  Activity,
  Mountain,
  ShieldCheck,
  TrendingDown,
  DollarSign,
  Leaf,
  BarChart3,
  Clock,
} from 'lucide-react';

import { calculateDynamicMetrics } from '../services/routingService';

export default function AiRecommendation({
  ecoRoute,
  fastestRoute,
  shortestRoute,
  recommendedRoute,
  vehicle,
  isMetric,
  originName,
  destName,
}) {
  // Map each route to its corresponding route type.
  const routeOptions = {
    eco: ecoRoute,
    fastest: fastestRoute,
    shortest: shortestRoute,
  };

  // Normalize the recommendation received from the backend.
  const selectedType = String(recommendedRoute || 'eco')
    .toLowerCase()
    .replace(/\s+route$/, '')
    .trim();

  // Select the route recommended by the AI.
  const selectedRoute = routeOptions[selectedType] || ecoRoute;

  // Calculate metrics for the recommended route and fastest route.
  const selectedMetrics = calculateDynamicMetrics(
    selectedRoute,
    vehicle,
    isMetric
  );

  const fastMetrics = calculateDynamicMetrics(
    fastestRoute,
    vehicle,
    isMetric
  );

  // Calculate estimated savings compared with the fastest route.
  const co2SavedKg = Math.max(
    0,
    fastMetrics.totalCo2 - selectedMetrics.totalCo2
  ).toFixed(1);

  const fuelSaved = Math.max(
    0,
    fastMetrics.totalFuel - selectedMetrics.totalFuel
  ).toFixed(1);

  const costSavedINR = Math.max(
  0,
  fastMetrics.estimatedCostINR - selectedMetrics.estimatedCostINR
).toFixed(2);

  const percentReduction =
    fastMetrics.totalCo2 > 0
      ? Math.max(
          0,
          Math.round(
            ((fastMetrics.totalCo2 - selectedMetrics.totalCo2) /
              fastMetrics.totalCo2) *
              100
          )
        )
      : 0;

  // Annual projection: 20 vehicles, 3 trips per week, 52 weeks.
  const annualTrips = 20 * 3 * 52;

  const annualCo2SavedTons = (
    (Number(co2SavedKg) * annualTrips) /
    1000
  ).toFixed(1);

  const annualCostSavedINR = (
  Number(costSavedINR) * annualTrips
).toLocaleString('en-IN', {
  maximumFractionDigits: 0,
});

  const breakdown = selectedRoute?.agentBreakdown;

  // Display a readable name for the selected route.
  const selectedRouteName =
    selectedType === 'shortest'
      ? 'Shortest Route'
      : selectedType === 'fastest'
        ? 'Fastest Route'
        : 'Eco Route';

  return (
    <div className="ai-recommendation-panel">
      {/* Header Banner */}
      <div className="recommendation-header">
        <div className="recommendation-title-group">
          <div className="ai-sparkle-avatar">
            <Sparkles size={20} className="text-emerald-300" />
          </div>

          <div>
            <div className="agent-badge-pill">
              <Bot size={13} className="mr-1 inline text-emerald-400" />
              <span>Multi-Agent Consensus Verdict</span>
            </div>

            <h3 className="recommendation-heading">
              Why {selectedRouteName} is Recommended
            </h3>
          </div>
        </div>

        <div className="eco-roi-badge">
          <TrendingDown size={16} />
          <span>{percentReduction}% Carbon Reduction</span>
        </div>
      </div>

      {/* Rationale Executive Summary */}
      <p className="recommendation-lead">
        EcoRoute AI compared the available routes between{' '}
        <strong>{originName || 'Origin'}</strong> and{' '}
        <strong>{destName || 'Destination'}. </strong>
        For <strong>{vehicle?.name || 'the selected vehicle'}</strong>, the
        AI recommends the {selectedRouteName.toLowerCase()} using the same
        backend fuel, CO2, and Eco Score as the route cards. Savings below
        are compared with the <strong>fastest route baseline</strong>. The
        selected route covers{' '}
        <strong>
          {Number(selectedRoute?.distanceKm || 0).toFixed(1)} km
        </strong>
        .
      </p>

      {/* High-Impact Savings Cards */}
      <div className="impact-metrics-row">
        <div className="impact-card impact-co2">
          <div className="impact-icon-wrapper">
            <Leaf size={18} className="text-emerald-400" />
          </div>

          <div className="impact-info">
            <div className="impact-value">
              {co2SavedKg}{' '}
              <span className="impact-unit">kg CO₂</span>
            </div>

            <div className="impact-label">
              Estimated Carbon Reduction vs Fastest Route
            </div>
          </div>
        </div>

        <div className="impact-card impact-fuel">
          <div className="impact-icon-wrapper">
            <TrendingDown size={18} className="text-blue-400" />
          </div>

          <div className="impact-info">
            <div className="impact-value">
              {fuelSaved}{' '}
              <span className="impact-unit">
                {vehicle?.fuelUnit || 'units'}
              </span>
            </div>

            <div className="impact-label">
              Estimated Fuel/Energy Savings
            </div>
          </div>
        </div>

        <div className="impact-card impact-cost">
          <div className="impact-icon-wrapper">
            <DollarSign size={18} className="text-amber-400" />
          </div>

          <div className="impact-info">
            <div className="impact-value">
  ₹{costSavedINR}{' '}
  <span className="impact-unit">INR</span>
</div>

            <div className="impact-label">
              Estimated Cost Savings per Trip
            </div>
          </div>
        </div>
      </div>

      {/* Multi-Agent Reasoning Pillars */}
      {breakdown && (
        <div className="agent-pillars-container">
          <h4 className="pillars-title">
            <Activity
              size={15}
              className="mr-1 text-emerald-400 inline"
            />
            Agent-by-Agent Reasoning Breakdown:
          </h4>

          <div className="pillar-cards-grid">
            {/* Agent 1: Traffic Intelligence */}
            {breakdown.trafficAgent && (
              <div className="agent-pillar-card">
                <div className="pillar-header">
                  <span className="pillar-tag traffic-tag">
                    Traffic Intelligence Agent
                  </span>

                  <span className="pillar-status status-good">
                    {breakdown.trafficAgent.status}
                  </span>
                </div>

                <p className="pillar-body">
                  {breakdown.trafficAgent.impact}
                </p>

                <div className="pillar-stat">
                  <Clock size={13} className="text-emerald-400" />
                  <span>
                    {breakdown.trafficAgent.timeSavedIdle}
                  </span>
                </div>
              </div>
            )}

            {/* Agent 2: Topography and Aerodynamics */}
            {breakdown.topographyAgent && (
              <div className="agent-pillar-card">
                <div className="pillar-header">
                  <span className="pillar-tag topo-tag">
                    Topography &amp; Aero Agent
                  </span>

                  <span className="pillar-status status-good">
                    {breakdown.topographyAgent.status}
                  </span>
                </div>

                <p className="pillar-body">
                  {breakdown.topographyAgent.impact}
                </p>

                <div className="pillar-stat">
                  <Mountain size={13} className="text-blue-400" />
                  <span>
                    {breakdown.topographyAgent.engineStrainReduction}
                  </span>
                </div>
              </div>
            )}

            {/* Agent 3: Fleet and Emissions */}
            {breakdown.emissionsAgent && (
              <div className="agent-pillar-card">
                <div className="pillar-header">
                  <span className="pillar-tag emission-tag">
                    Fleet Carbon Agent
                  </span>

                  <span className="pillar-status status-good">
                    {breakdown.emissionsAgent.status}
                  </span>
                </div>

                <p className="pillar-body">
                  {breakdown.emissionsAgent.impact}
                </p>

                <div className="pillar-stat">
                  <ShieldCheck size={13} className="text-purple-400" />
                  <span>
                    {breakdown.emissionsAgent.fleetProjection}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Fleet Scaled Impact Callout */}
      <div className="fleet-scale-callout">
        <div className="scale-badge">
          <BarChart3 size={15} />
          <span>Fleet Scale ESG Impact Projection</span>
        </div>

        <p className="scale-text">
          Applying the selected route to a fleet of{' '}
          <strong>20 {vehicle?.name || 'vehicles'}</strong>, completing
          3 trips per week for 52 weeks, projects an estimated reduction of{' '}
          <strong>{annualCo2SavedTons} metric tons of CO₂</strong> and{' '}
          <strong>₹{annualCostSavedINR}</strong> in fuel expenditure,
          compared with using the fastest route.
        </p>
      </div>
    </div>
  );
}