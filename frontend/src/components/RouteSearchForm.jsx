import {
  MapPin,
  ArrowUpDown,
  Truck,
  Car,
  Bike,
  Sparkles,
  Zap,
  BatteryCharging,
  Fuel,
  Flame,
  Atom,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import { VEHICLE_TYPES, DEMO_PRESETS } from '../data/vehicleTypes';

export default function RouteSearchForm({
  origin,
  setOrigin,
  destination,
  setDestination,
  selectedVehicle,
  setSelectedVehicle,
  onOptimize,
  isOptimizing,
  optimizingStep,
  errorMessage,
  onSelectPreset,
}) {
  const handleSwap = () => {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
  };

  const getVehicleIcon = (iconName) => {
    switch (iconName) {
      case 'Car':
        return <Car size={16} className="text-cyan-400" />;
      case 'Bike':
        return <Bike size={16} className="text-orange-400" />;
      case 'BatteryCharging':
        return <BatteryCharging size={16} className="text-emerald-400" />;
      case 'Zap':
        return <Zap size={16} className="text-yellow-400" />;
      case 'Flame':
        return <Flame size={16} className="text-amber-400" />;
      case 'Atom':
        return <Atom size={16} className="text-emerald-300" />;
      case 'Fuel':
        return <Fuel size={16} className="text-blue-400" />;
      case 'Truck':
      default:
        return <Truck size={16} className="text-slate-300" />;
    }
  };

  // Group vehicles for structured, intuitive selection
  const vehicleGroups = [
    'Passenger & 2-Wheeler',
    'Light & Medium Commercial',
    'Heavy Freight & Alternative Powertrains',
  ];

  return (
    <div className="search-panel-container">
      {/* Quick Corridor Selector Chips */}
      <div className="preset-corridors-bar">
        <span className="preset-label">Quick Real Corridors:</span>
        <div className="preset-chips">
          {DEMO_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              className={`preset-chip ${origin === preset.origin && destination === preset.destination ? 'active' : ''}`}
              onClick={() => onSelectPreset(preset.origin, preset.destination)}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      <form
        className="route-form"
        onSubmit={(e) => {
          e.preventDefault();
          onOptimize();
        }}
      >
        <div className="inputs-wrapper">
          {/* Start Location Input */}
          <div className="input-group">
            <div className="input-icon-indicator origin-indicator">
              <span className="dot origin-dot"></span>
            </div>
            <div className="input-content">
              <label htmlFor="origin-input" className="input-label">
                Starting Location (Origin)
              </label>
              <input
                id="origin-input"
                type="text"
                className="route-input"
                placeholder="Enter any city, town, or address (e.g. Jayasingpur, Maharashtra)..."
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Swap Button */}
          <div className="swap-button-row">
            <button
              type="button"
              className="swap-btn"
              onClick={handleSwap}
              title="Swap Origin and Destination"
              aria-label="Swap Origin and Destination"
            >
              <ArrowUpDown size={15} />
            </button>
            <div className="route-connector-line"></div>
          </div>

          {/* Destination Input */}
          <div className="input-group">
            <div className="input-icon-indicator destination-indicator">
              <MapPin size={16} className="text-red-400" />
            </div>
            <div className="input-content">
              <label htmlFor="dest-input" className="input-label">
                Destination (Delivery Hub)
              </label>
              <input
                id="dest-input"
                type="text"
                className="route-input"
                placeholder="Enter destination (e.g. Kolhapur, Maharashtra)..."
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                required
              />
            </div>
          </div>
        </div>

        {/* Vehicle Selector */}
        <div className="vehicle-selector-group">
          <label className="input-label flex-between">
            <span>Fleet & Mobility Vehicle ({VEHICLE_TYPES.length} Types)</span>
            <span className="vehicle-subtag">{selectedVehicle.category}</span>
          </label>
          <div className="vehicle-select-box">
            <div className="vehicle-selected-icon">
              {getVehicleIcon(selectedVehicle.icon)}
            </div>
            <select
              className="vehicle-dropdown"
              value={selectedVehicle.id}
              onChange={(e) => {
                const found = VEHICLE_TYPES.find((v) => v.id === e.target.value);
                if (found) setSelectedVehicle(found);
              }}
            >
              {vehicleGroups.map((group) => (
                <optgroup key={group} label={group}>
                  {VEHICLE_TYPES.filter((v) => v.group === group).map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.fuelType} • {v.baseConsumptionPer100Km} {v.fuelUnit}/100km)
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
          <div className="vehicle-spec-footer">
            <span>
              Fuel/Energy: <strong>{selectedVehicle.fuelType}</strong>
            </span>
            <span>
              Emissions: <strong>{selectedVehicle.co2PerFuelUnit} kg CO2/{selectedVehicle.fuelUnit}</strong>
            </span>
          </div>
        </div>

        {/* Error Message Banner */}
        {errorMessage && (
          <div className="routing-error-banner" role="alert">
            <AlertCircle size={16} className="error-banner-icon" />
            <span className="error-banner-text">{errorMessage}</span>
          </div>
        )}

        {/* Search Route Button */}
        <button
          type="submit"
          className={`search-route-btn ${isOptimizing ? 'loading' : ''}`}
          disabled={isOptimizing}
        >
          {isOptimizing ? (
            <div className="agent-loading-state">
              <Sparkles className="spin-slow text-emerald-300" size={18} />
              <span>{optimizingStep || 'Geocoding & Calculating Real OSRM Route...'}</span>
            </div>
          ) : (
            <div className="btn-content-flex">
              <Sparkles size={18} className="text-emerald-300" />
              <span>Calculate Real Eco Route</span>
              <ChevronRight size={18} className="ml-auto" />
            </div>
          )}
        </button>

        {isOptimizing && (
          <div className="agent-progress-bar-container">
            <div className="agent-progress-bar-indeterminate"></div>
          </div>
        )}
      </form>
    </div>
  );
}
