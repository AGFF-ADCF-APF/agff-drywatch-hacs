/* AGFF DryWatch 0.1.0 · EUPL-1.2 · https://github.com/AGFF-ADCF-APF/agff-drywatch-hacs */
var f={tsAnwelk:60,tsHaupt:80,tsEnd:88,wasserHoch:.2,wasserTief:-.1},g={geschwMin:.07,geschwMax:.13,effGut:50,effWarn:30,wasserMinHaupt:.5,kittlRostTabelle:[{flaeche:40,rostCm:41},{flaeche:50,rostCm:43},{flaeche:60,rostCm:44},{flaeche:70,rostCm:46},{flaeche:80,rostCm:47},{flaeche:90,rostCm:49},{flaeche:100,rostCm:50},{flaeche:110,rostCm:52},{flaeche:120,rostCm:53},{flaeche:130,rostCm:55},{flaeche:140,rostCm:56},{flaeche:150,rostCm:58},{flaeche:160,rostCm:59},{flaeche:170,rostCm:61},{flaeche:180,rostCm:63},{flaeche:190,rostCm:64},{flaeche:200,rostCm:66},{flaeche:210,rostCm:67},{flaeche:220,rostCm:69},{flaeche:230,rostCm:70},{flaeche:240,rostCm:72},{flaeche:250,rostCm:73},{flaeche:260,rostCm:75},{flaeche:270,rostCm:76},{flaeche:280,rostCm:78},{flaeche:290,rostCm:79},{flaeche:300,rostCm:81}]},y=[{id:"start",nr:1,titel:"1. Startphase",farbe:"blue"},{id:"haupt",nr:2,titel:"2. Haupttrocknung",farbe:"amber"},{id:"end",nr:3,titel:"3. Endtrocknung",farbe:"lime"},{id:"lager",nr:4,titel:"4. Lagerung",farbe:"emerald"}];var G=r=>6.1078*Math.exp(17.08*r/(234.2+r)),E=r=>1013.25*Math.pow(1-225e-7*r,5.25),V=(r,e)=>e*100/(287.05*(r+273.15)),m=(r,e,t)=>{let n=G(r)*e/100;return 622*n/(t-n)};function F({t2:r,h2:e,t3:t,h3:n,p:s,luftmenge:a}){let i=V(r,s),l=m(t,n,s)-m(r,e,s),h=l*i,c=h*(a||0)*3.6;return{dx:l,dichte:i,wasserProM3:h,wasserLh:c}}function S(r,e){let t=Math.max(0,parseFloat(e)||0),n=parseFloat(r?.pmax)||0,s=(Array.isArray(r?.punkte)?r.punkte:[]).map(o=>({p:parseFloat(o.p)||0,q:parseFloat(o.q)||0,kw:parseFloat(o.kw)||0})).filter(o=>o.q>=0).sort((o,p)=>o.p-p.p);if(!s.length||n>0&&t>=n)return{luftmenge:0,leistung:0,moeglich:!1};let a=s[0],i=s[s.length-1];for(let o=0;o<s.length-1;o++)if(t>=s[o].p&&t<=s[o+1].p){a=s[o],i=s[o+1];break}t<a.p&&(i=a,a={p:0,q:a.q,kw:a.kw});let l=i.p-a.p,h=Math.abs(l)<1e-6?0:(t-a.p)/l,c=Math.max(0,a.q+(i.q-a.q)*h),d=Math.max(0,a.kw+(i.kw-a.kw)*h);return{luftmenge:c,leistung:d,moeglich:c>0}}function j(r){let e=parseFloat(r);return e>95?55:e>90?65:e>80?75:e>70?82:e>60?86:88}function q(r){return r<f.tsAnwelk?0:r<f.tsHaupt?1:r<f.tsEnd?2:3}function O(r,e){return r===0?"dauer_pflicht":r===1?e<g.wasserMinHaupt?"ineffizient":"dauer":r===2?"intervall":"aus"}function K(r){return r<g.geschwMin?"rot":r<=g.geschwMax?"gruen":"gelb"}function U(r){return r>g.effGut?"gruen":r>g.effWarn?"gelb":"rot"}function J(r){return r>f.wasserHoch?"gruen":r<f.wasserTief?"rot":"gelb"}function C(r){let e=r.klima||{},t=Number.isFinite(parseFloat(r.p))&&parseFloat(r.p)>0?parseFloat(r.p):E(parseFloat(r.hoehe)||0),n=Math.max(0,parseFloat(r.flaeche)||0),s=Math.max(0,parseFloat(r.druckMbar)||0),a=parseFloat(r.luftmenge),i=null;if(!(a>=0)&&r.luefter){let p=S(r.luefter,s);a=p.luftmenge,i=p.leistung}a>=0||(a=0);let l=F({t2:e.t2,h2:e.h2,t3:e.t3,h3:e.h3,p:t,luftmenge:a}),h=j(e.h3),c=q(h),d=n>0?a/n:null,o=i>0?a*s*100/1e3/i*100:null;return{p:t,xZuluft:m(e.t2,e.h2,t),xAbluft:m(e.t3,e.h3,t),dx:l.dx,dichte:l.dichte,wasserProM3:l.wasserProM3,wasserLh:l.wasserLh,befeuchtung:l.wasserProM3<f.wasserTief,abluftWaermerAlsZuluft:e.t3>e.t2+.5,ts:h,phase:y[c],empfehlung:O(c,l.wasserProM3),luftmenge:a,leistung:i,geschwindigkeit:d,effizienz:o,ampel:{wasser:J(l.wasserProM3),geschwindigkeit:d===null?null:K(d),effizienz:o===null?null:U(o),druck:r.luefter&&parseFloat(r.luefter.pmax)>0?s>parseFloat(r.luefter.pmax)?"rot":"gruen":null}}}var k={de:{titel:"DryWatch Heubel\xFCftung",untertitel:"Wasserentzug und Betriebsempfehlung",messwerte:"Luftwerte",aussen:"Aussen",zuluft:"Zuluft",abluft:"Abluft",temperatur:"Temperatur \xB0C",feuchte:"rel. Feuchte %",sensor:"Sensor",anlage:"Anlage",hoehe:"H\xF6he m \xFC. M.",flaeche:"Stockfl\xE4che m\xB2",luftmenge:"Luftmenge m\xB3/s",ergebnis:"Ergebnis",wasser_lh:"Wasserentzug",wasser_m3:"je m\xB3 Luft",ts:"TS gesch\xE4tzt",phase:"Phase",empfehlung:"Empfehlung",geschwindigkeit:"Luftgeschwindigkeit",warn_befeuchtung:"Die Abluft tr\xE4gt weniger Wasser als die Zuluft: Das Futter wird wieder befeuchtet. L\xFCftung stoppen oder Luft aufbereiten.",warn_abluft_warm:"Abluft ist w\xE4rmer als die Zuluft: auf Erw\xE4rmung im Stock achten (Temperatur messen).",warn_geschw_rot:"Zu geringe Luftgeschwindigkeit: Durchstr\xF6mung ungen\xFCgend, Trocknung verz\xF6gert.",warn_geschw_gelb:"\xDCber dem Zielbereich: erh\xF6hten Energiebedarf pr\xFCfen.",ts_hinweis:"Grobe Sch\xE4tzung aus der Abluftfeuchte, ersetzt keine Messung.",wissen:"Hintergrundwissen",wissen_suche:"Suchen \u2026",nichts_gefunden:"Nichts gefunden.","empfehlung.dauer_pflicht":"Dauerbetrieb (mind. 24 h nach Einlagerung)","empfehlung.dauer":"Dauerbetrieb","empfehlung.ineffizient":"Ineffizient (< 0.5 g/m\xB3): stoppen oder Luft aufbereiten","empfehlung.intervall":"Intervallbetrieb (z. B. 1 h ein, 3\u20134 h aus)","empfehlung.aus":"L\xFCftung aus, Temperatur kontrollieren","phase.start":"1. Startphase","phase.haupt":"2. Haupttrocknung","phase.end":"3. Endtrocknung","phase.lager":"4. Lagerung",fehlt:"Werte f\xFCr Zuluft und Abluft eingeben."},fr:{titel:"DryWatch ventilation du foin",untertitel:"Extraction d\u2019eau et recommandation",messwerte:"Valeurs de l\u2019air",aussen:"Ext\xE9rieur",zuluft:"Air entrant",abluft:"Air sortant",temperatur:"Temp\xE9rature \xB0C",feuchte:"Humidit\xE9 rel. %",sensor:"Capteur",anlage:"Installation",hoehe:"Altitude m",flaeche:"Surface du tas m\xB2",luftmenge:"D\xE9bit d\u2019air m\xB3/s",ergebnis:"R\xE9sultat",wasser_lh:"Extraction d\u2019eau",wasser_m3:"par m\xB3 d\u2019air",ts:"MS estim\xE9e",phase:"Phase",empfehlung:"Recommandation",geschwindigkeit:"Vitesse de l\u2019air",warn_befeuchtung:"L\u2019air sortant contient moins d\u2019eau que l\u2019air entrant : le fourrage se r\xE9humidifie. Arr\xEAter la ventilation ou traiter l\u2019air.",warn_abluft_warm:"L\u2019air sortant est plus chaud que l\u2019air entrant : surveiller l\u2019\xE9chauffement du tas.",warn_geschw_rot:"Vitesse de l\u2019air trop faible : s\xE9chage ralenti.",warn_geschw_gelb:"Au-dessus de la plage cible : v\xE9rifier la consommation d\u2019\xE9nergie.",ts_hinweis:"Estimation grossi\xE8re d\u2019apr\xE8s l\u2019humidit\xE9 de l\u2019air sortant.",wissen:"Connaissances",wissen_suche:"Rechercher \u2026",nichts_gefunden:"Aucun r\xE9sultat.","empfehlung.dauer_pflicht":"Fonctionnement continu (au moins 24 h apr\xE8s l\u2019engrangement)","empfehlung.dauer":"Fonctionnement continu","empfehlung.ineffizient":"Inefficace (< 0.5 g/m\xB3) : arr\xEAter ou traiter l\u2019air","empfehlung.intervall":"Fonctionnement par intervalles (p. ex. 1 h marche, 3\u20134 h arr\xEAt)","empfehlung.aus":"Ventilation arr\xEAt\xE9e, contr\xF4ler la temp\xE9rature","phase.start":"1. Phase de d\xE9marrage","phase.haupt":"2. S\xE9chage principal","phase.end":"3. S\xE9chage final","phase.lager":"4. Stockage",fehlt:"Saisir les valeurs de l\u2019air entrant et sortant."},it:{titel:"DryWatch ventilazione del fieno",untertitel:"Estrazione d\u2019acqua e raccomandazione",messwerte:"Valori dell\u2019aria",aussen:"Esterno",zuluft:"Aria in entrata",abluft:"Aria in uscita",temperatur:"Temperatura \xB0C",feuchte:"Umidit\xE0 rel. %",sensor:"Sensore",anlage:"Impianto",hoehe:"Altitudine m",flaeche:"Superficie m\xB2",luftmenge:"Portata d\u2019aria m\xB3/s",ergebnis:"Risultato",wasser_lh:"Estrazione d\u2019acqua",wasser_m3:"per m\xB3 d\u2019aria",ts:"SS stimata",phase:"Fase",empfehlung:"Raccomandazione",geschwindigkeit:"Velocit\xE0 dell\u2019aria",warn_befeuchtung:"L\u2019aria in uscita contiene meno acqua di quella in entrata: il foraggio si inumidisce. Fermare la ventilazione o trattare l\u2019aria.",warn_abluft_warm:"L\u2019aria in uscita \xE8 pi\xF9 calda di quella in entrata: controllare il riscaldamento del fieno.",warn_geschw_rot:"Velocit\xE0 dell\u2019aria troppo bassa: essiccazione rallentata.",warn_geschw_gelb:"Sopra l\u2019intervallo ottimale: verificare il consumo di energia.",ts_hinweis:"Stima approssimativa dall\u2019umidit\xE0 dell\u2019aria in uscita.",wissen:"Conoscenze",wissen_suche:"Cerca \u2026",nichts_gefunden:"Nessun risultato.","empfehlung.dauer_pflicht":"Funzionamento continuo (almeno 24 h dopo l\u2019immagazzinamento)","empfehlung.dauer":"Funzionamento continuo","empfehlung.ineffizient":"Inefficiente (< 0.5 g/m\xB3): fermare o trattare l\u2019aria","empfehlung.intervall":"Funzionamento a intervalli (p. es. 1 h acceso, 3\u20134 h spento)","empfehlung.aus":"Ventilazione spenta, controllare la temperatura","phase.start":"1. Fase iniziale","phase.haupt":"2. Essiccazione principale","phase.end":"3. Essiccazione finale","phase.lager":"4. Stoccaggio",fehlt:"Inserire i valori dell\u2019aria in entrata e in uscita."},en:{titel:"DryWatch hay drying",untertitel:"Water removal and recommendation",messwerte:"Air values",aussen:"Outside",zuluft:"Supply air",abluft:"Exhaust air",temperatur:"Temperature \xB0C",feuchte:"Rel. humidity %",sensor:"Sensor",anlage:"System",hoehe:"Altitude m",flaeche:"Floor area m\xB2",luftmenge:"Airflow m\xB3/s",ergebnis:"Result",wasser_lh:"Water removal",wasser_m3:"per m\xB3 of air",ts:"DM estimate",phase:"Phase",empfehlung:"Recommendation",geschwindigkeit:"Air speed",warn_befeuchtung:"Exhaust air carries less water than supply air: the hay is being rewetted. Stop the fan or condition the air.",warn_abluft_warm:"Exhaust air is warmer than supply air: watch for heating in the stack.",warn_geschw_rot:"Air speed too low: drying is delayed.",warn_geschw_gelb:"Above target range: check energy use.",ts_hinweis:"Rough estimate from exhaust humidity, not a measurement.",wissen:"Background",wissen_suche:"Search \u2026",nichts_gefunden:"Nothing found.","empfehlung.dauer_pflicht":"Continuous operation (at least 24 h after storing)","empfehlung.dauer":"Continuous operation","empfehlung.ineffizient":"Inefficient (< 0.5 g/m\xB3): stop or condition the air","empfehlung.intervall":"Interval operation (e.g. 1 h on, 3\u20134 h off)","empfehlung.aus":"Fan off, check temperature","phase.start":"1. Start phase","phase.haupt":"2. Main drying","phase.end":"3. Final drying","phase.lager":"4. Storage",fehlt:"Enter supply and exhaust air values."}};function Y(r){let e=String(r||"").toLowerCase().slice(0,2);return k[e]?e:"de"}function A(r){let e=k[Y(r)];return t=>e[t]??k.de[t]??t}var x=r=>r.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");function M(r,e){if(/^(https?:|mailto:)/i.test(r))return r;try{return new URL(r,e).href}catch{return"#"}}function b(r,e){let t=x(r);return t=t.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g,(n,s,a)=>`<img src="${x(M(a,e))}" alt="${s}" loading="lazy">`),t=t.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g,(n,s,a)=>`<a href="${x(M(a,e))}" target="_blank" rel="noopener">${s}</a>`),t=t.replace(/`([^`]+)`/g,"<code>$1</code>"),t=t.replace(/\*\*([^*]+)\*\*/g,"<strong>$1</strong>"),t}var L=r=>r.trim().replace(/^\||\|$/g,"").split("|").map(e=>e.trim());function T(r,e="https://apps.graswachstum.ch/drywatch/"){let t=String(r).split(/\r?\n/),n=[],s=!1,a=()=>{s&&(n.push("</ul>"),s=!1)};for(let i=0;i<t.length;i++){let l=t[i],h=l.match(/^(#{1,4})\s+(.*)$/);if(h){a();let c=Math.min(6,h[1].length+2);n.push(`<h${c}>${b(h[2],e)}</h${c}>`)}else if(/^\s*[-*]\s+/.test(l))s||(n.push("<ul>"),s=!0),n.push(`<li>${b(l.replace(/^\s*[-*]\s+/,""),e)}</li>`);else if(/^\s*\|/.test(l)&&/^\s*\|[\s|:-]+\|\s*$/.test(t[i+1]||"")){a();let c=L(l);i+=1;let d=[];for(;i+1<t.length&&/^\s*\|/.test(t[i+1]);)d.push(L(t[++i]));n.push('<div class="tabelle"><table><thead><tr>'+c.map(o=>`<th>${b(o,e)}</th>`).join("")+"</tr></thead><tbody>"+d.map(o=>"<tr>"+o.map(p=>`<td>${b(p,e)}</td>`).join("")+"</tr>").join("")+"</tbody></table></div>")}else l.trim()===""?a():(a(),n.push(`<p>${b(l,e)}</p>`))}return a(),n.join(`
`)}var W=`# 1. Trocknungsphasen (Kittl-orientiert)
## Startphase (< 60% TS)
**Ziel:** G\xE4rung und Selbsterw\xE4rmung verhindern.
- Dauerbetrieb der L\xFCftung, mindestens die ersten 24 h nach Einlagerung.
- Bei feuchter oder kalter Zuluft Luftaufbereitung gezielt nutzen.
- Temperatur und Feuchte im Stock engmaschig kontrollieren.
- Bei dichter Lagerung und hoher Feuchte fr\xFChzeitig auf kritische Temperaturanstiege achten.

## Haupttrocknung (60-80% TS)
**Ziel:** Wasserabfuhr an der Futteroberfl\xE4che maximieren.
- Weiterhin hoher Volumenstrom, m\xF6glichst kontinuierlicher Betrieb.
- Bei sinkendem Wasserentzug Betriebspunkt (Luftmenge, Druck, Aufbereitung) nachstellen.
- Intervallbetrieb erst pr\xFCfen, wenn TS klar fortgeschritten ist.
- Heustock m\xF6glichst schonend behandeln; obere Schichten nur bei Bedarf lockern.

## Endtrocknung (80-88% TS)
**Ziel:** Restwasser aus tieferen Pflanzenteilen l\xF6sen.
- Intervallbetrieb ist h\xE4ufig energetisch g\xFCnstiger (z.B. 1 h EIN, 3-4 h AUS).
- TS-Verlauf dokumentieren und Intervalle anpassen.
- Dauerbetrieb ist in dieser Phase oft energetisch ung\xFCnstig.

## Lagerung (> 88% TS)
**Ziel:** Stabilit\xE4t halten, Nachw\xE4rme fr\xFCh erkennen.
- L\xFCftung in der Regel aus.
- In den ersten Wochen t\xE4glich Temperatur kontrollieren.
- Nur bei Erw\xE4rmungstendenz kurz nachl\xFCften.

## Ziel Trocknungsdauer
- Zielwert: m\xF6glichst vollst\xE4ndige Trocknung innerhalb von **80 h (Lose)** bzw. **60 h (Ballen)**.
- Die Anlage sollte als Faustregel etwa **1/3 bis 1/2 der Erntefl\xE4che** zeitgerecht bew\xE4ltigen k\xF6nnen.

## Risikoentwicklung (Einlagerung)
- Auch bei scheinbar trockenem Futter kann Restatmung W\xE4rme und Feuchte erzeugen.
- Kritische Temperaturentwicklung fr\xFCh erkennen und Luftf\xFChrung/Betrieb anpassen.

![Wassermenge pro 1000 kg Heu](Heutrocknung_Wassermenge_pro_1000kg_Heu.png)
![Prozesse Selbsterhitzung](Prozesse_Selbsterhitzung_Heu_Philipsen_1965.png)
`;var H=`# 2. Richtwerte Statischer Druck (futterabh\xE4ngig)
## Schichtzuschlag je Meter Futterh\xF6he
- Dauerwiese: **ca. 160 Pa/m**
- Gr\xE4ser-/Kr\xE4uterreich: **ca. 120 Pa/m**
- Kleereich: **ca. 240 Pa/m**

## Typische Systemzuschl\xE4ge
- Dachabsaugung: **+120 Pa**
- W\xE4rmetauscher: **+70 Pa**
- Entfeuchter: **+120 Pa**

## H\xF6henkorrektur
- Ab etwa 1000 m \xFC.M.: als Daumenregel **+10%** Druckbedarf.

## Schnellcheck
1. Druckbedarf aus Schicht + Anlagenzuschl\xE4gen bilden.
2. Gegen reale Ventilatorkennlinie pr\xFCfen (nicht nur Nennpunkt).
3. Reserve f\xFCr Betriebsverschiebung einplanen (Verschmutzung, Setzung, Kanalverluste).
`;var $=`# 3. Normwerte, Luftmengen und Dimensionierung
## Richtwert Luftgeschwindigkeit im Heustock
- Zielbereich im Cockpit: **0.07 bis 0.13 m/s**.
- Unterhalb: ungen\xFCgende Durchstr\xF6mung, Trocknung verz\xF6gert.
- Oberhalb: h\xF6herer Energiebedarf, oft wenig Zusatznutzen.

## Luftmenge aus Fl\xE4che und Soll-Geschwindigkeit
- Formel: **Volumenstrom = Fl\xE4che \xD7 Geschwindigkeit**
- Beispiel: 180 m\xB2 \xD7 0.10 m/s = 18.0 m\xB3/s

## Praxis-Hinweise zur Luftmenge
- Fr\xFChe Phase: eher oberes Ende des Zielbereichs fahren.
- Endphase: Intervall plus bedarfsgerechte Luftmenge ist oft wirtschaftlicher.
- Bei niedrigem Wasserentzug zuerst Betriebspunkt pr\xFCfen, nicht nur l\xE4nger laufen lassen.

## Einordnung zu Richtwerten
- Richtwerte sind Planungs- und Betriebsorientierung.
- Entscheidend bleibt der gemessene Wasserentzug, die TS-Entwicklung und der Energieeinsatz.

## Dimensionierungstabelle (n. Kittl/Galler 2020)
Grundlage: 2\u20133 Chargen je Schnitt, Luftgeschwindigkeit Sammelkanal 4 m/s, Druckkanal 10 m/s.

| M\xE4hfl\xE4che [ha] | Boxenfl\xE4che [m\xB2] | Rosth\xF6he [cm] | Abdeckbreite [cm] | Ventilator halbe Sh [m\xB3/h] | Ventilator volle Sh [m\xB3/h] | Sammelkanal [m\xB2] | Druckkanal [m\xB2] | L\xFCfter [kW] | Entfeuchter [kW] |
|---|---|---|---|---|---|---|---|---|---|
| 6\u20138 | 40 | 41 | 49 | 15.840 | 10.080 | 1,10 | 0,44 | 5 | 7 |
| 7\u201310 | 50 | 43 | 51 | 19.800 | 12.600 | 1,38 | 0,55 | 6 | 9 |
| 8\u201312 | 60 | 44 | 53 | 23.760 | 15.120 | 1,65 | 0,66 | 7 | 10 |
| 10\u201314 | 70 | 46 | 54 | 27.720 | 17.640 | 1,93 | 0,77 | 8 | 12 |
| 11\u201316 | 80 | 47 | 56 | 31.680 | 20.160 | 2,20 | 0,88 | 9 | 14 |
| 12\u201318 | 90 | 49 | 58 | 35.640 | 22.680 | 2,48 | 0,99 | 10 | 16 |
| 14\u201320 | 100 | 50 | 59 | 39.600 | 25.200 | 2,75 | 1,10 | 12 | 17 |
| 15\u201322 | 110 | 52 | 61 | 43.560 | 27.720 | 3,03 | 1,21 | 13 | 19 |
| 16\u201324 | 120 | 53 | 63 | 47.520 | 30.240 | 3,30 | 1,32 | 14 | 21 |
| 18\u201327 | 130 | 55 | 64 | 51.480 | 32.760 | 3,58 | 1,43 | 15 | 23 |
| 19\u201329 | 140 | 56 | 66 | 55.440 | 35.280 | 3,85 | 1,54 | 16 | 24 |
| 20\u201331 | 150 | 58 | 67 | 59.400 | 37.800 | 4,13 | 1,65 | 17 | 26 |
| 22\u201333 | 160 | 59 | 69 | 63.360 | 40.320 | 4,40 | 1,76 | 19 | 28 |
| 23\u201335 | 170 | 61 | 71 | 67.320 | 42.840 | 4,68 | 1,87 | 20 | 30 |
| 24\u201337 | 180 | 63 | 72 | 71.280 | 45.360 | 4,95 | 1,98 | 21 | 31 |
| 26\u201339 | 190 | 64 | 74 | 75.240 | 47.880 | 5,23 | 2,09 | 22 | 33 |
| 27\u201341 | 200 | 66 | 76 | 79.200 | 50.400 | 5,50 | 2,20 | 23 | 35 |
| 28\u201343 | 210 | 67 | 77 | 83.160 | 52.920 | 5,78 | 2,31 | 24 | 36 |
| 30\u201345 | 220 | 69 | 79 | 87.120 | 55.440 | 6,05 | 2,42 | 25 | 38 |
| 31\u201347 | 230 | 70 | 80 | 91.080 | 57.960 | 6,33 | 2,53 | 27 | 40 |
| 32\u201349 | 240 | 72 | 82 | 95.040 | 60.480 | 6,60 | 2,64 | 28 | 42 |
| 34\u201351 | 250 | 73 | 84 | 99.000 | 63.000 | 6,88 | 2,75 | 29 | 43 |
| 35\u201353 | 260 | 75 | 85 | 102.960 | 65.520 | 7,15 | 2,86 | 30 | 45 |
| 36\u201355 | 270 | 76 | 87 | 106.920 | 68.040 | 7,43 | 2,97 | 31 | 47 |
| 38\u201357 | 280 | 78 | 88 | 110.880 | 70.560 | 7,70 | 3,08 | 32 | 49 |
| 39\u201359 | 290 | 79 | 90 | 114.840 | 73.080 | 7,98 | 3,19 | 34 | 50 |
| 40\u201361 | 300 | 81 | 92 | 118.800 | 75.600 | 8,25 | 3,30 | 35 | 52 |
`;var R=`# 4. Heueinlagerung und Gefahren
Selbst scheinbar trockenes Futter kann nach Einlagerung noch Atmung zeigen. Das erzeugt W\xE4rme und Feuchte.

## Temperaturbereiche zur Orientierung
- < 40 \xB0C: meist unkritisch.
- 45\u201360 \xB0C: Risiko steigt, Kontrollen intensivieren.
- 60\u201370 \xB0C: sehr engmaschig kontrollieren, keine hektische Umlagerung.
- > 70 \xB0C: Feuerwehr bzw. Fachstellen einbeziehen.

## Organisatorische Ma\xDFnahmen
- Messstellen festlegen und protokollieren.
- Besonders in den ersten Tagen t\xE4glich kontrollieren.
- Bei kritischer Entwicklung: Luftf\xFChrung und Aufbereitung sofort nachstellen.

![Prozesse Selbsterhitzung](Prozesse_Selbsterhitzung_Heu_Philipsen_1965.png)
`;var P=`# Luftaufbereitung \u2013 Heizung & Entfeuchter

## Heizung

Durch Erw\xE4rmen der Zuluft sinkt die relative Luftfeuchtigkeit \u2013 die Trocknungskapazit\xE4t steigt.

Richtwerte Heizleistungsbedarf:

- 20'000 m\xB3/h: +1\xB0C = 7 kW | +5\xB0C = 35 kW | +10\xB0C = 70 kW
- 35'000 m\xB3/h: +1\xB0C = 12 kW | +5\xB0C = 61 kW | +10\xB0C = 122 kW
- 50'000 m\xB3/h: +1\xB0C = 17.5 kW | +5\xB0C = 87.5 kW | +10\xB0C = 175 kW

**Hinweise:**

- Unter +5\xB0C Temperaturerh\xF6hung ist Heizung oft ineffizient.
- +10\xB0C bei 35'000 m\xB3/h (\u2248 10 m\xB3/s) ben\xF6tigt ca. 122 kW.
- Kosten stark abh\xE4ngig vom Energietr\xE4ger (\xD6l, Gas, W\xE4rmepumpe).

## Entfeuchter

Ein Entfeuchter entzieht der Luft direkt Wasser \u2013 unabh\xE4ngig von der Aussentemperatur.

**Hinweise:**

- Luftgeschwindigkeit durch Entfeuchter: 2\u20134 m/s einhalten.
- Bei h\xF6herer Gesamtluftemenge: Bypass nutzen.
- Leistungsbedarf ca. 1\u20132 kW pro Liter Wasserentzug/h.
- Kombination Heizung + Entfeuchter m\xF6glich (additive Wirkung).
`;var B=`# Berechnungsgrundlagen \u2013 Wasserentzug & Psychrometrie

## Verwendete Formeln

### S\xE4ttigungsdampfdruck (Magnus-Formel)

\`p_sat(T) = 6.1078 \xB7 exp(17.08 \xB7 T / (234.2 + T))\` (hPa)

Gibt den maximal m\xF6glichen Dampfdruck bei Temperatur T an.

### Absolute Feuchte x (Mischungsverh\xE4ltnis)

\`x = 622 \xB7 \u03C6 \xB7 p_sat(T) / (p \u2212 \u03C6 \xB7 p_sat(T))\` (g/kg Trockenluft)

- \u03C6 = relative Luftfeuchtigkeit (0\u20131)
- p = Luftdruck am Standort (hPa)

### Luftdruck nach H\xF6he

\`p(h) = 1013.25 \xB7 (1 \u2212 2.25 \xB7 10\u207B\u2075 \xB7 h)\u2075\xB7\xB2\u2075\` (hPa)

Die eingestellte H\xF6he (m \xFC.M.) beeinflusst direkt den Luftdruck und damit alle Feuchtewerte.

### Luftdichte \u03C1

\`\u03C1 = p \xB7 100 / (287.05 \xB7 (T + 273.15))\` (kg/m\xB3)

### Wasserentzug

\`\u0394x = x_Abluft \u2212 x_Zuluft\` (g/kg)

\`Wasserentzug = \u0394x \xB7 \u03C1 \xB7 V\u0307 \xB7 3.6\` (L/h)

- V\u0307 = Luftmenge (m\xB3/s)
- 3.6 = Umrechnungsfaktor (g/s \u2192 L/h)

## Warum k\xF6nnen Ergebnisse abweichen?

Verschiedene Rechner oder KI-Werkzeuge (z.B. Gemini, ChatGPT) k\xF6nnen andere Werte liefern, weil:

- **Andere Einheit**: \`x\` in g/kg Trockenluft \u2260 absolute Feuchte in g/m\xB3
- **Anderer Luftdruck**: Manche Rechner verwenden fix 1013 hPa (Meeresh\xF6he), dieser Rechner berechnet p nach Standorth\xF6he.
- **Andere Formel**: Es gibt verschiedene N\xE4herungsformeln f\xFCr p_sat (Magnus, Tetens, Buck, ASHRAE). Abweichungen bis ~2%.
- **Abluft vs. Zuluft**: Welche Temperatur f\xFCr \u03C1 verwendet wird, beeinflusst das Ergebnis leicht.

## Beispiel

Standort 600 m \xFC.M. (p \u2248 942 hPa), Zuluft 20 \xB0C / 60 % rF, Abluft 15 \xB0C / 90 % rF:

- x_Zuluft \u2248 8.7 g/kg
- x_Abluft \u2248 9.5 g/kg
- \u0394x \u2248 0.8 g/kg

Bei 10 m\xB3/s und \u03C1 \u2248 1.16 kg/m\xB3: **Wasserentzug \u2248 33 L/h**
`;var N=`# 99. AGFF-Merkbl\xE4tter und Literatur
## Relevante Unterlagen
- [Heutrocknung von A-Z (Kittl + Galler, 2020)](knowledge/files/Heutrocknung_von_A-Z_Kittl+Galler_2020.pdf)
- [ABC der Heubel\xFCftung (Baumgartner, 1982)](knowledge/files/Baumgartner_1982_ABC-der-Heubelueftung.pdf)
- [Heul\xFCfterliste Bund FAT (PDF)](knowledge/files/607_Heuluefterliste_Bund_FAT.pdf)
- [Heul\xFCfterliste Bund FAT (CSV)](knowledge/files/607_Heuluefterliste_Bund_FAT.csv)
- [Richtlinien f\xFCr Heubel\xFCftungsanlagen (Agroscope Transfer 38, 2014)](knowledge/files/agroscope_transfer_38_2014_richtlinien_fuer_heubelueftungsanlagen.pdf)

## Bezug / Bestellung
- [AGFF Kontakt](https://www.agff.ch/kontakt)
- **K5 Heubel\xFCftung \u2013 Checkliste f\xFCr eine Anlage:** bitte explizit \xFCber den AGFF-Shop beziehen/bestellen ([zum Shop](https://www.agff.ch/online-shop/informationsblaetter.html)).
`;var D=[W,H,$,R,P,B,N].map(r=>{let e=(r.match(/^#\s+(.*)$/m)||[,""])[1].replace(/^\d+\.\s*/,""),t=r.replace(/^#\s+.*$/m,"").trim();return{titel:e,text:t}});var I=`
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
`;var se=[{id:"1",ort:"aussen"},{id:"2",ort:"zuluft"},{id:"3",ort:"abluft"}],_={t1:18,h1:70,t2:20,h2:60,t3:16,h3:88,hoehe:600,flaeche:100,luftmenge:11},w=(r,e)=>Number.isFinite(r)?r.toFixed(e):"\u2013",u=r=>String(r).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"),v=class extends HTMLElement{static get observedAttributes(){return["sprache","datei-basis","hoehe","flaeche","luftmenge"]}constructor(){super(),this.attachShadow({mode:"open"}),this._werte={..._},this._sensor={},this._gebaut=!1}connectedCallback(){this._ladeGespeichert();for(let e of["hoehe","flaeche","luftmenge"]){let t=parseFloat(this.getAttribute(e));Number.isFinite(t)&&!this._gespeichert?.[e]&&!this._sensor[e]&&(this._werte[e]=t)}this._baue()}attributeChangedCallback(){this._gebaut&&this._baue()}set sensorWerte(e){let t=!1,n={};for(let[s,a]of Object.entries(e||{})){let i=parseFloat(a);Number.isFinite(i)&&(n[s]=!0,this._werte[s]!==i&&(this._werte[s]=i,t=!0))}Object.keys(n).join()!==Object.keys(this._sensor).join()&&(t=!0),this._sensor=n,this._gebaut&&t&&(this._fuelleEingaben(),this._rechne())}get t(){return A(this.getAttribute("sprache")||document.documentElement.lang)}_speicherSchluessel(){return this.getAttribute("speicher")}_ladeGespeichert(){let e=this._speicherSchluessel();if(this._gespeichert=null,!!e)try{let t=JSON.parse(localStorage.getItem(e)||"null");if(t&&typeof t=="object"){this._gespeichert=t;for(let[n,s]of Object.entries(t))n in _&&Number.isFinite(s)&&!this._sensor[n]&&(this._werte[n]=s)}}catch{}}_speichere(){let e=this._speicherSchluessel();if(!e)return;let t={};for(let n of Object.keys(_))this._sensor[n]||(t[n]=this._werte[n]);try{localStorage.setItem(e,JSON.stringify(t))}catch{}}_feld(e,t,n){return`<label class="feld" data-feld="${e}">
            <span class="lbl">${u(t)}<span class="sensor" hidden>${u(this.t("sensor"))}</span></span>
            <input type="number" inputmode="decimal" step="${n}" data-k="${e}">
        </label>`}_baue(){let e=this.t,t=this.hasAttribute("ohne-wissen");this.shadowRoot.innerHTML=`<style>${I}</style>
        <div class="dw">
            <header><h2>${u(e("titel"))}</h2><p>${u(e("untertitel"))}</p></header>

            <section class="karte ergebnis" aria-live="polite">
                <div class="gross"><span class="wert" id="wasserLh">\u2013</span><span class="einheit">l/h</span></div>
                <div class="klein">${u(e("wasser_lh"))} \xB7 <span id="wasserM3">\u2013</span> g/m\xB3 ${u(e("wasser_m3"))}</div>
                <div class="phase" id="phase"></div>
                <div class="empfehlung" id="empfehlung"></div>
                <dl class="kennzahlen">
                    <div><dt>${u(e("ts"))}</dt><dd><span id="ts">\u2013</span> %</dd></div>
                    <div><dt>${u(e("geschwindigkeit"))}</dt><dd><span class="ampel" id="ampelV"></span><span id="v">\u2013</span> m/s</dd></div>
                </dl>
                <ul class="warnungen" id="warnungen"></ul>
                <p class="hinweis">${u(e("ts_hinweis"))}</p>
            </section>

            <section class="karte">
                <h3>${u(e("messwerte"))}</h3>
                <div class="klima">
                    ${se.map(n=>`<fieldset><legend>${u(e(n.ort))}</legend>
                        ${this._feld("t"+n.id,e("temperatur"),"0.1")}
                        ${this._feld("h"+n.id,e("feuchte"),"1")}
                    </fieldset>`).join("")}
                </div>
            </section>

            <section class="karte">
                <h3>${u(e("anlage"))}</h3>
                <div class="raster">
                    ${this._feld("hoehe",e("hoehe"),"10")}
                    ${this._feld("flaeche",e("flaeche"),"1")}
                    ${this._feld("luftmenge",e("luftmenge"),"0.1")}
                </div>
            </section>

            ${t?"":`<section class="karte wissen">
                <h3>${u(e("wissen"))}</h3>
                <input type="search" id="suche" placeholder="${u(e("wissen_suche"))}" aria-label="${u(e("wissen_suche"))}">
                <div id="artikel"></div>
            </section>`}
        </div>`,this.shadowRoot.querySelectorAll("input[data-k]").forEach(n=>{n.addEventListener("input",()=>{let s=parseFloat(n.value);Number.isFinite(s)&&(this._werte[n.dataset.k]=s,this._rechne(),this._speichere())})}),t||(this._zeigeWissen(""),this.shadowRoot.getElementById("suche").addEventListener("input",n=>this._zeigeWissen(n.target.value))),this._gebaut=!0,this._fuelleEingaben(),this._rechne()}_fuelleEingaben(){this.shadowRoot.querySelectorAll("input[data-k]").forEach(e=>{let t=e.dataset.k,n=!!this._sensor[t];(n||this.shadowRoot.activeElement!==e)&&(e.value=this._werte[t]),e.readOnly=n,e.closest(".feld").classList.toggle("vom-sensor",n),e.closest(".feld").querySelector(".sensor").hidden=!n})}_zeigeWissen(e){let t=this.shadowRoot.getElementById("artikel"),n=this.getAttribute("datei-basis")||void 0,s=e.trim().toLowerCase(),a=D.filter(i=>!s||(i.titel+" "+i.text).toLowerCase().includes(s));t.innerHTML=a.length?a.map(i=>`<details${s?" open":""}><summary>${u(i.titel)}</summary>
                <div class="md">${T(i.text,n)}</div></details>`).join(""):`<p class="hinweis">${u(this.t("nichts_gefunden"))}</p>`}_rechne(){let e=this._werte,t=this.t,n=h=>this.shadowRoot.getElementById(h),s={t1:e.t1,h1:e.h1,t2:e.t2,h2:e.h2,t3:e.t3,h3:e.h3};if(![e.t2,e.h2,e.t3,e.h3].every(Number.isFinite)){n("empfehlung").textContent=t("fehlt");return}let a=C({klima:s,hoehe:e.hoehe,flaeche:e.flaeche,luftmenge:e.luftmenge});this._letztes=a,n("wasserLh").textContent=w(a.wasserLh,0),n("wasserLh").dataset.ampel=a.ampel.wasser,n("wasserM3").textContent=w(a.wasserProM3,2),n("ts").textContent=w(a.ts,0),n("v").textContent=w(a.geschwindigkeit,2),n("ampelV").dataset.ampel=a.ampel.geschwindigkeit||"";let i=n("phase");i.textContent=t("phase."+a.phase.id),i.dataset.phase=a.phase.id,n("empfehlung").textContent=t("empfehlung."+a.empfehlung);let l=[];a.befeuchtung&&l.push(["rot",t("warn_befeuchtung")]),a.abluftWaermerAlsZuluft&&l.push(["gelb",t("warn_abluft_warm")]),a.ampel.geschwindigkeit==="rot"&&l.push(["rot",t("warn_geschw_rot")]),a.ampel.geschwindigkeit==="gelb"&&l.push(["gelb",t("warn_geschw_gelb")]),n("warnungen").innerHTML=l.map(([h,c])=>`<li data-ampel="${h}">${u(c)}</li>`).join(""),this.dispatchEvent(new CustomEvent("drywatch-ergebnis",{detail:a,bubbles:!0,composed:!0}))}};customElements.get("agff-drywatch")||customElements.define("agff-drywatch",v);var Z={t_aussen:"t1",rf_aussen:"h1",t_zuluft:"t2",rf_zuluft:"h2",t_abluft:"t3",rf_abluft:"h3",luftmenge:"luftmenge"},z=class extends HTMLElement{setConfig(e){if(!e||typeof e!="object")throw new Error("drywatch-card: Konfiguration fehlt");let t=Object.keys(e.entities||{}).filter(n=>!(n in Z));if(t.length)throw new Error(`drywatch-card: unbekannte Eintr\xE4ge unter entities: ${t.join(", ")}`);this._config=e,this._baue()}_baue(){let e=this._config;this.innerHTML="";let t=document.createElement("ha-card");t.style.padding="12px";let n=document.createElement("agff-drywatch");n.setAttribute("speicher","drywatch-card:"+(e.speicher||"standard")),e.hoehe!=null&&n.setAttribute("hoehe",e.hoehe),e.flaeche!=null&&n.setAttribute("flaeche",e.flaeche),e.datei_basis&&n.setAttribute("datei-basis",e.datei_basis),e.wissen===!1&&n.setAttribute("ohne-wissen",""),this._sprache&&n.setAttribute("sprache",this._sprache),t.appendChild(n),this.appendChild(t),this._panel=n,this._hass&&(this.hass=this._hass)}set hass(e){if(this._hass=e,!this._panel)return;let t=e.locale?.language||e.language;t&&t!==this._sprache&&(this._sprache=t,this._panel.setAttribute("sprache",t));let n={};for(let[s,a]of Object.entries(this._config.entities||{})){let i=e.states[a];if(!i||i.state==="unavailable"||i.state==="unknown")continue;let l=parseFloat(i.state);s==="luftmenge"&&i.attributes?.unit_of_measurement==="m\xB3/h"&&(l/=3600),n[Z[s]]=l}this._panel.sensorWerte=n}getCardSize(){return 8}static getStubConfig(){return{hoehe:600,flaeche:100,entities:{}}}};customElements.get("drywatch-card")||customElements.define("drywatch-card",z);window.customCards=window.customCards||[];window.customCards.some(r=>r.type==="drywatch-card")||window.customCards.push({type:"drywatch-card",name:"DryWatch Heubel\xFCftung",description:"Wasserentzug, Trocknungsphase und Empfehlung f\xFCr die Heubel\xFCftung (AGFF)",documentationURL:"https://github.com/AGFF-ADCF-APF/agff-drywatch-hacs"});
