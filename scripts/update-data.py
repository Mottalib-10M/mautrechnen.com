#!/usr/bin/env python3
"""Aktualisiert src/data/sprit.json aus dem Weekly Oil Bulletin der Europäischen Kommission.

Quelle : https://energy.ec.europa.eu/data-and-analysis/weekly-oil-bulletin_en
Datei  : « Weekly Oil Bulletin Prices History » (xlsx, Blatt « Prices with taxes »), Preise in EUR je 1 000 Liter,
         inklusive Steuern, Stichtag Montag. Weiterverwendung erlaubt mit Quellenangabe (Beschluss 2011/833/EU).
Aufruf : python3 scripts/update-data.py [--datei lokale.xlsx]
Ergebnis : src/data/sprit.json (Preise in €/L, drei Nachkommastellen, die letzten 26 Wochen je Land)
         und src/data/kurse.json (Euro-Referenzkurse der EZB für CHF, CZK, HUF, DKK).
Der Workflow .github/workflows/update-data.yml ruft das Skript jeden Dienstag auf und baut die Seite neu.
"""
import io, json, re, sys, urllib.request, datetime, os
import openpyxl

PAGE = 'https://energy.ec.europa.eu/data-and-analysis/weekly-oil-bulletin_en'
BASE = 'https://energy.ec.europa.eu'
LAENDER = ['AT', 'BE', 'BG', 'CZ', 'DE', 'DK', 'ES', 'FR', 'HR', 'HU', 'IT', 'LU', 'NL', 'PL', 'PT', 'RO', 'SI', 'SK']
SORTEN = {'euro95': 'e95', 'diesel': 'diesel', 'LPG': 'lpg'}
WOCHEN = 26
OUT = os.path.join(os.path.dirname(__file__), '..', 'src', 'data', 'sprit.json')


def lade() -> bytes:
    if '--datei' in sys.argv:
        return open(sys.argv[sys.argv.index('--datei') + 1], 'rb').read()
    html = urllib.request.urlopen(urllib.request.Request(PAGE, headers={'User-Agent': 'Mozilla/5.0 (update-data)'}), timeout=60).read().decode('utf-8', 'replace')
    m = re.search(r'href="(/document/download/[^"]+Prices_History[^"]*)"', html)
    if not m:
        sys.exit('Link « Prices History » auf der Seite des Weekly Oil Bulletin nicht gefunden')
    url = BASE + m.group(1).replace('&amp;', '&')
    return urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (update-data)'}), timeout=120).read()


def main():
    wb = openpyxl.load_workbook(io.BytesIO(lade()), read_only=True, data_only=True)
    ws = wb['Prices with taxes']
    rows = list(ws.iter_rows(values_only=True))
    kopf = rows[0]
    spalten = {}
    for i, v in enumerate(kopf):
        m = re.match(r'^([A-Z]{2})_price_with_tax_(euro95|diesel|LPG)$', str(v or ''))
        if m and m.group(1) in LAENDER:
            spalten[(m.group(1), SORTEN[m.group(2)])] = i
    daten = [r for r in rows[3:] if isinstance(r[0], datetime.datetime)]
    daten.sort(key=lambda r: r[0], reverse=True)
    daten = daten[:WOCHEN]
    if not daten:
        sys.exit('Keine Datenzeilen gelesen')
    wochen = [r[0].date().isoformat() for r in daten]
    laender = {}
    for land in LAENDER:
        e = {}
        for sorte in ('e95', 'diesel', 'lpg'):
            i = spalten.get((land, sorte))
            werte = []
            for r in daten:
                v = r[i] if i is not None else None
                werte.append(round(float(v) / 1000, 3) if isinstance(v, (int, float)) and v > 0 else None)
            e[sorte] = werte
        laender[land] = e
    if laender['DE']['e95'][0] is None:
        sys.exit('Kein aktueller Preis für Deutschland: Datei unvollständig, nichts geschrieben')
    out = {
        'quelle': 'Europäische Kommission, Weekly Oil Bulletin (Prices with taxes)',
        'quelle_url': PAGE,
        'lizenz': 'Weiterverwendung mit Quellenangabe, Beschluss 2011/833/EU der Kommission',
        'abgerufen': datetime.date.today().isoformat(),
        'stand': wochen[0],
        'wochen': wochen,
        'laender': laender,
    }
    json.dump(out, open(OUT, 'w'), ensure_ascii=False, separators=(',', ':'))
    print(f"sprit.json : Stand {wochen[0]}, {len(LAENDER)} Länder, {len(wochen)} Wochen")


ECB = 'https://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml'
KURSE_OUT = os.path.join(os.path.dirname(__file__), '..', 'src', 'data', 'kurse.json')


def kurse():
    """Euro-Referenzkurse der EZB (CHF, CZK, HUF, DKK) für die Umrechnung der Vignettenpreise."""
    xml = urllib.request.urlopen(urllib.request.Request(ECB, headers={'User-Agent': 'Mozilla/5.0 (update-data)'}), timeout=60).read().decode()
    tag = re.search(r"time='(\d{4}-\d{2}-\d{2})'", xml).group(1)
    k = {c: float(r) for c, r in re.findall(r"currency='([A-Z]{3})' rate='([\d.]+)'", xml) if c in ('CHF', 'CZK', 'HUF', 'DKK')}
    if len(k) != 4:
        sys.exit('EZB-Kurse unvollständig, nichts geschrieben')
    json.dump({'quelle': 'Europäische Zentralbank, Euro-Referenzkurse', 'quelle_url': 'https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/index.de.html', 'stand': tag, 'kurse': k}, open(KURSE_OUT, 'w'), ensure_ascii=False, indent=1)
    print(f"kurse.json : Stand {tag}, {k}")


if __name__ == '__main__':
    main()
    if '--datei' not in sys.argv:
        kurse()
