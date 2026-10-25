/*
  Word Legends – Grammatik-Karten (MORE! 1, Student's Book S. 15 und S. 20)
  ---------------------------------------------------------------
  Jedes Thema hat eine Regelkarte und mehrere Übungskarten. Die Übungskarten laufen im
  selben Karteikasten wie die Vokabeln. ids NIE ändern – der Fortschritt hängt daran.

  Felder pro Übungskarte:
    id     eindeutig
    q      Satz mit genau einer Lücke: [richtig|auch richtig]
    order  statt q: Satz, der aus Wort-Kärtchen gebaut wird
    de     (optional) deutsche Bedeutung oder Arbeitsauftrag
    why    (optional) kurze Begründung nach der Antwort
    opts   (optional) Auswahl beim ersten Kennenlernen (erste Option = richtig)
    pic    (optional) Bild für Präpositionen: [Figur, Gegenstand, Präposition]
    bonus  (optional) kommt erst zum Schluss dran (nicht sicher im Unterricht gewesen)
*/
window.GRAMMAR = [
  {
    id: 'tobe', unit: 'u2', title: 'to be', sub: 'am · is · are', page: 'S.B. S. 20',
    opts: ['am', 'is', 'are'],
    rule: `
      <p>Das Verb <b>sein</b> (ich bin, du bist, er ist …) hat im Englischen drei Formen: <b>am</b>, <b>is</b> und <b>are</b>. Meistens sagt man die Kurzform.</p>
      <table class="gtable">
        <tr><td>I</td><td><b>am</b></td><td>I'm fine.</td></tr>
        <tr><td>you</td><td><b>are</b></td><td>You're nice.</td></tr>
        <tr><td>he</td><td><b>is</b></td><td>He's in class 4A.</td></tr>
        <tr><td>she</td><td><b>is</b></td><td>She's 11.</td></tr>
        <tr><td>it</td><td><b>is</b></td><td>It's yellow.</td></tr>
        <tr><td>we</td><td><b>are</b></td><td>We're from York.</td></tr>
        <tr><td>you</td><td><b>are</b></td><td>You're happy.</td></tr>
        <tr><td>they</td><td><b>are</b></td><td>They're from London.</td></tr>
      </table>
      <p class="gtip">💡 Eine Person oder Sache → <b>is</b>. Mehrere → <b>are</b>. Nur bei <b>I</b> heißt es <b>am</b>.</p>
      <p class="gtip">⚠️ <b>you're</b> (du bist) ≠ <b>your</b> (dein) · <b>they're</b> (sie sind) ≠ <b>their</b> (ihr)</p>`,
    items: [
      { id: 'tb-i', q: 'I [am] fine.', why: 'I → am' },
      { id: 'tb-you', q: 'You [are] nice.', why: 'you → are' },
      { id: 'tb-he', q: 'He [is] in class 4A.', why: 'he → is' },
      { id: 'tb-she', q: 'She [is] 11.', why: 'she → is' },
      { id: 'tb-we', q: 'We [are] from York.', why: 'we → are' },
      { id: 'tb-they', q: 'They [are] from London.', why: 'they → are' },
      { id: 'tb-parrot', q: 'The parrot [is] blue and yellow.', why: 'ein Papagei (it) → is' },
      { id: 'tb-monkeys', q: 'The monkeys [are] behind the tree.', why: 'mehrere Affen (they) → are' },
      { id: 'tb-rahim', q: 'Rahim and Sue [are] 11.', why: 'zwei Personen (they) → are' },
      { id: 'tb-sophie', q: 'Sophie and I [are] in class 1A.', why: 'Sophie and I = we → are' },
      { id: 'tb-s-im', q: "I am fine. → [I'm] fine.", de: 'Kurzform', opts: ["I'm", 'Im', "I'am"], why: "I am = I'm" },
      { id: 'tb-s-youre', q: "You are happy. → [You're] happy.", de: 'Kurzform', opts: ["You're", 'Your', "You's"], why: "you are = you're (your heißt dein!)" },
      { id: 'tb-s-its', q: "It is yellow. → [It's] yellow.", de: 'Kurzform', opts: ["It's", 'Its', "It're"], why: "it is = it's" },
      { id: 'tb-s-theyre', q: "They are from London. → [They're] from London.", de: 'Kurzform', opts: ["They're", 'Their', "They's"], why: "they are = they're (their heißt ihr!)" }
    ]
  },
  {
    id: 'therebe', unit: 'u2', title: 'there is / there are', sub: 'es gibt', page: 'S.B. S. 20',
    opts: ['There is', 'There are'],
    rule: `
      <p>So sagst du, dass etwas da ist (<i>es gibt, da ist, da sind</i>):</p>
      <table class="gtable two">
        <tr><th>eins (Einzahl)</th><th>mehrere (Mehrzahl)</th></tr>
        <tr><td><b>There is</b> a train.</td><td><b>There are</b> two trains.</td></tr>
        <tr><td><b>There is</b> a penguin.</td><td><b>There are</b> two penguins.</td></tr>
      </table>
      <p class="gtip">💡 <b>There's</b> ist die Kurzform von <b>There is</b>: There's a book on my desk.</p>
      <p class="gtip">⚠️ Aufpassen bei den Ausnahmen: five children, three fish, four mice → alles Mehrzahl, also <b>There are</b>!</p>`,
    items: [
      { id: 'th-train', q: "[There is|There's] a train.", why: 'ein Zug → There is' },
      { id: 'th-trains', q: '[There are] two trains.', why: 'zwei Züge → There are' },
      { id: 'th-penguin', q: "[There is|There's] a penguin.", why: 'ein Pinguin → There is' },
      { id: 'th-penguins', q: '[There are] two penguins.', why: 'zwei Pinguine → There are' },
      { id: 'th-book', q: "[There is|There's] a book on my desk.", why: 'ein Buch → There is' },
      { id: 'th-books', q: '[There are] three books on my desk.', why: 'drei Bücher → There are' },
      { id: 'th-animals', q: '[There are] many animals in the zoo.', why: 'viele Tiere → There are' },
      { id: 'th-ruler', q: "In my pencil case [there is|there's] a ruler.", opts: ['there is', 'there are'], why: 'ein Lineal → there is' },
      { id: 'th-pens', q: 'In my pencil case [there are] two pens.', opts: ['there are', 'there is'], why: 'zwei Füller → there are' },
      { id: 'th-children', q: '[There are] five children in the classroom.', why: 'children ist Mehrzahl → There are' },
      { id: 'th-fish', q: '[There are] three fish in the water.', why: 'three fish ist Mehrzahl, auch ohne -s!' },
      { id: 'th-mice', q: '[There are] four mice under the chair.', why: 'mice = Mehrzahl von mouse → There are' }
    ]
  },
  {
    id: 'prep', unit: 'u2', title: 'Prepositions of place', sub: 'Wo ist …?', page: 'S.B. S. 20',
    opts: ['in', 'on', 'under', 'next to', 'behind', 'in front of'],
    ruleScenes: [['frog', 'shoe', 'in', 'in'], ['frog', 'shoe', 'on', 'auf'], ['frog', 'shoe', 'under', 'unter'],
      ['frog', 'shoe', 'next to', 'neben'], ['frog', 'shoe', 'behind', 'hinter'], ['frog', 'shoe', 'in front of', 'vor']],
    rule: `
      <p>So fragst du, wo etwas ist: <b>Where's</b> the frog? – So antwortest du: It's <b>in</b> the shoe.</p>
      <p class="gtip">💡 Eins: <b>Where is …?</b> (Wo ist …?) · Mehrere: <b>Where are …?</b> (Wo sind …?)</p>`,
    items: [
      { id: 'pr-f-in', q: "Where's the frog? – It's [in] the shoe.", pic: ['frog', 'shoe', 'in'] },
      { id: 'pr-f-on', q: "Where's the frog? – It's [on] the shoe.", pic: ['frog', 'shoe', 'on'] },
      { id: 'pr-f-under', q: "Where's the frog? – It's [under] the shoe.", pic: ['frog', 'shoe', 'under'] },
      { id: 'pr-f-next', q: "Where's the frog? – It's [next to] the shoe.", pic: ['frog', 'shoe', 'next to'] },
      { id: 'pr-f-behind', q: "Where's the frog? – It's [behind] the shoe.", pic: ['frog', 'shoe', 'behind'] },
      { id: 'pr-f-front', q: "Where's the frog? – It's [in front of] the shoe.", pic: ['frog', 'shoe', 'in front of'] },
      { id: 'pr-cat-in', q: 'The cat is [in] the box.', pic: ['cat', 'box', 'in'] },
      { id: 'pr-cat-on', q: 'The cat is [on] the box.', pic: ['cat', 'box', 'on'] },
      { id: 'pr-cat-behind', q: 'The cat is [behind] the box.', pic: ['cat', 'box', 'behind'] },
      { id: 'pr-ball-under', q: 'The ball is [under] the chair.', pic: ['ball', 'chair', 'under'] },
      { id: 'pr-ball-next', q: 'The ball is [next to] the chair.', pic: ['ball', 'chair', 'next to'] },
      { id: 'pr-monkey-front', q: 'The monkey is [in front of] the tree.', pic: ['monkey', 'tree', 'in front of'] },
      { id: 'pr-book-bag', q: 'The book is [in] the school bag.', pic: ['book', 'bag', 'in'] },
      { id: 'pr-penguin-stone', q: 'The penguin is [behind] the stone.', pic: ['penguin', 'stone', 'behind'] }
    ]
  },
  {
    id: 'plural', unit: 'u1', title: 'Plural', sub: 'Mehrzahl + Ausnahmen', page: 'S.B. S. 15',
    rule: `
      <p>Die <b>Mehrzahl</b> bildest du meistens mit <b>-s</b>: a dog → 4 dog<b>s</b> · a bear → 7 bear<b>s</b></p>
      <p>Endet das Wort auf <b>Mitlaut + y</b>, wird aus <b>y → ies</b>: a ba<b>by</b> → 8 bab<b>ies</b><br>
      Aber: <b>Selbstlaut + y</b> bekommt nur -s: a b<b>oy</b> → 3 boy<b>s</b></p>
      <p class="gtip">💡 Selbstlaute sind a, e, i, o, u. Alle anderen Buchstaben sind Mitlaute.</p>
      <p><b>Ausnahmen – auswendig lernen:</b></p>
      <table class="gtable two">
        <tr><td>a child</td><td>five <b>children</b></td></tr>
        <tr><td>a fish</td><td>three <b>fish</b></td></tr>
        <tr><td>a sheep</td><td>12 <b>sheep</b></td></tr>
        <tr><td>a foot</td><td>2 <b>feet</b></td></tr>
        <tr><td>a mouse</td><td>7 <b>mice</b></td></tr>
      </table>
      <p class="gtip">⭐ Extra, falls ihr sie auch schon hattet: man → <b>men</b> · woman → <b>women</b> · tooth → <b>teeth</b></p>`,
    items: [
      { id: 'pl-dog', q: 'a dog – 4 [dogs]', opts: ['dogs', 'doges', 'dog'], why: 'einfach -s' },
      { id: 'pl-bear', q: 'a bear – 7 [bears]', opts: ['bears', 'beares', 'bear'], why: 'einfach -s' },
      { id: 'pl-frog', q: 'a frog – 5 [frogs]', opts: ['frogs', 'froges', 'frog'], why: 'einfach -s' },
      { id: 'pl-desk', q: 'a desk – 10 [desks]', opts: ['desks', 'deskes', 'desk'], why: 'einfach -s' },
      { id: 'pl-baby', q: 'a baby – 8 [babies]', opts: ['babies', 'babys', 'babyes'], why: 'Mitlaut b + y → ies' },
      { id: 'pl-boy', q: 'a boy – 3 [boys]', opts: ['boys', 'boies', 'boyes'], why: 'Selbstlaut o + y → nur -s' },
      { id: 'pl-monkey', q: 'a monkey – 2 [monkeys]', opts: ['monkeys', 'monkies', 'monkeyes'], why: 'Selbstlaut e + y → nur -s' },
      { id: 'pl-family', q: 'a family – 2 [families]', de: 'Familie', opts: ['families', 'familys', 'familyes'], why: 'Mitlaut l + y → ies' },
      { id: 'pl-city', q: 'a city – 3 [cities]', de: 'Stadt', opts: ['cities', 'citys', 'cityes'], why: 'Mitlaut t + y → ies' },
      { id: 'pl-day', q: 'a day – 7 [days]', de: 'Tag', opts: ['days', 'daies', 'dayes'], why: 'Selbstlaut a + y → nur -s' },
      { id: 'pl-child', q: 'a child – five [children]', opts: ['children', 'childs', 'childrens'], why: 'Ausnahme: child → children' },
      { id: 'pl-fish', q: 'a fish – three [fish]', opts: ['fish', 'fishs', 'fishies'], why: 'Ausnahme: fish bleibt fish' },
      { id: 'pl-sheep', q: 'a sheep – 12 [sheep]', opts: ['sheep', 'sheeps', 'sheepies'], why: 'Ausnahme: sheep bleibt sheep' },
      { id: 'pl-foot', q: 'a foot – 2 [feet]', opts: ['feet', 'foots', 'feets'], why: 'Ausnahme: foot → feet' },
      { id: 'pl-mouse', q: 'a mouse – 7 [mice]', opts: ['mice', 'mouses', 'mices'], why: 'Ausnahme: mouse → mice' },
      { id: 'pl-s-children', q: 'How many [children] are in the classroom?', de: 'Kinder', opts: ['children', 'childs', 'child'], why: 'Ausnahme: child → children' },
      { id: 'pl-s-mice', q: 'There are two [mice] under the chair.', de: 'Mäuse', opts: ['mice', 'mouses', 'mouse'], why: 'Ausnahme: mouse → mice' },
      { id: 'pl-man', q: 'a man – 2 [men]', opts: ['men', 'mans', 'mens'], why: 'Ausnahme: man → men', bonus: true },
      { id: 'pl-woman', q: 'a woman – 3 [women]', opts: ['women', 'womans', 'womens'], why: 'Ausnahme: woman → women', bonus: true },
      { id: 'pl-tooth', q: 'a tooth – 32 [teeth]', opts: ['teeth', 'tooths', 'teeths'], why: 'Ausnahme: tooth → teeth', bonus: true }
    ]
  },
  {
    id: 'questions', unit: 'u1', title: 'Questions', sub: 'Fragen', page: 'S.B. S. 15',
    opts: ['What', 'Where', 'How', 'How many'],
    rule: `
      <p>So fragst du nach dem <b>Namen</b>, der <b>E-Mail-Adresse</b> und wie es jemandem <b>geht</b>:</p>
      <p class="gex">What's your name? – I'm Sue. (I am …)<br>What's your email address? – Can you spell it, please?<br>How are you? – I'm fine, thanks. And you?</p>
      <p>So fragst du, <b>wo</b> etwas ist: <b>Where's</b> the frog? – It's in the shoe.<br>Bei mehreren: <b>Where are</b> the penguins?</p>
      <p>So fragst du, <b>wie viele</b>: <b>How many</b> frogs can you see?</p>
      <p class="gtip">💡 Das Fragewort steht ganz vorne: What …? Where …? How …? How many …?</p>`,
    items: [
      { id: 'q-o-name', order: "What's your name?", de: 'Wie heißt du?' },
      { id: 'q-o-how', order: 'How are you?', de: 'Wie geht es dir?' },
      { id: 'q-o-email', order: "What's your email address?", de: 'Wie lautet deine E-Mail-Adresse?' },
      { id: 'q-o-spell', order: 'Can you spell it, please?', de: 'Kannst du es bitte buchstabieren?' },
      { id: 'q-o-where', order: "Where's the frog?", de: 'Wo ist der Frosch?' },
      { id: 'q-o-howmany', order: 'How many frogs can you see?', de: 'Wie viele Frösche kannst du sehen?' },
      { id: 'q-o-whereare', order: 'Where are the penguins?', de: 'Wo sind die Pinguine?' },
      { id: 'q-g-what', q: "[What]'s your name? – I'm Sue.", why: 'Name → What' },
      { id: 'q-g-how', q: "[How] are you? – I'm fine, thanks.", why: 'Wie geht es dir? → How are you?' },
      { id: 'q-g-where', q: "[Where]'s the frog? – It's in the shoe.", why: 'Wo? → Where' },
      { id: 'q-g-howmany', q: '[How many] frogs can you see? – Five.', why: 'Wie viele? → How many' },
      { id: 'q-g-are', q: "Where [are] the monkeys? – They're behind the tree.", opts: ['are', 'is'], why: 'mehrere Affen → Where are' },
      { id: 'q-g-is', q: "Where [is] my pencil case? – It's in my school bag.", opts: ['is', 'are'], why: 'ein Federpennal → Where is' }
    ]
  },
  {
    id: 'imper', unit: 'u1', title: 'Imperatives', sub: 'Befehlsformen', page: 'S.B. S. 15',
    rule: `
      <p>So sagst du, dass jemand etwas <b>tun soll</b>: Das Verb steht ganz vorne.</p>
      <p class="gex"><b>Stand up!</b> · <b>Open</b> your books! · <b>Close</b> the window! · <b>Take out</b> your books!</p>
      <p>So sagst du, dass jemand etwas <b>nicht tun soll</b>: <b>Don't</b> + Verb (lang: <b>Do not</b> …)</p>
      <p class="gex"><b>Don't</b> stand up! · <b>Don't</b> open your books! · <b>Don't</b> close the window! · <b>Don't</b> speak!</p>
      <p class="gtip">💡 Kein <i>you</i> davor: „Open the door!“ – nicht „You open the door!“</p>`,
    items: [
      { id: 'im-standup', q: '[Stand up]!', de: 'Steh auf!', opts: ['Stand up', "Don't stand up", 'You stand up'], why: 'Verb nach vorne' },
      { id: 'im-dstandup', q: "[Don't stand up|Do not stand up]!", de: 'Steh nicht auf!', opts: ["Don't stand up", 'Not stand up', 'Stand not up'], why: "nicht → Don't + Verb" },
      { id: 'im-open', q: '[Open] your books!', de: 'Öffnet eure Bücher!', opts: ['Open', "Don't open", 'You open'], why: 'Verb nach vorne' },
      { id: 'im-dopen', q: "[Don't open|Do not open] your books!", de: 'Öffnet eure Bücher nicht!', opts: ["Don't open", 'Not open', 'Open not'], why: "nicht → Don't + Verb" },
      { id: 'im-close', q: '[Close] the window!', de: 'Schließ das Fenster!', opts: ['Close', "Don't close", 'You close'], why: 'Verb nach vorne' },
      { id: 'im-dclose', q: "[Don't close|Do not close] the window!", de: 'Schließ das Fenster nicht!', opts: ["Don't close", 'Not close', 'Close not'], why: "nicht → Don't + Verb" },
      { id: 'im-takeout', q: '[Take out] your books!', de: 'Nehmt eure Bücher heraus!', opts: ['Take out', "Don't take out", 'You take out'], why: 'Verb nach vorne' },
      { id: 'im-dspeak', q: "[Don't speak|Do not speak]! Listen.", de: 'Sprich nicht! Hör zu.', opts: ["Don't speak", 'Not speak', 'Speak not'], why: "nicht → Don't + Verb" },
      { id: 'im-t-door', q: "Open the door! → [Don't open|Do not open] the door!", de: 'Mach daraus ein Verbot.', opts: ["Don't open", 'Not open', 'Open not'], why: "Verbot → Don't + Verb" },
      { id: 'im-t-sit', q: "Don't sit down! → [Sit down]!", de: 'Mach daraus eine Aufforderung.', opts: ['Sit down', 'You sit down', 'Do sit'], why: 'Aufforderung → Verb nach vorne' },
      { id: 'im-o-books', order: "Don't open your books!", de: 'Öffnet eure Bücher nicht!' },
      { id: 'im-o-window', order: 'Close the window, please!', de: 'Schließ bitte das Fenster!' }
    ]
  }
];
