/*
  Word Legends – Vokabeldaten
  ---------------------------------------------------------------
  Eine Unit = eine Vokabelliste aus dem Buch. Neue Units einfach
  unten anhängen. Die ids NIE ändern – der Lernfortschritt hängt daran.

  Felder pro Wort:
    id    eindeutig, z. B. 'u1-give'
    sec   Übungsnummer im Buch ('' = ohne Nummer)
    en    englisch, so wie im Buch
    de    deutsch, so wie im Buch
    ex    Beispielsatz aus dem Buch; [eckige Klammern] = Lücke im Lückentext
    alt   (optional) alle richtigen Antworten, wenn es mehrere gibt
    main  (optional) Form, die beim Abschreiben angezeigt wird
    (apart pro Unit: Gruppen von ids, die nicht am selben Tag neu eingeführt werden)
    say   (optional) was die Vorlesestimme sagt
    hint  (optional) Zusatz unter dem deutschen Wort, wenn es mehrdeutig ist
    tip   (optional) Merktipp nach der Antwort
*/
window.UNITS = [
  {
    id: 'u1',
    title: 'Unit 1',
    source: 'MORE Words and Phrases · WB Seite 13',
    // Diese Wörter kommen nie am selben Tag neu dazu (Gegensätze und leicht Verwechselbares stören sich beim Lernen)
    apart: [
      ['u1-open', 'u1-close'],
      ['u1-sitdown', 'u1-standup'],
      ['u1-love', 'u1-hate'],
      ['u1-their', 'u1-your', 'u1-our']
    ],
    words: [
      { id: 'u1-give', sec: '', en: 'to give', de: 'geben', ex: '[Give] me your school bag.' },
      { id: 'u1-time', sec: '', en: 'time', de: 'Zeit', ex: "It's [time] for school." },
      { id: 'u1-understand', sec: '', en: 'to understand', de: 'verstehen', ex: 'I [understand] the question.' },
      { id: 'u1-write', sec: '', en: 'to write', de: 'schreiben', ex: '[Write] the numbers.', tip: 'Das w am Anfang spricht man nicht: write.' },

      { id: 'u1-enjoy', sec: '1', en: 'to enjoy', de: 'genießen', ex: '[Enjoy] the music.' },
      { id: 'u1-listen', sec: '1', en: 'to listen', de: 'zuhören', ex: '[Listen] to the song.', tip: 'Das t spricht man nicht: lis-ten. Man sagt listen to …' },
      { id: 'u1-love', sec: '1', en: 'to love', de: 'lieben', ex: "I [love] blue. It's my favourite colour.", tip: 'Gegenteil: to hate' },
      { id: 'u1-more', sec: '1', en: 'more', de: 'mehr', ex: 'I want [more]!' },
      { id: 'u1-read', sec: '1', en: 'to read', de: 'lesen', ex: '[Read] the text.' },

      { id: 'u1-their', sec: '2', en: 'their', de: 'ihr/e', hint: 'gehört mehreren Personen', ex: "What's [their] address?", tip: 'their = ihr/e, there = dort. Die beiden klingen gleich!' },

      { id: 'u1-ask', sec: '4', en: 'to ask', de: 'fragen', ex: 'Can I [ask] you a question?' },
      { id: 'u1-address', sec: '4', en: '(email) address', de: '(E-Mail-)Adresse', alt: ['address', 'email address', 'e-mail address'], main: 'email address', say: 'email address', ex: 'My email [address] is sara@linkways.com.', tip: 'Im Englischen mit dd und ss: a-dd-re-ss.' },
      { id: 'u1-howareyou', sec: '4', en: 'How are you?', de: 'Wie geht es dir/Ihnen/euch?', ex: "[How are you]? – I'm fine." },
      { id: 'u1-fine', sec: '4', en: "I am (= I'm) fine.", de: 'Es geht mir gut.', alt: ['i am fine', "i'm fine"], main: "I'm fine.", say: "I'm fine.", ex: "How are you? – [I'm fine].", tip: "I'm ist die Kurzform von I am." },
      { id: 'u1-meet', sec: '4', en: 'to meet', de: 'kennenlernen; sich treffen', ex: 'Nice to [meet] you!' },
      { id: 'u1-then', sec: '4', en: 'then', de: 'dann, danach', ex: 'Listen to the dialogue. [Then] read it.' },
      { id: 'u1-your', sec: '4', en: 'your', de: 'dein/e; Ihr/e; euer/eure', ex: "What's [your] email address?" },

      { id: 'u1-look', sec: '7', en: 'to look', de: 'sehen, schauen; Schau mal.', ex: '[Look] at the animals.', tip: 'look at = anschauen' },
      { id: 'u1-or', sec: '7', en: 'or', de: 'oder', ex: 'Tick [or] correct the numbers.' },

      { id: 'u1-eat', sec: '8', en: 'to eat', de: 'essen; fressen', ex: 'I [eat] insects.' },
      { id: 'u1-go', sec: '8', en: 'to go', de: 'gehen', ex: 'I must [go]. Bye.' },
      { id: 'u1-must', sec: '8', en: 'must', de: 'müssen', ex: 'I [must] go.', tip: 'must steht ohne to: I must go.' },

      { id: 'u1-howmany', sec: '9', en: 'how many', de: 'wie viele', ex: '[How many] frogs can you see?' },

      { id: 'u1-hate', sec: '12', en: 'to hate', de: 'hassen, nicht ausstehen können', ex: 'I [hate] pink.', tip: 'Gegenteil: to love' },
      { id: 'u1-here', sec: '12', en: 'here', de: 'hier', ex: "[Here]'s your pencil case.", tip: 'here = hier, hear = hören. Die beiden klingen gleich!' },
      { id: 'u1-it', sec: '12', en: 'it', de: 'es', ex: "[It]'s yellow.", tip: "It's ist die Kurzform von It is." },
      { id: 'u1-lets', sec: '12', en: "Let's …", de: 'Lass(t) …', hint: 'wie in: Lasst uns singen!', alt: ["let's"], main: "Let's", say: "Let's", ex: "[Let's] sing a song!", tip: "Let's = Let us. Den Apostroph nicht vergessen!" },
      { id: 'u1-midnight', sec: '12', en: 'midnight', de: 'Mitternacht', ex: "It's twelve o'clock – [midnight].", tip: 'Das gh spricht man nicht: mid-night.' },
      { id: 'u1-our', sec: '12', en: 'our', de: 'unser/e', ex: 'This is [our] school.' },

      { id: 'u1-favourite', sec: 'OYW1', en: 'favourite', de: 'Lieblings-', ex: 'Green is my [favourite] colour.', tip: 'Britisches Englisch: favo-u-rite, mit u.' },
      { id: 'u1-find', sec: 'OYW1', en: 'to find', de: 'finden', ex: 'Can you [find] my school tie?' },
      { id: 'u1-light', sec: 'OYW1', en: 'light', de: 'hell', hint: 'bei Farben, z. B. hellblau', ex: 'My favourite colour is [light] blue.', tip: 'Das gh spricht man nicht: light.' },

      { id: 'u1-child', sec: '15', en: 'child', de: 'Kind', ex: 'The [child] is in class 1A.', tip: 'Mehrzahl: children (Kinder).' },
      { id: 'u1-clean', sec: '15', en: 'to clean', de: 'sauber machen, putzen', ex: '[Clean] the board.' },
      { id: 'u1-close', sec: '15', en: 'to close', de: 'schließen, zumachen', ex: '[Close] the door.', tip: 'Gegenteil: to open' },
      { id: 'u1-open', sec: '15', en: 'to open', de: 'öffnen, aufmachen', ex: '[Open] the window.', tip: 'Gegenteil: to close' },
      { id: 'u1-picture', sec: '15', en: 'picture', de: 'Bild', ex: 'Look at the [picture]s.' },
      { id: 'u1-sitdown', sec: '15', en: 'to sit down', de: 'sich (hin-)setzen', ex: '[Sit down], children.', tip: 'Gegenteil: to stand up' },
      { id: 'u1-speak', sec: '15', en: 'to speak', de: 'sprechen', ex: "Don't [speak]. Listen." },
      { id: 'u1-standup', sec: '15', en: 'to stand up', de: 'aufstehen', ex: "Don't [stand up]. Sit down.", tip: 'Gegenteil: to sit down' },
      { id: 'u1-takeout', sec: '15', en: 'to take out', de: 'herausnehmen', ex: '[Take out] your books.' },

      { id: 'u1-class', sec: '18', en: 'class', de: '(Schul-)Klasse', ex: "I'm in [class] 1A.", tip: 'class schreibt man mit ss.' }
    ]
  }
];
