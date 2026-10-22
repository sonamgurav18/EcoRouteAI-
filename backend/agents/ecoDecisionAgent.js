async function ecoDecisionAgent(
  routeData,
  trafficData,
  fuelData,
  carbonData
) {
  // Get all available route options
  const routes = routeData.routeOptions || [];

  if (routes.length === 0) {
    return {
      agent: "Eco Decision Agent",
      status: "error",
      message: "No route options available for eco analysis."
    };
  }

  const efficiency = Number(fuelData.efficiency) || 1;
  const emissionFactor = Number(carbonData.emissionFactor) || 0;
  const fuelUnit = fuelData.unit || "L";

  // Calculate environmental impact for every route from actual distance.
  // Do not apply extra eco or shortest fuel multipliers.
  const routeAnalysis = routes.map((route) => {
    const distanceKm = Number(route.distanceKm) || 0;

    const fuelFromAgent = (fuelData.routeConsumption || []).find(
      (item) => item.routeType === route.routeType
    );
    const carbonFromAgent = (carbonData.routeEmissions || []).find(
      (item) => item.routeType === route.routeType
    );

    const fuelUsed =
      fuelFromAgent?.fuelOrEnergyUsed ??
      distanceKm / efficiency;

    const co2Emission =
      carbonFromAgent?.co2Emission ??
      fuelUsed * emissionFactor;

    const environmentalImpact = co2Emission;
    return {
      option: route.option,
      routeType: route.routeType,
      distanceKm: Number(distanceKm.toFixed(2)),
      travelTimeMinutes: route.travelTimeMinutes,
      fuelOrEnergyUsed: Number(Number(fuelUsed).toFixed(2)),
      co2Emission: Number(Number(co2Emission).toFixed(2)),
      unit: fuelFromAgent?.unit || fuelUnit,
      environmentalImpact: Number(
        environmentalImpact.toFixed(2)
      )
    };
  });

  const routePreference = {
    eco: 0,
    shortest: 1,
    fastest: 2
  };

  // Find the route with the lowest environmental impact.
  // If two routes tie, prefer Eco, then Shortest.
  const recommendedRoute =
    routeAnalysis.reduce((best, current) => {
      if (current.environmentalImpact < best.environmentalImpact) {
        return current;
      }

      if (
        current.environmentalImpact === best.environmentalImpact &&
        (routePreference[current.routeType] ?? 9) <
          (routePreference[best.routeType] ?? 9)
      ) {
        return current;
      }

      return best;
    });

  // Calculate Eco Score relative to the best route
  const worstImpact = Math.max(
    ...routeAnalysis.map(
      (route) => route.environmentalImpact
    )
  );

  const bestImpact =
    recommendedRoute.environmentalImpact;

  const impactRange =
    worstImpact - bestImpact;

  const ecoScores = routeAnalysis.map((route) => {
    let score = 100;

    if (impactRange > 0) {
      score =
        100 -
        ((route.environmentalImpact - bestImpact) /
          impactRange) *
          30;
    }

    return {
      ...route,
      ecoScore: Number(
        Math.max(0, Math.min(100, score)).toFixed(1)
      )
    };
  });

  const finalRecommendedRoute =
    ecoScores.find(
      (route) =>
        route.option === recommendedRoute.option
    );

  let recommendation;

  if (finalRecommendedRoute.routeType === "eco") {
    recommendation =
      "AI selected the Eco Route because it has the lowest estimated environmental impact.";
  } else if (finalRecommendedRoute.routeType === "shortest") {
    recommendation =
      "AI selected the Shortest Route because it currently has the lowest estimated fuel use and CO2 emissions.";
  } else {
    recommendation =
      "AI selected the Fastest Route because it provides the best environmental result among the available routes.";
  }

  return {
    agent: "Eco Decision Agent",
    status: "success",

    recommendedRoute:
      finalRecommendedRoute.routeType,

    recommendedOption:
      finalRecommendedRoute.option,

    ecoScore:
      finalRecommendedRoute.ecoScore,

    distanceKm:
      finalRecommendedRoute.distanceKm,

    fuelOrEnergyUsed:
      finalRecommendedRoute.fuelOrEnergyUsed,

    co2Emission:
      finalRecommendedRoute.co2Emission,

    trafficLevel:
      trafficData.trafficLevel,

    baselineRouteType: "fastest",

    routeAnalysis: ecoScores,

    recommendation,

    message:
      "All available routes were compared using estimated fuel consumption and CO2 emissions from actual route distance. Traffic remains estimated. Valhalla shortest costing is a distance estimate, not a proven global minimum."
  };
}

module.exports = ecoDecisionAgent;