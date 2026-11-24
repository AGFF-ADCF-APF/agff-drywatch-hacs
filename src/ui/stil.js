// Stil für <agff-drywatch>. Handy zuerst: eine Spalte, grosse Eingabefelder (≥ 44 px, 16 px Schrift gegen Zoom in iOS),
// ab 600 px mehrspaltig. Übernimmt Farben von Home Assistant (--primary-text-color usw.), sonst eigene, hell und dunkel.
export const STIL = `
:host {
    --dw-text: var(--primary-text-color, #1f2a1f);
    --dw-text2: var(--secondary-text-color, #5b665b);
    --dw-grund: var(--card-background-color, #ffffff);
    --dw-flaeche: var(--secondary-background-color, #f3f6f1);
    --dw-rand: var(--divider-color, #d6ddd2);
    --dw-akzent: var(--primary-color, #3d7a2a);
    --dw-gruen: #2e7d32; --dw-gelb: #b7791f; --dw-rot: #c62828;
    --dw-blau: #1565c0; --dw-amber: #b45309; --dw-lime: #4d7c0f; --dw-emerald: #047857;
    display: block;
    color: var(--dw-text);
    font: 16px/1.45 var(--paper-font-body1_-_font-family, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif);
    container-type: inline-size;
}
@media (prefers-color-scheme: dark) {
    :host(:not([hell])) {
        --dw-text: var(--primary-text-color, #e6ece4);
        --dw-text2: var(--secondary-text-color, #a9b5a6);
        --dw-grund: var(--card-background-color, #1c211b);
        --dw-flaeche: var(--secondary-background-color, #262d25);
        --dw-rand: var(--divider-color, #3a4438);
        --dw-akzent: var(--primary-color, #7cc160);
        --dw-gruen: #66bb6a; --dw-gelb: #f6c453; --dw-rot: #ef6b6b;
        --dw-blau: #64b5f6; --dw-amber: #f59e0b; --dw-lime: #a3d24a; --dw-emerald: #34d399;
    }
}
* { box-sizing: border-box; }
.dw { display: grid; gap: 12px; }
header h2 { margin: 0; font-size: 1.25rem; }
header p { margin: 2px 0 0; color: var(--dw-text2); font-size: .9rem; }
h3 { margin: 0 0 8px; font-size: 1rem; }
.karte { background: var(--dw-grund); border: 1px solid var(--dw-rand); border-radius: 12px; padding: 12px; min-width: 0; }

.ergebnis .gross { display: flex; align-items: baseline; gap: 6px; }
.ergebnis .wert { font-size: 2.6rem; font-weight: 800; line-height: 1; color: var(--dw-blau); font-variant-numeric: tabular-nums; }
.ergebnis .wert[data-ampel="rot"] { color: var(--dw-rot); }
.ergebnis .wert[data-ampel="gelb"] { color: var(--dw-gelb); }
.ergebnis .einheit { font-weight: 700; color: var(--dw-text2); }
.klein { color: var(--dw-text2); font-size: .9rem; margin-top: 2px; }
.phase { display: inline-block; margin-top: 10px; padding: 2px 10px; border-radius: 999px; font-weight: 700; font-size: .9rem;
         color: #fff; background: var(--dw-akzent); }
.phase[data-phase="start"] { background: var(--dw-blau); }
.phase[data-phase="haupt"] { background: var(--dw-amber); }
.phase[data-phase="end"] { background: var(--dw-lime); }
.phase[data-phase="lager"] { background: var(--dw-emerald); }
.empfehlung { margin-top: 6px; font-weight: 700; font-size: 1.05rem; }
.kennzahlen { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin: 12px 0 0; }
.kennzahlen div { background: var(--dw-flaeche); border-radius: 8px; padding: 8px; }
.kennzahlen dt { font-size: .8rem; color: var(--dw-text2); }
.kennzahlen dd { margin: 0; font-weight: 700; font-variant-numeric: tabular-nums; }
.ampel { display: inline-block; width: 10px; height: 10px; border-radius: 50%; margin-right: 6px; background: var(--dw-rand); }
.ampel[data-ampel="gruen"] { background: var(--dw-gruen); }
.ampel[data-ampel="gelb"] { background: var(--dw-gelb); }
.ampel[data-ampel="rot"] { background: var(--dw-rot); }
.warnungen { list-style: none; margin: 10px 0 0; padding: 0; display: grid; gap: 6px; }
.warnungen:empty { display: none; }
.warnungen li { border-left: 4px solid var(--dw-gelb); background: var(--dw-flaeche); padding: 6px 8px; border-radius: 4px; font-size: .9rem; }
.warnungen li[data-ampel="rot"] { border-color: var(--dw-rot); }
.hinweis { margin: 8px 0 0; font-size: .8rem; color: var(--dw-text2); }

.klima { display: grid; gap: 10px; }
fieldset { border: 1px solid var(--dw-rand); border-radius: 10px; margin: 0; padding: 6px 10px 10px; display: grid;
           grid-template-columns: 1fr 1fr; gap: 8px; min-width: 0; }
legend { font-weight: 700; padding: 0 4px; }
.raster { display: grid; gap: 8px; grid-template-columns: 1fr 1fr; }
.feld { display: grid; gap: 2px; min-width: 0; }
.lbl { font-size: .8rem; color: var(--dw-text2); display: flex; gap: 6px; align-items: center; flex-wrap: wrap; }
.sensor { font-size: .7rem; font-weight: 700; color: var(--dw-akzent); border: 1px solid currentColor; border-radius: 4px; padding: 0 4px; }
input { font: inherit; font-size: 16px; width: 100%; min-height: 44px; padding: 8px 10px; border-radius: 8px;
        border: 1px solid var(--dw-rand); background: var(--dw-flaeche); color: var(--dw-text); font-variant-numeric: tabular-nums; }
input:focus { outline: 2px solid var(--dw-akzent); outline-offset: 1px; }
.vom-sensor input { border-style: dashed; background: transparent; }

.wissen details { border-top: 1px solid var(--dw-rand); }
.wissen summary { cursor: pointer; padding: 12px 0; font-weight: 700; min-height: 44px; }
.md { font-size: .95rem; overflow-wrap: anywhere; }
.md h3, .md h4, .md h5 { margin: 12px 0 4px; font-size: 1rem; }
.md ul { padding-left: 20px; margin: 4px 0; }
.md img { max-width: 100%; height: auto; border-radius: 6px; }
.md a { color: var(--dw-akzent); }
.md code { background: var(--dw-flaeche); padding: 1px 4px; border-radius: 4px; font-size: .85em; overflow-wrap: anywhere; }
.tabelle { overflow-x: auto; -webkit-overflow-scrolling: touch; margin: 6px 0; }
.tabelle table { border-collapse: collapse; font-size: .8rem; white-space: nowrap; }
.tabelle th, .tabelle td { border: 1px solid var(--dw-rand); padding: 4px 6px; text-align: right; }
.tabelle th { background: var(--dw-flaeche); text-align: left; }
input[type="search"] { margin-bottom: 4px; }

@container (min-width: 600px) {
    .klima { grid-template-columns: repeat(3, 1fr); }
    .raster { grid-template-columns: repeat(3, 1fr); }
}
`;
