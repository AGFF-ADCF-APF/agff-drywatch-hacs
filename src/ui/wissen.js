// Wissenstexte aus agff-app-drywatch/src/knowledge (beim Bauen als Text eingebunden).
import phasen from '../daten/wissen/01-phasen.md';
import druck from '../daten/wissen/02-druckrichtwerte-futterart.md';
import luftmengen from '../daten/wissen/03-normwerte-luftmengen.md';
import einlagerung from '../daten/wissen/04-einlagerung-gefahren.md';
import aufbereitung from '../daten/wissen/05-luftaufbereitung.md';
import grundlagen from '../daten/wissen/06-berechnungsgrundlagen.md';
import merkblaetter from '../daten/wissen/99-merkblaetter-agff.md';

export const WISSEN = [phasen, druck, luftmengen, einlagerung, aufbereitung, grundlagen, merkblaetter].map(md => {
    const titel = (md.match(/^#\s+(.*)$/m) || [, ''])[1].replace(/^\d+\.\s*/, '');
    const text = md.replace(/^#\s+.*$/m, '').trim();
    return { titel, text };
});
