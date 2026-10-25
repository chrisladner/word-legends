/*
  Word Legends – Schularbeit
  ---------------------------------------------------------------
  Bis zum Datum ist die App im Schularbeits-Modus: alle genannten Units zählen gleich,
  neue Karten werden bis 3 Tage vorher verteilt, in den letzten 3 Tagen kommt jede Karte
  noch einmal dran (schwache am Tag davor). Danach läuft die App normal weiter.
  Die Abschnitte entsprechen dem Zettel „English test on November 5th, 2026“.
*/
window.EXAM = {
  id: 'sa-2026-11-05',
  date: '2026-11-05',
  title: 'Englisch-Schularbeit',
  units: ['u1', 'u2'],
  parts: [
    { id: 'v1', area: 'General', label: 'Vokabeln Unit 1', kind: 'vocab', unit: 'u1', ref: 'WB S. 11–13' },
    { id: 'v2', area: 'General', label: 'Vokabeln Unit 2', kind: 'vocab', unit: 'u2', ref: 'WB S. 20–21' },
    { id: 'plural', area: 'Grammar', label: 'Plural + Ausnahmen', kind: 'gram', topic: 'plural', ref: 'S.B. S. 15' },
    { id: 'questions', area: 'Grammar', label: 'Fragen', kind: 'gram', topic: 'questions', ref: 'S.B. S. 15' },
    { id: 'imper', area: 'Grammar', label: 'Befehlsformen', kind: 'gram', topic: 'imper', ref: 'S.B. S. 15' },
    { id: 'tobe', area: 'Grammar', label: 'to be', kind: 'gram', topic: 'tobe', ref: 'S.B. S. 20' },
    { id: 'therebe', area: 'Grammar', label: 'there is / there are', kind: 'gram', topic: 'therebe', ref: 'S.B. S. 20' },
    { id: 'prep', area: 'Grammar', label: 'Präpositionen', kind: 'gram', topic: 'prep', ref: 'S.B. S. 20' },
    { id: 'listen', area: 'Listening', label: 'Listening', kind: 'tick',
      ticks: ['Listening-Aufgaben von Unit 1 + 2 im „My personal Learning Track“ (digi4school) gemacht'] },
    { id: 'read', area: 'Reading', label: 'Reading', kind: 'tick',
      ticks: ['Reading-Aufgaben von Unit 1 + 2 im „My personal Learning Track“ gemacht', 'Reading-Texte im Student’s Book noch einmal gelesen'] },
    { id: 'w-me', area: 'Writing', label: 'Text über mich & mein Klassenzimmer', kind: 'write', task: 'me', ref: 'S.B. S. 15, Üb. 18' },
    { id: 'w-case', area: 'Writing', label: 'Was ist in meinem Federpennal?', kind: 'write', task: 'case', ref: 'S.B. S. 20, Üb. 12 A' },
    { id: 'w-scene', area: 'Writing', label: 'Bild beschreiben: wo & welche Farbe', kind: 'write', task: 'scene', ref: 'S.B. S. 20, Üb. 12 B' }
  ],
  // Mikes Text aus dem Student's Book S. 15, Übung 18 – die Vorlage für den eigenen Text
  model: "I'm Mike. I'm ten. I'm in class 1A. My email address is mike@linkways.com. In my classroom, the floor is green. The desks and the chairs are brown and black. The door is light green and the board is white. My pencil case is blue and red. Red is my favourite colour."
};
