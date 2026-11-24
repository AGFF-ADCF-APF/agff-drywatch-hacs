"""Prüft den Python-Port (custom_components/drywatch/physik.py) gegen dieselben Referenzwerte wie der JS-Kern.
Aufruf: python3 -m unittest discover -s test"""

import importlib.util
import json
import unittest
from pathlib import Path

WURZEL = Path(__file__).resolve().parent.parent
_spec = importlib.util.spec_from_file_location("physik", WURZEL / "custom_components/drywatch/physik.py")
physik = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(physik)
VEKTOREN = json.loads((WURZEL / "test/vektoren.json").read_text(encoding="utf-8"))


class PhysikTest(unittest.TestCase):
    def test_wasserentzug(self):
        for v in VEKTOREN["wasserentzug"]:
            p = physik.luftdruck(v["hoehe"])
            self.assertAlmostEqual(p, v["p"], delta=1e-3)
            r = physik.wasserentzug(v["t2"], v["h2"], v["t3"], v["h3"], p, v["luftmenge"])
            self.assertAlmostEqual(r["dichte"], v["dichte"], delta=1e-5)
            self.assertAlmostEqual(r["dx"], v["dx"], delta=1e-5)
            self.assertAlmostEqual(r["wasser_pro_m3"], v["wasserProM3"], delta=1e-5)
            self.assertAlmostEqual(r["wasser_lh"], v["wasserLh"], delta=1e-2)

    def test_phase_und_empfehlung(self):
        self.assertEqual(physik.ts_schaetzung(97), 55)
        self.assertEqual(physik.ts_schaetzung(85), 75)
        self.assertEqual(physik.ts_schaetzung(50), 88)
        self.assertEqual([physik.phase(t) for t in (55, 65, 82, 88)], ["start", "haupt", "end", "lager"])
        self.assertEqual(physik.empfehlung("haupt", 0.3), "ineffizient")
        self.assertEqual(physik.empfehlung("haupt", 1.0), "dauer")
        self.assertEqual(physik.empfehlung("lager", 1.0), "aus")


if __name__ == "__main__":
    unittest.main()
