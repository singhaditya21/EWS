import { CurriculumChapter } from '../types/curriculum.types';

// Class 1 reading chapters on the themes of NCERT Sarangi 1 and Mridang 1. The stories, poems and
// scenes (src/class1/readingSets.ts) are original; the books' own text is not reproduced.
const base = {
  track: 'school' as const,
  board: 'BOTH' as const,
  classLevel: 1,
  wing: 'Primary (Class 1–5)' as const,
  streamCategory: 'Class 1',
  simulationId: 'Class1InteractiveLab' as const,
};

const hindi = { ...base, subject: 'Hindi (हिंदी)' };
const english = { ...base, subject: 'English' };

const ICSE_HINDI = 'CISCE Class 1 Hindi — reading short stories and poems (school-chosen reader)';
const HINDI_NOTE =
  'NCERT Sarangi teaches letters and words through stories and poems from the first lesson. ICSE schools choose their own Hindi readers, so these original pieces work as extra reading practice there.';

const readingFormula = {
  label: 'पढ़ने के तीन कदम',
  latex: '\\text{Read} \\rightarrow \\text{Find words} \\rightarrow \\text{Answer}',
  description: 'पहले सुनो और पढ़ो, फिर शब्द ढूँढो, फिर उत्तर दो।',
};

export const CLASS1_READING_CHAPTERS: CurriculumChapter[] = [
  {
    ...hindi,
    id: 'cls1-hindi-parivar',
    title: 'मेरा परिवार: गोलू का घर, मेरा घर, आशा का दिन',
    chapterNumber: 'Class 1 • Hindi Ch 4',
    defaultSimulationMode: 'hindi-parivar',
    summary: 'घर, परिवार और दिनचर्या पर छोटी कहानियाँ और कविता। हर शब्द छूकर सुनो, शब्द ढूँढो, कहानी का क्रम लगाओ और उत्तर दो।',
    syllabusAlignment: {
      cbseChapter: 'NCERT सारंगी 1 (Sarangi) — इकाई 1 परिवार (original reading on this theme)',
      icseChapter: ICSE_HINDI,
      examRelevance: 'Reading short Hindi sentences (NIPUN Bharat Class 1 reading goal)',
      differenceNote: HINDI_NOTE,
    },
    keyFormulas: [readingFormula],
    conceptNotes: [
      'परिवार में माँ, पापा, दादा, दादी और भाई-बहन होते हैं।',
      'कहानी को क्रम से सुनाना सीखो: पहले क्या हुआ, फिर क्या हुआ।',
      'शब्द को छूकर सुनो और फिर खुद बोलो।',
    ],
    quiz: [
      { id: 'c1h6-q1', question: 'गोलू को रात में कहानी कौन सुनाता है?', options: ['दादी', 'दीदी', 'मामा', 'चाचा'], correctIndex: 0, explanation: 'कहानी में दादी रात को गोलू को कहानी सुनाती हैं।', boardTag: 'Class 1 Hindi' },
      { id: 'c1h6-q2', question: 'इनमें से परिवार का सदस्य कौन है?', options: ['पेड़', 'पापा', 'बस', 'गेंद'], correctIndex: 1, explanation: 'पापा परिवार के सदस्य हैं।', boardTag: 'Class 1 Hindi' },
      { id: 'c1h6-q3', question: 'सुबह उठकर हम सबसे पहले क्या करते हैं?', options: ['सो जाते हैं', 'रात का खाना खाते हैं', 'दाँत साफ़ करते हैं', 'कहानी सुनते हैं'], correctIndex: 2, explanation: 'आशा भी सुबह उठकर दाँत साफ़ करती है।', boardTag: 'Class 1 Hindi' },
    ],
  },
  {
    ...hindi,
    id: 'cls1-hindi-jeev-jagat',
    title: 'जीव-जगत: चींटी और दाना, मेरी बिल्ली',
    chapterNumber: 'Class 1 • Hindi Ch 5',
    defaultSimulationMode: 'hindi-jeev-jagat',
    summary: 'जानवरों और छोटे जीवों पर कहानी और कविता। मिलकर काम करना सीखो और शब्द पहचानो।',
    syllabusAlignment: {
      cbseChapter: 'NCERT सारंगी 1 (Sarangi) — इकाई 2 जीव-जगत (original reading on this theme)',
      icseChapter: ICSE_HINDI,
      examRelevance: 'Reading short Hindi sentences (NIPUN Bharat Class 1 reading goal)',
      differenceNote: HINDI_NOTE,
    },
    keyFormulas: [readingFormula],
    conceptNotes: [
      'चींटियाँ मिलकर भारी दाना भी उठा लेती हैं।',
      'मिलकर काम करने से काम आसान हो जाता है।',
      'बिल्ली म्याऊँ-म्याऊँ बोलती है।',
    ],
    quiz: [
      { id: 'c1h7-q1', question: 'चींटी ने दाना कैसे उठाया?', options: ['अकेले', 'दोस्तों के साथ मिलकर', 'हाथी की मदद से', 'उठाया ही नहीं'], correctIndex: 1, explanation: 'चींटी ने दोस्तों को बुलाया और सबने मिलकर दाना उठाया।', boardTag: 'Class 1 Hindi' },
      { id: 'c1h7-q2', question: 'बिल्ली की आवाज़ कौन-सी है?', options: ['काँव-काँव', 'म्याऊँ-म्याऊँ', 'भौं-भौं', 'मैं-मैं'], correctIndex: 1, explanation: 'बिल्ली म्याऊँ-म्याऊँ बोलती है।', boardTag: 'Class 1 Hindi' },
      { id: 'c1h7-q3', question: 'इनमें से जानवर कौन है?', options: ['किताब', 'कुर्सी', 'कलम', 'बकरी'], correctIndex: 3, explanation: 'बकरी एक जानवर है।', boardTag: 'Class 1 Hindi' },
    ],
  },
  {
    ...hindi,
    id: 'cls1-hindi-khan-paan',
    title: 'हमारा खान-पान: गरम-गरम खिचड़ी, फल खाओ',
    chapterNumber: 'Class 1 • Hindi Ch 6',
    defaultSimulationMode: 'hindi-khan-paan',
    summary: 'घर के खाने और फलों पर कहानी और कविता। खाने की चीज़ों के नाम पढ़ो और पहचानो।',
    syllabusAlignment: {
      cbseChapter: 'NCERT सारंगी 1 (Sarangi) — इकाई 3 हमारा खान-पान (original reading on this theme)',
      icseChapter: ICSE_HINDI,
      examRelevance: 'Reading short Hindi sentences (NIPUN Bharat Class 1 reading goal)',
      differenceNote: HINDI_NOTE,
    },
    keyFormulas: [readingFormula],
    conceptNotes: [
      'खिचड़ी दाल और चावल से बनती है।',
      'रोज़ फल खाने से शरीर को ताक़त मिलती है।',
      'खाने से पहले हाथ धोना चाहिए।',
    ],
    quiz: [
      { id: 'c1h8-q1', question: 'खिचड़ी किससे बनती है?', options: ['दूध और चीनी से', 'दाल और चावल से', 'आटे और घी से', 'केले और सेब से'], correctIndex: 1, explanation: 'खिचड़ी दाल और चावल से बनती है।', boardTag: 'Class 1 Hindi' },
      { id: 'c1h8-q2', question: 'इनमें से फल कौन-सा है?', options: ['आलू', 'गाजर', 'मटर', 'आम'], correctIndex: 3, explanation: 'आम एक फल है।', boardTag: 'Class 1 Hindi' },
      { id: 'c1h8-q3', question: 'रोज़ फल खाने से क्या मिलता है?', options: ['ताक़त', 'नींद', 'बुखार', 'चोट'], correctIndex: 0, explanation: 'फल खाने से शरीर को ताक़त मिलती है।', boardTag: 'Class 1 Hindi' },
    ],
  },
  {
    ...hindi,
    id: 'cls1-hindi-tyohar',
    title: 'त्योहार और मेले: दीवाली की रात, मेला आया',
    chapterNumber: 'Class 1 • Hindi Ch 7',
    defaultSimulationMode: 'hindi-tyohar',
    summary: 'त्योहार और मेले की खुशियों पर कहानी और कविता। दीये, रंगोली, झूले और गुब्बारों के शब्द पढ़ो।',
    syllabusAlignment: {
      cbseChapter: 'NCERT सारंगी 1 (Sarangi) — इकाई 4 त्योहार और मेले (original reading on this theme)',
      icseChapter: ICSE_HINDI,
      examRelevance: 'Reading short Hindi sentences (NIPUN Bharat Class 1 reading goal)',
      differenceNote: HINDI_NOTE,
    },
    keyFormulas: [readingFormula],
    conceptNotes: [
      'दीवाली पर हम घर साफ़ करते हैं, रंगोली बनाते हैं और दीये जलाते हैं।',
      'मेले में झूले, गुब्बारे और खाने की चीज़ें होती हैं।',
      'त्योहार हम सब मिलकर मनाते हैं।',
    ],
    quiz: [
      { id: 'c1h9-q1', question: 'दीवाली पर हम क्या जलाते हैं?', options: ['दीये', 'कागज़', 'कपड़े', 'किताबें'], correctIndex: 0, explanation: 'दीवाली पर हम दीये जलाते हैं।', boardTag: 'Class 1 Hindi' },
      { id: 'c1h9-q2', question: 'मेले में बच्चे किस पर झूलते हैं?', options: ['पेड़ पर', 'झूले पर', 'छत पर', 'बस पर'], correctIndex: 1, explanation: 'मेले में बच्चे झूले पर झूलते हैं।', boardTag: 'Class 1 Hindi' },
      { id: 'c1h9-q3', question: 'रंगोली कहाँ बनाते हैं?', options: ['आसमान में', 'पानी में', 'घर के आँगन या दरवाज़े पर', 'पेड़ पर'], correctIndex: 2, explanation: 'रंगोली घर के आँगन या दरवाज़े पर बनाते हैं।', boardTag: 'Class 1 Hindi' },
    ],
  },
  {
    ...hindi,
    id: 'cls1-hindi-hari-bhari',
    title: 'हरी-भरी दुनिया: नन्हा पौधा, बारिश आई',
    chapterNumber: 'Class 1 • Hindi Ch 8',
    defaultSimulationMode: 'hindi-hari-bhari',
    summary: 'पौधों और बारिश पर कहानी और कविता। बीज से फूल बनने का क्रम लगाओ।',
    syllabusAlignment: {
      cbseChapter: 'NCERT सारंगी 1 (Sarangi) — इकाई 5 हरी-भरी दुनिया (original reading on this theme)',
      icseChapter: ICSE_HINDI,
      examRelevance: 'Reading short Hindi sentences (NIPUN Bharat Class 1 reading goal)',
      differenceNote: HINDI_NOTE,
    },
    keyFormulas: [readingFormula],
    conceptNotes: [
      'बीज को पानी और धूप मिले तो उससे पौधा निकलता है।',
      'बारिश में मोर नाचता है और मेंढक बोलता है।',
      'पेड़-पौधे हमारी धरती को हरा-भरा रखते हैं।',
    ],
    quiz: [
      { id: 'c1h10-q1', question: 'बीज से क्या निकलता है?', options: ['पत्थर', 'पौधा', 'पानी', 'धूप'], correctIndex: 1, explanation: 'बीज से पौधा निकलता है।', boardTag: 'Class 1 Hindi' },
      { id: 'c1h10-q2', question: 'पौधे को बढ़ने के लिए क्या चाहिए?', options: ['दूध', 'चीनी', 'नमक', 'पानी और धूप'], correctIndex: 3, explanation: 'पौधे को पानी और धूप चाहिए।', boardTag: 'Class 1 Hindi' },
      { id: 'c1h10-q3', question: 'बारिश में कौन नाचता है?', options: ['मोर', 'चूहा', 'मछली', 'चींटी'], correctIndex: 0, explanation: 'बारिश में मोर नाचता है।', boardTag: 'Class 1 Hindi' },
    ],
  },
  {
    ...english,
    id: 'cls1-eng-picture-talk',
    title: 'Picture Talk: Look, Say and Count, with a Counting Song and Fruit Poem',
    chapterNumber: 'Class 1 • English Ch 7',
    defaultSimulationMode: 'eng-picture-talk',
    summary: 'Look at a picture, say what you see, find objects and count them. Then read along with an original counting song and fruit poem.',
    syllabusAlignment: {
      cbseChapter: 'NCERT Mridang 1 — Unit 2: Picture Time; Unit 3: Fun with Pictures (original activities on these themes)',
      icseChapter: 'CISCE Class 1 English — listening and speaking: talking about pictures, simple rhymes',
      examRelevance: 'Speaking and listening in simple sentences',
      differenceNote: 'Mridang builds spoken English through picture talk before formal reading. ICSE schools practise the same skill through picture composition.',
    },
    keyFormulas: [
      {
        label: 'Picture talk sentence',
        latex: '\\text{I can see} + \\text{number} + \\text{thing}',
        description: 'Say what you see in a full sentence: I can see two kites.',
      },
    ],
    conceptNotes: [
      'Look at the whole picture first, then name what you see.',
      'Use a full sentence: I can see three trees.',
      'One thing or many? One kite, two kites.',
    ],
    quiz: [
      { id: 'c1en7-q1', question: 'Which is a full sentence about a picture?', options: ['Tree', 'I can see a tree.', 'Tree see', 'A a tree'], correctIndex: 1, explanation: 'A full sentence tells us what you see: I can see a tree.', boardTag: 'Class 1 English' },
      { id: 'c1en7-q2', question: 'There are 3 kites in a picture. What do we say?', options: ['I can see three kite.', 'I can see one kites.', 'I can see three kites.', 'I see kite three.'], correctIndex: 2, explanation: 'For more than one, we say kites: I can see three kites.', boardTag: 'Class 1 English' },
      { id: 'c1en7-q3', question: 'In the counting song, what comes after six?', options: ['Seven', 'Five', 'Nine', 'Ten'], correctIndex: 0, explanation: 'Four, five, six, then seven, eight, nine.', boardTag: 'Class 1 English' },
    ],
  },
  {
    ...english,
    id: 'cls1-eng-farm-seasons',
    title: 'On the Farm and Round the Year: Poems and Picture Stories',
    chapterNumber: 'Class 1 • English Ch 8',
    defaultSimulationMode: 'eng-farm-seasons',
    summary: 'Read along with original poems about farm animals and the seasons, then put picture stories in the right order.',
    syllabusAlignment: {
      cbseChapter: 'NCERT Mridang 1 — Unit 2: A Farm; Unit 4: The Four Seasons (original poems and picture stories on these themes)',
      icseChapter: 'CISCE Class 1 English — reading: rhymes and short stories, putting events in order',
      examRelevance: 'Reading short texts and sequencing events',
      differenceNote: 'Mridang links English to the world around the child, so EVS themes like farms and seasons appear here. ICSE readers vary by school.',
    },
    keyFormulas: [
      {
        label: 'Story order',
        latex: '\\text{First} \\rightarrow \\text{Next} \\rightarrow \\text{Last}',
        description: 'Every story has a beginning, a middle and an end.',
      },
    ],
    conceptNotes: [
      'Farm animals make different sounds: moo, cluck, baa, quack.',
      'India has summer, rain, winter and spring.',
      'Words like first, next and last help us tell a story in order.',
    ],
    quiz: [
      { id: 'c1en8-q1', question: 'Which animal says quack?', options: ['Cow', 'Duck', 'Sheep', 'Hen'], correctIndex: 1, explanation: 'A duck says quack.', boardTag: 'Class 1 English' },
      { id: 'c1en8-q2', question: 'What do we need on a rainy day?', options: ['A kite', 'A sweater', 'A fan', 'An umbrella'], correctIndex: 3, explanation: 'An umbrella keeps us dry in the rain.', boardTag: 'Class 1 English' },
      { id: 'c1en8-q3', question: 'Which comes first?', options: ['Rain falls', 'A rainbow comes out', 'The sky gets dark', 'The sun comes out'], correctIndex: 2, explanation: 'First the sky gets dark, then the rain falls.', boardTag: 'Class 1 English' },
    ],
  },
];
