# DryWatch Heubelüftung – Home Assistant und Grav

Rechner für die Heubelüftung der AGFF: Wasserentzug (l/h und g/m³), grobe TS-Schätzung, Trocknungsphase und
Betriebsempfehlung, dazu Hintergrundwissen (Phasen, Druck, Luftmengen, Einlagerung, Luftaufbereitung, Formeln).
Berechnung und Texte stammen aus [agff-app-drywatch](https://github.com/AGFF-ADCF-APF/agff-app-drywatch).

Ein gemeinsamer JS-Kern, zwei Wege zu den Leuten:

| | Home Assistant (HACS) | Grav (graswachstum.ch) |
|---|---|---|
| Eingabe | Sensoren (Temperatur/Feuchte Zuluft, Abluft, aussen; Luftmenge) oder von Hand | nur von Hand |
| Oberfläche | Lovelace-Card `custom:drywatch-card` | Baustein `[drywatch]` in einer Seite |
| Zusätzlich | Sensoren für Automationen: Wasserentzug, je m³, TS-Schätzung, Phase, Empfehlung, Luftgeschwindigkeit | – |
| Auslieferung | dieses Repo über HACS (Kategorie Integration) | `grav-plugin-agff-drywatch-<version>.zip` |

## Aufbau

```
src/core/          Berechnung, reine Funktionen ohne DOM (physik, lager, luefter, auswertung, konfig)
src/ui/            Web Component <agff-drywatch>: Eingaben, Ergebnis, Wissen; Texte de/fr/it/en (rm → de)
src/card/          Lovelace-Card, reicht Sensorwerte an <agff-drywatch> weiter
src/grav/          Einstieg für das Grav-Plugin
src/daten/         Wissenstexte (Markdown) und Heulüfterliste Bund/FAT (CSV)
custom_components/drywatch/   HA-Integration (Python): Einrichtung im UI, berechnete Sensoren, liefert die Card aus
                              frontend/drywatch-card.js ist gebaut und eingecheckt (HACS lädt das Repo, nicht den Build)
grav/              Grav-Plugin agff-drywatch (PHP, Blueprint); assets/ entsteht beim Bauen
test/              node --test für den Kern, unittest für den Python-Port; beide prüfen vektoren.json
demo/              Testseite für die Web Component
```

Die Physik gibt es zweimal: im JS-Kern (Card, Grav) und als schlanker Python-Port in `custom_components/drywatch/physik.py`
(für die HA-Sensoren). Beide werden gegen dieselben Referenzwerte aus `evaporation.php` geprüft (`test/vektoren.json`).

## Bauen und testen

Auf dem Heimserver ist kein Node installiert; das Skript nimmt einen festgenagelten Node-Container.

```bash
scripts/build.sh          # Tests (JS + Python), Card, Grav-Asset, dist/grav-plugin-agff-drywatch-<version>.zip
scripts/build.sh test     # nur Tests
```

Nach Änderungen an `src/` immer bauen und `custom_components/drywatch/frontend/drywatch-card.js` mitcommitten.
Version überall gleich halten: `package.json`, `custom_components/drywatch/manifest.json`, `custom_components/drywatch/const.py`, `grav/blueprints.yaml`.

Ausprobieren ohne HA und Grav: nach dem Bauen `python3 -m http.server` im Repo-Ordner, dann `/demo/` öffnen.

## Home Assistant

1. HACS → Benutzerdefinierte Repositories → `https://github.com/AGFF-ADCF-APF/agff-drywatch-hacs`, Kategorie *Integration*.
2. Installieren, HA neu starten, *Einstellungen → Geräte & Dienste → Integration hinzufügen → DryWatch*.
3. Sensoren wählen: Zuluft und Abluft (Temperatur, Feuchte) sind Pflicht, aussen und Luftmenge freiwillig; Höhe und Stockfläche.
   Ohne Luftmengen-Sensor kann eine feste Luftmenge eingetragen werden.
4. Card ins Dashboard (die Integration meldet sie selbst als Frontend-Modul an):

```yaml
type: custom:drywatch-card
hoehe: 600
flaeche: 100
entities:
  t_zuluft: sensor.zuluft_temperatur
  rf_zuluft: sensor.zuluft_feuchte
  t_abluft: sensor.heustock_temperatur
  rf_abluft: sensor.heustock_feuchte
  t_aussen: sensor.aussen_temperatur     # freiwillig
  rf_aussen: sensor.aussen_feuchte       # freiwillig
  luftmenge: sensor.luefter_luftmenge    # freiwillig, m³/s oder m³/h
# wissen: false                          # Hintergrundwissen ausblenden
```

Werte ohne Sensor gibt man in der Card von Hand ein; sie bleiben im Browser gespeichert.

## Grav

ZIP unter `user/plugins/` entpacken (Ordner `agff-drywatch`), dann in einer Seite:

```
[drywatch]
[drywatch hoehe=800 flaeche=120 luftmenge=13 wissen=nein]
```

Das Skript wird nur auf Seiten mit dem Baustein geladen. Sprache = aktive Grav-Sprache. Merkblätter und Bilder im Wissen
verlinken auf `datei_basis` (Vorgabe: die Unterlagen bei apps.graswachstum.ch/drywatch).

## Lizenz

Code: © 2026 AGFF – Arbeitsgemeinschaft zur Förderung des Futterbaues, lizenziert unter der EUPL-1.2 (Datei `LICENSE`).
Nicht unter die Lizenz fallen die Inhalte (Merkblätter, Zeichnungen, Fotos, Tabellen); die Rechte liegen bei der jeweiligen
Quelle, meist bei der AGFF. Die Heulüfterliste stammt von Bund/FAT (heute Agroscope).
