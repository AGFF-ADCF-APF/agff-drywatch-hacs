// <agff-drywatch>: Bedienoberfläche als Web Component (Shadow DOM, ohne Abhängigkeiten).
// Läuft eigenständig (Grav: nur manuelle Eingabe) oder in der HA-Card (Werte aus Sensoren über .sensorWerte).
//
// Attribute: sprache (de|fr|it|en|rm), datei-basis (URL für Merkblätter/Bilder), hoehe, flaeche, luftmenge,
//            speicher (Schlüssel für localStorage, leer = nicht speichern), ohne-wissen
import { auswerten } from '../core/index.js';
import { uebersetzer } from './texte.js';
import { markdownZuHtml } from './markdown.js';
import { WISSEN } from './wissen.js';
import { STIL } from './stil.js';

const KLIMA = [
    { id: '1', ort: 'aussen' },
    { id: '2', ort: 'zuluft' },
    { id: '3', ort: 'abluft' }
];
const VORGABE = { t1: 18, h1: 70, t2: 20, h2: 60, t3: 16, h3: 88, hoehe: 600, flaeche: 100, luftmenge: 11 };
const fmt = (v, n) => (Number.isFinite(v) ? v.toFixed(n) : '–');
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export class DrywatchPanel extends HTMLElement {
    static get observedAttributes() {
        return ['sprache', 'datei-basis', 'hoehe', 'flaeche', 'luftmenge'];
    }

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this._werte = { ...VORGABE };
        this._sensor = {}; // Schlüssel → true, wenn der Wert von einem Sensor kommt
        this._gebaut = false;
    }

    connectedCallback() {
        this._ladeGespeichert();
        for (const k of ['hoehe', 'flaeche', 'luftmenge']) {
            const a = parseFloat(this.getAttribute(k));
            if (Number.isFinite(a) && !this._gespeichert?.[k] && !this._sensor[k]) this._werte[k] = a;
        }
        this._baue();
    }

    attributeChangedCallback() {
        if (this._gebaut) this._baue();
    }

    /** Werte aus Sensoren, z. B. { t2: 21.3, h2: 58 }; null/undefined = nicht verfügbar */
    set sensorWerte(werte) {
        let geaendert = false;
        const neu = {};
        for (const [k, v] of Object.entries(werte || {})) {
            const z = parseFloat(v);
            if (!Number.isFinite(z)) continue;
            neu[k] = true;
            if (this._werte[k] !== z) { this._werte[k] = z; geaendert = true; }
        }
        if (Object.keys(neu).join() !== Object.keys(this._sensor).join()) geaendert = true;
        this._sensor = neu;
        if (!this._gebaut) return;
        if (geaendert) { this._fuelleEingaben(); this._rechne(); }
    }

    get t() {
        return uebersetzer(this.getAttribute('sprache') || document.documentElement.lang);
    }

    _speicherSchluessel() {
        return this.getAttribute('speicher');
    }

    _ladeGespeichert() {
        const s = this._speicherSchluessel();
        this._gespeichert = null;
        if (!s) return;
        try {
            const g = JSON.parse(localStorage.getItem(s) || 'null');
            if (g && typeof g === 'object') {
                this._gespeichert = g;
                for (const [k, v] of Object.entries(g)) {
                    if (k in VORGABE && Number.isFinite(v) && !this._sensor[k]) this._werte[k] = v;
                }
            }
        } catch { /* kein Speicher: Vorgaben bleiben */ }
    }

    _speichere() {
        const s = this._speicherSchluessel();
        if (!s) return;
        const manuell = {};
        for (const k of Object.keys(VORGABE)) if (!this._sensor[k]) manuell[k] = this._werte[k];
        try { localStorage.setItem(s, JSON.stringify(manuell)); } catch { /* ignorieren */ }
    }

    _feld(k, label, schritt) {
        return `<label class="feld" data-feld="${k}">
            <span class="lbl">${esc(label)}<span class="sensor" hidden>${esc(this.t('sensor'))}</span></span>
            <input type="number" inputmode="decimal" step="${schritt}" data-k="${k}">
        </label>`;
    }

    _baue() {
        const t = this.t;
        const ohneWissen = this.hasAttribute('ohne-wissen');
        this.shadowRoot.innerHTML = `<style>${STIL}</style>
        <div class="dw">
            <header><h2>${esc(t('titel'))}</h2><p>${esc(t('untertitel'))}</p></header>

            <section class="karte ergebnis" aria-live="polite">
                <div class="gross"><span class="wert" id="wasserLh">–</span><span class="einheit">l/h</span></div>
                <div class="klein">${esc(t('wasser_lh'))} · <span id="wasserM3">–</span> g/m³ ${esc(t('wasser_m3'))}</div>
                <div class="phase" id="phase"></div>
                <div class="empfehlung" id="empfehlung"></div>
                <dl class="kennzahlen">
                    <div><dt>${esc(t('ts'))}</dt><dd><span id="ts">–</span> %</dd></div>
                    <div><dt>${esc(t('geschwindigkeit'))}</dt><dd><span class="ampel" id="ampelV"></span><span id="v">–</span> m/s</dd></div>
                </dl>
                <ul class="warnungen" id="warnungen"></ul>
                <p class="hinweis">${esc(t('ts_hinweis'))}</p>
            </section>

            <section class="karte">
                <h3>${esc(t('messwerte'))}</h3>
                <div class="klima">
                    ${KLIMA.map(o => `<fieldset><legend>${esc(t(o.ort))}</legend>
                        ${this._feld('t' + o.id, t('temperatur'), '0.1')}
                        ${this._feld('h' + o.id, t('feuchte'), '1')}
                    </fieldset>`).join('')}
                </div>
            </section>

            <section class="karte">
                <h3>${esc(t('anlage'))}</h3>
                <div class="raster">
                    ${this._feld('hoehe', t('hoehe'), '10')}
                    ${this._feld('flaeche', t('flaeche'), '1')}
                    ${this._feld('luftmenge', t('luftmenge'), '0.1')}
                </div>
            </section>

            ${ohneWissen ? '' : `<section class="karte wissen">
                <h3>${esc(t('wissen'))}</h3>
                <input type="search" id="suche" placeholder="${esc(t('wissen_suche'))}" aria-label="${esc(t('wissen_suche'))}">
                <div id="artikel"></div>
            </section>`}
        </div>`;

        this.shadowRoot.querySelectorAll('input[data-k]').forEach(inp => {
            inp.addEventListener('input', () => {
                const z = parseFloat(inp.value);
                if (!Number.isFinite(z)) return;
                this._werte[inp.dataset.k] = z;
                this._rechne();
                this._speichere();
            });
        });
        if (!ohneWissen) {
            this._zeigeWissen('');
            this.shadowRoot.getElementById('suche').addEventListener('input', e => this._zeigeWissen(e.target.value));
        }
        this._gebaut = true;
        this._fuelleEingaben();
        this._rechne();
    }

    _fuelleEingaben() {
        this.shadowRoot.querySelectorAll('input[data-k]').forEach(inp => {
            const k = inp.dataset.k;
            const istSensor = !!this._sensor[k];
            if (istSensor || this.shadowRoot.activeElement !== inp) inp.value = this._werte[k];
            inp.readOnly = istSensor;
            inp.closest('.feld').classList.toggle('vom-sensor', istSensor);
            inp.closest('.feld').querySelector('.sensor').hidden = !istSensor;
        });
    }

    _zeigeWissen(suche) {
        const ziel = this.shadowRoot.getElementById('artikel');
        const basis = this.getAttribute('datei-basis') || undefined;
        const q = suche.trim().toLowerCase();
        const treffer = WISSEN.filter(a => !q || (a.titel + ' ' + a.text).toLowerCase().includes(q));
        ziel.innerHTML = treffer.length
            ? treffer.map(a => `<details${q ? ' open' : ''}><summary>${esc(a.titel)}</summary>
                <div class="md">${markdownZuHtml(a.text, basis)}</div></details>`).join('')
            : `<p class="hinweis">${esc(this.t('nichts_gefunden'))}</p>`;
    }

    _rechne() {
        const w = this._werte;
        const t = this.t;
        const $ = id => this.shadowRoot.getElementById(id);
        const klima = { t1: w.t1, h1: w.h1, t2: w.t2, h2: w.h2, t3: w.t3, h3: w.h3 };
        if (![w.t2, w.h2, w.t3, w.h3].every(Number.isFinite)) {
            $('empfehlung').textContent = t('fehlt');
            return;
        }
        const r = auswerten({ klima, hoehe: w.hoehe, flaeche: w.flaeche, luftmenge: w.luftmenge });
        this._letztes = r;

        $('wasserLh').textContent = fmt(r.wasserLh, 0);
        $('wasserLh').dataset.ampel = r.ampel.wasser;
        $('wasserM3').textContent = fmt(r.wasserProM3, 2);
        $('ts').textContent = fmt(r.ts, 0);
        $('v').textContent = fmt(r.geschwindigkeit, 2);
        $('ampelV').dataset.ampel = r.ampel.geschwindigkeit || '';
        const ph = $('phase');
        ph.textContent = t('phase.' + r.phase.id);
        ph.dataset.phase = r.phase.id;
        $('empfehlung').textContent = t('empfehlung.' + r.empfehlung);

        const warn = [];
        if (r.befeuchtung) warn.push(['rot', t('warn_befeuchtung')]);
        if (r.abluftWaermerAlsZuluft) warn.push(['gelb', t('warn_abluft_warm')]);
        if (r.ampel.geschwindigkeit === 'rot') warn.push(['rot', t('warn_geschw_rot')]);
        if (r.ampel.geschwindigkeit === 'gelb') warn.push(['gelb', t('warn_geschw_gelb')]);
        $('warnungen').innerHTML = warn.map(([a, txt]) => `<li data-ampel="${a}">${esc(txt)}</li>`).join('');

        this.dispatchEvent(new CustomEvent('drywatch-ergebnis', { detail: r, bubbles: true, composed: true }));
    }
}

if (!customElements.get('agff-drywatch')) customElements.define('agff-drywatch', DrywatchPanel);
