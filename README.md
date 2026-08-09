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


## Update v4
- Layout bleibt statisch: keine VisualViewport-Höhenanpassung und kein dynamisches Zusammenschieben bei Tastatureingabe.
- Vorname, Nachname und Alter stehen tabellarisch in Zeilen.
- „Person hinzufügen“ erzeugt eine neue Zeile.
- Neuer Zwischenschritt „Möchtest du was mitbringen?“ mit Ja / Nein / Was wird noch gebraucht?.
- „Was wird noch gebraucht?“ zeigt eine lokale Statistik mit Plus-Schaltflächen zum Übernehmen einer Kategorie.
- „Nein“ führt direkt zur Übersicht.
- Größeres Notizfeld.
- Feuerwerk etwas größer und häufiger, weiterhin ruhig.

## Update v5

- Anmeldebox auf Smartphones breiter gemacht.
- Teilnehmerliste als echte Tabelle mit Vorname, Nachname und Alter; zusätzliche Personen erzeugen neue Zeilen.
- Hintergrund bleibt bei eingeblendeter Tastatur statisch. Nur die Anmeldebox wird so weit nach oben verschoben, dass die aktive Eingabe sichtbar bleibt; nach dem Schließen der Tastatur fährt sie zurück.
- „Was wird noch gebraucht?“ ist jetzt eine eigene Kachel/Ansicht mit Statistik. Ein Klick auf + öffnet das Mitbringsel-Formular mit bereits voreingestellter Kategorie bzw. Unterkategorie.
- Neuer Zahlungsschritt mit Kostenübersicht (20 € ab 18 Jahren) und zwei Zahlungswegen: Briefkasten oder persönliche Abholung.
- Abschlussübersicht enthält jetzt auch die Zahlung.


## Update v6

- iOS-Autozoom in Eingabefeldern verhindert (16px Form-Schrift + feste Viewport-Skalierung)
- Anmeldebox behält beim Tastatur-Öffnen exakt dieselbe Breite und Größe
- bei Tastatur wird ausschließlich die Box vertikal verschoben, damit das aktive Feld sichtbar bleibt
- Hintergrund bleibt dabei vollständig statisch und wird nicht mehr mit dem VisualViewport verschoben
- beim Schließen der Tastatur kehrt die Box exakt zur Ausgangsposition zurück
- Seiten-/Horizontal-Scrolling gesperrt; nur interne Listen können scrollen
- Browser-Viewport-Höhe wird nach Tastaturschluss neu gesetzt, damit die Footerleiste sichtbar bleibt
- Hintergrundmotiv ca. 32 CSS-Pixel nach oben versetzt


## Update v7

- Die Anmeldekachel wird aus der Geometrie des Hintergrundbildes berechnet und sitzt auf Smartphones ca. 10–16 CSS-Pixel unter „in Hilchenbach“.
- Hintergrund und Kartenbreite bleiben bei eingeblendeter Tastatur unverändert.
- Beim Fokus einer Personenzeile wird nur die komplette Karte vertikal verschoben; Vorname, Nachname und Alter derselben Zeile behalten dieselbe Kartenposition.
- iOS-/Browser-Fokus-Panning wird ausgeglichen, damit Hintergrund und Karte optisch nicht seitlich oder unkontrolliert verrutschen.
- Beim Schließen der Tastatur kehrt die Karte exakt in die normale Ausgangsposition zurück.
- Impressum/Kontakt/Admin werden bei geöffneter Tastatur nicht nach oben geschoben, sondern bleiben am normalen unteren Platz und sind währenddessen unsichtbar.
- Lange Schritte (Bedarf, Zahlung, Übersicht) bleiben zwischen Titel und Footer; die Aktionsbuttons sind innerhalb der Kachel sticky und damit erreichbar.


## Update v8

- Das im Video sichtbare Wackeln beim Wechsel zwischen Vorname, Nachname und Alter wurde gezielt behoben.
- Pro Personenzeile wird die vertikale Fokusposition nur einmal berechnet und anschließend festgehalten.
- Wechsel zwischen den drei Spalten derselben Zeile löst keine Neupositionierung mehr aus.
- iOS-VisualViewport-Panning wird nur noch direkt vertikal kompensiert; die frühere mehrstufige Nachkorrektur entfällt.
- Während die Tastatur geöffnet ist sind Transform-Animationen der Karte deaktiviert.
- Die Karte kann nie horizontal verschoben werden.
- Beim Schließen der Tastatur wird die Ausgangslage wiederhergestellt.
