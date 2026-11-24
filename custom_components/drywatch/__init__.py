"""DryWatch Heubelüftung (AGFF): berechnet Wasserentzug, Trocknungsphase und Empfehlung aus vorhandenen
Temperatur- und Feuchtesensoren und bringt die Lovelace-Card drywatch-card mit."""

from __future__ import annotations

from pathlib import Path

from homeassistant.components.frontend import add_extra_js_url
from homeassistant.components.http import StaticPathConfig
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import Platform
from homeassistant.core import HomeAssistant
from homeassistant.helpers import config_validation as cv
from homeassistant.helpers.typing import ConfigType

from .const import CARD_URL, DOMAIN, VERSION

PLATFORMS = [Platform.SENSOR]
CONFIG_SCHEMA = cv.config_entry_only_config_schema(DOMAIN)


async def async_setup(hass: HomeAssistant, config: ConfigType) -> bool:
    """Card einmal als Frontend-Modul anmelden (auch ohne Config-Entry nutzbar, sobald die Integration geladen ist)."""
    await _card_anmelden(hass)
    return True


async def _card_anmelden(hass: HomeAssistant) -> None:
    daten = hass.data.setdefault(DOMAIN, {})
    if daten.get("card"):
        return
    datei = Path(__file__).parent / "frontend" / "drywatch-card.js"
    await hass.http.async_register_static_paths([StaticPathConfig(CARD_URL, str(datei), False)])
    add_extra_js_url(hass, f"{CARD_URL}?v={VERSION}")
    daten["card"] = True


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    await _card_anmelden(hass)
    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    entry.async_on_unload(entry.add_update_listener(_neu_laden))
    return True


async def _neu_laden(hass: HomeAssistant, entry: ConfigEntry) -> None:
    await hass.config_entries.async_reload(entry.entry_id)


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    return await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
