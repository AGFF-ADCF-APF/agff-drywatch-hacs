// Lovelace-Card für Home Assistant. Wird von der Integration custom_components/drywatch als Frontend-Modul geladen.
//
// type: custom:drywatch-card
// entities:                      # alle optional; fehlende Werte gibt man in der Card von Hand ein
//   t_aussen: sensor.aussen_temperatur
//   rf_aussen: sensor.aussen_feuchte
//   t_zuluft: sensor.zuluft_temperatur
//   rf_zuluft: sensor.zuluft_feuchte
//   t_abluft: sensor.heustock_temperatur
//   rf_abluft: sensor.heustock_feuchte
//   luftmenge: sensor.luefter_luftmenge   # m³/s
// hoehe: 600        # m ü. M.
// flaeche: 100      # m²
// wissen: true      # Hintergrundwissen anzeigen
import '../ui/drywatch-panel.js';

const ZUORDNUNG = {
    t_aussen: 't1', rf_aussen: 'h1',
    t_zuluft: 't2', rf_zuluft: 'h2',
    t_abluft: 't3', rf_abluft: 'h3',
    luftmenge: 'luftmenge'
};

class DrywatchCard extends HTMLElement {
    setConfig(config) {
        if (!config || typeof config !== 'object') throw new Error('drywatch-card: Konfiguration fehlt');
        const unbekannt = Object.keys(config.entities || {}).filter(k => !(k in ZUORDNUNG));
        if (unbekannt.length) throw new Error(`drywatch-card: unbekannte Einträge unter entities: ${unbekannt.join(', ')}`);
        this._config = config;
        this._baue();
    }

    _baue() {
        const c = this._config;
        this.innerHTML = '';
        const karte = document.createElement('ha-card');
        karte.style.padding = '12px';
        const panel = document.createElement('agff-drywatch');
        panel.setAttribute('speicher', 'drywatch-card:' + (c.speicher || 'standard'));
        if (c.hoehe != null) panel.setAttribute('hoehe', c.hoehe);
        if (c.flaeche != null) panel.setAttribute('flaeche', c.flaeche);
        if (c.datei_basis) panel.setAttribute('datei-basis', c.datei_basis);
        if (c.wissen === false) panel.setAttribute('ohne-wissen', '');
        if (this._sprache) panel.setAttribute('sprache', this._sprache);
        karte.appendChild(panel);
        this.appendChild(karte);
        this._panel = panel;
        if (this._hass) this.hass = this._hass;
    }

    set hass(hass) {
        this._hass = hass;
        if (!this._panel) return;
        const sprache = hass.locale?.language || hass.language;
        if (sprache && sprache !== this._sprache) {
            this._sprache = sprache;
            this._panel.setAttribute('sprache', sprache);
        }
        const werte = {};
        for (const [schluessel, entity] of Object.entries(this._config.entities || {})) {
            const s = hass.states[entity];
            if (!s || s.state === 'unavailable' || s.state === 'unknown') continue;
            let v = parseFloat(s.state);
            if (schluessel === 'luftmenge' && s.attributes?.unit_of_measurement === 'm³/h') v /= 3600;
            werte[ZUORDNUNG[schluessel]] = v;
        }
        this._panel.sensorWerte = werte;
    }

    getCardSize() {
        return 8;
    }

    static getStubConfig() {
        return { hoehe: 600, flaeche: 100, entities: {} };
    }
}

if (!customElements.get('drywatch-card')) customElements.define('drywatch-card', DrywatchCard);
window.customCards = window.customCards || [];
if (!window.customCards.some(c => c.type === 'drywatch-card')) {
    window.customCards.push({
        type: 'drywatch-card',
        name: 'DryWatch Heubelüftung',
        description: 'Wasserentzug, Trocknungsphase und Empfehlung für die Heubelüftung (AGFF)',
        documentationURL: 'https://github.com/AGFF-ADCF-APF/agff-drywatch-hacs'
    });
}
