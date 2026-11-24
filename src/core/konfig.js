// Richtwerte und Grenzen, übernommen aus agff-app-drywatch (AGFF_CONFIG).

export const GRENZEN = {
    tsAnwelk: 60,
    tsHaupt: 80,
    tsEnd: 88,
    wasserHoch: 0.2, // g/m³: guter Wasserentzug
    wasserTief: -0.1 // g/m³: darunter wird das Futter wieder befeuchtet
};

export const RICHTWERTE = {
    geschwMin: 0.07,
    geschwMax: 0.13,
    effGut: 50,
    effWarn: 30,
    wasserMinHaupt: 0.5,
    // Rosthöhe nach Kittl in Abhängigkeit der Stockfläche
    kittlRostTabelle: [
        { flaeche: 40, rostCm: 41 }, { flaeche: 50, rostCm: 43 }, { flaeche: 60, rostCm: 44 },
        { flaeche: 70, rostCm: 46 }, { flaeche: 80, rostCm: 47 }, { flaeche: 90, rostCm: 49 },
        { flaeche: 100, rostCm: 50 }, { flaeche: 110, rostCm: 52 }, { flaeche: 120, rostCm: 53 },
        { flaeche: 130, rostCm: 55 }, { flaeche: 140, rostCm: 56 }, { flaeche: 150, rostCm: 58 },
        { flaeche: 160, rostCm: 59 }, { flaeche: 170, rostCm: 61 }, { flaeche: 180, rostCm: 63 },
        { flaeche: 190, rostCm: 64 }, { flaeche: 200, rostCm: 66 }, { flaeche: 210, rostCm: 67 },
        { flaeche: 220, rostCm: 69 }, { flaeche: 230, rostCm: 70 }, { flaeche: 240, rostCm: 72 },
        { flaeche: 250, rostCm: 73 }, { flaeche: 260, rostCm: 75 }, { flaeche: 270, rostCm: 76 },
        { flaeche: 280, rostCm: 78 }, { flaeche: 290, rostCm: 79 }, { flaeche: 300, rostCm: 81 }
    ]
};

export const PHASEN = [
    { id: 'start', nr: 1, titel: '1. Startphase', farbe: 'blue' },
    { id: 'haupt', nr: 2, titel: '2. Haupttrocknung', farbe: 'amber' },
    { id: 'end', nr: 3, titel: '3. Endtrocknung', farbe: 'lime' },
    { id: 'lager', nr: 4, titel: '4. Lagerung', farbe: 'emerald' }
];

// Lagerungsdichte: Druckfaktor f (mbar je m Stockhöhe) und Frischdichte d (kg/m³)
export const DICHTE_OPTIONEN = [
    { id: 'loose_l', name: 'Leicht', f: 1.5, d: 60 },
    { id: 'loose_m', name: 'Mittel', f: 2.0, d: 80 },
    { id: 'loose_h', name: 'Fest', f: 3.5, d: 100 },
    { id: 'bales', name: 'Ballen', f: 6.0, d: 130 }
];

export const SYSTEM_ZUSCHLAEGE_PA = { dachabsaugung: 120, luftaufbereitung: 190 };
