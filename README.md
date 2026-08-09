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


## Update v9

- Goldgelbe, deutlichere Scrollbalken in allen vorgesehenen Scrollbereichen.
- Smooth-Scrolling deaktiviert, damit Fokuswechsel nicht mehr sichtbar „wabern“.
- Die Tastaturposition wird nur einmal pro Personenzeile bzw. Eingabebereich berechnet.
- Das Notizfeld wird beim Schreiben stabil oberhalb der Tastatur sichtbar positioniert.
- Neue Personenzeilen bekommen eindeutige Feldnamen und Browser-Autofill ist deaktiviert; neue Zeilen werden explizit leer erzeugt.
- Fehler erscheinen als deutliches Pop-up und die Ansicht springt automatisch zur Fehlerstelle.
- Kacheln und Formularflächen sind leicht transparenter, sodass der Hintergrund dezent durchscheint.


## Update v10

Die Tastaturlogik wurde vollständig vereinfacht und der alte feldabhängige
Positionierungsalgorithmus entfernt.

- Sobald die Bildschirmtastatur geöffnet ist, wird die komplette Kachel am oberen
  Rand des sichtbaren Browserbereichs angeheftet.
- Die Kachel darf dabei den Titel „Straßenfest in Hilchenbach“ überdecken.
- Beim Wechsel zwischen Vorname, Nachname und Alter bewegt sich die Kachel nicht mehr.
- Falls ein Feld weiter unten liegt, scrollt ausschließlich der Inhalt innerhalb der Kachel.
- Beim Schließen der Tastatur kehrt die Kachel an ihre normale Position direkt unter
  „in Hilchenbach“ zurück.
- Hintergrund und Footer werden nicht durch die Tastatur nach oben geschoben.
- Die zuvor übereinanderliegenden v7/v8/v9-CSS-Override-Blöcke wurden entfernt und
  zu einem einzigen v10-Block zusammengeführt.
- Alte Viewport-Helfer für fokusabhängige Verschiebungen wurden aus JavaScript entfernt.


## Update v11

- Sanfte Rückkehranimation nach dem Schließen der Tastatur:
  Die oben angeheftete Kachel gleitet mit einer kurzen Ease-out-Bewegung zurück an ihre
  normale Position unter „in Hilchenbach“.
- Der durch mobile Browser verschobene Hintergrund gleitet im selben Zeitraum zurück.
- Footer blendet nach dem Tastaturmodus sanft wieder ein.
- Seitenwechsel über „Weiter“, „Zurück“, „Ja/Nein“, „Was wird noch gebraucht?“ usw.
  verwenden kurze, ruhige Einblend-/Verschiebebewegungen.
- Neue Personenzeilen erscheinen mit einer kleinen Fade-/Slide-Bewegung;
  entfernte Zeilen verschwinden ebenfalls weich.
- Buttons erhalten eine kurze, dezente Druckanimation.
- Pop-ups/Fehlermeldungen und Modalfenster erscheinen sanfter.
- Tote bzw. fehlerhafte Fragmente aus v10 wurden entfernt:
  ein veralteter Geometrie-Aufruf sowie eine falsche Variable beim Fokus einer
  neu hinzugefügten Person.
- Die gestapelten v10-CSS-Overrides wurden entfernt und die mobile Interaktions-
  und Animationslogik in einem gemeinsamen Block zusammengeführt.


## Update v12

- „Person hinzufügen“ erstellt die neue Zeile und fokussiert sofort synchron das Feld „Vorname“.
- Dadurch öffnet sich die Smartphone-Tastatur direkt aus dem Tastendruck heraus.
- Die Personenliste springt automatisch zum neu angelegten Eintrag.
- Die Kachel selbst bleibt im Tastaturmodus oben angeheftet; nur der interne Listen-/Karteninhalt wird zum neuen Feld bewegt.
- Auf `scrollIntoView()` wird bewusst verzichtet, damit mobile Browser nicht die gesamte Seite verschieben.


## Update v13

- Google-Apps-Script-Web-App angebunden:
  https://script.google.com/macros/s/AKfycbyR2jC7NmY5h2q__ZLJo-SeuNpGoXoJO-JNyNahOlkVybBKZoRlS1Mb859Gov8Hb3pkEw/exec
- Serverkommunikation erfolgt über einen versteckten iframe/form-Transport mit `postMessage`,
  damit die GitHub-Pages-Seite nicht von CORS-Problemen beim Lesen der Apps-Script-Antwort
  abhängig ist.
- Neue Anmeldungen werden zentral gespeichert; der Server liefert den persönlichen Anmeldecode.
- „Was wird noch gebraucht?“ liest die zentrale Statistik aus Google Sheets.
- Auf der Startseite gibt es „Meine Anmeldung“.
- Gespeicherter Code + Nachname werden lokal auf dem Gerät gemerkt und für den Wiederaufruf verwendet.
- Alternativ kann eine Anmeldung manuell per Code + Nachname geladen werden.
- Nach erfolgreicher Anmeldung werden Code und gespeicherte Daten angezeigt.
- „Alle Daten als PDF herunterladen“ erzeugt clientseitig eine PDF-Datei.


## Update v14

- Footer-Admin öffnet eine separate `admin.html`.
- Geschützter Admin-Bereich mit Passwortlogin und serverseitiger Sitzung.
- Übersicht: jede einzelne Person, Suche, Filter und Sortierung.
- Bezahlstatus pro Person mit automatischer Speicherung.
- Neues Google-Sheet-Blatt `zahlungen` für Bezahlstatus.
- Einkauf-Reiter mit erhaltenem Betrag, Einkaufssumme und Restbudget.
- Einkaufsposten: Kategorie, Bezeichnung, Betrag, Notiz; Änderungen werden automatisch gespeichert.
- Neues Google-Sheet-Blatt `einkauf`.
- Mitbringsel-Kategorie `Sonstiges`.
- Beim Auswählen eines Mitbringsel-Bereichs werden bereits vorhandene konkrete Einträge angezeigt.
- Das konkrete Mitbringsel/Notizfeld bleibt Pflichtfeld.

## Update v15 – Apps-Script-Verbindung korrigiert
- Die Rückmeldung der Apps-Script-Web-App wird jetzt auch dann akzeptiert,
  wenn Google die HtmlService-Antwort in einem zusätzlichen Sandbox-Frame ausführt.
- Die Zuordnung einer Antwort erfolgt über die zufällig erzeugte requestId.
- Dadurch laufen Anmeldung, Bedarfsliste, „Meine Anmeldung“ und Admin-API
  nicht mehr in den 18-Sekunden-Timeout, nur weil event.source vom äußeren iframe abweicht.


## Update v16 – robuste Apps-Script-Kommunikation

Die bisherige iframe/postMessage-Rückgabe wurde vollständig ersetzt.

Neuer Ablauf:
1. Die Webseite sendet die Aktion per HTTPS-POST mit `fetch(..., mode: "no-cors")`.
2. Apps Script verarbeitet die Aktion und legt das Ergebnis kurzzeitig unter einer
   zufälligen Einmal-ID im Script-Cache ab.
3. Die Webseite fragt ausschließlich diese Einmal-ID per JSONP ab.
4. Passwort und Admin-Session-Token stehen niemals in der JSONP-/GET-URL.

Das vermeidet die Google-HtmlService-Sandbox-/iframe-Probleme, die bei v14/v15
zum Timeout geführt haben konnten.


## Update v17 – Doppelanmeldungen verhindert + sichere Bestätigung

- Der finale „Absenden“-Button wird beim ersten Klick sofort deaktiviert und
  zeigt „Wird gespeichert …“.
- Während der Speicherung ist kein zweiter Klick möglich.
- Jede Anmeldung erhält vor dem ersten Sendeversuch eine stabile submissionId.
- Dieselbe ID wird bei einem Retry wiederverwendet.
- Der Server verwendet diese ID als registration_id und legt dieselbe Anmeldung
  bei einem erneuten POST nicht ein zweites Mal an.
- Die erfolgreiche Anmeldung wird nach dem POST unabhängig über
  `registrationstatus` abgefragt. Die Website ist damit nicht mehr auf die
  unmittelbare POST-Antwort angewiesen.
- Nach erfolgreicher Bestätigung wechselt die Seite automatisch auf die
  Abschlusskachel; der Submit-Button bleibt bis dahin gesperrt.

## Update v18
- Admin-Übersicht gruppiert Teilnehmer nach Anmeldung.
- Erste Person wird als „Hauptzahler / Hauptanmeldung“ dargestellt.
- Weitere Personen hängen optisch direkt darunter als „Mitangemeldet“.
- Bezahlstatus kann weiterhin pro Person gesetzt werden.
- Zusätzlich kann eine komplette Anmeldung mit einem Klick als bezahlt/offen markiert werden.
- Nach dem erfolgreichen Absenden erscheint eine eigene Anmeldecode-Kachel.
- Kein Code-kopieren-Button mehr.
- PDF-Download enthält oben groß und fett den Anmeldecode und darunter alle Anmeldedaten.
- Der Weiter-Button auf der Code-Kachel zählt von 10 herunter und wird erst danach aktiv.

## Update v19
- Footer: Impressum · Kontakt · Datenschutz · Admin.
- Kontakt öffnet `contact.html`.
- Kontaktformular verlangt Name, Anfrage und einen Kontaktweg:
  E-Mail, Telefon oder WhatsApp.
- Kontaktanfragen werden zentral in Google Sheets als Tickets gespeichert.
- Admin-Bereich: dritter Reiter `Tickets`.
- Tickets besitzen Suche, Statusfilter, Sortierung und Open/Done-Status.
- Ticketstatus wird beim Klick sofort automatisch gespeichert.
- `impressum.html` und `datenschutz.html` sind als ausfüllbare Entwürfe enthalten.


## Update v20
- PDF-Download auf Smartphones verbessert:
  - wenn möglich nativer Teilen-/Speichern-Dialog,
  - ansonsten PDF in neuem Tab,
  - Desktop weiterhin normaler Dateidownload.
- Datenbank-Polling besitzt jetzt pro Einzelabfrage einen 4-Sekunden-Watchdog.
  Ein festhängender Script-Request kann die Oberfläche damit nicht mehr
  unbegrenzt auf „Wird gespeichert …“ stehen lassen.
- Auch der initiale POST wartet höchstens 10 Sekunden lokal; anschließend wird
  trotzdem geprüft, ob die Anmeldung bereits in Google Sheets gespeichert wurde.
- Eine neue Anmeldung ist nicht an eine Geräte-ID gebunden. Jede neue Anmeldung
  bekommt eine neue zufällige submissionId; nur ein Retry derselben Anmeldung
  verwendet dieselbe ID zur Duplikatvermeidung.

## Update v21
- Teilnehmerübersicht kompakt/einklappbar.
- „Nutzer suchen & sortieren“ als gestufte Kompaktsteuerung.
- Einzelne Personen löschbar; Hauptperson nur mit Nachfolger.
- Einkaufsliste einzeilig; Kategorie/Notiz hinter Notizsymbol.
- Tickets werden beim Abschließen gelöscht.


## Update v22
- Admin: iOS-Autozoom bei allen Eingabefeldern verhindert (16px Mindestschrift).
- Einkauf: jeder gespeicherte Posten ist jetzt eine echte Ein-Zeilen-Liste:
  Bezeichnung · Preis · Notizsymbol · Löschen.
- „Posten hinzufügen“ öffnet zuerst ein Popup. Erst „Hinzufügen“ speichert den
  neuen Posten und nimmt ihn in die Berechnung auf.
- Das Notizsymbol öffnet dasselbe Popup zum Bearbeiten von Bezeichnung, Preis,
  Kategorie und Notiz.
- Schritt 1: die Aktionsleiste ist nicht mehr sticky und kann zusätzliche
  Personenzeilen bei geöffneter Tastatur nicht mehr überdecken.
- Feuerwerk: Canvas-Skalierung synchronisiert, Explosionen runder, heller und
  klarer mit dezenten Funken-Schweifen.
