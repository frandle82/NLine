# NLine

NLine ist eine interaktive Zahlenstrahl-App für den Mathematikunterricht in Klasse 6. Sie läuft ohne Anmeldung direkt im Browser und ist für iPads, Laptops und digitale Tafeln optimiert.

## Funktionen

- Umschalten zwischen Brüchen und Dezimalbrüchen
- Bruch-Eingabe in getrennten Feldern für Zähler und Nenner
- Automatische Einteilung des Zahlenstrahls anhand des Nenners
- Dezimalskalierung in Zehntel, Hundertstel oder Tausendstel
- Zuschaltbarer Schieberegler mit laufender Wertanzeige
- Bedienung per Finger, Maus oder Tastatur
- Barrierearme, responsive Oberfläche auf Deutsch

## Lokal starten

Voraussetzung ist Node.js 22 oder neuer.

```bash
npm install
npm run dev
```

Der Produktions-Build wird mit `npm run build` erzeugt und liegt anschließend in `dist/`.

## GitHub Pages

Der Workflow [deploy-pages.yml](.github/workflows/deploy-pages.yml) baut und veröffentlicht die App automatisch bei jedem Push auf `main`. Im GitHub-Repository muss unter **Settings → Pages → Source** einmalig **GitHub Actions** ausgewählt sein.

Öffentliche App: <https://frandle82.github.io/NLine/>

## Lizenz

[MIT](LICENSE)
