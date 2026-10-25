# Word Legends – Vokabeltrainer

Web-App (PWA) fürs iPhone: Englisch-Vokabeln und Grammatik als Sammelkarten, Wiederholung nach dem
Karteikasten-Prinzip (Leitner), dazu Schreib-Training mit Satzprüfung und eine Generalprobe für
Schularbeiten. Kein App Store, kein Build-Schritt, keine Abhängigkeiten. Läuft offline, sobald sie
einmal geöffnet wurde.

## Aufs iPhone

1. In **Safari** die veröffentlichte Adresse öffnen.
2. Teilen-Symbol → **„Zum Home-Bildschirm“**.
3. Ab jetzt nur noch über das Icon starten. Wichtig: Der Fortschritt liegt auf dem Gerät,
   in der Home-Bildschirm-App. Wer die App löscht, löscht den Fortschritt.
   Sicherung: Einstellungen → „Code kopieren“ (z. B. in eine Notiz).

## Wie gelernt wird

| Baustein | Umsetzung |
|---|---|
| Aktives Abrufen | Jede Aufgabe verlangt eine Antwort, nichts wird nur angeschaut |
| Verteilte Wiederholung | Stufen 1–5 + Legendär, Pausen 1 · 2 · 4 · 7 · 14 · 30 Tage (Legendär und richtig: 60) |
| Einmal pro Tag zählt | Nur der erste Versuch einer geladenen Karte ändert die Stufe |
| Fehler | −2 Stufen (mind. 1), morgen wieder. Tippfehler oder Tipp benutzt: Stufe bleibt, morgen wieder |
| Wie im Test | Hauptaufgabe Deutsch → Englisch tippen, Autokorrektur aus, 1 Buchstabe daneben = „Fast!“ |
| Ausbessern | Nach Fehlern einmal richtig abschreiben, Wort kommt in derselben Runde nochmal |
| Neue Wörter | erst abfragen („Kennst du das schon?“): gekonnt → startet auf Stufe 2 (Schularbeit: 3). Sonst Karte ansehen + anhören → verdeckt tippen → Multiple Choice → tippen |
| Abfragearten | Stufe 1: tippen · Stufe 2: tippen/Lückensatz · ab 3: tippen/Lückensatz/Hördiktat |
| Portionen | 8 neue pro Tag (einstellbar), `apart`-Gruppen (open/close …) nie am selben Tag |
| Mehrere Units | neueste Unit hat Vorrang, ältere werden eingestreut (max. 6 pro Tag), siehe unten |
| Testdatum | Neue Wörter werden bis 2 Tage vorher verteilt, am Tag vor dem Test sind alle Karten fällig |
| Probetest | Deutsch → Englisch ohne Hilfe, halbe Punkte für Tippfehler / fehlendes „to“, Note 1–5 (90/80/65/50 %) |

## Schularbeit (exam.js)

Bis zum Datum in `exam.js` läuft die App im Schularbeits-Modus. Die Abschnitte entsprechen dem
Zettel der Lehrerin und stehen als Checkliste mit echtem Fortschritt auf der Startseite.

| | Schularbeits-Modus |
|---|---|
| Units | alle in `EXAM.units` zählen gleich, neue Wörter bunt gemischt |
| Neue Karten | bis 3 Tage vorher verteilt (Vokabeln und Grammatik getrennt, Grammatik in Dreiergruppen, max. 3 neue Themen pro Tag) |
| Endspurt | jede Karte, die nicht in den letzten 6 Tagen ab Stufe 3 gewusst wurde, kommt in den letzten 3 Tagen nochmal, schwache am Tag davor |
| Menge | höchstens `REVIEW_CAP` (55) Wiederholungen pro Tag, die wackeligsten zuerst; am Tag selbst nur 15 (Aufwärmen) |
| Bereit-Anzeige | Stufe 3 = sicher (1 und 2 Tage Pause überstanden) |
| Generalprobe | 12 Vokabeln, 20 Grammatik-Aufgaben, 2 Sätze zu einem Bild – Punkte pro Teil und Note |

Simuliert (70 % der neuen Wörter schon bekannt, sonst 85 % richtig): ca. 9–17 Minuten pro Tag,
am Ende 93 % der Karten auf Stufe 3 oder höher.

Nach dem Datum ist alles wieder normal (neueste Unit = Schwerpunkt). Für die nächste Schularbeit
`exam.js` anpassen: Datum, Units, Abschnitte.

## Grammatik (grammar.js)

Je Thema eine Regelkarte (aus dem Student's Book) und Übungskarten im selben Karteikasten:
Lücke (`q: 'She [is] 11.'`, Alternativen mit `|`), Satzbau mit Kärtchen (`order: '…'`) oder
Bild (`pic: ['frog', 'shoe', 'in']`). Am Anfang wird ausgewählt, später selbst geschrieben.
Bei Grammatik zählt jeder Buchstabe (babys statt babies ist falsch), nur ein vergessener Apostroph gilt als „fast“.

## Schreiben

- **Bild beschreiben** (S.B. S. 20 Üb. 12 B) und **Federpennal** (Üb. 12 A): zufällige Bilder aus
  `scene.js`. Die App prüft Ding, Farbe, Ort, is/are, there is/are, a/an und Mehrzahl.
- **Eigener Text** (S.B. S. 15 Üb. 18): Mikes Text als Vorlage, Satzanfänge zum Antippen,
  Checkliste (Sätze, Großschreibung, I, Klassenzimmer, Farben, is/are) und Hinweise auf unbekannte Wörter.
- Testseite für die Präpositions-Bilder: `tools/scene-test.html`

## Neue Unit hinzufügen

In `words.js` einen weiteren Block an `window.UNITS` anhängen (Format steht oben in der Datei).
Einfachster Weg: Foto der Vokabelseite an Claude schicken („neue Unit für Word Legends“).
ids nie ändern oder wiederverwenden, sonst geht der Fortschritt verloren.
Danach `sw.js` → `VERSION` hochzählen (Stand `wl-v5`) und neu veröffentlichen.

So kommt ein Update aufs iPhone (seit `wl-v5`): Mit Internet holt der Offline-Cache die App-Dateien
immer frisch vom Server (höchstens 2,5 s warten, sonst Cache). Ein neuer `VERSION`-Stand wird beim Öffnen
und beim Zurückholen aus dem Hintergrund gefunden; die App lädt dann von selbst neu, sobald man auf der
Startseite ist, nie mitten in einer Runde. Kommt das Update von `wl-v1`…`wl-v4` (diese Seiten konnten
sich noch nicht selbst neu laden), lädt der neue Offline-Cache das offene Fenster einmal neu (`LEGACY`).
Welche Version am Handy läuft, steht unten in den Einstellungen („Version 5“).

## Mehrere Units: Schwerpunkt + Einstreuen

Keine Unit wird je „abgeschlossen“ – alle Karten bleiben im Kreislauf, nur die Abstände wachsen.
Sobald es mehr als eine Unit gibt, gilt (Einstellungen → „Schwerpunkt“, Standard: neueste Unit):

| | Schwerpunkt-Unit | Ältere Units |
|---|---|---|
| Neue Wörter | zuerst von hier | erst, wenn der Schwerpunkt ganz gesammelt ist |
| Wiederholungen | alle fälligen | höchstens `OLD_PER_DAY` (6) pro Tag, überfälligste zuerst, gemischt in die Runde |
| Testdatum | gilt (alles am Tag vorher) | gilt nicht |
| Probetest | vorausgewählt | per Chip wählbar, oder „Alle Units“ |

„Alle Units gleich“ schaltet den Vorrang ab, z. B. vor einer Schularbeit über mehrere Units.
Mit nur einer Unit ist davon nichts sichtbar. Getestet mit einer erfundenen Unit 2 über 25 simulierte Tage:
nie mehr als 6 alte Karten pro Tag, ein Rückstau von 20 fälligen Karten war nach etwa einer Woche abgebaut.

## Dateien

- `index.html` – Gerüst, iOS-Meta-Tags
- `styles.css` – Design (Kobaltblau, Tinten-Konturen, Stufenfarben `--t0`…`--t6`)
- `words.js` – Vokabeln
- `grammar.js` – Grammatik-Themen mit Regeln und Übungskarten
- `exam.js` – Schularbeit: Datum, Units, Abschnitte des Zettels, Mikes Mustertext
- `scene.js` – Bilder: Präpositionen (Emoji), Zimmer und Federpennal (gezeichnet)
- `app.js` – Lernlogik + Oberfläche
- `sw.js` – Offline-Cache
- `manifest.webmanifest`, `icons/` – App-Icon (Quelle: `icons/icon-source.html`)

## Lokal testen

```bash
python3 word-legends/tools/devserver.py 8765
```

Der Test-Server schickt keine Cache-Header, und auf localhost ist der Offline-Cache aus
(mit `?sw` trotzdem testen). In der Browser-Konsole: `WL.shiftDays(1)` springt einen Tag weiter
(nur in diesem Tab), `WL.check('u1-give', 'to giv')`, `WL.checkGram('pl-baby', 'babys')`,
`WL.room(satz, fakten)` und `WL.meText(text)` prüfen Antworten, `WL.counts()` zeigt die Tagesmenge.

## Icons neu erzeugen

```bash
cd word-legends/icons
CH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
"$CH" --headless=new --hide-scrollbars --window-size=1024,1024 --virtual-time-budget=6000 --screenshot=$PWD/i.png "file://$PWD/icon-source.html"
"$CH" --headless=new --hide-scrollbars --window-size=1024,1024 --virtual-time-budget=6000 --screenshot=$PWD/m.png "file://$PWD/icon-source.html?s=0.6"
magick i.png -resize 180x180 apple-touch-icon.png && magick i.png -resize 192x192 icon-192.png
magick i.png -resize 512x512 icon-512.png && magick m.png -resize 512x512 icon-maskable-512.png && rm i.png m.png
```
