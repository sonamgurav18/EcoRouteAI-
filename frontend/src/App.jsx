import { useState, useEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import RouteSearchForm from './components/RouteSearchForm';
import RouteCard from './components/RouteCard';
import AiRecommendation from './components/AiRecommendation';
import MapView from './components/MapView';
import { VEHICLE_TYPES, DEMO_PRESETS } from './data/vehicleTypes';
import {
  fetchBackendRoute,
  calculateDynamicMetrics
} from './services/routingService';
import {
  Sparkles,
  Map as MapIcon,
  ListFilter,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import './App.css';

function App() {
  const [origin, setOrigin] = useState('Jayasingpur, Maharashtra, India');
  const [destination, setDestination] = useState('Kolhapur, Maharashtra, India');
  const [selectedVehicle, setSelectedVehicle] = useState(VEHICLE_TYPES[0]);
  const [activeRouteId, setActiveRouteId] = useState('eco');
  const [isMetric, setIsMetric] = useState(true);

  // Real Dynamic Route Result from Nominatim + OSRM
  const [routeResult, setRouteResult] = useState(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizingStep, setOptimizingStep] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Mobile layout tab: 'panel' or 'map'
  const [mobileTab, setMobileTab] = useState('panel');

  // AI Recommendation expanded accordion toggle
  const [isAiRecExpanded, setIsAiRecExpanded] = useState(true);

  const isFirstMount = useRef(true);

  // Dynamic Route Fetching Function
  const executeRouting = async (startLoc, endLoc) => {
    const from = startLoc || origin;
    const to = endLoc || destination;

    if (!from.trim() || !to.trim()) {
      setErrorMessage('Please provide both starting location and destination.');
      return;
    }

    setIsOptimizing(true);
    setErrorMessage('');
    setOptimizingStep('1/3: Geocoding locations via OpenStreetMap Nominatim...');

    try {
      // Simulate progressive agent step updates for visual feedback
      const stepTimer1 = setTimeout(() => {
        setOptimizingStep('2/3: Calculating road geometry via OpenStreetMap OSRM...');
      }, 500);

      const stepTimer2 = setTimeout(() => {
        setOptimizingStep('3/3: Running multi-agent vehicle emission & torque models...');
      }, 1100);

      const result = await fetchBackendRoute(from, to, selectedVehicle);

      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);

      setRouteResult(result);
      const recommendedId = String(
        result?.ecoData?.recommendedRoute || 'eco'
      )
        .toLowerCase()
        .replace(/\s+route$/, '')
        .trim();
      setActiveRouteId(
        ['eco', 'fastest', 'shortest'].includes(recommendedId)
          ? recommendedId
          : 'eco'
      );
      setErrorMessage('');
    } catch (err) {
      setErrorMessage(err.message || 'Failed to calculate route. Please try again.');
    } finally {
      setIsOptimizing(false);
      setOptimizingStep('');
    }
  };

  // Initial load: automatically fetch real route for Jayasingpur -> Kolhapur
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      executeRouting('Jayasingpur, Maharashtra, India', 'Kolhapur, Maharashtra, India');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Preset Selection
  const handleSelectPreset = (newOrigin, newDest) => {
    setOrigin(newOrigin);
    setDestination(newDest);
    executeRouting(newOrigin, newDest);
  };

  // Reset simulation to default
  const handleReset = () => {
    const defaultPreset = DEMO_PRESETS[0];
    setOrigin(defaultPreset.origin);
    setDestination(defaultPreset.destination);
    setSelectedVehicle(VEHICLE_TYPES[0]);
    setIsMetric(true);
    executeRouting(defaultPreset.origin, defaultPreset.destination);
  };

  const routes = routeResult?.routes;

const fastestRoute = routes?.fastest;

const ecoRoute = routes?.eco;

const shortestRoute = routes?.shortest;

const recommendedRoute =
  routeResult?.ecoData?.recommendedRoute || 'eco';

  // Baseline metrics from the fastest route
  const fastestMetrics =
    fastestRoute && selectedVehicle
      ? {
          ...calculateDynamicMetrics(fastestRoute, selectedVehicle, isMetric),
          rawMinutes: fastestRoute.baseDurationMinutes,
        }
      : null;

  return (
    <div className="ecoroute-app">
      {/* Top Navbar */}
      <Navbar
        isMetric={isMetric}
        setIsMetric={setIsMetric}
        onResetSimulation={handleReset}
        isOptimizing={isOptimizing}
      />

      {/* Main Dashboard Container */}
      <main className="dashboard-layout">
        {/* Left Floating Sidebar Panel (Google Maps Style) */}
        <aside className={`floating-sidebar ${mobileTab === 'map' ? 'mobile-hidden' : ''}`}>
          <div className="sidebar-scrollable-content">
            {/* 1. Origin, Destination, Vehicle Search Form */}
            <RouteSearchForm
              origin={origin}
              setOrigin={setOrigin}
              destination={destination}
              setDestination={setDestination}
              selectedVehicle={selectedVehicle}
              setSelectedVehicle={setSelectedVehicle}
              onOptimize={() => executeRouting(origin, destination)}
              isOptimizing={isOptimizing}
              optimizingStep={optimizingStep}
              errorMessage={errorMessage}
              onSelectPreset={handleSelectPreset}
            />

            {/* 2. Route Options Header */}
            <div className="routes-section-header">
              <div className="section-title-wrap">
                <span className="section-badge">Live OSRM Routing</span>
                <h2 className="section-heading">Available Road Routes</h2>
              </div>
              <span className="routes-count">
                {routes ? '3 Options' : isOptimizing ? 'Calculating...' : 'Ready'}
              </span>
            </div>

            {/* 3. Three Route Option Cards (Eco, Fastest, Shortest) */}
            {routes && ecoRoute && fastestRoute && shortestRoute ? (
              <div className="route-cards-list">
                {/* Eco Route (Highlighted & Listed First for Green Focus) */}
                <RouteCard
                  route={ecoRoute}
                  vehicle={selectedVehicle}
                  isMetric={isMetric}
                  isSelected={activeRouteId === 'eco'}
                  onSelect={() => setActiveRouteId('eco')}
                  baselineMetrics={fastestMetrics}
                />

                {/* Fastest Route */}
                <RouteCard
                  route={fastestRoute}
                  vehicle={selectedVehicle}
                  isMetric={isMetric}
                  isSelected={activeRouteId === 'fastest'}
                  onSelect={() => setActiveRouteId('fastest')}
                  baselineMetrics={fastestMetrics}
                />

                {/* Shortest Route */}
                <RouteCard
                  route={shortestRoute}
                  vehicle={selectedVehicle}
                  isMetric={isMetric}
                  isSelected={activeRouteId === 'shortest'}
                  onSelect={() => setActiveRouteId('shortest')}
                  baselineMetrics={fastestMetrics}
                />
              </div>
            ) : isOptimizing ? (
              <div className="loading-routes-placeholder">
                <Sparkles className="spin-anim text-emerald-500" size={24} />
                <p className="loading-placeholder-text">
                  Contacting OpenStreetMap Nominatim & OSRM servers...
                </p>
              </div>
            ) : null}

            {/* 4. AI Recommendation Section */}
            {routes && ecoRoute && fastestRoute && (
              <div className="ai-recommendation-wrapper">
                <button
                  className="ai-rec-toggle-btn"
                  onClick={() => setIsAiRecExpanded(!isAiRecExpanded)}
                  type="button"
                >
                  <div className="flex items-center gap-2">
                    <Sparkles size={16} className="text-emerald-400" />
                    <span className="font-semibold text-emerald-900">
                      AI Agent Optimization Analysis
                    </span>
                  </div>
                  {isAiRecExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>

                {isAiRecExpanded && (
  <AiRecommendation
    ecoRoute={ecoRoute}
    fastestRoute={fastestRoute}
    shortestRoute={shortestRoute}
    recommendedRoute={recommendedRoute}
    vehicle={selectedVehicle}
    isMetric={isMetric}
    originName={routeResult?.origin?.shortName}
    destName={routeResult?.destination?.shortName}
  />
)}
              </div>
            )}

            {/* Bottom Supply Chain Platform Footer */}
            <footer className="sidebar-footer">
              <div className="security-notice">
                <ShieldCheck size={14} className="text-emerald-500" />
                <span>Real-Time OpenStreetMap Nominatim & OSRM Engines</span>
              </div>
              <p className="copyright-note">
                EcoRoute AI v1.0 • Dynamic Green Supply Chain Navigation
              </p>
            </footer>
          </div>
        </aside>

        {/* Right Large Map Area (Leaflet + OpenStreetMap) */}
        <section className={`map-viewport-section ${mobileTab === 'panel' ? 'mobile-map-secondary' : ''}`}>
          <MapView
            routeResult={routeResult}
            activeRouteId={activeRouteId}
            onSelectRoute={setActiveRouteId}
            isOptimizing={isOptimizing}
          />
        </section>

        {/* Mobile View Toggle Bar */}
        <div className="mobile-view-toggle-bar">
          <button
            className={`mobile-tab-btn ${mobileTab === 'panel' ? 'active' : ''}`}
            onClick={() => setMobileTab('panel')}
            type="button"
          >
            <ListFilter size={17} />
            <span>Routes & AI</span>
          </button>
          <button
            className={`mobile-tab-btn ${mobileTab === 'map' ? 'active' : ''}`}
            onClick={() => setMobileTab('map')}
            type="button"
          >
            <MapIcon size={17} />
            <span>Interactive Map</span>
          </button>
        </div>
      </main>
    </div>
  );
}

export default App;
