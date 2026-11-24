// Kleiner Markdown-Umsetzer für die Wissenstexte: Titel, Absätze, Listen, Tabellen, fett, Code, Links, Bilder.
// Relative Links und Bilder zeigen auf dateiBasis (die Unterlagen liegen bei agff-app-drywatch).

const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function url(href, basis) {
    if (/^(https?:|mailto:)/i.test(href)) return href;
    try {
        return new URL(href, basis).href;
    } catch {
        return '#';
    }
}

function inline(text, basis) {
    let s = esc(text);
    s = s.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (_, alt, href) =>
        `<img src="${esc(url(href, basis))}" alt="${alt}" loading="lazy">`);
    s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, t, href) =>
        `<a href="${esc(url(href, basis))}" target="_blank" rel="noopener">${t}</a>`);
    s = s.replace(/`([^`]+)`/g, '<code>$1</code>');
    s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    return s;
}

const zellen = zeile => zeile.trim().replace(/^\||\|$/g, '').split('|').map(z => z.trim());

/** @returns {string} HTML */
export function markdownZuHtml(md, basis = 'https://apps.graswachstum.ch/drywatch/') {
    const zeilen = String(md).split(/\r?\n/);
    const out = [];
    let liste = false;
    const listeZu = () => { if (liste) { out.push('</ul>'); liste = false; } };
    for (let i = 0; i < zeilen.length; i++) {
        const z = zeilen[i];
        const titel = z.match(/^(#{1,4})\s+(.*)$/);
        if (titel) {
            listeZu();
            const n = Math.min(6, titel[1].length + 2);
            out.push(`<h${n}>${inline(titel[2], basis)}</h${n}>`);
        } else if (/^\s*[-*]\s+/.test(z)) {
            if (!liste) { out.push('<ul>'); liste = true; }
            out.push(`<li>${inline(z.replace(/^\s*[-*]\s+/, ''), basis)}</li>`);
        } else if (/^\s*\|/.test(z) && /^\s*\|[\s|:-]+\|\s*$/.test(zeilen[i + 1] || '')) {
            listeZu();
            const kopf = zellen(z);
            i += 1;
            const reihen = [];
            while (i + 1 < zeilen.length && /^\s*\|/.test(zeilen[i + 1])) reihen.push(zellen(zeilen[++i]));
            out.push('<div class="tabelle"><table><thead><tr>'
                + kopf.map(k => `<th>${inline(k, basis)}</th>`).join('')
                + '</tr></thead><tbody>'
                + reihen.map(r => '<tr>' + r.map(c => `<td>${inline(c, basis)}</td>`).join('') + '</tr>').join('')
                + '</tbody></table></div>');
        } else if (z.trim() === '') {
            listeZu();
        } else {
            listeZu();
            out.push(`<p>${inline(z, basis)}</p>`);
        }
    }
    listeZu();
    return out.join('\n');
}
