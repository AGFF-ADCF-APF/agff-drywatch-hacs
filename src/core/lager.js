// Futterlager: Stapeldruck, Dichte, Rosthöhe (aus agff-app-drywatch: getStorageMetrics, getPressureBreakdown,
// getLayerPressureFactor, getLayerDensity, getKittlGrateHeightCm).
import { DICHTE_OPTIONEN, RICHTWERTE, SYSTEM_ZUSCHLAEGE_PA } from './konfig.js';

const zahl = v => parseFloat(v) || 0;
const dichteOption = typ => DICHTE_OPTIONEN.find(o => o.id === typ) || DICHTE_OPTIONEN[1];

/** Druckfaktor einer Schicht in mbar je m Höhe, abhängig von Lagerungsart und TS-Gehalt */
export function schichtDruckFaktor(schicht) {
    const opt = dichteOption(schicht.typ);
    const ts = parseFloat(schicht.ts);
    if (!Number.isFinite(ts)) return opt.f;
    const tsBegrenzt = Math.max(40, Math.min(92, ts));
    const tsKorrektur = 1.58 - (tsBegrenzt - 40) * 0.014;
    return opt.f * Math.max(0.75, Math.min(1.65, tsKorrektur));
}

/** Frischdichte einer Schicht in kg/m³ (eigener Wert oder Standard der Lagerungsart) */
export function schichtDichte(schicht) {
    const d = parseFloat(schicht.dichte);
    return Number.isFinite(d) && d > 0 ? d : dichteOption(schicht.typ).d;
}

/**
 * Kennwerte des Stocks.
 * @param {{flaeche:number, schichten:Array<{h:number, ts:number, typ:string, dichte?:number}>, stockhoeheManuell?:number}} lager
 */
export function lagerKennwerte({ flaeche, schichten = [], stockhoeheManuell = null }) {
    const a = zahl(flaeche);
    const hoeheSchichten = schichten.reduce((s, l) => s + zahl(l.h), 0);
    const hoeheMax = stockhoeheManuell && stockhoeheManuell > 0
        ? Math.max(stockhoeheManuell, hoeheSchichten)
        : hoeheSchichten;
    let masseFrisch = 0;
    let druckSchichtenMbar = 0;
    for (const l of schichten) {
        masseFrisch += a * zahl(l.h) * schichtDichte(l);
        druckSchichtenMbar += zahl(l.h) * schichtDruckFaktor(l);
    }
    const druckSkala = hoeheSchichten > 0 && hoeheMax > 0 ? hoeheMax / hoeheSchichten : 1;
    const stapeldruckMbar = druckSchichtenMbar * druckSkala;
    const mittlereDichte = masseFrisch > 0 && a > 0 && hoeheSchichten > 0 ? masseFrisch / (a * hoeheSchichten) : 0;
    return {
        hoeheSchichten,
        hoeheMax,
        druckSkala,
        druckSchichtenMbar,
        stapeldruckMbar,
        stapeldruckPa: stapeldruckMbar * 100,
        masseFrisch,
        mittlereDichte
    };
}

/** Gesamter Druckbedarf: Stapeldruck plus Zuschläge für Dachabsaugung und Luftaufbereitung */
export function druckAufschluesselung(lager, zusatz = {}) {
    const k = lagerKennwerte(lager);
    const dachabsaugungPa = zusatz.dachabsaugung ? SYSTEM_ZUSCHLAEGE_PA.dachabsaugung : 0;
    const luftaufbereitungPa = zusatz.luftaufbereitung ? SYSTEM_ZUSCHLAEGE_PA.luftaufbereitung : 0;
    const systemPa = dachabsaugungPa + luftaufbereitungPa;
    const totalPa = k.stapeldruckPa + systemPa;
    return {
        ...k,
        dachabsaugungPa,
        luftaufbereitungPa,
        systemPa,
        systemMbar: systemPa / 100,
        totalPa,
        totalMbar: totalPa / 100
    };
}

/** Empfohlene Rosthöhe in cm nach Kittl, linear interpoliert und über 300 m² extrapoliert */
export function rostHoeheKittl(flaeche) {
    const tab = RICHTWERTE.kittlRostTabelle;
    const a = Math.max(1, parseFloat(flaeche) || 1);
    if (a <= tab[0].flaeche) return tab[0].rostCm;
    for (let i = 1; i < tab.length; i++) {
        const vor = tab[i - 1];
        const nach = tab[i];
        if (a <= nach.flaeche) {
            const r = (a - vor.flaeche) / Math.max(1, nach.flaeche - vor.flaeche);
            return Math.round(vor.rostCm + (nach.rostCm - vor.rostCm) * r);
        }
    }
    const letzte = tab[tab.length - 1];
    const vorletzte = tab[tab.length - 2];
    const steigung = (letzte.rostCm - vorletzte.rostCm) / Math.max(1, letzte.flaeche - vorletzte.flaeche);
    return Math.round(letzte.rostCm + (a - letzte.flaeche) * steigung);
}
