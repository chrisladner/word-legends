# Word Legends – Vokabeltrainer

Web-App (PWA) fürs iPhone: Englisch-Vokabeln als Sammelkarten, Wiederholung nach dem
Karteikasten-Prinzip (Leitner). Kein App Store, kein Build-Schritt, keine Abhängigkeiten.
Läuft offline, sobald sie einmal geöffnet wurde.

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
| Neue Wörter | Karte ansehen + anhören → verdeckt tippen → später Multiple Choice → später tippen |
| Abfragearten | Stufe 1: tippen · Stufe 2: tippen/Lückensatz · ab 3: tippen/Lückensatz/Hördiktat |
| Portionen | 8 neue pro Tag (einstellbar), `apart`-Gruppen (open/close …) nie am selben Tag |
| Testdatum | Neue Wörter werden bis 2 Tage vorher verteilt, am Tag vor dem Test sind alle Karten fällig |
| Probetest | Deutsch → Englisch ohne Hilfe, halbe Punkte für Tippfehler / fehlendes „to“, Note 1–5 (90/80/65/50 %) |

## Neue Unit hinzufügen

In `words.js` einen weiteren Block an `window.UNITS` anhängen (Format steht oben in der Datei).
Einfachster Weg: Foto der Vokabelseite an Claude schicken („neue Unit für Word Legends“).
ids nie ändern oder wiederverwenden, sonst geht der Fortschritt verloren.
Danach `sw.js` → `VERSION` hochzählen (z. B. `wl-v2`) und neu veröffentlichen.
Auf dem iPhone ist die neue Version ab dem **zweiten** Öffnen da (erst Hintergrund-Update, dann aktiv).

## Dateien

- `index.html` – Gerüst, iOS-Meta-Tags
- `styles.css` – Design (Kobaltblau, Tinten-Konturen, Stufenfarben `--t0`…`--t6`)
- `words.js` – Vokabeln
- `app.js` – Lernlogik + Oberfläche
- `sw.js` – Offline-Cache
- `manifest.webmanifest`, `icons/` – App-Icon (Quelle: `icons/icon-source.html`)

## Lokal testen

```bash
python3 -m http.server 8765 --directory word-legends
```

In der Browser-Konsole: `WL.shiftDays(1)` springt einen Tag weiter (nur in diesem Tab),
`WL.check('u1-give', 'to giv')` prüft eine Antwort.

## Icons neu erzeugen

```bash
cd word-legends/icons
CH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
"$CH" --headless=new --hide-scrollbars --window-size=1024,1024 --virtual-time-budget=6000 --screenshot=$PWD/i.png "file://$PWD/icon-source.html"
"$CH" --headless=new --hide-scrollbars --window-size=1024,1024 --virtual-time-budget=6000 --screenshot=$PWD/m.png "file://$PWD/icon-source.html?s=0.6"
magick i.png -resize 180x180 apple-touch-icon.png && magick i.png -resize 192x192 icon-192.png
magick i.png -resize 512x512 icon-512.png && magick m.png -resize 512x512 icon-maskable-512.png && rm i.png m.png
```
