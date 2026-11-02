// Reading activities for Class 1. Every story, poem and scene here is original: they follow the
// themes of the NCERT Sarangi 1 and Mridang 1 units, but no textbook text is reproduced.

export type ReadingMode =
  | 'eng-picture-talk'
  | 'eng-farm-seasons'
  | 'hindi-parivar'
  | 'hindi-jeev-jagat'
  | 'hindi-khan-paan'
  | 'hindi-tyohar'
  | 'hindi-hari-bhari';

export interface ReadingLine {
  text: string;
  picture: string;
}

export interface ReadingQuestion {
  prompt: string;
  options: string[];
  answer: number;
  explain: string;
  /** Overrides the set's skill, for rounds that mix skills. */
  skillId?: string;
}

export interface ReadingPiece {
  id: string;
  kind: 'story' | 'poem';
  title: string;
  lines: ReadingLine[];
  /** Words the child hunts for in the text; each must appear in a line. */
  findWords: string[];
  questions: ReadingQuestion[];
}

export interface SceneObject {
  name: string;
  plural: string;
  picture: string;
  count: number;
}

export interface PictureScene {
  id: string;
  title: string;
  objects: SceneObject[];
}

export interface ReadingSet {
  mode: ReadingMode;
  chapterId: string;
  skillId: string;
  lang: 'en-IN' | 'hi-IN';
  heading: string;
  pieces: ReadingPiece[];
  scenes?: PictureScene[];
}

export const READING_SETS: ReadingSet[] = [
  {
    mode: 'hindi-parivar',
    chapterId: 'cls1-hindi-parivar',
    skillId: 'h.padhna',
    lang: 'hi-IN',
    heading: 'मेरा परिवार',
    pieces: [
      {
        id: 'golu-ka-ghar',
        kind: 'story',
        title: 'गोलू का घर',
        lines: [
          { text: 'यह गोलू का घर है।', picture: '🏠' },
          { text: 'घर में माँ और पापा हैं।', picture: '👩👨' },
          { text: 'दादी भी साथ रहती हैं।', picture: '👵' },
          { text: 'रात को दादी कहानी सुनाती हैं।', picture: '🌙📖' },
          { text: 'गोलू ध्यान से सुनता है।', picture: '👂' },
          { text: 'गोलू दादी से प्यार करता है।', picture: '❤️' },
        ],
        findWords: ['घर', 'दादी', 'कहानी', 'गोलू'],
        questions: [
          { prompt: 'यह किसका घर है?', options: ['सोनू का', 'गोलू का', 'आशा का'], answer: 1, explain: 'कहानी में लिखा है: यह गोलू का घर है।' },
          { prompt: 'गोलू को कहानी कौन सुनाता है?', options: ['दादी', 'पापा', 'माँ'], answer: 0, explain: 'रात को दादी कहानी सुनाती हैं।' },
          { prompt: 'दादी कहानी कब सुनाती हैं?', options: ['सुबह को', 'दोपहर को', 'रात को'], answer: 2, explain: 'दादी रात को कहानी सुनाती हैं।' },
        ],
      },
      {
        id: 'mera-ghar',
        kind: 'poem',
        title: 'मेरा घर',
        lines: [
          { text: 'छोटा-सा है मेरा घर,', picture: '🏠' },
          { text: 'प्यार भरा है मेरा घर।', picture: '❤️' },
          { text: 'माँ-पापा हैं, दादी-दादा,', picture: '👨‍👩‍👧' },
          { text: 'सब रहते हैं मिलकर।', picture: '🤝' },
        ],
        findWords: ['घर', 'प्यार', 'मिलकर'],
        questions: [
          { prompt: 'कविता में घर कैसा है?', options: ['बहुत ऊँचा', 'छोटा-सा', 'बहुत दूर'], answer: 1, explain: 'कविता कहती है: छोटा-सा है मेरा घर।' },
          { prompt: 'घर में सब कैसे रहते हैं?', options: ['लड़कर', 'अकेले', 'मिलकर'], answer: 2, explain: 'कविता कहती है: सब रहते हैं मिलकर।' },
        ],
      },
      {
        id: 'asha-ka-din',
        kind: 'story',
        title: 'आशा का दिन',
        lines: [
          { text: 'आशा सुबह जल्दी उठती है।', picture: '🌅' },
          { text: 'वह दाँत साफ़ करती है।', picture: '🪥' },
          { text: 'माँ उसे दूध देती हैं।', picture: '🥛' },
          { text: 'आशा बस से स्कूल जाती है।', picture: '🚌' },
          { text: 'शाम को वह पापा के साथ खेलती है।', picture: '⚽' },
          { text: 'रात को आशा सो जाती है।', picture: '😴' },
        ],
        findWords: ['सुबह', 'दूध', 'स्कूल', 'रात'],
        questions: [
          { prompt: 'आशा स्कूल कैसे जाती है?', options: ['बस से', 'नाव से', 'रेल से'], answer: 0, explain: 'आशा बस से स्कूल जाती है।' },
          { prompt: 'माँ आशा को क्या देती हैं?', options: ['पानी', 'दूध', 'फल'], answer: 1, explain: 'माँ उसे दूध देती हैं।' },
          { prompt: 'शाम को आशा किसके साथ खेलती है?', options: ['दादी के', 'भैया के', 'पापा के'], answer: 2, explain: 'शाम को वह पापा के साथ खेलती है।' },
        ],
      },
    ],
  },
  {
    mode: 'hindi-jeev-jagat',
    chapterId: 'cls1-hindi-jeev-jagat',
    skillId: 'h.padhna',
    lang: 'hi-IN',
    heading: 'जीव-जगत',
    pieces: [
      {
        id: 'chinti-aur-dana',
        kind: 'story',
        title: 'चींटी और दाना',
        lines: [
          { text: 'एक चींटी जा रही थी।', picture: '🐜' },
          { text: 'उसे एक बड़ा दाना मिला।', picture: '🌾' },
          { text: 'दाना बहुत भारी था।', picture: '😓' },
          { text: 'चींटी ने दोस्तों को बुलाया।', picture: '🐜🐜🐜' },
          { text: 'सबने मिलकर दाना उठाया।', picture: '💪' },
          { text: 'सब बहुत खुश हुए।', picture: '😊' },
        ],
        findWords: ['चींटी', 'दाना', 'दोस्तों', 'खुश'],
        questions: [
          { prompt: 'चींटी को क्या मिला?', options: ['फूल', 'पत्ता', 'दाना'], answer: 2, explain: 'चींटी को एक बड़ा दाना मिला।' },
          { prompt: 'चींटी ने किसे बुलाया?', options: ['दोस्तों को', 'चिड़िया को', 'बिल्ली को'], answer: 0, explain: 'चींटी ने दोस्तों को बुलाया।' },
          { prompt: 'इस कहानी से क्या सीखते हैं?', options: ['अकेले रहना', 'मिलकर काम करना', 'दाना फेंकना'], answer: 1, explain: 'मिलकर काम करने से भारी काम भी हो जाता है।' },
        ],
      },
      {
        id: 'meri-billi',
        kind: 'poem',
        title: 'मेरी बिल्ली',
        lines: [
          { text: 'मेरी बिल्ली काली है,', picture: '🐈‍⬛' },
          { text: 'दूध की प्याली खाली है।', picture: '🥛' },
          { text: 'म्याऊँ-म्याऊँ करती है,', picture: '🐱' },
          { text: 'चूहे से वह लड़ती है।', picture: '🐭' },
        ],
        findWords: ['बिल्ली', 'दूध', 'चूहे'],
        questions: [
          { prompt: 'बिल्ली का रंग कैसा है?', options: ['काला', 'सफ़ेद', 'लाल'], answer: 0, explain: 'कविता कहती है: मेरी बिल्ली काली है।' },
          { prompt: 'बिल्ली कैसे बोलती है?', options: ['भौं-भौं', 'म्याऊँ-म्याऊँ', 'काँव-काँव'], answer: 1, explain: 'बिल्ली म्याऊँ-म्याऊँ करती है।' },
        ],
      },
    ],
  },
  {
    mode: 'hindi-khan-paan',
    chapterId: 'cls1-hindi-khan-paan',
    skillId: 'h.padhna',
    lang: 'hi-IN',
    heading: 'हमारा खान-पान',
    pieces: [
      {
        id: 'garam-khichdi',
        kind: 'story',
        title: 'गरम-गरम खिचड़ी',
        lines: [
          { text: 'आज बारिश हो रही है।', picture: '🌧️' },
          { text: 'दादी रसोई में जाती हैं।', picture: '👵' },
          { text: 'दादी दाल और चावल धोती हैं।', picture: '🍚' },
          { text: 'कुकर में खिचड़ी बनती है।', picture: '🍲' },
          { text: 'सब मिलकर खिचड़ी खाते हैं।', picture: '🥣' },
          { text: 'खिचड़ी बहुत अच्छी है!', picture: '😋' },
        ],
        findWords: ['बारिश', 'दाल', 'चावल', 'खिचड़ी'],
        questions: [
          { prompt: 'खिचड़ी किसने बनाई?', options: ['पापा ने', 'दादी ने', 'गोलू ने'], answer: 1, explain: 'दादी ने रसोई में खिचड़ी बनाई।' },
          { prompt: 'खिचड़ी किससे बनती है?', options: ['दाल और चावल से', 'दूध और चीनी से', 'आटे और घी से'], answer: 0, explain: 'दादी दाल और चावल धोती हैं।' },
          { prompt: 'उस दिन मौसम कैसा था?', options: ['बहुत ठंडा', 'तेज़ धूप', 'बारिश का'], answer: 2, explain: 'कहानी में लिखा है: आज बारिश हो रही है।' },
        ],
      },
      {
        id: 'phal-khao',
        kind: 'poem',
        title: 'फल खाओ',
        lines: [
          { text: 'केला खाओ, आम खाओ,', picture: '🍌🥭' },
          { text: 'सेब और अंगूर खाओ।', picture: '🍎🍇' },
          { text: 'रोज़ फल खाकर, बच्चो तुम,', picture: '🧒' },
          { text: 'ताक़त वाले बन जाओ।', picture: '💪' },
        ],
        findWords: ['केला', 'आम', 'सेब', 'फल'],
        questions: [
          { prompt: 'कविता में कौन-सा फल नहीं है?', options: ['केला', 'अनार', 'अंगूर'], answer: 1, explain: 'कविता में केला, आम, सेब और अंगूर हैं।' },
          { prompt: 'रोज़ फल खाने से क्या होता है?', options: ['नींद आती है', 'भूख लगती है', 'ताक़त मिलती है'], answer: 2, explain: 'फल खाकर हम ताक़त वाले बनते हैं।' },
        ],
      },
    ],
  },
  {
    mode: 'hindi-tyohar',
    chapterId: 'cls1-hindi-tyohar',
    skillId: 'h.padhna',
    lang: 'hi-IN',
    heading: 'त्योहार और मेले',
    pieces: [
      {
        id: 'diwali-ki-raat',
        kind: 'story',
        title: 'दीवाली की रात',
        lines: [
          { text: 'आज दीवाली है।', picture: '🪔' },
          { text: 'सोनू घर साफ़ करता है।', picture: '🧹' },
          { text: 'माँ रंगोली बनाती हैं।', picture: '🎨' },
          { text: 'पापा मिठाई लाते हैं।', picture: '🍬' },
          { text: 'शाम को सब दीये जलाते हैं।', picture: '🪔🪔' },
          { text: 'घर जगमग करने लगता है।', picture: '✨' },
        ],
        findWords: ['दीवाली', 'रंगोली', 'मिठाई', 'दीये'],
        questions: [
          { prompt: 'रंगोली कौन बनाता है?', options: ['माँ', 'पापा', 'सोनू'], answer: 0, explain: 'माँ रंगोली बनाती हैं।' },
          { prompt: 'पापा क्या लाते हैं?', options: ['फूल', 'दीये', 'मिठाई'], answer: 2, explain: 'पापा मिठाई लाते हैं।' },
          { prompt: 'सब दीये कब जलाते हैं?', options: ['सुबह को', 'शाम को', 'दोपहर को'], answer: 1, explain: 'शाम को सब दीये जलाते हैं।' },
        ],
      },
      {
        id: 'mela-aaya',
        kind: 'poem',
        title: 'मेला आया',
        lines: [
          { text: 'मेला आया, मेला आया,', picture: '🎡' },
          { text: 'झूले, गुब्बारे संग लाया।', picture: '🎈' },
          { text: 'हम सब मेले में जाएँगे,', picture: '🧒🧒' },
          { text: 'चाट-पकौड़ी खाएँगे।', picture: '😋' },
        ],
        findWords: ['मेला', 'झूले', 'गुब्बारे'],
        questions: [
          { prompt: 'मेला अपने साथ क्या लाया?', options: ['किताबें', 'झूले और गुब्बारे', 'कपड़े'], answer: 1, explain: 'मेला झूले और गुब्बारे संग लाया।' },
          { prompt: 'बच्चे मेले में क्या खाएँगे?', options: ['चाट-पकौड़ी', 'खिचड़ी', 'दाल-चावल'], answer: 0, explain: 'कविता कहती है: चाट-पकौड़ी खाएँगे।' },
        ],
      },
    ],
  },
  {
    mode: 'hindi-hari-bhari',
    chapterId: 'cls1-hindi-hari-bhari',
    skillId: 'h.padhna',
    lang: 'hi-IN',
    heading: 'हरी-भरी दुनिया',
    pieces: [
      {
        id: 'nanha-paudha',
        kind: 'story',
        title: 'नन्हा पौधा',
        lines: [
          { text: 'पिंकी ने एक बीज बोया।', picture: '🌰' },
          { text: 'उसने रोज़ पानी डाला।', picture: '💧' },
          { text: 'बीज को धूप भी मिली।', picture: '☀️' },
          { text: 'बीज से पौधा निकला।', picture: '🌱' },
          { text: 'पौधा बड़ा होता गया।', picture: '🌿' },
          { text: 'एक दिन उस पर फूल खिला।', picture: '🌸' },
        ],
        findWords: ['बीज', 'पानी', 'धूप', 'फूल'],
        questions: [
          { prompt: 'पिंकी ने क्या बोया?', options: ['फूल', 'बीज', 'पत्ता'], answer: 1, explain: 'पिंकी ने एक बीज बोया।' },
          { prompt: 'पिंकी रोज़ क्या डालती थी?', options: ['दूध', 'रेत', 'पानी'], answer: 2, explain: 'उसने रोज़ पानी डाला।' },
          { prompt: 'पौधे को बढ़ने के लिए क्या चाहिए?', options: ['पानी और धूप', 'कागज़ और कलम', 'गेंद और बल्ला'], answer: 0, explain: 'पौधे को पानी और धूप चाहिए।' },
        ],
      },
      {
        id: 'barish-aayi',
        kind: 'poem',
        title: 'बारिश आई',
        lines: [
          { text: 'टप-टप-टप बूँदें आईं,', picture: '🌧️' },
          { text: 'काली-काली घटाएँ छाईं।', picture: '☁️' },
          { text: 'मोर नाचा, मेंढक बोला,', picture: '🦚🐸' },
          { text: 'चारों ओर हरियाली छाई।', picture: '🌿' },
        ],
        findWords: ['बूँदें', 'मोर', 'मेंढक'],
        questions: [
          { prompt: 'बारिश में कौन नाचा?', options: ['मेंढक', 'मोर', 'बकरी'], answer: 1, explain: 'कविता कहती है: मोर नाचा।' },
          { prompt: 'बूँदों की आवाज़ कैसी है?', options: ['टप-टप', 'छम-छम', 'भौं-भौं'], answer: 0, explain: 'कविता कहती है: टप-टप-टप बूँदें आईं।' },
        ],
      },
    ],
  },
  {
    mode: 'eng-picture-talk',
    chapterId: 'cls1-eng-picture-talk',
    skillId: 'e.picturetalk',
    lang: 'en-IN',
    heading: 'Picture talk',
    scenes: [
      {
        id: 'park',
        title: 'At the Park',
        objects: [
          { name: 'kite', plural: 'kites', picture: '🪁', count: 2 },
          { name: 'tree', plural: 'trees', picture: '🌳', count: 3 },
          { name: 'bird', plural: 'birds', picture: '🐦', count: 4 },
          { name: 'dog', plural: 'dogs', picture: '🐕', count: 1 },
          { name: 'ball', plural: 'balls', picture: '⚽', count: 2 },
          { name: 'flower', plural: 'flowers', picture: '🌼', count: 5 },
        ],
      },
      {
        id: 'market',
        title: 'At the Vegetable Shop',
        objects: [
          { name: 'tomato', plural: 'tomatoes', picture: '🍅', count: 4 },
          { name: 'carrot', plural: 'carrots', picture: '🥕', count: 3 },
          { name: 'brinjal', plural: 'brinjals', picture: '🍆', count: 2 },
          { name: 'onion', plural: 'onions', picture: '🧅', count: 5 },
          { name: 'corn cob', plural: 'corn cobs', picture: '🌽', count: 1 },
        ],
      },
      {
        id: 'classroom',
        title: 'In My Classroom',
        objects: [
          { name: 'book', plural: 'books', picture: '📕', count: 4 },
          { name: 'pencil', plural: 'pencils', picture: '✏️', count: 3 },
          { name: 'bag', plural: 'bags', picture: '🎒', count: 2 },
          { name: 'chair', plural: 'chairs', picture: '🪑', count: 5 },
          { name: 'clock', plural: 'clocks', picture: '🕘', count: 1 },
        ],
      },
    ],
    pieces: [
      {
        id: 'counting-song',
        kind: 'poem',
        title: 'Counting Song',
        lines: [
          { text: 'One, two, three, a bird in a tree.', picture: '🐦🌳' },
          { text: 'Four, five, six, a hen and her chicks.', picture: '🐔🐥' },
          { text: 'Seven, eight, nine, the ducks in a line.', picture: '🦆🦆🦆' },
          { text: 'Ten, ten, ten, let us count again!', picture: '🔟' },
        ],
        findWords: ['bird', 'hen', 'ducks', 'count'],
        questions: [
          { prompt: 'Where is the bird?', options: ['In a tree', 'In a box', 'On a bus'], answer: 0, explain: 'The song says: a bird in a tree.' },
          { prompt: 'Which number comes after nine in the song?', options: ['Eight', 'Six', 'Ten'], answer: 2, explain: 'Seven, eight, nine, ten!' },
        ],
      },
      {
        id: 'fruit-basket',
        kind: 'poem',
        title: 'My Fruit Basket',
        lines: [
          { text: 'Red apple, yellow pear,', picture: '🍎🍐' },
          { text: 'Sweet fruit for us all to share.', picture: '🧺' },
          { text: 'Green grapes, an orange too,', picture: '🍇🍊' },
          { text: 'One for me and one for you!', picture: '😊' },
        ],
        findWords: ['apple', 'pear', 'grapes', 'orange'],
        questions: [
          { prompt: 'What colour is the apple?', options: ['Blue', 'Red', 'Black'], answer: 1, explain: 'The poem says: red apple.' },
          { prompt: 'What do we do with the fruit?', options: ['Share it', 'Throw it', 'Hide it'], answer: 0, explain: 'The poem says the fruit is for us all to share.' },
        ],
      },
    ],
  },
  {
    mode: 'eng-farm-seasons',
    chapterId: 'cls1-eng-farm-seasons',
    skillId: 'e.picturetalk',
    lang: 'en-IN',
    heading: 'Farm and seasons',
    pieces: [
      {
        id: 'on-the-farm',
        kind: 'poem',
        title: 'On the Farm',
        lines: [
          { text: 'Moo says the cow, in the morning sun.', picture: '🐄☀️' },
          { text: 'Cluck says the hen, her work is done.', picture: '🐔' },
          { text: 'Baa says the sheep, on the green, green hill.', picture: '🐑' },
          { text: 'Quack says the duck, and she will not sit still.', picture: '🦆' },
        ],
        findWords: ['cow', 'hen', 'sheep', 'duck'],
        questions: [
          { prompt: 'Which animal says moo?', options: ['Hen', 'Duck', 'Cow'], answer: 2, explain: 'The cow says moo.' },
          { prompt: 'Where is the sheep?', options: ['On the hill', 'In the pond', 'In the bus'], answer: 0, explain: 'The poem says: on the green, green hill.' },
        ],
      },
      {
        id: 'mona-farm',
        kind: 'story',
        title: 'Mona Goes to a Farm',
        lines: [
          { text: 'Mona goes to a farm.', picture: '🌾' },
          { text: 'She sees a big red tractor.', picture: '🚜' },
          { text: 'She gives grass to the cow.', picture: '🐄' },
          { text: 'She finds eggs in the hen house.', picture: '🥚' },
          { text: 'She drinks fresh milk.', picture: '🥛' },
          { text: 'Mona is very happy!', picture: '😊' },
        ],
        findWords: ['farm', 'tractor', 'eggs', 'milk'],
        questions: [
          { prompt: 'What colour is the tractor?', options: ['Green', 'Red', 'Blue'], answer: 1, explain: 'Mona sees a big red tractor.' },
          { prompt: 'What does Mona give the cow?', options: ['Grass', 'Eggs', 'Milk'], answer: 0, explain: 'She gives grass to the cow.' },
          { prompt: 'Where does Mona find eggs?', options: ['In the tree', 'In the bag', 'In the hen house'], answer: 2, explain: 'She finds eggs in the hen house.' },
        ],
      },
      {
        id: 'four-seasons-rhyme',
        kind: 'poem',
        title: 'Round the Year',
        lines: [
          { text: 'Summer sun is hot and bright.', picture: '☀️' },
          { text: 'Rain comes down all day and night.', picture: '🌧️' },
          { text: 'Winter wind is cold and slow.', picture: '🧣' },
          { text: 'In spring the flowers start to grow.', picture: '🌸' },
        ],
        findWords: ['sun', 'rain', 'winter', 'flowers'],
        questions: [
          { prompt: 'Which season is hot and bright?', options: ['Winter', 'Summer', 'Spring'], answer: 1, explain: 'Summer sun is hot and bright.' },
          { prompt: 'When do the flowers start to grow?', options: ['In spring', 'In winter', 'At night'], answer: 0, explain: 'In spring the flowers start to grow.' },
        ],
      },
      {
        id: 'the-rain-comes',
        kind: 'story',
        title: 'The Rain Comes',
        lines: [
          { text: 'The sky is dark.', picture: '☁️' },
          { text: 'Rain starts to fall.', picture: '🌧️' },
          { text: 'Ravi opens his umbrella.', picture: '☂️' },
          { text: 'He jumps in the water.', picture: '💦' },
          { text: 'The sun comes out.', picture: '🌤️' },
          { text: 'A rainbow is in the sky.', picture: '🌈' },
        ],
        findWords: ['sky', 'umbrella', 'water', 'rainbow'],
        questions: [
          { prompt: 'What does Ravi open?', options: ['A book', 'A door', 'An umbrella'], answer: 2, explain: 'Ravi opens his umbrella.' },
          { prompt: 'What comes after the rain?', options: ['A rainbow', 'A kite', 'A bus'], answer: 0, explain: 'The sun comes out and a rainbow is in the sky.' },
        ],
      },
    ],
  },
];

export const readingSetFor = (mode: string) => READING_SETS.find((s) => s.mode === mode);

const WORD_PUNCTUATION = /[।,.!?"“”‘’:;]/g;
/** A word as it should be matched and spoken, without punctuation or capitals. */
export const cleanWord = (word: string) => word.replace(WORD_PUNCTUATION, '').toLowerCase();
