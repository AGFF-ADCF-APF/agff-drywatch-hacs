"""Einrichtung im UI: Sensoren für Zuluft/Abluft (Pflicht), Aussen und Luftmenge (freiwillig), Höhe und Fläche."""

from __future__ import annotations

from typing import Any

import voluptuous as vol

from homeassistant.config_entries import ConfigEntry, ConfigFlow, ConfigFlowResult, OptionsFlow
from homeassistant.const import CONF_NAME
from homeassistant.core import callback
from homeassistant.helpers import selector

from .const import CONF_FLAECHE, CONF_HOEHE, CONF_LUFTMENGE_FIX, DOMAIN, PFLICHT, QUELLEN

_TEMP = selector.EntitySelector(selector.EntitySelectorConfig(domain="sensor", device_class="temperature"))
_FEUCHTE = selector.EntitySelector(selector.EntitySelectorConfig(domain="sensor", device_class="humidity"))
_SENSOR = selector.EntitySelector(selector.EntitySelectorConfig(domain="sensor"))


def _zahl(minimum: float, maximum: float, schritt: float, einheit: str) -> selector.NumberSelector:
    return selector.NumberSelector(
        selector.NumberSelectorConfig(min=minimum, max=maximum, step=schritt, unit_of_measurement=einheit,
                                      mode=selector.NumberSelectorMode.BOX)
    )


def _schema(v: dict[str, Any], mit_name: bool) -> vol.Schema:
    felder: dict[Any, Any] = {}
    if mit_name:
        felder[vol.Required(CONF_NAME, default=v.get(CONF_NAME, "Heustock"))] = str
    for schluessel in QUELLEN:
        art = vol.Required if schluessel in PFLICHT else vol.Optional
        if schluessel == "luftmenge":
            sel = _SENSOR
        elif schluessel.startswith("t_"):
            sel = _TEMP
        else:
            sel = _FEUCHTE
        felder[art(schluessel, description={"suggested_value": v.get(schluessel)})] = sel
    felder[vol.Required(CONF_HOEHE, default=v.get(CONF_HOEHE, 600))] = _zahl(0, 3000, 10, "m")
    felder[vol.Required(CONF_FLAECHE, default=v.get(CONF_FLAECHE, 100))] = _zahl(1, 2000, 1, "m²")
    felder[vol.Optional(CONF_LUFTMENGE_FIX, description={"suggested_value": v.get(CONF_LUFTMENGE_FIX)})] = _zahl(
        0, 100, 0.1, "m³/s"
    )
    return vol.Schema(felder)


class DrywatchConfigFlow(ConfigFlow, domain=DOMAIN):
    VERSION = 1

    async def async_step_user(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        if user_input is not None:
            return self.async_create_entry(title=user_input[CONF_NAME], data=user_input)
        return self.async_show_form(step_id="user", data_schema=_schema({}, True))

    @staticmethod
    @callback
    def async_get_options_flow(config_entry: ConfigEntry) -> OptionsFlow:
        return DrywatchOptionsFlow()


class DrywatchOptionsFlow(OptionsFlow):
    async def async_step_init(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        if user_input is not None:
            return self.async_create_entry(data=user_input)
        werte = {**self.config_entry.data, **self.config_entry.options}
        return self.async_show_form(step_id="init", data_schema=_schema(werte, False))
