# Berechnungsgrundlagen – Wasserentzug & Psychrometrie

## Verwendete Formeln

### Sättigungsdampfdruck (Magnus-Formel)

`p_sat(T) = 6.1078 · exp(17.08 · T / (234.2 + T))` (hPa)

Gibt den maximal möglichen Dampfdruck bei Temperatur T an.

### Absolute Feuchte x (Mischungsverhältnis)

`x = 622 · φ · p_sat(T) / (p − φ · p_sat(T))` (g/kg Trockenluft)

- φ = relative Luftfeuchtigkeit (0–1)
- p = Luftdruck am Standort (hPa)

### Luftdruck nach Höhe

`p(h) = 1013.25 · (1 − 2.25 · 10⁻⁵ · h)⁵·²⁵` (hPa)

Die eingestellte Höhe (m ü.M.) beeinflusst direkt den Luftdruck und damit alle Feuchtewerte.

### Luftdichte ρ

`ρ = p · 100 / (287.05 · (T + 273.15))` (kg/m³)

### Wasserentzug

`Δx = x_Abluft − x_Zuluft` (g/kg)

`Wasserentzug = Δx · ρ · V̇ · 3.6` (L/h)

- V̇ = Luftmenge (m³/s)
- 3.6 = Umrechnungsfaktor (g/s → L/h)

## Warum können Ergebnisse abweichen?

Verschiedene Rechner oder KI-Werkzeuge (z.B. Gemini, ChatGPT) können andere Werte liefern, weil:

- **Andere Einheit**: `x` in g/kg Trockenluft ≠ absolute Feuchte in g/m³
- **Anderer Luftdruck**: Manche Rechner verwenden fix 1013 hPa (Meereshöhe), dieser Rechner berechnet p nach Standorthöhe.
- **Andere Formel**: Es gibt verschiedene Näherungsformeln für p_sat (Magnus, Tetens, Buck, ASHRAE). Abweichungen bis ~2%.
- **Abluft vs. Zuluft**: Welche Temperatur für ρ verwendet wird, beeinflusst das Ergebnis leicht.

## Beispiel

Standort 600 m ü.M. (p ≈ 942 hPa), Zuluft 20 °C / 60 % rF, Abluft 15 °C / 90 % rF:

- x_Zuluft ≈ 8.7 g/kg
- x_Abluft ≈ 9.5 g/kg
- Δx ≈ 0.8 g/kg

Bei 10 m³/s und ρ ≈ 1.16 kg/m³: **Wasserentzug ≈ 33 L/h**
