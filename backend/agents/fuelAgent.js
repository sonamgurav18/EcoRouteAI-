// EcoRoute AI - Fuel/Energy Optimization Agent

const vehicleData = {
  "Passenger Car - Petrol": {
    consumptionPer100Km: 7.2,
    unit: "L"
  },

  "Passenger Car - Diesel": {
    consumptionPer100Km: 5.6,
    unit: "L"
  },

  "Passenger Car - Electric (EV)": {
    consumptionPer100Km: 16.5,
    unit: "kWh"
  },

  "Motorcycle - Petrol": {
    consumptionPer100Km: 2.4,
    unit: "L"
  },

  "Electric Delivery Van": {
    consumptionPer100Km: 28,
    unit: "kWh"
  },

  "Hybrid SUV": {
    consumptionPer100Km: 5.2,
    unit: "L"
  },

  "Medium Duty Diesel Truck": {
    consumptionPer100Km: 22,
    unit: "L"
  },

  "Heavy Duty Diesel Truck": {
    consumptionPer100Km: 35,
    unit: "L"
  },

  "Electric Semi Truck": {
    consumptionPer100Km: 125,
    unit: "kWh"
  },

  "CNG Freight Truck": {
    consumptionPer100Km: 28,
    unit: "kg"
  },

  "LPG Delivery Vehicle": {
    consumptionPer100Km: 11.5,
    unit: "L"
  },

  "Hydrogen Fuel Cell Truck": {
    consumptionPer100Km: 7.5,
    unit: "kg"
  }
};

async function fuelAgent(routeData, vehicle) {
  const distanceKm = Number(routeData.distanceKm) || 0;

  const selectedVehicle =
    vehicleData[vehicle] || vehicleData["Passenger Car - Petrol"];

  const routeConsumption = (routeData.routeOptions || []).map((route) => {
    const routeDistanceKm = Number(route.distanceKm) || 0;

    const fuelOrEnergyUsed =
      (routeDistanceKm / 100) *
      selectedVehicle.consumptionPer100Km;

    return {
      option: route.option,
      routeType: route.routeType,
      distanceKm: routeDistanceKm,
      fuelOrEnergyUsed: Number(fuelOrEnergyUsed.toFixed(2)),
      unit: selectedVehicle.unit
    };
  });

  const fastestConsumption =
    routeConsumption.find((route) => route.routeType === "fastest") ||
    routeConsumption[0];

  const fuelOrEnergyUsed =
    fastestConsumption?.fuelOrEnergyUsed ??
    ((distanceKm / 100) * selectedVehicle.consumptionPer100Km);

  return {
    agent: "Fuel/Energy Optimization Agent",
    status: "success",
    vehicle: vehicle || "Passenger Car - Petrol",
    distanceKm: fastestConsumption?.distanceKm ?? distanceKm,
    fuelOrEnergyUsed: Number(Number(fuelOrEnergyUsed).toFixed(2)),
    unit: selectedVehicle.unit,
    efficiency: selectedVehicle.consumptionPer100Km,
    routeConsumption,
    message:
      "Fuel or energy consumption calculated from each route distance and the configured vehicle consumption per 100 km."
  };
}

module.exports = fuelAgent;