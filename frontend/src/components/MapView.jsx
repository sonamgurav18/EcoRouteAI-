import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Layers, Compass, Leaf, Navigation, Zap } from 'lucide-react';

export default function MapView({
  routeResult,
  activeRouteId,
  onSelectRoute,
  isOptimizing,
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const onSelectRouteRef = useRef(onSelectRoute);

  useEffect(() => {
    onSelectRouteRef.current = onSelectRoute;
  }, [onSelectRoute]);

  const layersRef = useRef({
    polylines: {},
    markers: [],
    milestones: [],
    tileLayer: null,
  });

  const [tileStyle, setTileStyle] = useState('positron'); // 'positron' or 'osm'

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const initialCoords = routeResult
        ? [routeResult.origin.lat, routeResult.origin.lon]
        : [16.7907, 74.5509]; // Default: Jayasingpur, Maharashtra

      const map = L.map(mapContainerRef.current, {
        center: initialCoords,
        zoom: 10,
        zoomControl: false,
      });

      // Add zoom control in top right
      L.control.zoom({ position: 'topright' }).addTo(map);

      // OpenStreetMap tile layer
const tileUrl = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';

      const tileLayer = L.tileLayer(tileUrl, {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19,
      }).addTo(map);

      layersRef.current.tileLayer = tileLayer;
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update tile style if toggled
useEffect(() => {
  const map = mapInstanceRef.current;
  if (!map) return;

  const tileUrl = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';

  const newTileLayer = L.tileLayer(tileUrl, {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 19,
    updateWhenIdle: true,
    keepBuffer: 2,
  });

  newTileLayer.on('tileerror', (event) => {
    console.error('Map tile failed to load:', event.tile.src);
  });

  if (layersRef.current.tileLayer) {
    map.removeLayer(layersRef.current.tileLayer);
  }

  newTileLayer.addTo(map);
  layersRef.current.tileLayer = newTileLayer;

  return () => {
    if (map.hasLayer(newTileLayer)) {
      map.removeLayer(newTileLayer);
    }
  };
}, [tileStyle]);

  // Render Routes and Markers whenever routeResult or activeRouteId changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !routeResult || !routeResult.routes) return;

    // Clear old polylines, markers, milestones
    Object.values(layersRef.current.polylines).forEach((poly) => map.removeLayer(poly));
    layersRef.current.polylines = {};

    layersRef.current.markers.forEach((m) => map.removeLayer(m));
    layersRef.current.markers = [];

    layersRef.current.milestones.forEach((m) => map.removeLayer(m));
    layersRef.current.milestones = [];

    const { origin, destination, routes } = routeResult;

    // Custom Start Pin (A)
    const startIcon = L.divIcon({
      className: 'custom-map-pin origin-pin',
      html: `<div class="pin-marker origin"><div class="pin-center">A</div></div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 30],
      popupAnchor: [0, -28],
    });

    // Custom End Pin (B)
    const destIcon = L.divIcon({
      className: 'custom-map-pin dest-pin',
      html: `<div class="pin-marker destination"><div class="pin-center">B</div></div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 30],
      popupAnchor: [0, -28],
    });

    const startMarker = L.marker([origin.lat, origin.lon], { icon: startIcon })
      .addTo(map)
      .bindPopup(
        `<div class="map-popup">
          <strong class="text-emerald-700">Origin:</strong> ${origin.displayName || origin.shortName}
        </div>`
      );

    const destMarker = L.marker([destination.lat, destination.lon], { icon: destIcon })
      .addTo(map)
      .bindPopup(
        `<div class="map-popup">
          <strong class="text-red-700">Destination:</strong> ${destination.displayName || destination.shortName}
        </div>`
      );

    layersRef.current.markers.push(startMarker, destMarker);

    // Route Colors & Configs
    const routeStyleConfigs = {
      eco: {
        color: '#10b981',
        weight: activeRouteId === 'eco' ? 7 : 4,
        opacity: activeRouteId === 'eco' ? 0.95 : 0.5,
        dashArray: null,
      },
      fastest: {
        color: '#3b82f6',
        weight: activeRouteId === 'fastest' ? 7 : 4,
        opacity: activeRouteId === 'fastest' ? 0.95 : 0.5,
        dashArray: null,
      },
      shortest: {
        color: '#f59e0b',
        weight: activeRouteId === 'shortest' ? 7 : 4,
        opacity: activeRouteId === 'shortest' ? 0.95 : 0.5,
        dashArray: '5, 8',
      },
    };

    // Render Polylines: inactive polylines first, active route on top
    const routeKeys = Object.keys(routes).sort((a) => (a === activeRouteId ? 1 : -1));

    routeKeys.forEach((key) => {
      const routeData = routes[key];
      if (!routeData || !routeData.path || routeData.path.length === 0) return;

      const style = routeStyleConfigs[key] || { color: '#6b7280', weight: 4, opacity: 0.6 };

      const polyline = L.polyline(routeData.path, {
        color: style.color,
        weight: style.weight,
        opacity: style.opacity,
        dashArray: style.dashArray,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(map);

      // Tooltip on hover
      polyline.bindTooltip(
        `<div class="route-map-tooltip">
          <strong>${routeData.name}</strong><br />
          <span>${routeData.distanceKm} km • Eco Score: ${routeData.ecoScore}/100</span>
        </div>`,
        { sticky: true }
      );

      // Click event to select this route
      polyline.on('click', () => {
        onSelectRouteRef.current(key);
      });

      layersRef.current.polylines[key] = polyline;
    });

    // Render Milestones for the active route
    const activeRouteData = routes[activeRouteId];
    if (activeRouteData && activeRouteData.milestones) {
      activeRouteData.milestones.forEach((mile) => {
        const milestoneIcon = L.divIcon({
          className: 'custom-milestone-pin',
          html: `<div class="milestone-badge ${mile.type}">
                  <span class="milestone-dot"></span>
                  <span class="milestone-text">${mile.label}</span>
                 </div>`,
          iconAnchor: [12, 12],
        });

        const milestoneMarker = L.marker(mile.coords, { icon: milestoneIcon }).addTo(map);
        layersRef.current.milestones.push(milestoneMarker);
      });
    }

    // Auto-fit bounds to the real route geometry
    if (activeRouteData && activeRouteData.path.length > 0) {
      const bounds = L.latLngBounds(activeRouteData.path);
      map.fitBounds(bounds, {
        paddingTopLeft: [window.innerWidth > 900 ? 460 : 40, 40],
        paddingBottomRight: [40, 40],
        maxZoom: 14,
      });
    }

    const resizeTimer = setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => clearTimeout(resizeTimer);
  }, [routeResult, activeRouteId]);

  // Handler to recenter to active route
  const handleRecenter = () => {
    if (!mapInstanceRef.current || !routeResult || !routeResult.routes) return;
    const activeRouteData = routeResult.routes[activeRouteId];
    if (activeRouteData && activeRouteData.path.length > 0) {
      const bounds = L.latLngBounds(activeRouteData.path);
      mapInstanceRef.current.fitBounds(bounds, {
        paddingTopLeft: [window.innerWidth > 900 ? 460 : 40, 40],
        paddingBottomRight: [40, 40],
      });
    }
  };

  return (
    <div className="map-view-wrapper">
      <div id="ecoroute-leaflet-map" ref={mapContainerRef} className="map-canvas"></div>

      {/* Floating Map Legend */}
      <div className="map-legend-box">
        <div className="legend-title">Real Road Route Overlays</div>
        <div className="legend-items">
          <div
            className={`legend-item ${activeRouteId === 'eco' ? 'active-legend' : ''}`}
            onClick={() => onSelectRoute('eco')}
          >
            <span className="legend-swatch swatch-eco"></span>
            <span className="legend-name">AI Eco Route</span>
            <Leaf size={12} className="text-emerald-500 ml-1" />
          </div>
          <div
            className={`legend-item ${activeRouteId === 'fastest' ? 'active-legend' : ''}`}
            onClick={() => onSelectRoute('fastest')}
          >
            <span className="legend-swatch swatch-fastest"></span>
            <span className="legend-name">Fastest Highway</span>
            <Zap size={12} className="text-blue-500 ml-1" />
          </div>
          <div
            className={`legend-item ${activeRouteId === 'shortest' ? 'active-legend' : ''}`}
            onClick={() => onSelectRoute('shortest')}
          >
            <span className="legend-swatch swatch-shortest"></span>
            <span className="legend-name">Shortest Route</span>
            <Navigation size={12} className="text-amber-500 ml-1" />
          </div>
        </div>
      </div>

      {/* Floating Map Controls */}
      <div className="map-floating-controls">
        <button
          className="map-control-btn"
          onClick={() => setTileStyle(tileStyle === 'positron' ? 'osm' : 'positron')}
          title="Toggle Map Style (Clean Positron / OSM Classic)"
          type="button"
        >
          <Layers size={18} />
          <span className="control-tooltip">
            {tileStyle === 'positron' ? 'Standard OSM' : 'Clean Positron'}
          </span>
        </button>

        <button
          className="map-control-btn"
          onClick={handleRecenter}
          title="Recenter Map to Selected Route"
          type="button"
        >
          <Compass size={18} />
          <span className="control-tooltip">Recenter</span>
        </button>
      </div>

      {/* Optimizing Overlay Animation */}
      {isOptimizing && (
        <div className="map-agent-computing-overlay">
          <div className="computing-card">
            <Leaf size={24} className="text-emerald-400 spin-anim mb-2" />
            <div className="font-semibold text-white">Calculating Real Road Route</div>
            <div className="text-xs text-emerald-200 mt-1">
              Querying Nominatim geocoding & OSRM road geometry...
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
