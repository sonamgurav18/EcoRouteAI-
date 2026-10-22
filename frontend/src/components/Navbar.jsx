import { Leaf, Cpu, Globe, RefreshCw } from 'lucide-react';

export default function Navbar({
  isMetric,
  setIsMetric,
  onResetSimulation,
  isOptimizing,
}) {
  return (
    <header className="ecoroute-navbar">
      <div className="navbar-left">
        <div className="brand-logo-container">
          <div className="logo-glow-wrapper">
            <Leaf className="logo-icon text-emerald-400" size={24} />
          </div>
          <div className="brand-titles">
            <div className="brand-main">
              <span className="brand-name">EcoRoute</span>
              <span className="brand-badge">AI</span>
            </div>
            <span className="brand-subtitle">
              Multi-Agent Cloud Platform for Green Supply Chain Optimization
            </span>
          </div>
        </div>
      </div>

      <div className="navbar-center">
        <div className="agent-status-pill">
          <span className="status-indicator">
            <span className="ping-dot"></span>
            <span className="solid-dot"></span>
          </span>
          <Cpu size={14} className="agent-icon" />
          <span className="agent-status-text">
            {isOptimizing ? 'Multi-Agent Consensus Running...' : '3 AI Cloud Agents Active'}
          </span>
        </div>
      </div>

      <div className="navbar-right">
        <button
          className="unit-toggle-btn"
          onClick={() => setIsMetric(!isMetric)}
          title="Switch distance and fuel units"
          type="button"
        >
          <Globe size={15} />
          <span>{isMetric ? 'Metric (km / L)' : 'Imperial (mi / gal)'}</span>
        </button>

        <button
          className="reset-btn"
          onClick={onResetSimulation}
          title="Reset Simulation to Initial State"
          type="button"
        >
          <RefreshCw size={15} className={isOptimizing ? 'spin-anim' : ''} />
          <span className="desktop-only-inline">Reset</span>
        </button>
      </div>
    </header>
  );
}
