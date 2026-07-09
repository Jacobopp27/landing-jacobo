// ============================================================
//  FÍSICA Y COSTOS — módulo central de cálculos.
//  Aquí van las fórmulas; cámbienlas/afínenlas con sus datos.
// ============================================================

export const DEFAULTS = {
  gasPricePerGallon: 16200, // COP por galón (Medellín aprox.)
  kwhPrice: 850, // COP por kWh (tarifa EPM aprox.)
  litersPerGallon: 3.785,
  co2PerLiterGasoline: 2.31, // kg CO2 por litro de gasolina
  co2PerKwh: 0.164, // kg CO2 por kWh (red eléctrica Colombia, mayormente hídrica)
  treeKgPerYear: 21, // kg CO2 que absorbe un árbol al año
  energyPerLiterMJ: 34.2, // contenido energético de la gasolina (MJ/L)
  effGasoline: 0.25, // eficiencia motor de combustión (~25%)
  effElectric: 0.9, // eficiencia motor eléctrico (~90%)
};

// km mensuales de UNA ruta frecuente
export function routeKmPerMonth(route) {
  const oneWay = route.distanceKm || 0;
  const perTrip = oneWay * (route.roundTrip ? 2 : 1);
  const tripsPerMonth = route.period === "semana" ? route.times * 4.33 : route.times;
  return perTrip * tripsPerMonth;
}

export function totalKmPerMonth(routes) {
  return routes
    .filter((r) => r.active !== false)
    .reduce((sum, r) => sum + routeKmPerMonth(r), 0);
}

// ---- Costos mensuales ----
export function gasMonthly(kmMonth, gasCar, cfg = DEFAULTS) {
  const liters = kmMonth / gasCar.kmPerLiter;
  const gallons = liters / cfg.litersPerGallon;
  const cost = gallons * cfg.gasPricePerGallon;
  const co2 = liters * cfg.co2PerLiterGasoline;
  return { liters, gallons, cost, co2 };
}

export function evMonthly(kmMonth, evCar, cfg = DEFAULTS) {
  const kwh = kmMonth * evCar.kwhPerKm;
  const cost = kwh * cfg.kwhPrice;
  const co2 = kwh * cfg.co2PerKwh;
  return { kwh, cost, co2 };
}

// ---- Comparación completa ----
export function compare(kmMonth, evCar, gasCar, cfg = DEFAULTS) {
  const gas = gasMonthly(kmMonth, gasCar, cfg);
  const ev = evMonthly(kmMonth, evCar, cfg);

  const monthlySaving = gas.cost - ev.cost; // ahorro operativo al mes
  const co2SavedMonth = gas.co2 - ev.co2;
  const priceDiff = evCar.priceCOP - gasCar.priceCOP; // sobrecosto inicial del eléctrico

  // meses para recuperar el sobrecosto con el ahorro de combustible
  const breakEvenMonths = monthlySaving > 0 ? priceDiff / monthlySaving : Infinity;

  const treesPerYear = (co2SavedMonth * 12) / cfg.treeKgPerYear;

  // Energía por km (para mostrar la física)
  const evMJperKm = evCar.kwhPerKm * 3.6;
  const gasMJperKm = cfg.energyPerLiterMJ / gasCar.kmPerLiter;

  return {
    gas,
    ev,
    monthlySaving,
    co2SavedMonth,
    priceDiff,
    breakEvenMonths,
    breakEvenYears: breakEvenMonths / 12,
    treesPerYear,
    physics: {
      evMJperKm,
      gasMJperKm,
      gasUsefulMJperKm: gasMJperKm * cfg.effGasoline,
      evUsefulMJperKm: evMJperKm * cfg.effElectric,
    },
  };
}

// Serie de costo acumulado (precio del carro + operación) para la gráfica.
// Donde las dos líneas se cruzan está el punto de equilibrio.
export function cumulativeSeries(evCar, gasCar, evCostMonth, gasCostMonth, months = 96) {
  const data = [];
  for (let m = 0; m <= months; m += 2) {
    data.push({
      mes: m,
      Eléctrico: Math.round(evCar.priceCOP + evCostMonth * m),
      Gasolina: Math.round(gasCar.priceCOP + gasCostMonth * m),
    });
  }
  return data;
}

export function fmtCOP(n) {
  if (!isFinite(n)) return "—";
  return "$" + Math.round(n).toLocaleString("es-CO");
}
