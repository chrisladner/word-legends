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
| Testdatum | Neue Wörter werden bis 2 Tage vorher verteilt, am Tag vor dem Test sind alle Karten fällig. Der offizielle Termin (`exam.js`) geht vor und ist gesperrt; ein eigenes Datum gilt nur ohne offiziellen |
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
`exam.js` anpassen: Datum, Units, Abschnitte, dazu `eingetragen: 'JJJJ-MM-TT'` (Tag des Eintrags, setzt `/stoff`).
Dieser Termin gilt als „von Mama/Papa“: In den Einstellungen ist das Testdatum dann gesperrt, und ein
früher selbst eingetragenes Datum zählt nicht, solange die Schularbeit ansteht.

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
Danach `VERSION` hochzählen, in `sw.js` **und** oben in `app.js` (Stand `wl-v7`; die Version steht auch im
Lagebericht und in der Sicherung), und neu veröffentlichen.

So kommt ein Update aufs iPhone (seit `wl-v5`): Mit Internet holt der Offline-Cache die App-Dateien
immer frisch vom Server (höchstens 2,5 s warten, sonst Cache). Ein neuer `VERSION`-Stand wird beim Öffnen
und beim Zurückholen aus dem Hintergrund gefunden; die App lädt dann von selbst neu, sobald man auf der
Startseite ist, nie mitten in einer Runde. Kommt das Update von `wl-v1`…`wl-v4` (diese Seiten konnten
sich noch nicht selbst neu laden), lädt der neue Offline-Cache das offene Fenster einmal neu (`LEGACY`).
Welche Version am Handy läuft, steht unten in den Einstellungen („Version 6“).

## Eltern-Verbindung und Plan-Karte (seit `wl-v6`)

Anbindung an Legends HQ (Eltern-Hub). Vertrag: `apps/legends-hq/docs/schnittstelle.md`, fachlich
`auftraege/2026-11-06_eltern-hub.md`. Die Bausteine `legends-status.js` und `legends-sync.js` sind Kopien aus
`apps/legends-hq/shared/` – **hier nie von Hand ändern**, sondern dort ändern und `node tools/verteilen.mjs`.

| Teil | Umsetzung |
|---|---|
| Tagesprotokoll `S.log` | `{ 'JJJJ-MM-TT': { a, r, n, s, f, o, k } }`, in `fresh()` und `upgrade()`, beim Laden auf 90 Tage gekürzt. a/r = erste Versuche bei fälligen Karten (dort, wo `review()` läuft) und davon richtig · n = neu gesammelte Karten (`collect()`) · s = Sekunden vom Anzeigen bis zur Antwort, je Aufgabe höchstens 60 (auch Wiederholung in der Runde, Ausbessern, Regel lesen, Probetest, Generalprobe, Schreiben) · f/o/k setzt `LegendsStatus.bericht()` |
| Lagebericht | `berichtEingabe()` → `LegendsStatus.bericht()`, danach `save()`. Ziel = in der Schularbeitszeit `EXAM.units`, sonst die Schwerpunkt-Unit, ohne Schwerpunkt alle Units. Je Karte Stufe, effektiv fällig (`effDue`), zuletzt, gesammelt seit (`since`), im Ziel, Bezeichnung, richtig/falsch. Regeln wie die Lernlogik: Pausen 1·2·4·7·14·30, Legendär 60, sicher ab Stufe 3, Fehler −2, Neue pro Tag = Einstellung + 6 Grammatik, Vorlauf 2 im Schularbeits-Modus sonst 1, Limit 55 Wiederholungen im Schularbeits-Modus sonst keins, Paket 1. Unter 2 KB, ohne Namen |
| Plan je Termin `S.plaene` | in `fresh()` und `upgrade()`. `bericht()` friert beim ersten Bericht zu einem Termin ein, was der App-Plan ab dem Eintragetag bei täglichem Üben erreicht (Schlüssel `'<datum>\|<Stoffmenge>'`), und räumt vergangene Termine selbst weg. Die Ampel misst den Abstand dazu |
| Plan-Karte | Startseite unter der Mission: `urteil(bericht, heute).kind` (Im Plan ✓ · Aufholen · Notfallplan; ohne Termin seit `wl-v7` grau „Kein Termin“), die letzten 6 Tage plus heute als Punkte (✓ fertig, halb = geübt, gestrichelt = nicht geübt, hell = nichts fällig, Ring = heute offen), darunter „Das sehen Mama und Papa auch.“ Kein Rot, keine Minuten, keine XP. Rechnet auch ohne Verbindung. Mit Testdatum braucht die Prognose bis zu ein paar Zehntelsekunden: Das Ergebnis wird je Tag und Speicherstand gemerkt, sonst erscheint die Startseite zuerst und die Karte kurz danach |
| Termine | Offizieller Termin (`exam.js`, `quelle: 'eltern'`, `seit` = `EXAM.eingetragen`) geht immer vor, das Testdatum in den Einstellungen ist dann gesperrt („Termin von Mama/Papa“). Ein eigenes Datum (`quelle: 'selbst'`, `seit` = `settings.testSince`) gibt es nur ohne offiziellen. Ohne Eintragedatum bleibt `seit` weg; dann zählt der Tag, an dem die App den Termin zuerst sieht |
| Einstellungen → Eltern-Verbindung | Verbindungs-Code (`HQ1:…`) einfügen → „Verbinden“ (prüft beim Server, dann gleich melden und sichern). Zustand „verbunden · gemeldet 18:02 · gesichert 18:02“, Fehler als Hinweis darunter. „Aus Sicherung holen“ holt zuerst, fragt dann mit Datum und Kartenzahl beider Stände nach und spielt den Stand über `upgrade()` ein. „Verbindung trennen“ mit Rückfrage. Der Code liegt in `localStorage['legends.sync.v1']`, nie im Sicherungs-Code der App |
| Melden | nur mit Verbindung, nie blockierend, Fehler still: 1,5 s nach dem Start, beim Zurückholen aus dem Hintergrund (höchstens alle 10 Minuten), am Ende jeder Runde (auch beim Abbrechen, wenn schon geübt wurde) |
| Sichern | am Ende jeder Runde: ganzer Speicherstand, im Browser verschlüsselt (AES-GCM, Schlüssel aus dem Familien-Code) |
| Beim Verlassen der App | Tag ins Protokoll schreiben (fertig, offen, sicher), auch wenn die Startseite nicht mehr kommt |

Ohne die beiden Bausteine (z. B. halbes Update ohne Netz) läuft die App wie bisher, nur ohne Plan-Karte und
Verbindung.

Konsole: `WL.bericht()` (frisch gerechneter Lagebericht) · `WL.urteil()` bzw. `WL.urteil({ abend: true })` ·
`WL.eingabe()` · `WL.melden()` (melden und sichern, liefert den Zustand) · `WL.sync` (Verbindungszustand).
Gegen den lokalen Server testen: `node tools/dev.mjs` in `apps/legends-hq` (Port 8787), den gedruckten
Verbindungs-Code einfügen.

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
- `legends-status.js`, `legends-sync.js` – Lagebericht, Ampel, Verbindung zu Legends HQ (Kopien aus `apps/legends-hq/shared/`)
- `app.js` – Lernlogik + Oberfläche
- `sw.js` – Offline-Cache
- `manifest.webmanifest`, `icons/` – App-Icon (Quelle: `icons/icon-source.html`)

## Lokal testen

```bash
# im Projektordner (oder über .claude/launch.json „word-legends“)
python3 apps/word-legends/tools/devserver.py 8765
```

Der Test-Server schickt keine Cache-Header, und auf localhost ist der Offline-Cache aus
(mit `?sw` trotzdem testen). In der Browser-Konsole: `WL.shiftDays(1)` springt einen Tag weiter
(nur in diesem Tab), `WL.check('u1-give', 'to giv')`, `WL.checkGram('pl-baby', 'babys')`,
`WL.room(satz, fakten)` und `WL.meText(text)` prüfen Antworten, `WL.counts()` zeigt die Tagesmenge,
`WL.bericht()` und `WL.urteil()` zeigen Lagebericht und Ampel. Zeitsprünge mit Verbindung nur gegen den
lokalen Server testen, sonst landen Berichte aus der Zukunft bei den Eltern.

## Icons neu erzeugen

```bash
cd word-legends/icons
CH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
"$CH" --headless=new --hide-scrollbars --window-size=1024,1024 --virtual-time-budget=6000 --screenshot=$PWD/i.png "file://$PWD/icon-source.html"
"$CH" --headless=new --hide-scrollbars --window-size=1024,1024 --virtual-time-budget=6000 --screenshot=$PWD/m.png "file://$PWD/icon-source.html?s=0.6"
magick i.png -resize 180x180 apple-touch-icon.png && magick i.png -resize 192x192 icon-192.png
magick i.png -resize 512x512 icon-512.png && magick m.png -resize 512x512 icon-maskable-512.png && rm i.png m.png
```
