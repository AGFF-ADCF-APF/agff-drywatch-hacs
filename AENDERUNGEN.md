# Änderungen

## 0.1.0 – 24.11.2026

- Erster Stand: gemeinsamer JS-Kern aus agff-app-drywatch (Wasserentzug, Stapeldruck, Rosthöhe nach Kittl, Lüfterkennlinien
  und -vorschläge, TS-Schätzung, Phase, Empfehlung) mit Tests gegen evaporation.php.
- Web Component `<agff-drywatch>`: Luftwerte, Anlage, Ergebnis mit Warnungen, Hintergrundwissen mit Suche; für das Handy gebaut
  (eine Spalte, grosse Felder), hell und dunkel, de/fr/it/en.
- Home Assistant: Integration `drywatch` (Einrichtung im UI, Sensoren Wasserentzug, je m³, TS-Schätzung, Phase, Empfehlung,
  Luftgeschwindigkeit) und Card `custom:drywatch-card`.
- Grav: Plugin `agff-drywatch` mit Baustein `[drywatch]` (nur manuelle Eingabe).
