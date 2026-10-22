// EcoRoute AI - Multi-Agent Cloud Platform Mock Data & Calculation Engine

export const VEHICLE_TYPES = [
  {
    id: 'diesel_class8',
    name: 'Class 8 Heavy Duty Diesel Truck',
    category: 'Heavy Freight',
    fuelType: 'Diesel',
    fuelUnit: 'L',
    baseConsumptionPer100Km: 35.0, // Litres per 100km
    co2PerFuelUnit: 2.68, // kg CO2 per Litre
    efficiencyMultiplier: 1.0,
    costPerUnit: 1.25, // USD per Litre
    icon: 'Truck',
  },
  {
    id: 'electric_semi',
    name: 'Class 8 Electric Semi Truck (EV)',
    category: 'Zero Direct Emissions',
    fuelType: 'Electricity',
    fuelUnit: 'kWh',
    baseConsumptionPer100Km: 125.0, // kWh per 100km
    co2PerFuelUnit: 0.22, // kg CO2 per kWh (Grid mix factor)
    efficiencyMultiplier: 0.85,
    costPerUnit: 0.16, // USD per kWh
    icon: 'BatteryCharging',
  },
  {
    id: 'hybrid_van',
    name: 'Hybrid Commercial Delivery Van',
    category: 'Medium Duty',
    fuelType: 'Hybrid Petrol/Electric',
    fuelUnit: 'L',
    baseConsumptionPer100Km: 15.5,
    co2PerFuelUnit: 2.31,
    efficiencyMultiplier: 0.90,
    costPerUnit: 1.15,
    icon: 'Zap',
  },
  {
    id: 'lcv_diesel',
    name: 'Light Commercial Vehicle (LCV)',
    category: 'Last-Mile Delivery',
    fuelType: 'Diesel',
    fuelUnit: 'L',
    baseConsumptionPer100Km: 10.5,
    co2PerFuelUnit: 2.68,
    efficiencyMultiplier: 0.95,
    costPerUnit: 1.25,
    icon: 'Truck',
  },
  {
    id: 'cng_truck',
    name: 'CNG Freight Carrier',
    category: 'Alternative Fuel',
    fuelType: 'Compressed Natural Gas',
    fuelUnit: 'kg',
    baseConsumptionPer100Km: 28.0,
    co2PerFuelUnit: 2.75,
    efficiencyMultiplier: 0.92,
    costPerUnit: 0.95,
    icon: 'Fuel',
  },
];

export const CORRIDOR_PRESETS = [
  {
    id: 'la_lv',
    name: 'Port of Los Angeles → Las Vegas Hub',
    origin: 'Port of Los Angeles, CA',
    destination: 'Las Vegas Logistics Hub, NV',
    originCoords: [33.7432, -118.2673],
    destinationCoords: [36.1699, -115.1398],
    description: 'High-volume Western US logistics corridor through Mojave Basin and Cajon elevation.',
    routes: {
      eco: {
        id: 'eco',
        name: 'AI Eco Route',
        tag: 'Recommended by AI',
        badgeType: 'eco',
        distanceKm: 432,
        baseDurationMinutes: 272, // 4h 32m
        consumptionFactor: 0.74, // 26% lower consumption
        ecoScore: 95,
        elevationGainMeters: 940,
        idleTimeMinutes: 6,
        summary: 'Optimized speed governor (88 km/h), contour-smoothed Cajon bypass, and zero idle choke points.',
        keyBenefits: [
          'Bypasses 6.8% Cajon peak slope via gentle gradient arterial corridor',
          'Eliminates 38 minutes of diesel idle in Ontario/Barstow bottlenecks',
          'Regenerative braking optimization recovery zone (+14% energy recovered on EV)',
          'Operates vehicle in optimal BSFC (Brake Specific Fuel Consumption) rpm band',
        ],
        agentBreakdown: {
          trafficAgent: {
            title: 'Traffic Intelligence Agent',
            status: 'Optimal Flow',
            impact: 'Bypasses I-15 Friday freight choke-points at Victorville with predictive rerouting.',
            timeSavedIdle: '32 mins idling avoided',
          },
          topographyAgent: {
            title: 'Topography & Aerodynamics Agent',
            status: 'Grade Mitigated',
            impact: 'Restricts peak road grade to 3.2% max vs 7.4% on standard mountain passes.',
            engineStrainReduction: '42% lower torque spikes',
          },
          emissionsAgent: {
            title: 'Fleet & Carbon Impact Agent',
            status: 'Max Carbon ROI',
            impact: 'Reduces net trip CO2 by over 25%, qualifying for Tier 1 Green Freight credits.',
            fleetProjection: 'For a 20-truck fleet running weekly: ~118 metric tons CO2 saved/yr',
          },
        },
        // Detailed coordinates for Leaflet polyline
        path: [
          [33.7432, -118.2673],
          [33.8821, -118.1567],
          [34.0205, -117.9123],
          [34.1200, -117.6500],
          [34.2500, -117.4200],
          [34.3900, -117.3100],
          [34.5362, -117.2928],
          [34.7200, -117.1500],
          [34.8958, -117.0173],
          [35.1200, -116.6500],
          [35.2700, -116.0700],
          [35.4500, -115.8200],
          [35.6100, -115.3900],
          [35.8500, -115.2400],
          [36.0500, -115.1800],
          [36.1699, -115.1398],
        ],
        milestones: [
          { coords: [34.2500, -117.4200], label: 'Low-Gradient Contour Bypass', type: 'eco' },
          { coords: [34.8958, -117.0173], label: 'Predictive Green Corridor (Barstow)', type: 'eco' },
          { coords: [35.6100, -115.3900], label: 'Regenerative Descent Zone', type: 'energy' },
        ],
      },
      fastest: {
        id: 'fastest',
        name: 'Fastest Highway Route',
        tag: 'Speed Priority',
        badgeType: 'fastest',
        distanceKm: 448,
        baseDurationMinutes: 255, // 4h 15m (17 mins faster)
        consumptionFactor: 1.0, // baseline
        ecoScore: 64,
        elevationGainMeters: 1420,
        idleTimeMinutes: 44,
        summary: 'Direct Interstate 15 interstate corridor. High cruising speeds (110 km/h) with severe aerodynamic drag and heavy uphill throttle.',
        keyBenefits: [
          'Direct highway transit with minimal road transitions',
          'Saves ~17 minutes in raw transit time if no unexpected delays occur',
        ],
        agentBreakdown: {
          trafficAgent: {
            title: 'Traffic Intelligence Agent',
            status: 'High Congestion Risk',
            impact: 'Severe bottle-neck vulnerability at Cajon Summit and Primm agricultural inspection.',
            timeSavedIdle: '0 mins (Heavy stop & go risk)',
          },
          topographyAgent: {
            title: 'Topography & Aerodynamics Agent',
            status: 'High Aerodynamic Drag',
            impact: 'Sustained 110+ km/h cruising increases drag power requirements by 38%.',
            engineStrainReduction: 'None (Peak engine load)',
          },
          emissionsAgent: {
            title: 'Fleet & Carbon Impact Agent',
            status: 'High Emissions',
            impact: 'Produces highest fuel expenditure and CO2 output of all corridors.',
            fleetProjection: 'Estimated +$1,420 fuel cost / truck / month over Eco Route',
          },
        },
        path: [
          [33.7432, -118.2673],
          [33.9100, -118.1000],
          [34.0522, -117.8000],
          [34.1083, -117.2898],
          [34.3153, -117.4475],
          [34.5362, -117.2928],
          [34.8958, -117.0173],
          [35.2633, -116.0744],
          [35.6111, -115.3889],
          [35.9000, -115.2200],
          [36.1699, -115.1398],
        ],
        milestones: [
          { coords: [34.3153, -117.4475], label: 'Cajon Pass Summit (Steep 7.2% Grade)', type: 'warning' },
          { coords: [35.6111, -115.3889], label: 'Primm Chokepoint & Inspection', type: 'warning' },
        ],
      },
      shortest: {
        id: 'shortest',
        name: 'Shortest Distance Route',
        tag: 'Distance Priority',
        badgeType: 'shortest',
        distanceKm: 412,
        baseDurationMinutes: 308, // 5h 08m
        consumptionFactor: 0.94, // 6% lower due to km, but offset by stops
        ecoScore: 71,
        elevationGainMeters: 1890,
        idleTimeMinutes: 52,
        summary: 'Cut-through secondary state highways (CA-138 / Mojave). Lower odometer mileage but frequent speed changes, steep switchbacks, and urban traffic lights.',
        keyBenefits: [
          '36 fewer total road kilometres',
          'Bypasses heavy interstate toll checkpoints',
        ],
        agentBreakdown: {
          trafficAgent: {
            title: 'Traffic Intelligence Agent',
            status: 'Frequent Stops',
            impact: '34 signaled intersections through Lancaster and Palmdale districts.',
            timeSavedIdle: 'Stop-and-go thermal dissipation',
          },
          topographyAgent: {
            title: 'Topography & Aerodynamics Agent',
            status: 'Extreme Gradient',
            impact: 'High rolling resistance and frequent braking cycles wear tires and brake pads.',
            engineStrainReduction: 'Heavy gear shifts',
          },
          emissionsAgent: {
            title: 'Fleet & Carbon Impact Agent',
            status: 'Moderate Efficiency',
            impact: 'Distance reduction negated by fuel burned during acceleration after stop signs.',
            fleetProjection: 'Higher maintenance costs from brake wear',
          },
        },
        path: [
          [33.7432, -118.2673],
          [33.8200, -118.2200],
          [34.0200, -118.0500],
          [34.1900, -118.0500],
          [34.4200, -118.0800],
          [34.5800, -118.1100],
          [34.8000, -117.6500],
          [34.9500, -117.1500],
          [35.1500, -116.5000],
          [35.4000, -115.9000],
          [35.7500, -115.4000],
          [36.1699, -115.1398],
        ],
        milestones: [
          { coords: [34.5800, -118.1100], label: 'Lancaster Urban Signal Corridor', type: 'warning' },
          { coords: [35.1500, -116.5000], label: 'Desert Single-Lane Switchback', type: 'warning' },
        ],
      },
    },
  },
  {
    id: 'sf_reno',
    name: 'Port of Oakland → Reno Logistics Park',
    origin: 'Port of Oakland, CA',
    destination: 'Reno-Tahoe Industrial Center, NV',
    originCoords: [37.8044, -122.2712],
    destinationCoords: [39.5296, -119.8138],
    description: 'Sierra Nevada mountain pass route with high elevation risks, snow alerts, and severe grade mitigation.',
    routes: {
      eco: {
        id: 'eco',
        name: 'AI Eco Route',
        tag: 'Recommended by AI',
        badgeType: 'eco',
        distanceKm: 365,
        baseDurationMinutes: 245,
        consumptionFactor: 0.76,
        ecoScore: 94,
        elevationGainMeters: 1650,
        idleTimeMinutes: 5,
        summary: 'Thermal-managed climb via I-80 corridor with continuous torque stabilization and Truckee regenerative descent.',
        keyBenefits: [
          'Dynamically schedules Donner Pass crossing during optimal ambient air density',
          'Prevents engine overheating and avoids 28 minutes of Sacramento rush hour idling',
          'High regenerative capture (+19% EV recharge)',
        ],
        agentBreakdown: {
          trafficAgent: {
            title: 'Traffic Intelligence Agent',
            status: 'Flow Optimized',
            impact: 'Sacramento beltway bypass saves 22 mins of idle freight delay.',
            timeSavedIdle: '22 mins saved',
          },
          topographyAgent: {
            title: 'Topography & Aerodynamics Agent',
            status: 'Mountain Optimized',
            impact: 'Donner Summit torque management prevents engine turbo heat soak.',
            engineStrainReduction: '38% less stress',
          },
          emissionsAgent: {
            title: 'Fleet & Carbon Impact Agent',
            status: 'Green Certified',
            impact: 'Saves ~84 kg CO2 compared to unregulated speed trucking.',
            fleetProjection: '94 metric tons annual reduction',
          },
        },
        path: [
          [37.8044, -122.2712],
          [37.9500, -122.1500],
          [38.2500, -121.9500],
          [38.4500, -121.6500],
          [38.5816, -121.4944],
          [38.8000, -121.1500],
          [39.1000, -120.7500],
          [39.3200, -120.3500],
          [39.3300, -120.2000],
          [39.5296, -119.8138],
        ],
        milestones: [
          { coords: [38.5816, -121.4944], label: 'Predictive Beltway Diverter', type: 'eco' },
          { coords: [39.3200, -120.3500], label: 'Donner Summit Torque Control', type: 'eco' },
        ],
      },
      fastest: {
        id: 'fastest',
        name: 'Fastest Route (I-80 Express)',
        tag: 'Speed Priority',
        badgeType: 'fastest',
        distanceKm: 372,
        baseDurationMinutes: 232,
        consumptionFactor: 1.0,
        ecoScore: 66,
        elevationGainMeters: 2200,
        idleTimeMinutes: 35,
        summary: 'Standard I-80 corridor with aggressive uphill acceleration.',
        keyBenefits: ['13 mins faster assuming no chain-control delay'],
        agentBreakdown: {
          trafficAgent: {
            title: 'Traffic Intelligence Agent',
            status: 'Sacramento Jam',
            impact: 'Exposed to Interstate 80 commute rush hour.',
            timeSavedIdle: '0 mins',
          },
          topographyAgent: {
            title: 'Topography & Aerodynamics Agent',
            status: 'Peak Incline',
            impact: 'Full throttle climb pushes diesel particulate filter temps.',
            engineStrainReduction: 'None',
          },
          emissionsAgent: {
            title: 'Fleet & Carbon Impact Agent',
            status: 'High Fuel Burn',
            impact: 'Peak diesel fuel burn per mile on mountain climb.',
            fleetProjection: 'High fuel cost',
          },
        },
        path: [
          [37.8044, -122.2712],
          [38.0000, -122.1000],
          [38.3000, -121.8000],
          [38.5816, -121.4944],
          [38.9000, -121.0500],
          [39.2000, -120.6000],
          [39.3500, -120.2500],
          [39.5296, -119.8138],
        ],
        milestones: [
          { coords: [38.5816, -121.4944], label: 'Interstate Congestion Zone', type: 'warning' },
          { coords: [39.3500, -120.2500], label: 'Steep Summit Peak', type: 'warning' },
        ],
      },
      shortest: {
        id: 'shortest',
        name: 'Shortest Route via Highway 50',
        tag: 'Distance Priority',
        badgeType: 'shortest',
        distanceKm: 348,
        baseDurationMinutes: 285,
        consumptionFactor: 0.95,
        ecoScore: 70,
        elevationGainMeters: 2450,
        idleTimeMinutes: 48,
        summary: 'US-50 through South Lake Tahoe with extreme alpine grades and tourist traffic.',
        keyBenefits: ['24 km shorter odometer distance'],
        agentBreakdown: {
          trafficAgent: {
            title: 'Traffic Intelligence Agent',
            status: 'Tourist Congestion',
            impact: 'Multiple traffic lights throughout Lake Tahoe basin.',
            timeSavedIdle: 'Excessive idling',
          },
          topographyAgent: {
            title: 'Topography & Aerodynamics Agent',
            status: 'Severe Switchbacks',
            impact: 'Braking wear on Echo Summit descent.',
            engineStrainReduction: 'Heavy brake wear',
          },
          emissionsAgent: {
            title: 'Fleet & Carbon Impact Agent',
            status: 'Elevated Emissions',
            impact: 'Idle emissions in fragile alpine basin.',
            fleetProjection: 'High brake replacement frequency',
          },
        },
        path: [
          [37.8044, -122.2712],
          [38.1000, -121.8000],
          [38.5000, -121.3000],
          [38.7000, -120.8000],
          [38.8000, -120.2000],
          [38.9300, -119.9700],
          [39.1500, -119.7500],
          [39.5296, -119.8138],
        ],
        milestones: [
          { coords: [38.9300, -119.9700], label: 'Tahoe Alpine Choke Point', type: 'warning' },
        ],
      },
    },
  },
  {
    id: 'chi_ind',
    name: 'Chicago Distribution Yard → Indianapolis Hub',
    origin: 'Chicago Central Logistics Yard, IL',
    destination: 'Indianapolis Logistics Park, IN',
    originCoords: [41.8781, -87.6298],
    destinationCoords: [39.7684, -86.1581],
    description: 'Midwest manufacturing backbone corridor connecting Great Lakes industrial hub to central warehousing.',
    routes: {
      eco: {
        id: 'eco',
        name: 'AI Eco Route',
        tag: 'Recommended by AI',
        badgeType: 'eco',
        distanceKm: 295,
        baseDurationMinutes: 188,
        consumptionFactor: 0.78,
        ecoScore: 96,
        elevationGainMeters: 380,
        idleTimeMinutes: 4,
        summary: 'I-65 smart pacing avoiding Gary industrial bottle-neck, utilizing continuous aerodynamic platooning lanes.',
        keyBenefits: [
          'Bypasses Gary construction bottlenecks and rail crossing delays',
          'Steady 88 km/h aerodynamic cruising on flat terrain',
          'Predictive traffic light green-wave through outer corridor',
        ],
        agentBreakdown: {
          trafficAgent: {
            title: 'Traffic Intelligence Agent',
            status: 'Clear Corridor',
            impact: 'Bypasses south Chicago construction zones.',
            timeSavedIdle: '26 mins saved',
          },
          topographyAgent: {
            title: 'Topography & Aerodynamics Agent',
            status: 'Minimal Incline',
            impact: 'Leverages flat prairie terrain for optimal engine gear locking.',
            engineStrainReduction: '52% lower variability',
          },
          emissionsAgent: {
            title: 'Fleet & Carbon Impact Agent',
            status: 'Peak Eco Score',
            impact: 'Minimizes stop-and-go soot production by 68%.',
            fleetProjection: '72 metric tons saved annually',
          },
        },
        path: [
          [41.8781, -87.6298],
          [41.6000, -87.5500],
          [41.3500, -87.3500],
          [41.0500, -87.1500],
          [40.7500, -86.9000],
          [40.4200, -86.8700],
          [40.1500, -86.5500],
          [39.9500, -86.3000],
          [39.7684, -86.1581],
        ],
        milestones: [
          { coords: [41.3500, -87.3500], label: 'Gary Construction Bypass', type: 'eco' },
          { coords: [40.4200, -86.8700], label: 'Lafayette Aerodynamic Platooning Sector', type: 'eco' },
        ],
      },
      fastest: {
        id: 'fastest',
        name: 'Fastest Route (I-65 Direct)',
        tag: 'Speed Priority',
        badgeType: 'fastest',
        distanceKm: 302,
        baseDurationMinutes: 178,
        consumptionFactor: 1.0,
        ecoScore: 68,
        elevationGainMeters: 410,
        idleTimeMinutes: 28,
        summary: 'Direct I-65 with high speeds but susceptible to Gary interchange bottleneck.',
        keyBenefits: ['10 mins faster if zero roadwork delays'],
        agentBreakdown: {
          trafficAgent: {
            title: 'Traffic Intelligence Agent',
            status: 'Moderate Delays',
            impact: 'Heavy truck traffic on I-65 South.',
            timeSavedIdle: '0 mins',
          },
          topographyAgent: {
            title: 'Topography & Aerodynamics Agent',
            status: 'Headwind Exposure',
            impact: 'Open plains headwind increases aerodynamic drag at 115 km/h.',
            engineStrainReduction: 'Normal',
          },
          emissionsAgent: {
            title: 'Fleet & Carbon Impact Agent',
            status: 'Baseline Fuel',
            impact: 'Higher fuel consumption from higher speed limit.',
            fleetProjection: 'Standard fleet baseline',
          },
        },
        path: [
          [41.8781, -87.6298],
          [41.5500, -87.3500],
          [41.1500, -87.2000],
          [40.7000, -86.9500],
          [40.3500, -86.7500],
          [39.9800, -86.3500],
          [39.7684, -86.1581],
        ],
        milestones: [
          { coords: [41.5500, -87.3500], label: 'I-80/I-65 Interchange Congestion', type: 'warning' },
        ],
      },
      shortest: {
        id: 'shortest',
        name: 'Shortest Route (US-41 / IN-32)',
        tag: 'Distance Priority',
        badgeType: 'shortest',
        distanceKm: 282,
        baseDurationMinutes: 220,
        consumptionFactor: 0.93,
        ecoScore: 73,
        elevationGainMeters: 450,
        idleTimeMinutes: 38,
        summary: 'Country highway route with dozens of small-town speed drops.',
        keyBenefits: ['20 km shorter'],
        agentBreakdown: {
          trafficAgent: {
            title: 'Traffic Intelligence Agent',
            status: 'Frequent Towns',
            impact: 'Speed limit drops from 55 mph to 30 mph through 9 towns.',
            timeSavedIdle: 'Intermittent slowdowns',
          },
          topographyAgent: {
            title: 'Topography & Aerodynamics Agent',
            status: 'Stop and Go',
            impact: 'Multiple acceleration cycles from red lights.',
            engineStrainReduction: 'High stop frequency',
          },
          emissionsAgent: {
            title: 'Fleet & Carbon Impact Agent',
            status: 'Moderate Emissions',
            impact: 'Acceleration soot offset distance benefit.',
            fleetProjection: 'Moderate cost profile',
          },
        },
        path: [
          [41.8781, -87.6298],
          [41.4000, -87.5000],
          [41.0000, -87.4500],
          [40.6000, -87.3000],
          [40.2000, -87.0500],
          [39.9000, -86.6000],
          [39.7684, -86.1581],
        ],
        milestones: [
          { coords: [40.6000, -87.3000], label: 'State Highway Speed Zone', type: 'warning' },
        ],
      },
    },
  },
];

export function calculateRouteMetrics(route, vehicle, isMetric = true) {
  const distance = isMetric ? route.distanceKm : Math.round(route.distanceKm * 0.621371);
  const distanceUnit = isMetric ? 'km' : 'mi';

  // Base fuel consumption in vehicle's unit (L, kWh, or kg)
  const totalFuel = (
    (route.distanceKm / 100) *
    vehicle.baseConsumptionPer100Km *
    route.consumptionFactor *
    vehicle.efficiencyMultiplier
  ).toFixed(1);

  // Total CO2 in kg
  const totalCo2 = (parseFloat(totalFuel) * vehicle.co2PerFuelUnit).toFixed(1);

  // Estimated fuel cost in USD
  const estimatedCost = (parseFloat(totalFuel) * vehicle.costPerUnit).toFixed(2);

  // Duration in hours and minutes
  const hours = Math.floor(route.baseDurationMinutes / 60);
  const minutes = route.baseDurationMinutes % 60;
  const timeFormatted = `${hours}h ${minutes < 10 ? '0' : ''}${minutes}m`;

  return {
    distance,
    distanceUnit,
    timeFormatted,
    totalFuel: parseFloat(totalFuel),
    fuelUnit: vehicle.fuelUnit,
    totalCo2: parseFloat(totalCo2),
    estimatedCost: parseFloat(estimatedCost),
    ecoScore: route.ecoScore,
    elevationGain: route.elevationGainMeters,
    idleTime: route.idleTimeMinutes,
  };
}
