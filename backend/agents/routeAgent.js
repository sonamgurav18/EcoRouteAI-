
const axios = require("axios");

const VALHALLA_URL = "https://valhalla1.openstreetmap.de/route";
const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";

// --------------------------------------------------
// 1. GEOCODING
// --------------------------------------------------

async function geocodeLocation(location) {
  const response = await axios.get(NOMINATIM_URL, {
    params: {
      q: location,
      format: "json",
      limit: 1
    },
    headers: {
      "User-Agent": "EcoRouteAI/1.0"
    },
    timeout: 15000
  });

  if (!Array.isArray(response.data) || response.data.length === 0) {
    throw new Error(`Location not found: ${location}`);
  }

  const result = response.data[0];

  return {
    latitude: Number(result.lat),
    longitude: Number(result.lon),
    displayName: result.display_name
  };
}

// --------------------------------------------------
// 2. DECODE VALHALLA POLYLINE (PRECISION 1e6)
// --------------------------------------------------

function decodeValhallaPolyline(encoded) {
  if (typeof encoded !== "string" || encoded.length === 0) {
    return [];
  }

  const coordinates = [];
  let index = 0;
  let latitude = 0;
  let longitude = 0;

  function readValue() {
    let result = 0;
    let shift = 0;
    let byte;

    do {
      if (index >= encoded.length || shift > 30) {
        throw new Error("Invalid Valhalla polyline.");
      }

      byte = encoded.charCodeAt(index++) - 63;

      if (byte < 0 || byte > 63) {
        throw new Error("Invalid character in Valhalla polyline.");
      }

      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    return (result & 1) ? ~(result >> 1) : result >> 1;
  }

  while (index < encoded.length) {
    latitude += readValue();
    longitude += readValue();

    coordinates.push([
      longitude / 1000000,
      latitude / 1000000
    ]);
  }

  return coordinates;
}

// --------------------------------------------------
// 3. CONVERT VALHALLA TRIP TO ROUTE OBJECT
// --------------------------------------------------

function convertTripToRoute(trip) {
  if (!trip || !Array.isArray(trip.legs) || trip.legs.length === 0) {
    return null;
  }

  const coordinates = [];

  for (const leg of trip.legs) {
    if (!leg.shape) continue;

    const legCoordinates = decodeValhallaPolyline(leg.shape);

    for (const point of legCoordinates) {
      const previous = coordinates[coordinates.length - 1];

      if (
        !previous ||
        previous[0] !== point[0] ||
        previous[1] !== point[1]
      ) {
        coordinates.push(point);
      }
    }
  }

  if (coordinates.length < 2) {
    return null;
  }

  const summary = trip.summary || {};

  return {
    distanceKm: Number(Number(summary.length || 0).toFixed(2)),
    travelTimeMinutes: Number(
      (Number(summary.time || 0) / 60).toFixed(1)
    ),
    hasToll: Boolean(summary.has_toll),
    hasHighway: Boolean(summary.has_highway),
    hasFerry: Boolean(summary.has_ferry),
    cost: Number(summary.cost || 0),
    geometry: {
      type: "LineString",
      coordinates
    }
  };
}

// --------------------------------------------------
// 4. REQUEST ROUTES FROM VALHALLA
// --------------------------------------------------

async function getValhallaRoutes(
  originLocation,
  destinationLocation,
  costingOptions = {},
  alternates = 0
) {
  const requestBody = {
    locations: [
      {
        lat: originLocation.latitude,
        lon: originLocation.longitude
      },
      {
        lat: destinationLocation.latitude,
        lon: destinationLocation.longitude
      }
    ],
    costing: "auto",
    costing_options: {
      auto: costingOptions
    },
    units: "kilometers",
    directions_options: {
      units: "kilometers"
    }
  };

  if (alternates > 0) {
    requestBody.alternates = alternates;
  }

  const response = await axios.post(VALHALLA_URL, requestBody, {
    headers: {
      "Content-Type": "application/json"
    },
    timeout: 30000
  });

  const data = response.data;
  const routes = [];

  if (data && data.trip) {
    const primary = convertTripToRoute(data.trip);

    if (primary) {
      routes.push(primary);
    }
  }

  if (data && Array.isArray(data.alternates)) {
    for (const alternate of data.alternates) {
      const trip = alternate.trip || alternate;
      const route = convertTripToRoute(trip);

      if (route) {
        routes.push(route);
      }
    }
  }

  if (routes.length === 0) {
    throw new Error("Valhalla returned no usable driving route.");
  }

  return routes;
}

// --------------------------------------------------
// 5. COMPARE ROUTE GEOMETRIES
// --------------------------------------------------

function getGeometryKey(route) {
  const points = route?.geometry?.coordinates || [];

  if (points.length < 2) return "";

  // Sample multiple positions along the route.
  const samples = Math.min(20, points.length);
  const signature = [];

  for (let i = 0; i < samples; i++) {
    const index = Math.round(
      (i * (points.length - 1)) / (samples - 1)
    );

    const point = points[index];

    signature.push(
      `${point[0].toFixed(4)},${point[1].toFixed(4)}`
    );
  }

  return signature.join("|");
}

function chooseDistinctRoute(candidates, usedKeys, fallback) {
  for (const candidate of candidates) {
    const key = getGeometryKey(candidate);

    if (key && !usedKeys.has(key)) {
      usedKeys.add(key);
      return candidate;
    }
  }

  // If no alternative exists, return the real candidate.
  // Never manufacture a road geometry.
  return fallback;
}

// --------------------------------------------------
// 6. MAIN ROUTE OPTIMIZATION AGENT
// --------------------------------------------------

async function routeAgent(origin, destination) {
  if (
    typeof origin !== "string" ||
    !origin.trim() ||
    typeof destination !== "string" ||
    !destination.trim()
  ) {
    throw new Error("Origin and destination are required.");
  }

  const originLocation = await geocodeLocation(origin.trim());
  const destinationLocation = await geocodeLocation(destination.trim());

  // Fastest route and alternatives.
  const fastestCandidates = await getValhallaRoutes(
    originLocation,
    destinationLocation,
    {},
    2
  );

  const fastestRoute = fastestCandidates[0];

  const usedKeys = new Set();
  const fastestKey = getGeometryKey(fastestRoute);

  if (fastestKey) {
    usedKeys.add(fastestKey);
  }

  // Distance-oriented route and alternatives.
  const shortestCandidates = await getValhallaRoutes(
    originLocation,
    destinationLocation,
    {
      shortest: true
    },
    2
  );

  const shortestRoute = chooseDistinctRoute(
    shortestCandidates,
    usedKeys,
    shortestCandidates[0]
  );

  // Eco-oriented route: avoid highways, tolls and ferries
  // where possible. These preferences do not guarantee a
  // different road or the lowest real-world carbon emissions.
  const ecoCandidates = await getValhallaRoutes(
    originLocation,
    destinationLocation,
    {
      use_highways: 0,
      use_tolls: 0,
      use_ferry: 0
    },
    2
  );

  const ecoRoute = chooseDistinctRoute(
    ecoCandidates,
    usedKeys,
    ecoCandidates[0]
  );

  const routeOptions = [
    {
      option: 1,
      routeType: "fastest",
      distanceKm: fastestRoute.distanceKm,
      travelTimeMinutes: fastestRoute.travelTimeMinutes,
      hasToll: fastestRoute.hasToll,
      hasHighway: fastestRoute.hasHighway,
      hasFerry: fastestRoute.hasFerry,
      geometry: fastestRoute.geometry
    },
    {
      option: 2,
      routeType: "shortest",
      distanceKm: shortestRoute.distanceKm,
      travelTimeMinutes: shortestRoute.travelTimeMinutes,
      hasToll: shortestRoute.hasToll,
      hasHighway: shortestRoute.hasHighway,
      hasFerry: shortestRoute.hasFerry,
      geometry: shortestRoute.geometry
    },
    {
      option: 3,
      routeType: "eco",
      distanceKm: ecoRoute.distanceKm,
      travelTimeMinutes: ecoRoute.travelTimeMinutes,
      hasToll: ecoRoute.hasToll,
      hasHighway: ecoRoute.hasHighway,
      hasFerry: ecoRoute.hasFerry,
      geometry: ecoRoute.geometry
    }
  ];

  return {
    agent: "Route Optimization Agent",
    status: "success",

    origin: {
      name: origin.trim(),
      latitude: originLocation.latitude,
      longitude: originLocation.longitude
    },

    destination: {
      name: destination.trim(),
      latitude: destinationLocation.latitude,
      longitude: destinationLocation.longitude
    },

    distanceKm: fastestRoute.distanceKm,
    travelTimeMinutes: fastestRoute.travelTimeMinutes,
    geometry: fastestRoute.geometry,

    routeOptions,

    message:
      "Routes calculated using OpenStreetMap, Nominatim and Valhalla. " +
      "Available alternative roads depend on the routing server and road network."
  };
}

// --------------------------------------------------
// 7. EXPORT
// --------------------------------------------------

module.exports = routeAgent;

