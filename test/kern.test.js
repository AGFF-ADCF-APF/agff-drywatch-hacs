import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
    luftdruck, wasserentzug, standardLuftdruck, relativeFeuchte, absoluteFeuchte,
    lagerKennwerte, druckAufschluesselung, schichtDruckFaktor, rostHoeheKittl,
    leseLuefterliste, betriebspunkt, luefterVorschlaege,
    tsSchaetzung, phaseIndex, empfehlung, auswerten
} from '../src/core/index.js';

const vektoren = JSON.parse(readFileSync(new URL('./vektoren.json', import.meta.url), 'utf8'));
const nah = (ist, soll, tol, was) => assert.ok(Math.abs(ist - soll) <= tol, `${was}: ${ist} statt ${soll}`);

test('Wasserentzug stimmt mit evaporation.php überein', () => {
    for (const v of vektoren.wasserentzug) {
        const p = luftdruck(v.hoehe);
        nah(p, v.p, 1e-3, 'p');
        const w = wasserentzug({ ...v, p });
        nah(w.dichte, v.dichte, 1e-5, 'Dichte');
        nah(w.dx, v.dx, 1e-5, 'dx');
        nah(w.wasserProM3, v.wasserProM3, 1e-5, 'Wasser/m³');
        nah(w.wasserLh, v.wasserLh, 1e-2, 'Wasser l/h');
    }
});

test('relative und absolute Feuchte sind umkehrbar', () => {
    const p = 950;
    for (const [t, rf] of [[5, 90], [20, 60], [30, 35]]) {
        nah(relativeFeuchte(t, absoluteFeuchte(t, rf, p), p), rf, 1e-9, 'rF');
    }
    assert.equal(standardLuftdruck(600), 943);
    assert.equal(standardLuftdruck('x'), 1013);
});

test('Stapeldruck und Dichte', () => {
    // Mittel (f 2.0) bei TS 60: Korrektur 1.58 - 20*0.014 = 1.30
    nah(schichtDruckFaktor({ typ: 'loose_m', ts: 60 }), 2.6, 1e-9, 'Faktor');
    nah(schichtDruckFaktor({ typ: 'loose_m' }), 2.0, 1e-9, 'Faktor ohne TS');
    const k = lagerKennwerte({ flaeche: 100, schichten: [{ h: 2, ts: 60, typ: 'loose_m' }, { h: 1, ts: 80, typ: 'bales' }] });
    // Ballen f 6.0, TS 80: 1.58 - 0.56 = 1.02 → 6.12
    nah(k.stapeldruckMbar, 2 * 2.6 + 6.12, 1e-9, 'Stapeldruck');
    nah(k.mittlereDichte, (100 * 2 * 80 + 100 * 1 * 130) / 300, 1e-9, 'Dichte');
    const mitManuell = lagerKennwerte({ flaeche: 100, schichten: [{ h: 2, ts: 60, typ: 'loose_m' }], stockhoeheManuell: 4 });
    nah(mitManuell.stapeldruckMbar, 5.2 * 2, 1e-9, 'skaliert auf manuelle Höhe');
    const d = druckAufschluesselung({ flaeche: 100, schichten: [{ h: 2, ts: 60, typ: 'loose_m' }] }, { dachabsaugung: true, luftaufbereitung: true });
    nah(d.totalPa, 520 + 120 + 190, 1e-9, 'Druck total');
});

test('Rosthöhe nach Kittl', () => {
    assert.equal(rostHoeheKittl(10), 41);
    assert.equal(rostHoeheKittl(100), 50);
    assert.equal(rostHoeheKittl(105), 51);
    assert.equal(rostHoeheKittl(400), 101); // Steigung 0.2 cm/m² über 300 m²
});

test('Lüfterliste und Betriebspunkt', () => {
    const liste = leseLuefterliste(readFileSync(new URL('../src/daten/luefterliste.csv', import.meta.url), 'utf8'));
    assert.ok(liste.length > 150, `nur ${liste.length} Lüfter`);
    const l = liste.find(x => x.name.startsWith('Lanker/Aebi BL 19 (Nr. 1067 |'));
    assert.ok(l);
    assert.equal(l.pmax, 8.3);
    const bp = betriebspunkt(l, 3.5); // zwischen 3 (13.7) und 4 mbar (12.5)
    nah(bp.luftmenge, 13.1, 1e-9, 'Luftmenge');
    nah(bp.leistung, 8.7, 1e-9, 'Leistung');
    assert.equal(betriebspunkt(l, 9).moeglich, false);
    // unter dem ersten Punkt: konstant ab 0 mbar
    nah(betriebspunkt(l, 1).luftmenge, 14.6, 1e-9, 'unter 2 mbar');

    const druck = druckAufschluesselung({ flaeche: 100, schichten: [{ h: 3, ts: 60, typ: 'loose_m' }] });
    const v = luefterVorschlaege({ flaeche: 100, sollSpez: 0.11, druck, liste });
    assert.equal(v.vorschlaege.length, 5);
    nah(v.soll, 11, 1e-9, 'Soll');
    nah(v.druckHalb, druck.stapeldruckMbar / 2, 1e-9, 'Halbbeladung');
    for (let i = 1; i < v.vorschlaege.length; i++) assert.ok(v.vorschlaege[i - 1].punktzahl <= v.vorschlaege[i].punktzahl);
});

test('Phase und Empfehlung', () => {
    assert.equal(tsSchaetzung(97), 55);
    assert.equal(tsSchaetzung(60), 88);
    assert.deepEqual([55, 65, 82, 88].map(phaseIndex), [0, 1, 2, 3]);
    assert.equal(empfehlung(0, 5), 'dauer_pflicht');
    assert.equal(empfehlung(1, 0.3), 'ineffizient');
    assert.equal(empfehlung(1, 1), 'dauer');
    assert.equal(empfehlung(2, 1), 'intervall');
    assert.equal(empfehlung(3, 1), 'aus');
});

test('Gesamtauswertung', () => {
    const r = auswerten({ klima: { t2: 20, h2: 60, t3: 15, h3: 90 }, hoehe: 600, flaeche: 100, luftmenge: 11 });
    nah(r.wasserLh, 39.839, 1e-2, 'l/h');
    assert.equal(r.ts, 75);
    assert.equal(r.phase.id, 'haupt');
    assert.equal(r.empfehlung, 'dauer');
    nah(r.geschwindigkeit, 0.11, 1e-9, 'v');
    assert.equal(r.ampel.geschwindigkeit, 'gruen');
    assert.equal(r.ampel.wasser, 'gruen');
    assert.equal(r.effizienz, null);

    const mitLuefter = auswerten({
        klima: { t2: 20, h2: 60, t3: 19, h3: 75 }, p: 950, flaeche: 100, druckMbar: 3,
        luefter: { pmax: 8, punkte: [{ p: 2, q: 12, kw: 7 }, { p: 4, q: 10, kw: 8 }] }
    });
    nah(mitLuefter.luftmenge, 11, 1e-9, 'Luftmenge aus Kennlinie');
    nah(mitLuefter.effizienz, (11 * 300 / 1000 / 7.5) * 100, 1e-9, 'Effizienz');
    assert.equal(mitLuefter.ampel.druck, 'gruen');
});
