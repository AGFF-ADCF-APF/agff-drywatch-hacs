"""Konstanten der Integration DryWatch."""

DOMAIN = "drywatch"
VERSION = "0.1.0"

CONF_HOEHE = "hoehe"
CONF_FLAECHE = "flaeche"
CONF_LUFTMENGE_FIX = "luftmenge_fix"

# Quellen: Schlüssel im Config-Entry → Kürzel des JS-Kerns
QUELLEN = {
    "t_aussen": "t1",
    "rf_aussen": "h1",
    "t_zuluft": "t2",
    "rf_zuluft": "h2",
    "t_abluft": "t3",
    "rf_abluft": "h3",
    "luftmenge": "luftmenge",
}
PFLICHT = ("t_zuluft", "rf_zuluft", "t_abluft", "rf_abluft")

CARD_URL = "/drywatch/drywatch-card.js"
