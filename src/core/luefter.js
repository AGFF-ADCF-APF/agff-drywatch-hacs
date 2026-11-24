// Lüfterkennlinien und Vorschläge (aus agff-app-drywatch: parseCSV, getFanOperatingPoint, getFanSuggestions).
import { RICHTWERTE } from './konfig.js';

/**
 * Liest die Heulüfterliste Bund/FAT (CSV mit Semikolon).
 * Spalten: Hersteller;Modell_Nr;Typ;Handelsname;Nenndrehzahl_rpm;Motor_Nennleistung_kW;Max_Druck_mbar;Vol_2mbar;Pwr_2mbar;… bis 8 mbar
 * @returns {Array<{name:string, kw:number, pmax:number, punkte:Array<{p:number,q:number,kw:number}>}>}
 */
export function leseLuefterliste(text) {
    const liste = [];
    const zeilen = String(text).split(/\r?\n/);
    for (let i = 1; i < zeilen.length; i++) {
        const c = zeilen[i].split(';');
        if (c.length < 10) continue;
        const kern = `${c[0]} ${c[3]}`.trim();
        const modell = c[1] ? c[1].trim() : '';
        const kw = parseFloat(c[5]);
        const rpm = parseFloat(c[4]);
        const merkmale = [];
        if (modell) merkmale.push(`Nr. ${modell}`);
        if (Number.isFinite(kw)) merkmale.push(`${kw.toFixed(1).replace(/\.0$/, '')} kW`);
        if (Number.isFinite(rpm)) merkmale.push(`${Math.round(rpm)} rpm`);
        const name = merkmale.length ? `${kern} (${merkmale.join(' | ')})` : kern;
        const punkte = [];
        for (let p = 2; p <= 8; p++) {
            const iq = 7 + (p - 2) * 2;
            const ikw = iq + 1;
            if (c[iq] && c[iq].trim()) punkte.push({ p, q: parseFloat(c[iq]), kw: parseFloat(c[ikw]) });
        }
        liste.push({ name, kw, pmax: parseFloat(c[6]), punkte });
    }
    return liste;
}

/**
 * Betriebspunkt eines Lüfters bei gegebenem Gegendruck (lineare Interpolation der Kennlinie).
 * @param {{pmax:number, punkte:Array<{p,q,kw}>}} luefter
 * @param {number} druckMbar
 * @returns {{luftmenge:number, leistung:number, moeglich:boolean}} m³/s, kW
 */
export function betriebspunkt(luefter, druckMbar) {
    const ziel = Math.max(0, parseFloat(druckMbar) || 0);
    const pmax = parseFloat(luefter?.pmax) || 0;
    const pts = (Array.isArray(luefter?.punkte) ? luefter.punkte : [])
        .map(pt => ({ p: parseFloat(pt.p) || 0, q: parseFloat(pt.q) || 0, kw: parseFloat(pt.kw) || 0 }))
        .filter(pt => pt.q >= 0)
        .sort((a, b) => a.p - b.p);
    if (!pts.length || (pmax > 0 && ziel >= pmax)) return { luftmenge: 0, leistung: 0, moeglich: false };

    let p1 = pts[0];
    let p2 = pts[pts.length - 1];
    for (let i = 0; i < pts.length - 1; i++) {
        if (ziel >= pts[i].p && ziel <= pts[i + 1].p) {
            p1 = pts[i];
            p2 = pts[i + 1];
            break;
        }
    }
    if (ziel < p1.p) {
        p2 = p1;
        p1 = { p: 0, q: p1.q, kw: p1.kw };
    }
    const nenner = p2.p - p1.p;
    const r = Math.abs(nenner) < 1e-6 ? 0 : (ziel - p1.p) / nenner;
    const luftmenge = Math.max(0, p1.q + (p2.q - p1.q) * r);
    const leistung = Math.max(0, p1.kw + (p2.kw - p1.kw) * r);
    return { luftmenge, leistung, moeglich: luftmenge > 0 };
}

/**
 * Passende Lüfter aus der Liste. Hauptkriterium: Soll-Luftmenge bei Halbbeladung (halber Stapeldruck + Zuschläge,
 * nach Kittl); Nebenkriterium: Mindestluftmenge 0.07 m/s bei Vollbeladung.
 * @param {{flaeche:number, sollSpez:number, druck:{stapeldruckMbar:number, systemMbar:number, totalMbar:number}, liste:Array, anzahl?:number}} e
 */
export function luefterVorschlaege({ flaeche, sollSpez, druck, liste, anzahl = 5 }) {
    const a = Math.max(0, parseFloat(flaeche) || 0);
    const soll = a * Math.max(0, parseFloat(sollSpez) || 0);
    const minimum = a * RICHTWERTE.geschwMin;
    const druckVoll = druck.totalMbar;
    const druckHalb = druck.stapeldruckMbar / 2 + druck.systemMbar;
    const basis = { soll, minimum, druckVoll, druckHalb, vorschlaege: [] };
    if (soll <= 0 || !Array.isArray(liste) || !liste.length) return basis;

    basis.vorschlaege = liste.map(l => {
        const voll = betriebspunkt(l, druckVoll);
        const halb = betriebspunkt(l, druckHalb);
        const pmax = parseFloat(l.pmax) || 0;
        const abstandHalb = Math.abs(halb.luftmenge - soll) / soll;
        const zuWenigHalb = halb.luftmenge < soll ? 0.35 : 0;
        const zuWenigVoll = voll.luftmenge < minimum ? 0.5 : 0;
        const reserve = pmax > 0 ? Math.max(0, druckVoll / pmax - 0.85) : 1;
        const erfuelltMin = voll.moeglich && voll.luftmenge >= minimum;
        const erfuelltSoll = halb.moeglich && halb.luftmenge >= soll * 0.85;
        return {
            ...l,
            halb,
            voll,
            punktzahl: abstandHalb + zuWenigHalb + zuWenigVoll + reserve,
            geeignet: erfuelltMin && erfuelltSoll && pmax >= druckVoll * 1.02
        };
    }).filter(v => v.voll.moeglich || v.halb.moeglich)
        .sort((x, y) => x.punktzahl - y.punktzahl)
        .slice(0, anzahl);
    return basis;
}
