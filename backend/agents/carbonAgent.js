async function carbonAgent(fuelData) {
  const emissionFactors = {
    L: 2.31,    // Petrol: kg CO2 per litre
    kg: 2.75,   // Fuel emissions factor per kg
    kWh: 0.18,  // Electricity: kg CO2 per kWh
  };

  const factor = emissionFactors[fuelData.unit] ?? 0;

  const routeEmissions = (fuelData.routeConsumption || []).map((route) => {
    const co2Emission = route.fuelOrEnergyUsed * factor;

    return {
      option: route.option,
      routeType: route.routeType,
      distanceKm: route.distanceKm,
      fuelOrEnergyUsed: route.fuelOrEnergyUsed,
      unit: route.unit,
      co2Emission: Number(co2Emission.toFixed(2)),
    };
  });

  const fastestEmissions =
    routeEmissions.find((route) => route.routeType === "fastest") ||
    routeEmissions[0];

  const co2Emission =
    fastestEmissions?.co2Emission ??
    fuelData.fuelOrEnergyUsed * factor;

  return {
    agent: "Carbon Emission Agent",
    status: "success",
    vehicle: fuelData.vehicle,
    fuelOrEnergyUsed: fuelData.fuelOrEnergyUsed,
    unit: fuelData.unit,
    emissionFactor: factor,
    co2Emission: Number(Number(co2Emission).toFixed(2)),
    co2Unit: "kg CO2",
    routeEmissions,
    message:
      "CO2 emissions estimated from per-route fuel or energy use and the applicable emission factor.",
  };
}

module.exports = carbonAgent;