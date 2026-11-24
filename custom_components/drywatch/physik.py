"""Physik und Auswertung, Port von src/core (physik.js, auswertung.js). Ohne Home-Assistant-Abhängigkeit,
damit die Tests (tests/test_physik.py) dieselben Referenzwerte wie der JS-Kern prüfen können."""

from __future__ import annotations

import math

TS_ANWELK = 60
TS_HAUPT = 80
TS_END = 88
WASSER_MIN_HAUPT = 0.5  # g/m³

PHASEN = ("start", "haupt", "end", "lager")
EMPFEHLUNGEN = ("dauer_pflicht", "dauer", "ineffizient", "intervall", "aus")


def saettigungsdruck(t: float) -> float:
    """Sättigungsdampfdruck in hPa (Magnus)."""
    return 6.1078 * math.exp((17.08 * t) / (234.2 + t))


def luftdruck(hoehe: float) -> float:
    """Luftdruck in hPa aus der Höhe in m ü. M."""
    return 1013.25 * math.pow(1 - 2.25e-5 * hoehe, 5.25)


def luftdichte(t: float, p: float) -> float:
    """Luftdichte in kg/m³."""
    return (p * 100) / (287.05 * (t + 273.15))


def absolute_feuchte(t: float, rf: float, p: float) -> float:
    """Absolute Feuchte x in g/kg trockene Luft."""
    pd = saettigungsdruck(t) * rf / 100
    return (622 * pd) / (p - pd)


def wasserentzug(t2: float, h2: float, t3: float, h3: float, p: float, luftmenge: float | None) -> dict:
    """Wasserentzug: dx g/kg, dichte kg/m³, wasser_pro_m3 g/m³, wasser_lh l/h (negativ = Befeuchtung)."""
    dichte = luftdichte(t2, p)
    dx = absolute_feuchte(t3, h3, p) - absolute_feuchte(t2, h2, p)
    pro_m3 = dx * dichte
    return {
        "dx": dx,
        "dichte": dichte,
        "wasser_pro_m3": pro_m3,
        "wasser_lh": pro_m3 * (luftmenge or 0) * 3.6,
    }


def ts_schaetzung(rf_abluft: float) -> int:
    """Grobe TS-Schätzung in % aus der Abluftfeuchte."""
    for grenze, ts in ((95, 55), (90, 65), (80, 75), (70, 82), (60, 86)):
        if rf_abluft > grenze:
            return ts
    return 88


def phase(ts: float) -> str:
    if ts < TS_ANWELK:
        return "start"
    if ts < TS_HAUPT:
        return "haupt"
    if ts < TS_END:
        return "end"
    return "lager"


def empfehlung(ph: str, wasser_pro_m3: float) -> str:
    if ph == "start":
        return "dauer_pflicht"
    if ph == "haupt":
        return "ineffizient" if wasser_pro_m3 < WASSER_MIN_HAUPT else "dauer"
    if ph == "end":
        return "intervall"
    return "aus"
