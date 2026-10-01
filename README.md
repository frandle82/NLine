# NLine 📏✨

> **Interaktive WebApp zur Orientierung am Zahlstrahl mit Brüchen und Dezimalbrüchen**  
> Entwickelt für den modernen Mathematikunterricht an Schulen (Sekundarstufe I & Primarstufe) sowie für das selbstständige Lernen zu Hause.

[![Deploy to GitHub Pages](https://github.com/frandle82/NLine/actions/workflows/deploy.yml/badge.svg)](https://github.com/frandle82/NLine/actions/workflows/deploy.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## 🎯 Über das Projekt

Der Übergang von natürlichen Zahlen zu rationalen Zahlen (Brüche und Dezimalbrüche) stellt für viele Schülerinnen und Schüler eine der größten didaktischen Hürden im Mathematikunterricht dar. 

**NLine** ist eine interaktive, responsive WebApp, die ein intuitives mathematisches Grundverständnis durch Visualisierung und taktile Interaktion am virtuellen Zahlstrahl fördert.

### 🌟 Kernfunktionen & Didaktisches Konzept

1. **Dynamischer & zoombarer Zahlstrahl**
   - Stufenloses Vergrößern und Verschieben von Zahlenräumen (z. B. 0 bis 1, 0 bis 2 oder beliebige Intervalle).
   - Dynamische Skalierung: Bei starkem Hineinzoomen werden feinere Unterteilungen (Halbe, Viertel, Achtel bzw. Zehntel, Hundertstel) sichtbar.

2. **Duale Darstellung: Brüche & Dezimalbrüche synchron erleben**
   - Direkte Gegenüberstellung von Bruchdarstellung (z. B. $\frac{1}{4}, \frac{1}{2}, \frac{3}{4}$) und Dezimalbruchdarstellung ($0{,}25; 0{,}5; 0{,}75$).
   - Umschaltbare oder parallele Ansichten zur Stärkung der Übersetzungskompetenz zwischen Zahlformaten.

3. **Visuelle Modellierungshilfen**
   - Zuschaltbare Hilfslinien und Teilungsstufen (Bruchbalken, Farbkodierungen).
   - Markieren von echten und unechten Brüchen sowie gemischten Zahlen.

4. **Interaktive Spiel- & Übungsmodi**
   - **"Finde die Zahl"**: Gegebener Bruch / Dezimalbruch muss per Schieberegler oder Klick am Zahlstrahl lokalisiert werden.
   - **"Welche Zahl steht hier?"**: Ein markierter Punkt auf dem Strahl muss als gekürzter Bruch oder Dezimalzahl bestimmt werden.
   - **"Ordnen & Vergleichen"**: Mehrere Zahlen per Drag-and-Drop auf dem Strahl in die richtige Reihenfolge bringen.
   - Sofortiges, ermutigendes Feedback mit didaktischen Hilfestellungen statt bloßer Fehleranzeige.

5. **Optimiert für Schule & Unterricht**
   - Funktioniert nahtlos auf Tablets (iPad, Android), Laptops und interaktiven Whiteboards (Smartboards).
   - Kein Login oder Datentracking erforderlich – DSGVO-konform und direkt im Browser lauffähig.

---

## 🛠️ Technologie-Stack

- **Frontend Core**: Modernes HTML5, Vanilla JavaScript (ES Modules)
- **Styling**: Modernes Vanilla CSS (Design-Tokens, Dark/Light-Theme, barrierefreie Kontraste)
- **Build-Tooling**: [Vite](https://vite.dev/) für blitzschnelle Entwicklungszyklen und schlanke Produktions-Bundles
- **Hosting / CI/CD**: GitHub Actions & GitHub Pages

---

## 🚀 Schnellstart & Lokale Entwicklung

### Voraussetzungen

- [Node.js](https://nodejs.org/) (Version 18 oder höher empfohlen)
- [npm](https://www.npmjs.com/)

### Installation

```bash
# Repository klonen
git clone https://github.com/frandle82/NLine.git
cd NLine

# Abhängigkeiten installieren
npm install
```

### Entwicklungsserver starten

```bash
npm run dev
```

Die App ist anschließend lokal unter `http://localhost:3000` erreichbar.

### Produktions-Build erstellen

```bash
npm run build
```

Das optimierte Build-Artefakt wird im Ordner `dist/` abgelegt.

---

## 🚢 Deployment (GitHub Pages)

Im Repository ist ein automatisierter GitHub Actions Workflow (`.github/workflows/deploy.yml`) hinterlegt:
- Bei jedem Push auf den `main`-Branch wird das Projekt automatisch gebaut und auf GitHub Pages bereitgestellt.
- Zur Aktivierung in den GitHub Repository-Einstellungen unter **Settings -> Pages -> Source** auf **GitHub Actions** umstellen.

---

## 🤝 Mitwirken

Beiträge zur Weiterentwicklung und didaktischen Verfeinerung sind herzlich willkommen!
- Bei Fehlern oder Feature-Wünschen gerne ein [Issue](https://github.com/frandle82/NLine/issues) erstellen.
- Pull Requests sind stets gern gesehen.

---

## 📄 Lizenz

Dieses Projekt steht unter der [MIT License](LICENSE).
