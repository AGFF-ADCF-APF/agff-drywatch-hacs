// Auswertung eines Messzeitpunkts: Phase, Empfehlung, Wasserentzug, Ampeln (aus update() in agff-app-drywatch).
import { GRENZEN, RICHTWERTE, PHASEN } from './konfig.js';
import { luftdruck, absoluteFeuchte, wasserentzug } from './physik.js';
import { betriebspunkt } from './luefter.js';

/** Grobe TS-Schätzung (%) aus der rel. Feuchte der Abluft (Gleichgewichtsfeuchte) */
export function tsSchaetzung(rfAbluft) {
    const rf = parseFloat(rfAbluft);
    if (rf > 95) return 55;
    if (rf > 90) return 65;
    if (rf > 80) return 75;
    if (rf > 70) return 82;
    if (rf > 60) return 86;
    return 88;
}

/** Trocknungsphase (Index 0–3) aus dem TS-Gehalt */
export function phaseIndex(ts) {
    if (ts < GRENZEN.tsAnwelk) return 0;
    if (ts < GRENZEN.tsHaupt) return 1;
    if (ts < GRENZEN.tsEnd) return 2;
    return 3;
}

/**
 * Betriebsempfehlung als Schlüssel (Text in der Sprachdatei, Schlüssel empfehlung.<id>).
 * dauer_pflicht | dauer | ineffizient | intervall | aus
 */
export function empfehlung(phaseIdx, wasserProM3) {
    if (phaseIdx === 0) return 'dauer_pflicht';
    if (phaseIdx === 1) return wasserProM3 < RICHTWERTE.wasserMinHaupt ? 'ineffizient' : 'dauer';
    if (phaseIdx === 2) return 'intervall';
    return 'aus';
}

/** Ampel Luftgeschwindigkeit im Stock: rot zu wenig, gruen Ziel, gelb zu viel */
export function ampelGeschwindigkeit(v) {
    if (v < RICHTWERTE.geschwMin) return 'rot';
    if (v <= RICHTWERTE.geschwMax) return 'gruen';
    return 'gelb';
}

export function ampelEffizienz(eff) {
    if (eff > RICHTWERTE.effGut) return 'gruen';
    if (eff > RICHTWERTE.effWarn) return 'gelb';
    return 'rot';
}

/** Ampel Wasserentzug je m³ Luft */
export function ampelWasser(wasserProM3) {
    if (wasserProM3 > GRENZEN.wasserHoch) return 'gruen';
    if (wasserProM3 < GRENZEN.wasserTief) return 'rot';
    return 'gelb';
}

/**
 * Gesamtauswertung. Alle Felder ausser Klima dürfen fehlen.
 * @param {object} e
 * @param {{t1?,h1?,t2,h2,t3,h3}} e.klima  1 Aussen, 2 Zuluft, 3 Abluft (°C, %)
 * @param {number} [e.hoehe]       m ü. M. (für Luftdruck, wenn p fehlt)
 * @param {number} [e.p]           Luftdruck hPa
 * @param {number} [e.flaeche]     Stockfläche m²
 * @param {number} [e.luftmenge]   gemessene/bekannte Luftmenge m³/s (hat Vorrang)
 * @param {object} [e.luefter]     Lüfter mit Kennlinie {pmax, punkte}, dazu e.druckMbar
 * @param {number} [e.druckMbar]   Gegendruck (gemessen oder berechnet)
 */
export function auswerten(e) {
    const k = e.klima || {};
    const p = Number.isFinite(parseFloat(e.p)) && parseFloat(e.p) > 0 ? parseFloat(e.p) : luftdruck(parseFloat(e.hoehe) || 0);
    const flaeche = Math.max(0, parseFloat(e.flaeche) || 0);
    const druckMbar = Math.max(0, parseFloat(e.druckMbar) || 0);

    let luftmenge = parseFloat(e.luftmenge);
    let leistung = null;
    if (!(luftmenge >= 0) && e.luefter) {
        const bp = betriebspunkt(e.luefter, druckMbar);
        luftmenge = bp.luftmenge;
        leistung = bp.leistung;
    }
    if (!(luftmenge >= 0)) luftmenge = 0;

    const w = wasserentzug({ t2: k.t2, h2: k.h2, t3: k.t3, h3: k.h3, p, luftmenge });
    const ts = tsSchaetzung(k.h3);
    const pIdx = phaseIndex(ts);
    const geschwindigkeit = flaeche > 0 ? luftmenge / flaeche : null;
    const effizienz = leistung > 0 ? ((luftmenge * druckMbar * 100) / 1000 / leistung) * 100 : null;

    return {
        p,
        xZuluft: absoluteFeuchte(k.t2, k.h2, p),
        xAbluft: absoluteFeuchte(k.t3, k.h3, p),
        dx: w.dx,
        dichte: w.dichte,
        wasserProM3: w.wasserProM3,
        wasserLh: w.wasserLh,
        befeuchtung: w.wasserProM3 < GRENZEN.wasserTief,
        abluftWaermerAlsZuluft: k.t3 > k.t2 + 0.5,
        ts,
        phase: PHASEN[pIdx],
        empfehlung: empfehlung(pIdx, w.wasserProM3),
        luftmenge,
        leistung,
        geschwindigkeit,
        effizienz,
        ampel: {
            wasser: ampelWasser(w.wasserProM3),
            geschwindigkeit: geschwindigkeit === null ? null : ampelGeschwindigkeit(geschwindigkeit),
            effizienz: effizienz === null ? null : ampelEffizienz(effizienz),
            druck: e.luefter && parseFloat(e.luefter.pmax) > 0 ? (druckMbar > parseFloat(e.luefter.pmax) ? 'rot' : 'gruen') : null
        }
    };
}
