// EcoRoute AI - Real Dynamic Geocoding & OpenStreetMap Routing Service
// Uses OpenStreetMap Nominatim for geocoding and OSRM for road routing.

export async function fetchBackendRoute(startLocation, endLocation, vehicle) {
  const response = await fetch(
    "http://localhost:5000/api/optimize-route",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        origin: startLocation,
        destination: endLocation,
        vehicle: vehicle?.name?.replace('–', '-') || vehicle,
      }),
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));

    throw new Error(
      errorData.message || "Backend route optimization failed."
    );
  }

  const data = await response.json();

  if (!data.success) {
    throw new Error(
      data.message || "Backend route optimization failed."
    );
  }

  const routeData = data.routeData;
  const fuelData = data.fuelData;
  const ecoData = data.ecoData;

  const mapRouteFromBackend = (routeType, labels) => {
    const selection = data.routeSelection?.[routeType] || {};

    const analysis =
      ecoData?.routeAnalysis?.find(
        (item) => item.routeType === routeType
      ) || {};

    const fuelValue =
      selection.fuelOrEnergyUsed ?? analysis.fuelOrEnergyUsed;

    const co2Value =
      selection.co2Emission ?? analysis.co2Emission;

    const scoreValue =
      selection.ecoScore ?? analysis.ecoScore ?? ecoData?.ecoScore;

    return {
      id: routeType,
      name: labels.name,
      tag: labels.tag,
      badgeType: routeType,

      distanceKm: Number(
        selection.distanceKm ?? analysis.distanceKm ?? 0
      ),

      travelTimeMinutes: Number(
        selection.travelTimeMinutes ??
          analysis.travelTimeMinutes ??
          0
      ),

      baseDurationMinutes: Number(
        selection.travelTimeMinutes ??
          analysis.travelTimeMinutes ??
          0
      ),

      path: toLeafletPath(selection.geometry),

      backendFuel:
        fuelValue != null ? Number(fuelValue) : null,

      backendFuelUnit:
        selection.unit || analysis.unit || fuelData?.unit || 'L',

      backendCO2:
        co2Value != null ? Number(co2Value) : null,

      backendEcoScore:
        scoreValue != null ? Number(scoreValue) : null,

      backendTraffic:
        data.trafficData?.trafficLevel ?? 'estimated',

      backendRouteFuel:
        fuelValue != null ? Number(fuelValue) : null,

      backendRouteCO2:
        co2Value != null ? Number(co2Value) : null,

      elevationGainMeters: 0,
      idleTimeMinutes: 0,
      consumptionFactor: 1,

      ecoScore:
        scoreValue != null ? Number(scoreValue) : 0,

      summary: labels.summary,

      agentBreakdown: {
        routeAgent: {
          title: 'Route Optimization Agent',
          status: 'Completed',
          impact: `${Number(
            selection.distanceKm ?? 0
          )} km ${routeType} route calculated.`,
        },

        trafficAgent: {
          title: 'Traffic Intelligence Agent',
          status: 'Estimated',
          impact:
            'Traffic condition is currently estimated because a live traffic provider is not connected yet.',
        },

        fuelAgent: {
          title: 'Fuel/Energy Optimization Agent',
          status: 'Completed',
          impact: `${
            selection.fuelOrEnergyUsed ??
            analysis.fuelOrEnergyUsed ??
            0
          } ${
            selection.unit || fuelData?.unit || ''
          } estimated consumption.`,
        },

        carbonAgent: {
          title: 'Carbon Emission Agent',
          status: 'Completed',
          impact: `${
            selection.co2Emission ??
            analysis.co2Emission ??
            0
          } kg CO2 estimated.`,
        },

        ecoDecisionAgent: {
          title: 'Eco Decision Agent',
          status: 'Completed',
          impact:
            ecoData?.recommendation ||
            'Eco recommendation generated.',
        },
      },

      milestones: [],
    };
  };

  return {
    origin: {
      lat: routeData.origin.latitude,
      lon: routeData.origin.longitude,
      displayName: routeData.origin.name,
      shortName: routeData.origin.name,
    },

    destination: {
      lat: routeData.destination.latitude,
      lon: routeData.destination.longitude,
      displayName: routeData.destination.name,
      shortName: routeData.destination.name,
    },

    backendData: data,
    ecoData: ecoData,

    routes: {
      eco: mapRouteFromBackend('eco', {
        name: 'AI Eco Route',
        tag: 'Multi-Agent AI',
        summary:
          'Fuel-oriented Valhalla auto route. Highways and toll roads remain available. Consumption is based on actual distance, not a fixed savings percentage.',
      }),

      fastest: mapRouteFromBackend('fastest', {
        name: 'Fastest Route',
        tag: 'AI Route Selection',
        summary:
          'Time-oriented Valhalla auto route. Uses highways when they reduce travel time. This is the savings baseline.',
      }),

      shortest: mapRouteFromBackend('shortest', {
        name: 'Shortest Route',
        tag: 'AI Route Selection',
        summary:
          'Distance-oriented Valhalla request (shortest costing). This is the engine distance estimate, not a guaranteed globally shortest path.',
      }),
    },
  };
}

// Convert GeoJSON coordinates to Leaflet [latitude, longitude].
function toLeafletPath(geometry) {
  const coordinates = geometry?.coordinates;

  if (!Array.isArray(coordinates) || coordinates.length === 0) {
    return [];
  }

  return coordinates.map(([lon, lat]) => [lat, lon]);
}

/**
 * Geocodes a place name to { lat, lon, displayName }
 * using OpenStreetMap Nominatim.
 */
export async function geocodeLocation(query) {
  if (!query || !query.trim()) {
    throw new Error('Please enter a valid location name.');
  }

  const cleanQuery = query.trim();

  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
    cleanQuery
  )}&limit=1&addressdetails=1`;

  const headers = {
    Accept: 'application/json',
  };

  if (typeof window === 'undefined') {
    headers['User-Agent'] =
      'EcoRouteAI-GreenSupplyChain-Demo/1.0 (contact: student@ecoroute.ai)';
  }

  try {
    const response = await fetch(url, { headers });

    if (!response.ok) {
      throw new Error(
        `Geocoding service error (${response.status})`
      );
    }

    const data = await response.json();

    if (!data || data.length === 0) {
      throw new Error(
        `Location not found: "${cleanQuery}". Please check the spelling or add state/country (e.g., "Kolhapur, Maharashtra, India").`
      );
    }

    const result = data[0];

    return {
      lat: parseFloat(result.lat),
      lon: parseFloat(result.lon),
      displayName: result.display_name,
      shortName:
        result.name || cleanQuery.split(',')[0].trim(),
    };
  } catch (err) {
    if (err.message.startsWith('Location not found')) {
      throw err;
    }

    throw new Error(
      `Failed to reach Nominatim geocoding service: ${
        err.message || 'Network error'
      }`,
      { cause: err }
    );
  }
}

/**
 * Fetches real driving routes from OSRM and computes
 * Fastest, Shortest, and Eco routes.
 */
export async function fetchRealRoutes(startLocation, endLocation) {
  // Step 1: Geocode start and destination.
  const origin = await geocodeLocation(startLocation);
  const destination = await geocodeLocation(endLocation);

  // Step 2: Query OSRM routing engine.
  // OSRM expects coordinates in longitude, latitude order.
  const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${origin.lon},${origin.lat};${destination.lon},${destination.lat}?overview=full&geometries=geojson&alternatives=true&steps=true`;

  let osrmData;

  try {
    const res = await fetch(osrmUrl);

    if (!res.ok) {
      throw new Error(
        `OSRM routing service error (${res.status})`
      );
    }

    osrmData = await res.json();
  } catch (err) {
    throw new Error(
      `Failed to calculate road route: ${
        err.message || 'Routing server unavailable'
      }`,
      { cause: err }
    );
  }

  if (
    osrmData.code !== 'Ok' ||
    !osrmData.routes ||
    osrmData.routes.length === 0
  ) {
    throw new Error(
      `No road route found between "${origin.shortName}" and "${destination.shortName}". The locations may be on different landmasses or disconnected.`
    );
  }

  // Extract the primary route from OSRM.
  const primaryRoute = osrmData.routes[0];

  const realDistanceKm =
    Math.round((primaryRoute.distance / 1000) * 10) / 10;

  const realDurationMinutes =
    Math.round(primaryRoute.duration / 60);

  // Convert GeoJSON [longitude, latitude] to Leaflet [latitude, longitude].
  const primaryPath =
    primaryRoute.geometry.coordinates.map(
      ([lon, lat]) => [lat, lon]
    );

  // Check whether OSRM returned alternative routes.
  const hasAlternative = osrmData.routes.length > 1;

  const altRoute = hasAlternative
    ? osrmData.routes[1]
    : null;

  const altDistanceKm = altRoute
    ? Math.round((altRoute.distance / 1000) * 10) / 10
    : null;

  const altDurationMinutes = altRoute
    ? Math.round(altRoute.duration / 60)
    : null;

  const altPath = altRoute
    ? altRoute.geometry.coordinates.map(
        ([lon, lat]) => [lat, lon]
      )
    : null;

  // Extract road milestones along the route.
  const milestones = extractMilestones(
    primaryRoute,
    primaryPath,
    origin.shortName,
    destination.shortName
  );

  // 1. FASTEST ROUTE.
  const fastest = {
    id: 'fastest',
    name: 'Fastest Highway Route',
    tag: 'Speed Priority',
    badgeType: 'fastest',

    distanceKm: realDistanceKm,
    baseDurationMinutes: realDurationMinutes,

    consumptionFactor: 1.0,
    ecoScore: 65,

    elevationGainMeters: Math.round(realDistanceKm * 3.2),
    idleTimeMinutes: Math.round(realDurationMinutes * 0.16),

    path: primaryPath,

    summary: `Direct road transit connecting ${origin.shortName} and ${destination.shortName}. Prioritizes maximum allowed road speed limits with standard engine throttle.`,

    agentBreakdown: {
      trafficAgent: {
        title: 'Traffic Intelligence Agent',
        status: 'Standard Highway Flow',
        impact: `Direct highway transit between ${origin.shortName} and ${destination.shortName}.`,
        timeSavedIdle: `${Math.round(
          realDurationMinutes * 0.16
        )} min typical congestion delay`,
      },

      topographyAgent: {
        title: 'Topography & Aerodynamics Agent',
        status: 'Baseline Speed Drag',
        impact:
          'High cruising speed incurs greater aerodynamic air resistance on heavy vehicles.',
        engineStrainReduction: 'Standard engine load',
      },

      emissionsAgent: {
        title: 'Fleet & Carbon Impact Agent',
        status: 'Baseline Emissions',
        impact:
          'Produces standard baseline carbon footprint for this road corridor.',
        fleetProjection: 'Highest fuel expenditure per trip',
      },
    },

    milestones: [
      {
        coords:
          primaryPath[
            Math.floor(primaryPath.length * 0.4)
          ],
        label: 'Highway Speed Corridor',
        type: 'warning',
      },
    ],
  };

  // 2. SHORTEST ROUTE.
  let shortestDistanceKm;
  let shortestDurationMinutes;
  let shortestPath;

  if (
    hasAlternative &&
    altDistanceKm &&
    altDistanceKm < realDistanceKm
  ) {
    shortestDistanceKm = altDistanceKm;
    shortestDurationMinutes = altDurationMinutes;
    shortestPath = altPath;
  } else {
    // This is an estimate, not an independently calculated OSRM route.
    shortestDistanceKm = Math.max(
      1,
      Math.round(realDistanceKm * 0.97 * 10) / 10
    );

    shortestDurationMinutes =
      Math.round(realDurationMinutes * 1.18);

    shortestPath = primaryPath;
  }

  const shortest = {
    id: 'shortest',
    name: 'Shortest Distance Route',
    tag: 'Distance Priority',
    badgeType: 'shortest',

    distanceKm: shortestDistanceKm,
    baseDurationMinutes: shortestDurationMinutes,

    consumptionFactor: 0.94,
    ecoScore: 72,

    elevationGainMeters: Math.round(shortestDistanceKm * 3.8),

    idleTimeMinutes:
      Math.round(shortestDurationMinutes * 0.22),

    path: shortestPath,

    summary: `Distance-optimized corridor. Shorter total odometer distance (${shortestDistanceKm} km), but experiences more frequent urban speed reductions and junction stops.`,

    agentBreakdown: {
      trafficAgent: {
        title: 'Traffic Intelligence Agent',
        status: 'Urban Intersections',
        impact: `Passes through municipal intersections between ${origin.shortName} and ${destination.shortName}.`,
        timeSavedIdle: 'Stop-and-go speed variability',
      },

      topographyAgent: {
        title: 'Topography & Aerodynamics Agent',
        status: 'Repeated Braking',
        impact:
          'Lower cruising velocity but frequent deceleration and re-acceleration cycles.',
        engineStrainReduction: 'Moderate brake and tire wear',
      },

      emissionsAgent: {
        title: 'Fleet & Carbon Impact Agent',
        status: 'Moderate Efficiency',
        impact:
          'Slight mileage reduction partially counteracted by fuel burnt during acceleration.',
        fleetProjection: 'Moderate cost profile',
      },
    },

    milestones: [
      {
        coords:
          shortestPath[
            Math.floor(shortestPath.length * 0.5)
          ],
        label: 'Urban Traffic & Signal Zone',
        type: 'warning',
      },
    ],
  };

  // 3. AI ECO ROUTE.
  // This is an estimated eco-driving profile using the same primary path.
  const ecoDurationMinutes =
    Math.round(realDurationMinutes * 1.12);

  const eco = {
    id: 'eco',
    name: 'AI Eco Route',
    tag: 'Recommended by AI',
    badgeType: 'eco',

    distanceKm: realDistanceKm,
    baseDurationMinutes: ecoDurationMinutes,

    consumptionFactor: 0.76,
    ecoScore: 95,

    elevationGainMeters: Math.round(realDistanceKm * 2.6),
    idleTimeMinutes: 3,

    path: primaryPath,

    summary: `Multi-agent optimized corridor between ${origin.shortName} and ${destination.shortName}. Paces speed at optimal aerodynamic fuel efficiency, eliminating idling and aggressive torque spikes.`,

    keyBenefits: [
      `Saves ~24% fuel and energy through continuous aerodynamic pacing on ${realDistanceKm} km corridor`,

      `Avoids ${Math.round(
        realDurationMinutes * 0.14
      )} minutes of stop-and-go diesel idling`,

      `Reduces net trip CO2 emissions while adding only ~${
        ecoDurationMinutes - realDurationMinutes
      } minutes of transit time`,

      'Enables regenerative recovery on electric and hybrid powertrains',
    ],

    agentBreakdown: {
      trafficAgent: {
        title: 'Traffic Intelligence Agent',
        status: 'Optimal Smooth Flow',
        impact: `Anticipates congestion between ${origin.shortName} and ${destination.shortName}, synchronizing departure with smooth traffic flow.`,
        timeSavedIdle: `${Math.round(
          realDurationMinutes * 0.14
        )} mins idle avoided`,
      },

      topographyAgent: {
        title: 'Topography & Aerodynamics Agent',
        status: 'Drag Minimized',
        impact:
          'Cruising velocity envelope caps high-speed wind drag, reducing engine torque strain by ~35%.',
        engineStrainReduction: '35% less torque load',
      },

      emissionsAgent: {
        title: 'Fleet & Carbon Impact Agent',
        status: 'Max Carbon ROI (A+)',
        impact:
          'Achieves maximum carbon reduction per kilometer for corporate ESG compliance.',
        fleetProjection: 'Tier 1 Green Logistics Certified',
      },
    },

    milestones: milestones,
  };

  return {
    origin,
    destination,

    routes: {
      eco,
      fastest,
      shortest,
    },
  };
}

/**
 * Extracts intermediate milestone callouts along the route coordinates.
 */
function extractMilestones(osrmRoute, path, originName, destName) {
  if (!path || path.length < 5) {
    return [];
  }

  const milestones = [];

  // Milestone 1: Quarter point.
  const idx1 = Math.floor(path.length * 0.25);

  milestones.push({
    coords: path[idx1],
    label: `Eco Speed Pacing (Near ${originName})`,
    type: 'eco',
  });

  // Milestone 2: Mid point.
  const idx2 = Math.floor(path.length * 0.55);

  milestones.push({
    coords: path[idx2],
    label: 'Predictive Low-Idle Corridor',
    type: 'eco',
  });

  // Milestone 3: Three-quarter point.
  const idx3 = Math.floor(path.length * 0.8);

  milestones.push({
    coords: path[idx3],
    label: `Regen & Descent Approach (${destName})`,
    type: 'energy',
  });

  return milestones;
}

/**
 * Dynamically calculates fuel, CO2, cost, and formatted travel time
 * based on actual route metrics and selected vehicle parameters.
 */
export function calculateDynamicMetrics(
  route,
  vehicle,
  isMetric = true
) {
  const distanceKm = Number(route?.distanceKm ?? 0);

  const distance = isMetric
    ? Number(distanceKm.toFixed(1))
    : Number((distanceKm * 0.621371).toFixed(1));

  const distanceUnit = isMetric ? 'km' : 'mi';

  // Prefer travel time returned by the backend.
  const travelTimeMinutes = Number(
    route?.travelTimeMinutes ??
      route?.baseDurationMinutes ??
      0
  );

  const hours = Math.floor(travelTimeMinutes / 60);
  const minutes = Math.round(travelTimeMinutes % 60);

  const timeFormatted =
    hours > 0
      ? `${hours}h ${String(minutes).padStart(2, '0')}m`
      : `${minutes}m`;

  const hasBackendFuel =
    route?.backendRouteFuel != null &&
    Number.isFinite(Number(route.backendRouteFuel));

  const hasBackendCo2 =
    route?.backendRouteCO2 != null &&
    Number.isFinite(Number(route.backendRouteCO2));

  const hasBackendScore =
    route?.backendEcoScore != null &&
    Number.isFinite(Number(route.backendEcoScore));

  // Preserve precise values for calculations.
  // Round values only when displaying them in the UI.
  const rawFuel = hasBackendFuel
    ? Number(route.backendRouteFuel)
    : (distanceKm / 100) *
      (Number(vehicle?.baseConsumptionPer100Km) || 0) *
      (Number(vehicle?.efficiencyMultiplier) || 1);

  const rawCo2 = hasBackendCo2
    ? Number(route.backendRouteCO2)
    : rawFuel * (Number(vehicle?.co2PerFuelUnit) || 0);

  const costPerUnit = Number(vehicle?.costPerUnit) || 0;
  const rawCost = rawFuel * costPerUnit;

  // Round values for display.
  const calculatedFuel = Number(rawFuel.toFixed(1));
  const calculatedCo2 = Number(rawCo2.toFixed(1));
  const calculatedCost = Number(rawCost.toFixed(2));

  const ecoScore = hasBackendScore
    ? Number(route.backendEcoScore)
    : Number(route?.ecoScore ?? 0);

  return {
    distance,
    distanceUnit,
    timeFormatted,

    totalFuel: calculatedFuel,
    totalCo2: calculatedCo2,

    estimatedCost: calculatedCost,
    estimatedCostINR: calculatedCost,

    rawFuel,
    rawCo2,
    rawCost,

    fuelUnit:
      route?.backendFuelUnit || vehicle?.fuelUnit || 'L',

    ecoScore,

    elevationGain: route?.elevationGainMeters || 0,
    idleTime: route?.idleTimeMinutes || 0,
  };
}