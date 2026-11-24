// Feuchte Luft (Magnus-Formel), gleich wie agff-app-drywatch (PHY) und public/api/evaporation.php.
// Temperaturen in °C, rel. Feuchte in %, Druck in hPa, absolute Feuchte x in g Wasser je kg trockene Luft.

/** Sättigungsdampfdruck in hPa */
export const saettigungsdruck = t => 6.1078 * Math.exp((17.08 * t) / (234.2 + t));

/** Luftdruck in hPa aus der Höhe über Meer (Standardatmosphäre) */
export const luftdruck = hoehe => 1013.25 * Math.pow(1 - 2.25e-5 * hoehe, 5.25);

/** Luftdichte in kg/m³ */
export const luftdichte = (t, p) => (p * 100) / (287.05 * (t + 273.15));

/** Absolute Feuchte x in g/kg */
export const absoluteFeuchte = (t, rf, p) => {
    const pd = saettigungsdruck(t) * rf / 100;
    return (622 * pd) / (p - pd);
};

/** Relative Feuchte in % aus x (g/kg), höchstens 100 */
export const relativeFeuchte = (t, x, p) => Math.min(100, (x * p / (622 + x) / saettigungsdruck(t)) * 100);

/** Sättigungsdefizit in g/m³: so viel Wasser kann die Luft noch aufnehmen */
export const saettigungsdefizit = (t, rf, p) =>
    (absoluteFeuchte(t, 100, p) - absoluteFeuchte(t, rf, p)) * luftdichte(t, p);

/** Standard-Luftdruck in hPa (gerundet) für eine Höhe; ungültige Höhe = Meereshöhe */
export function standardLuftdruck(hoehe) {
    const h = Number.isFinite(parseFloat(hoehe)) ? parseFloat(hoehe) : 0;
    return Math.round(luftdruck(h));
}

/**
 * Wasserentzug durch die Belüftung (Port von evaporation.php).
 * @param {object} e  t2/h2 Zuluft, t3/h3 Abluft, p Luftdruck hPa, luftmenge m³/s
 * @returns {{dx:number, dichte:number, wasserProM3:number, wasserLh:number}}
 *   dx g/kg, dichte kg/m³, wasserProM3 g/m³, wasserLh l/h (negativ = Befeuchtung)
 */
export function wasserentzug({ t2, h2, t3, h3, p, luftmenge }) {
    const dichte = luftdichte(t2, p);
    const dx = absoluteFeuchte(t3, h3, p) - absoluteFeuchte(t2, h2, p);
    const wasserProM3 = dx * dichte;
    const wasserLh = wasserProM3 * (luftmenge || 0) * 3.6;
    return { dx, dichte, wasserProM3, wasserLh };
}
