"""Berechnete Sensoren: Wasserentzug (l/h, g/m³), TS-Schätzung, Phase, Empfehlung."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Callable

from homeassistant.components.sensor import SensorDeviceClass, SensorEntity, SensorStateClass
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import PERCENTAGE, STATE_UNAVAILABLE, STATE_UNKNOWN
from homeassistant.core import Event, HomeAssistant, callback
from homeassistant.helpers.device_registry import DeviceInfo
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.event import async_track_state_change_event

from . import physik
from .const import CONF_FLAECHE, CONF_HOEHE, CONF_LUFTMENGE_FIX, DOMAIN, QUELLEN, VERSION


@dataclass(frozen=True)
class Art:
    schluessel: str
    einheit: str | None
    nachkomma: int | None
    wert: Callable[[dict[str, Any]], Any]
    enum: tuple[str, ...] | None = None
    icon: str | None = None


ARTEN = (
    Art("wasserentzug", "L/h", 1, lambda r: r["wasser_lh"], icon="mdi:water-minus"),
    Art("wasser_pro_m3", "g/m³", 2, lambda r: r["wasser_pro_m3"], icon="mdi:water-percent"),
    Art("ts_schaetzung", PERCENTAGE, 0, lambda r: r["ts"], icon="mdi:grass"),
    Art("phase", None, None, lambda r: r["phase"], enum=physik.PHASEN, icon="mdi:progress-clock"),
    Art("empfehlung", None, None, lambda r: r["empfehlung"], enum=physik.EMPFEHLUNGEN, icon="mdi:fan"),
    Art("geschwindigkeit", "m/s", 2, lambda r: r["geschwindigkeit"], icon="mdi:weather-windy"),
)


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry, add: AddEntitiesCallback) -> None:
    rechner = Rechner(hass, entry)
    entities = [DrywatchSensor(rechner, art) for art in ARTEN]
    rechner.entities = entities
    add(entities)


class Rechner:
    """Liest die Quellsensoren und rechnet einmal für alle Sensoren dieses Eintrags."""

    def __init__(self, hass: HomeAssistant, entry: ConfigEntry) -> None:
        self.hass = hass
        self.entry = entry
        self.cfg = {**entry.data, **entry.options}
        self.entities: list[DrywatchSensor] = []
        self.ergebnis: dict[str, Any] | None = None

    def quellen(self) -> list[str]:
        return [self.cfg[k] for k in QUELLEN if self.cfg.get(k)]

    def _wert(self, schluessel: str) -> float | None:
        entity = self.cfg.get(schluessel)
        if not entity:
            return None
        s = self.hass.states.get(entity)
        if s is None or s.state in (STATE_UNAVAILABLE, STATE_UNKNOWN):
            return None
        try:
            v = float(s.state)
        except ValueError:
            return None
        if schluessel == "luftmenge" and s.attributes.get("unit_of_measurement") == "m³/h":
            v /= 3600
        return v

    def rechne(self) -> None:
        w = {k: self._wert(k) for k in QUELLEN}
        if any(w[k] is None for k in ("t_zuluft", "rf_zuluft", "t_abluft", "rf_abluft")):
            self.ergebnis = None
            return
        luftmenge = w["luftmenge"] if w["luftmenge"] is not None else self.cfg.get(CONF_LUFTMENGE_FIX)
        p = physik.luftdruck(float(self.cfg.get(CONF_HOEHE, 600)))
        r = physik.wasserentzug(w["t_zuluft"], w["rf_zuluft"], w["t_abluft"], w["rf_abluft"], p, luftmenge)
        ts = physik.ts_schaetzung(w["rf_abluft"])
        ph = physik.phase(ts)
        flaeche = float(self.cfg.get(CONF_FLAECHE) or 0)
        self.ergebnis = {
            **r,
            "wasser_lh": r["wasser_lh"] if luftmenge is not None else None,
            "ts": ts,
            "phase": ph,
            "empfehlung": physik.empfehlung(ph, r["wasser_pro_m3"]),
            "geschwindigkeit": luftmenge / flaeche if luftmenge is not None and flaeche > 0 else None,
            "luftdruck": p,
        }


class DrywatchSensor(SensorEntity):
    _attr_has_entity_name = True
    _attr_should_poll = False

    def __init__(self, rechner: Rechner, art: Art) -> None:
        self._r = rechner
        self._art = art
        self._attr_unique_id = f"{rechner.entry.entry_id}_{art.schluessel}"
        self._attr_translation_key = art.schluessel
        self._attr_icon = art.icon
        self._attr_native_unit_of_measurement = art.einheit
        self._attr_suggested_display_precision = art.nachkomma
        if art.enum:
            self._attr_device_class = SensorDeviceClass.ENUM
            self._attr_options = list(art.enum)
        else:
            self._attr_state_class = SensorStateClass.MEASUREMENT
        self._attr_device_info = DeviceInfo(
            identifiers={(DOMAIN, rechner.entry.entry_id)},
            name=rechner.entry.title,
            manufacturer="AGFF",
            model="DryWatch Heubelüftung",
            sw_version=VERSION,
        )

    @property
    def available(self) -> bool:
        return self._r.ergebnis is not None and self._art.wert(self._r.ergebnis) is not None

    @property
    def native_value(self) -> Any:
        if self._r.ergebnis is None:
            return None
        return self._art.wert(self._r.ergebnis)

    async def async_added_to_hass(self) -> None:
        # Nur der erste Sensor hört auf die Quellen und schreibt danach alle.
        if self._r.entities and self is self._r.entities[0]:
            self._r.rechne()

            @callback
            def _geaendert(_event: Event) -> None:
                self._r.rechne()
                for e in self._r.entities:
                    if e.hass is not None:
                        e.async_write_ha_state()

            self.async_on_remove(async_track_state_change_event(self.hass, self._r.quellen(), _geaendert))
