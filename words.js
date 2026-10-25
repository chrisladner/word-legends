/*
  Word Legends – Vokabeldaten
  ---------------------------------------------------------------
  Eine Unit = eine Vokabelliste aus dem Buch. Neue Units einfach
  unten anhängen. Die ids NIE ändern – der Lernfortschritt hängt daran.

  Felder pro Wort:
    id    eindeutig, z. B. 'u1-give'
    sec   Übungsnummer im Buch ('' = ohne Nummer) bzw. Seite bei Word Files ('S.12')
    grp   (optional) Überschrift in der Kartenübersicht, z. B. 'In the classroom'
    en    englisch, so wie im Buch
    de    deutsch, so wie im Buch (bei Word Files ohne deutsche Wörter: übliche Übersetzung)
    ex    Beispielsatz; [eckige Klammern] = Lücke im Lückentext.
          Aus dem Buch, wo es dort einen gibt – sonst ein einfacher Satz mit dem Stoff der Unit.
    alt   (optional) alle richtigen Antworten, wenn es mehrere gibt
    main  (optional) Form, die beim Abschreiben angezeigt wird
    say   (optional) was die Vorlesestimme sagt
    hint  (optional) Zusatz unter dem deutschen Wort, wenn es mehrdeutig ist
    tip   (optional) Merktipp nach der Antwort
    syn   (optional) ids von Wörtern, die auch passen würden (gilt als „fast richtig“)
    (apart pro Unit: Gruppen von ids, die nicht am selben Tag neu eingeführt werden)
*/
window.UNITS = [
  {
    id: 'u1',
    title: 'Unit 1',
    source: 'WB Seite 11–13',
    // Diese Wörter kommen nie am selben Tag neu dazu (Gegensätze und leicht Verwechselbares stören sich beim Lernen)
    apart: [
      ['u1-open', 'u1-close'],
      ['u1-sitdown', 'u1-standup'],
      ['u1-love', 'u1-hate'],
      ['u1-their', 'u1-your', 'u1-our'],
      ['u1b-boy', 'u1b-girl'],
      ['u1r-pen', 'u1r-pencil'],
      ['u1k-shirt', 'u1b-tshirt']
    ],
    words: [
      // ---- WB S. 11: Wörter, die du schon kennst ----
      { id: 'u1b-a', sec: 'S.11', grp: 'Wörter, die du schon kennst', en: 'a', de: 'ein, eine', alt: ['a', 'an'], ex: 'This is [a] cat.', tip: 'Vor a, e, i, o, u heißt es an: an apple, an orange pen.' },
      { id: 'u1b-the', sec: 'S.11', grp: 'Wörter, die du schon kennst', en: 'the', de: 'der, die, das', ex: 'Look at [the] board.' },
      { id: 'u1b-and', sec: 'S.11', grp: 'Wörter, die du schon kennst', en: 'and', de: 'und', ex: 'The parrot is blue [and] yellow.' },
      { id: 'u1b-yes', sec: 'S.11', grp: 'Wörter, die du schon kennst', en: 'yes', de: 'ja', ex: 'Are you eleven? – [Yes], I am.' },
      { id: 'u1b-not', sec: 'S.11', grp: 'Wörter, die du schon kennst', en: 'not', de: 'nicht', ex: "I'm [not] ten." },
      { id: 'u1b-i', sec: 'S.11', grp: 'Wörter, die du schon kennst', en: 'I', de: 'ich', ex: '[I] am eleven.', tip: 'I schreibt man immer groß – auch mitten im Satz.' },
      { id: 'u1b-you', sec: 'S.11', grp: 'Wörter, die du schon kennst', en: 'you', de: 'du; Sie; ihr', ex: 'Are [you] happy?' },
      { id: 'u1b-please', sec: 'S.11', grp: 'Wörter, die du schon kennst', en: 'please', de: 'bitte', ex: 'Can you spell it, [please]?' },
      { id: 'u1b-thankyou', sec: 'S.11', grp: 'Wörter, die du schon kennst', en: 'thank you', de: 'danke', alt: ['thank you', 'thanks'] },
      { id: 'u1b-say', sec: 'S.11', grp: 'Wörter, die du schon kennst', en: 'to say', de: 'sagen', ex: '[Say] hello.' },
      { id: 'u1b-sing', sec: 'S.11', grp: 'Wörter, die du schon kennst', en: 'to sing', de: 'singen', ex: "Let's [sing] a song!" },
      { id: 'u1b-boy', sec: 'S.11', grp: 'Wörter, die du schon kennst', en: 'boy', de: 'Junge, Bub', ex: 'Tom is a [boy].' },
      { id: 'u1b-girl', sec: 'S.11', grp: 'Wörter, die du schon kennst', en: 'girl', de: 'Mädchen', ex: 'Sue is a [girl].' },
      { id: 'u1b-school', sec: 'S.11', grp: 'Wörter, die du schon kennst', en: 'school', de: 'Schule', ex: "It's time for [school]." },
      { id: 'u1b-apple', sec: 'S.11', grp: 'Wörter, die du schon kennst', en: 'apple', de: 'Apfel', ex: 'The [apple] is red.', tip: 'an apple – vor a, e, i, o, u heißt es an.' },
      { id: 'u1b-ball', sec: 'S.11', grp: 'Wörter, die du schon kennst', en: 'ball', de: 'Ball', ex: 'The [ball] is under the chair.' },
      { id: 'u1b-cat', sec: 'S.11', grp: 'Wörter, die du schon kennst', en: 'cat', de: 'Katze', ex: 'The [cat] is on the box.' },
      { id: 'u1b-dog', sec: 'S.11', grp: 'Wörter, die du schon kennst', en: 'dog', de: 'Hund', ex: 'Can I bring my [dog], Buddy?' },
      { id: 'u1b-bear', sec: 'S.11', grp: 'Wörter, die du schon kennst', en: 'bear', de: 'Bär', ex: 'The [bear] is big.' },
      { id: 'u1b-fish', sec: 'S.11', grp: 'Wörter, die du schon kennst', en: 'fish', de: 'Fisch', ex: 'The [fish] is in the water.', tip: 'Mehrzahl: three fish – bleibt gleich!' },
      { id: 'u1b-frog', sec: 'S.11', grp: 'Wörter, die du schon kennst', en: 'frog', de: 'Frosch', ex: 'How many [frog]s can you see?' },
      { id: 'u1b-crocodile', sec: 'S.11', grp: 'Wörter, die du schon kennst', en: 'crocodile', de: 'Krokodil', ex: 'The [crocodile] is green.', tip: 'Englisch mit c statt k: crocodile.' },
      { id: 'u1b-gorilla', sec: 'S.11', grp: 'Wörter, die du schon kennst', en: 'gorilla', de: 'Gorilla', ex: 'The [gorilla] is black.' },
      { id: 'u1b-insect', sec: 'S.11', grp: 'Wörter, die du schon kennst', en: 'insect', de: 'Insekt', ex: 'I eat [insect]s.', tip: 'Englisch mit c statt k: insect.' },
      { id: 'u1b-honey', sec: 'S.11', grp: 'Wörter, die du schon kennst', en: 'honey', de: 'Honig', ex: 'Bears love [honey].' },
      { id: 'u1b-tshirt', sec: 'S.11', grp: 'Wörter, die du schon kennst', en: 'T-shirt', de: 'T-Shirt', ex: 'My [T-shirt] is blue.' },
      { id: 'u1b-hello', sec: 'S.11', grp: 'Wörter, die du schon kennst', en: 'Hello!', de: 'Hallo!', alt: ['hello'] },
      { id: 'u1b-bye', sec: 'S.11', grp: 'Wörter, die du schon kennst', en: 'Bye!', de: 'Tschüss!', alt: ['bye'], ex: 'I must go. [Bye]!' },
      { id: 'u1b-name', sec: 'S.11', grp: 'Wörter, die du schon kennst', en: "What's your name?", de: 'Wie heißt du?', alt: ["what's your name", 'what is your name'] },
      { id: 'u1b-myname', sec: 'S.11', grp: 'Wörter, die du schon kennst', en: 'My name is John.', de: 'Ich heiße John.', alt: ['my name is john'] },
      { id: 'u1b-im', sec: 'S.11', grp: 'Wörter, die du schon kennst', en: "I'm Joanna.", de: 'Ich bin Joanna.', alt: ["i'm joanna", 'i am joanna'] },
      { id: 'u1b-sorry', sec: 'S.11', grp: 'Wörter, die du schon kennst', en: "I'm sorry.", de: 'Es tut mir leid.', alt: ["i'm sorry", 'i am sorry'] },

      // ---- WB S. 11: Numbers ----
      { id: 'u1n-1', sec: 'S.11', grp: 'Numbers', en: 'one', de: '1', hint: 'als Wort' },
      { id: 'u1n-2', sec: 'S.11', grp: 'Numbers', en: 'two', de: '2', hint: 'als Wort' },
      { id: 'u1n-3', sec: 'S.11', grp: 'Numbers', en: 'three', de: '3', hint: 'als Wort' },
      { id: 'u1n-4', sec: 'S.11', grp: 'Numbers', en: 'four', de: '4', hint: 'als Wort' },
      { id: 'u1n-5', sec: 'S.11', grp: 'Numbers', en: 'five', de: '5', hint: 'als Wort' },
      { id: 'u1n-6', sec: 'S.11', grp: 'Numbers', en: 'six', de: '6', hint: 'als Wort' },
      { id: 'u1n-7', sec: 'S.11', grp: 'Numbers', en: 'seven', de: '7', hint: 'als Wort' },
      { id: 'u1n-8', sec: 'S.11', grp: 'Numbers', en: 'eight', de: '8', hint: 'als Wort', tip: 'Das gh spricht man nicht: eight.' },
      { id: 'u1n-9', sec: 'S.11', grp: 'Numbers', en: 'nine', de: '9', hint: 'als Wort' },
      { id: 'u1n-10', sec: 'S.11', grp: 'Numbers', en: 'ten', de: '10', hint: 'als Wort' },
      { id: 'u1n-11', sec: 'S.11', grp: 'Numbers', en: 'eleven', de: '11', hint: 'als Wort' },
      { id: 'u1n-12', sec: 'S.11', grp: 'Numbers', en: 'twelve', de: '12', hint: 'als Wort' },
      { id: 'u1n-13', sec: 'S.11', grp: 'Numbers', en: 'thirteen', de: '13', hint: 'als Wort', tip: 'Nicht threeteen: thir-teen.' },
      { id: 'u1n-14', sec: 'S.11', grp: 'Numbers', en: 'fourteen', de: '14', hint: 'als Wort' },
      { id: 'u1n-15', sec: 'S.11', grp: 'Numbers', en: 'fifteen', de: '15', hint: 'als Wort', tip: 'Nicht fiveteen: fif-teen.' },
      { id: 'u1n-16', sec: 'S.11', grp: 'Numbers', en: 'sixteen', de: '16', hint: 'als Wort' },
      { id: 'u1n-17', sec: 'S.11', grp: 'Numbers', en: 'seventeen', de: '17', hint: 'als Wort' },
      { id: 'u1n-18', sec: 'S.11', grp: 'Numbers', en: 'eighteen', de: '18', hint: 'als Wort', tip: 'Nur ein t: eigh-teen.' },
      { id: 'u1n-19', sec: 'S.11', grp: 'Numbers', en: 'nineteen', de: '19', hint: 'als Wort' },
      { id: 'u1n-20', sec: 'S.11', grp: 'Numbers', en: 'twenty', de: '20', hint: 'als Wort' },
      { id: 'u1n-21', sec: 'S.11', grp: 'Numbers', en: 'twenty-one', de: '21', hint: 'als Wort', tip: 'Mit Bindestrich: twenty-one.' },
      { id: 'u1n-22', sec: 'S.11', grp: 'Numbers', en: 'twenty-two', de: '22', hint: 'als Wort', tip: 'Mit Bindestrich: twenty-two.' },
      { id: 'u1n-23', sec: 'S.11', grp: 'Numbers', en: 'twenty-three', de: '23', hint: 'als Wort', tip: 'Mit Bindestrich: twenty-three.' },
      { id: 'u1n-24', sec: 'S.11', grp: 'Numbers', en: 'twenty-four', de: '24', hint: 'als Wort', tip: 'Mit Bindestrich: twenty-four.' },
      { id: 'u1n-25', sec: 'S.11', grp: 'Numbers', en: 'twenty-five', de: '25', hint: 'als Wort', tip: 'Mit Bindestrich: twenty-five.' },

      // ---- WB S. 11: Colours ----
      { id: 'u1c-red', sec: 'S.11', grp: 'Colours', en: 'red', de: 'rot', ex: 'My school bag is [red].' },
      { id: 'u1c-yellow', sec: 'S.11', grp: 'Colours', en: 'yellow', de: 'gelb', ex: 'My pencil is [yellow].' },
      { id: 'u1c-blue', sec: 'S.11', grp: 'Colours', en: 'blue', de: 'blau', ex: "I love [blue]. It's my favourite colour." },
      { id: 'u1c-green', sec: 'S.11', grp: 'Colours', en: 'green', de: 'grün', ex: '[Green] is my favourite colour.' },
      { id: 'u1c-orange', sec: 'S.11', grp: 'Colours', en: 'orange', de: 'orange', ex: 'The ruler is [orange].', tip: 'an orange ruler – vor orange heißt es an.' },
      { id: 'u1c-brown', sec: 'S.11', grp: 'Colours', en: 'brown', de: 'braun', ex: 'The monkey is [brown].' },
      { id: 'u1c-pink', sec: 'S.11', grp: 'Colours', en: 'pink', de: 'rosa, pink', ex: 'I hate [pink].' },
      { id: 'u1c-white', sec: 'S.11', grp: 'Colours', en: 'white', de: 'weiß', ex: 'The board is [white].' },
      { id: 'u1c-black', sec: 'S.11', grp: 'Colours', en: 'black', de: 'schwarz', ex: 'The chair is [black].' },
      { id: 'u1c-grey', sec: 'S.11', grp: 'Colours', en: 'grey', de: 'grau', ex: 'The stone is [grey].', tip: 'Britisches Englisch: grey mit e.' },

      // ---- WB S. 12: In the classroom ----
      { id: 'u1r-projector', sec: 'S.12', grp: 'In the classroom', en: 'projector', de: 'Projektor, Beamer', ex: "There's a [projector] in our classroom." },
      { id: 'u1r-sound', sec: 'S.12', grp: 'In the classroom', en: 'sound system', de: 'Tonanlage, Lautsprecher', ex: 'The [sound system] is next to the board.' },
      { id: 'u1r-board', sec: 'S.12', grp: 'In the classroom', en: 'board', de: 'Tafel', ex: 'Clean the [board].' },
      { id: 'u1r-window', sec: 'S.12', grp: 'In the classroom', en: 'window', de: 'Fenster', ex: 'Open the [window].' },
      { id: 'u1r-door', sec: 'S.12', grp: 'In the classroom', en: 'door', de: 'Tür', ex: 'Close the [door].' },
      { id: 'u1r-desk', sec: 'S.12', grp: 'In the classroom', en: 'desk', de: '(Schreib-)Tisch, Pult', ex: "There's a book on my [desk]." },
      { id: 'u1r-scissors', sec: 'S.12', grp: 'In the classroom', en: 'scissors', de: 'Schere', ex: 'The [scissors] are on the desk.', tip: 'scissors gibt es nur in der Mehrzahl: The scissors are …' },
      { id: 'u1r-ruler', sec: 'S.12', grp: 'In the classroom', en: 'ruler', de: 'Lineal', ex: 'My [ruler] is in my school bag.' },
      { id: 'u1r-floor', sec: 'S.12', grp: 'In the classroom', en: 'floor', de: '(Fuß-)Boden', ex: 'In my classroom, the [floor] is green.' },
      { id: 'u1r-tablet', sec: 'S.12', grp: 'In the classroom', en: 'tablet', de: 'Tablet', ex: 'The [tablet] is on the desk.' },
      { id: 'u1r-pencilcase', sec: 'S.12', grp: 'In the classroom', en: 'pencil case', de: 'Federpennal', ex: "Here's your [pencil case]." },
      { id: 'u1r-chair', sec: 'S.12', grp: 'In the classroom', en: 'chair', de: 'Stuhl, Sessel', ex: 'The [chair] is behind the desk.' },
      { id: 'u1r-watercolours', sec: 'S.12', grp: 'In the classroom', en: 'watercolours', de: 'Wasserfarben', ex: 'The [watercolours] are on the desk.', tip: 'Britisches Englisch: colour mit u – watercolours.' },
      { id: 'u1r-paintbrush', sec: 'S.12', grp: 'In the classroom', en: 'paintbrush', de: 'Pinsel', ex: 'The [paintbrush] is next to the watercolours.' },
      { id: 'u1r-schoolbag', sec: 'S.12', grp: 'In the classroom', en: 'school bag', de: 'Schultasche', ex: 'Give me your [school bag].' },
      { id: 'u1r-pencil', sec: 'S.12', grp: 'In the classroom', en: 'pencil', de: 'Bleistift', ex: 'The [pencil] is yellow.' },
      { id: 'u1r-gluestick', sec: 'S.12', grp: 'In the classroom', en: 'glue stick', de: 'Klebestift', ex: 'The [glue stick] is in my pencil case.' },
      { id: 'u1r-pen', sec: 'S.12', grp: 'In the classroom', en: 'pen', de: 'Füllfeder, Kugelschreiber', ex: 'My [pen] is blue.' },
      { id: 'u1r-exercisebook', sec: 'S.12', grp: 'In the classroom', en: 'exercise book', de: '(Schul-)Heft', ex: 'Write the numbers in your [exercise book].' },
      { id: 'u1r-sharpener', sec: 'S.12', grp: 'In the classroom', en: 'pencil sharpener', de: 'Spitzer', ex: 'The [pencil sharpener] is next to the rubber.' },
      { id: 'u1r-rubber', sec: 'S.12', grp: 'In the classroom', en: 'rubber', de: 'Radiergummi', ex: 'The [rubber] is white.' },

      // ---- WB S. 12: Cool clothes ----
      { id: 'u1k-hairband', sec: 'S.12', grp: 'Cool clothes', en: 'hairband', de: 'Haarreif', ex: 'My [hairband] is yellow.' },
      { id: 'u1k-sunglasses', sec: 'S.12', grp: 'Cool clothes', en: 'sunglasses', de: 'Sonnenbrille', ex: 'My [sunglasses] are on the desk.', tip: 'sunglasses ist Mehrzahl: My sunglasses are …' },
      { id: 'u1k-shirt', sec: 'S.12', grp: 'Cool clothes', en: 'shirt', de: 'Hemd; Bluse', ex: 'My [shirt] is white.' },
      { id: 'u1k-schooltie', sec: 'S.12', grp: 'Cool clothes', en: 'school tie', de: 'Schulkrawatte', ex: 'Can you find my [school tie]?' },
      { id: 'u1k-hat', sec: 'S.12', grp: 'Cool clothes', en: 'hat', de: 'Hut; Mütze', ex: 'The [hat] is on the chair.' },
      { id: 'u1k-sweater', sec: 'S.12', grp: 'Cool clothes', en: 'sweater', de: 'Pullover', ex: 'My [sweater] is blue.' },
      { id: 'u1k-skirt', sec: 'S.12', grp: 'Cool clothes', en: 'skirt', de: 'Rock', ex: 'The [skirt] is grey.' },
      { id: 'u1k-socks', sec: 'S.12', grp: 'Cool clothes', en: 'socks', de: 'Socken', ex: 'My [socks] are black.' },
      { id: 'u1k-shoe', sec: 'S.12', grp: 'Cool clothes', en: 'shoe', de: 'Schuh', ex: 'The frog is in the [shoe].' },

      // ---- WB S. 13: MORE Words and Phrases ----
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
      { id: 'u1-speak', sec: '15', en: 'to speak', de: 'sprechen', ex: "Don't [speak]. Listen.", syn: ['u2-talk'] },
      { id: 'u1-standup', sec: '15', en: 'to stand up', de: 'aufstehen', ex: "Don't [stand up]. Sit down.", tip: 'Gegenteil: to sit down' },
      { id: 'u1-takeout', sec: '15', en: 'to take out', de: 'herausnehmen', ex: '[Take out] your books.' },

      { id: 'u1-class', sec: '18', en: 'class', de: '(Schul-)Klasse', ex: "I'm in [class] 1A.", tip: 'class schreibt man mit ss.' }
    ]
  },
  {
    id: 'u2',
    title: 'Unit 2',
    source: 'WB Seite 20–21',
    apart: [
      ['u2-he', 'u2-she', 'u2-they', 'u2-we'],
      ['u2-behind', 'u2-infrontof'],
      ['u2-on', 'u2-under', 'u2-in'],
      ['u2-big', 'u2-small'],
      ['u2-at', 'u2-to']
    ],
    words: [
      // ---- WB S. 20: At the wildlife park (Wörter, die nicht auf S. 21 stehen) ----
      { id: 'u2-monkey', sec: 'S.20', grp: 'At the wildlife park', en: 'monkey', de: 'Affe', ex: 'The [monkey]s are behind the tree.' },
      { id: 'u2-parrot', sec: 'S.20', grp: 'At the wildlife park', en: 'parrot', de: 'Papagei', ex: 'The [parrot] is blue and yellow.' },
      { id: 'u2-giraffe', sec: 'S.20', grp: 'At the wildlife park', en: 'giraffe', de: 'Giraffe', ex: "There's a big [giraffe]." },
      { id: 'u2-penguin', sec: 'S.20', grp: 'At the wildlife park', en: 'penguin', de: 'Pinguin', ex: "Let's go and feed the [penguin]s." },
      { id: 'u2-lion', sec: 'S.20', grp: 'At the wildlife park', en: 'lion', de: 'Löwe', ex: 'The [lion] is big.' },
      { id: 'u2-in', sec: 'S.20', grp: 'Prepositions of place', en: 'in', de: 'in, im', hint: 'wie in: Der Papagei ist im Auto.', ex: 'The parrot is [in] the car.' },

      // ---- WB S. 21: MORE Words and Phrases ----
      { id: 'u2-zoo', sec: '', en: 'zoo', de: 'Zoo', ex: 'There are many animals in the [zoo].' },

      { id: 'u2-beautiful', sec: '1', en: 'beautiful', de: 'schön, hübsch', ex: "The parrot is blue and yellow. It's [beautiful].", tip: 'Schwieriges Wort: b-e-a-u-t-i-f-u-l.' },
      { id: 'u2-behind', sec: '1', en: 'behind', de: 'hinter', ex: 'The chair is [behind] the desk.', tip: 'Gegenteil: in front of' },
      { id: 'u2-big', sec: '1', en: 'big', de: 'groß', ex: "There's a [big] giraffe.", tip: 'Gegenteil: small' },
      { id: 'u2-infrontof', sec: '1', en: 'in front of', de: 'vor', hint: 'Ort, z. B. vor dem Baum', ex: 'The tree is [in front of] you.', tip: 'Gegenteil: behind' },
      { id: 'u2-nextto', sec: '1', en: 'next to', de: 'neben', ex: 'The parrot is [next to] the monkeys.' },
      { id: 'u2-now', sec: '1', en: 'now', de: 'jetzt', ex: 'Where is it [now]?' },
      { id: 'u2-on', sec: '1', en: 'on', de: 'auf', ex: 'Look! The parrot is [on] Buddy now.' },
      { id: 'u2-thereis', sec: '1', en: "there is (there's)", de: 'es gibt, da ist', hint: 'eins', alt: ['there is', "there's"], main: 'there is', say: 'there is', ex: "[There's] a book on my desk." },
      { id: 'u2-thereare', sec: '1', en: 'there are', de: 'es gibt, da sind', hint: 'mehrere', ex: '[There are] three books on my desk.' },
      { id: 'u2-tree', sec: '1', en: 'tree', de: 'Baum', ex: 'The monkeys are behind the [tree].' },
      { id: 'u2-under', sec: '1', en: 'under', de: 'unter', ex: "There's a book [under] my desk." },
      { id: 'u2-whatisit', sec: '1', en: 'What is it?', de: 'Was ist los?', alt: ['what is it'] },
      { id: 'u2-where', sec: '1', en: 'where', de: 'wo', ex: '[Where] is it?' },

      { id: 'u2-small', sec: '2', en: 'small', de: 'klein', ex: "The monkey isn't big. It's [small].", tip: 'Gegenteil: big' },

      { id: 'u2-adult', sec: '4', en: 'adult', de: 'Erwachsene/r', ex: '[Adult]s are £14.40.' },
      { id: 'u2-at', sec: '4', en: 'at', de: 'bei; an; hier: in', hint: 'wie in: Die Kinder sind im Zoo.', ex: 'The children are [at] the zoo.' },
      { id: 'u2-bring', sec: '4', en: 'to bring', de: '(mit-)bringen', ex: 'Can I [bring] my dog, Buddy?' },
      { id: 'u2-but', sec: '4', en: 'but', de: 'aber', ex: 'Dogs are welcome. [But] they can’t run around.' },
      { id: 'u2-feed', sec: '4', en: 'to feed', de: 'füttern', ex: "Let's go and [feed] the penguins." },
      { id: 'u2-guide', sec: '4', en: 'guide', de: '(Reise-)Führer/in', ex: 'Listen to the [guide].' },
      { id: 'u2-runaround', sec: '4', en: 'to run around', de: 'herumlaufen', ex: "Dogs are welcome, but they can't [run around]." },
      { id: 'u2-train', sec: '4', en: 'train', de: 'Zug', ex: "Let's go on a [train]." },
      { id: 'u2-to', sec: '4', en: 'to', de: 'zu; bis; vor; hier: in', hint: 'wie in: Willkommen im Wildpark!', ex: 'Welcome [to] the wildlife park!' },
      { id: 'u2-welcome', sec: '4', en: 'welcome', de: 'willkommen', ex: '[Welcome] to London.' },

      { id: 'u2-from', sec: '6', en: 'from', de: 'aus', ex: 'They are [from] California.' },
      { id: 'u2-year', sec: '6', en: 'year', de: 'Jahr; Jahrgangsstufe', ex: "I'm in [Year] 7." },

      { id: 'u2-he', sec: '7', en: 'he', de: 'er', ex: '[He] likes animals.' },
      { id: 'u2-she', sec: '7', en: 'she', de: 'sie', hint: 'eine Person, z. B. Sue', ex: '[She] is from England.' },
      { id: 'u2-talk', sec: '7', en: 'to talk', de: 'sprechen, sich unterhalten', ex: '[Talk] about the boys and girls.', syn: ['u1-speak'] },
      { id: 'u2-they', sec: '7', en: 'they', de: 'sie', hint: 'mehrere', ex: 'Rahim and Sue are 11. [They] are from Manchester.' },
      { id: 'u2-we', sec: '7', en: 'we', de: 'wir', ex: "[We]'re Sophie and John." },

      { id: 'u2-for', sec: '9', en: 'for', de: 'für', ex: "Here's a chant [for] you." },
      { id: 'u2-happy', sec: '9', en: 'happy', de: 'glücklich, fröhlich; zufrieden', ex: 'Buddy is [happy].' },
      { id: 'u2-letout', sec: '9', en: 'to let somebody out', de: 'jemanden herauslassen', alt: ['to let somebody out', 'to let someone out'], ex: '[Let] us out!' },
      { id: 'u2-us', sec: '9', en: 'us', de: 'uns', ex: 'Can you see [us]?' },

      { id: 'u2-car', sec: '10', en: 'car', de: 'Auto', ex: 'The parrot is in the [car].' },

      { id: 'u2-atlast', sec: 'S1', en: 'At last.', de: 'Endlich.', alt: ['at last'] },
      { id: 'u2-strange', sec: 'S1', en: 'How strange!', de: 'Wie komisch!', alt: ['how strange'] },
      { id: 'u2-letmesee', sec: 'S1', en: 'Let me see.', de: 'Lass mich mal schauen.', alt: ['let me see'] },
      { id: 'u2-stone', sec: 'S1', en: 'stone', de: 'Stein', ex: 'Colour your [stone].' }
    ]
  }
];
