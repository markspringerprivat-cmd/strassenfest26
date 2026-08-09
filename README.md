# Straßenfest in Hilchenbach – mobile Anmeldung

Mobile-first Einseiten-Webseite für die Anmeldung zum Straßenfest. Die Seite ist für GitHub Pages vorbereitet und besteht aus HTML, CSS und JavaScript.


## Design-Update

Die Anmeldebox ist jetzt im Stil des abgestimmten Mockups umgesetzt: halbtransparentes Indigo-/Violett-Glas, warmer goldener Leuchtrand, goldener Weiter-Button, passende Eingabefelder und eine schmale Icon-Navigation am unteren Bildschirmrand. Die Box sitzt direkt unter „in Hilchenbach“, während die Jahrmarkt-Szene sichtbar bleibt.

## Enthalten

- Vollbild-Hintergrund auf Smartphones
- Berücksichtigung der mobilen Browserleiste über `100dvh` und die `VisualViewport`-API
- Kein Scrollen der eigentlichen Seite
- Mehrstufige Anmeldung:
  1. Name + Alter, weitere Personen hinzufügen
  2. Mitbringsel auswählen und beschreiben
  3. Übersicht und Absenden
  4. Danke-Ansicht
- Kategorien:
  - Spielzeug
  - Essen → Deftig / Süß / Beilage
  - Getränke → Alkoholisch / Nicht alkoholisch / Zuckerhaltig / Nicht zuckerhaltig / Gemischt
- Das Freitextfeld bleibt ausgegraut, bis die erforderlichen Dropdowns gewählt wurden
- Dezente, langsame Feuerwerk-Animation im Hintergrund
- Footer mit Impressum, Kontakt und Admin
- Demo-Adminbereich mit lokal gespeicherten Anmeldungen und JSON-Export
- `prefers-reduced-motion` wird respektiert

## GitHub Pages

1. Den Inhalt dieses Ordners in ein GitHub-Repository hochladen.
2. In GitHub unter **Settings → Pages** als Quelle den Branch `main` und `/ (root)` auswählen.
3. Die von GitHub angezeigte Pages-Adresse öffnen.

## Wichtiger Hinweis zur Datenspeicherung

GitHub Pages ist statisch und kann selbst keine zentrale Datenbank führen. In dieser ersten Version werden Anmeldungen deshalb nur im `localStorage` des jeweiligen Browsers gespeichert.

Das bedeutet: Die Oberfläche und der Ablauf sind vollständig funktionsfähig, aber verschiedene Besucher sehen nicht gegenseitig ihre Anmeldungen.

Für den produktiven Einsatz muss in `script.js` die Konstante `SUBMIT_ENDPOINT` mit einem HTTPS-Endpunkt verbunden werden, zum Beispiel über eine Serverless Function, Supabase, Firebase oder einen eigenen Backend-Service.

## Dateien

```text
strassenfest-hilchenbach/
├── index.html
├── styles.css
├── script.js
├── README.md
└── assets/
    └── strassenfest-hilchenbach.png
```

## Impressum / Kontakt

Die Inhalte in den Dialogen sind aktuell Platzhalter und müssen vor Veröffentlichung mit den echten Angaben ersetzt werden.


## Update v3

- neuer Hintergrund aus dem zuletzt freigegebenen Motiv
- Karte weiter nach unten gesetzt für mehr Abstand unter „in Hilchenbach“
- besseres Verhalten bei eingeblendeter Smartphone-Tastatur: Die Karte bleibt sichtbar und wird nach oben verlagert, statt oben abgeschnitten zu werden
- Notizfeld vergrößert
- Feuerwerk etwas größer, auffälliger und an zufälligen Stellen
