import { CurriculumChapter } from '../types/curriculum.types';

// Class 1 topic chapters that close the gaps against CISCE's Class I curriculum.
// Activities live in src/class1/topicSets.ts.
const base = {
  track: 'school' as const,
  board: 'BOTH' as const,
  classLevel: 1,
  wing: 'Primary (Class 1–5)' as const,
  streamCategory: 'Class 1',
  simulationId: 'Class1InteractiveLab' as const,
};

const NO_EVS_BOOK = 'No separate EVS textbook in CBSE Class 1 (NCF-FS) — theme met through';

export const CLASS1_TOPIC_CHAPTERS: CurriculumChapter[] = [
  {
    ...base,
    subject: 'EVS & Science',
    id: 'cls1-evs-communication',
    title: 'How We Share News: Phone, Radio, TV, Newspaper and Messages',
    chapterNumber: 'Class 1 • EVS Ch 10',
    defaultSimulationMode: 'evs-communication',
    summary: 'Explore the ways we share news at home and nearby, sort what we listen to, watch and read, and learn to use them well.',
    syllabusAlignment: {
      cbseChapter: `${NO_EVS_BOOK} school EVS/GK activities`,
      icseChapter: 'CISCE Class I EVS — Theme 13: Communication',
      examRelevance: 'CISCE Class I EVS',
      differenceNote: 'CISCE has a Class I theme on communication, including its uses and misuses. CBSE has no EVS textbook in Class 1.',
    },
    keyFormulas: [
      { label: 'Ways to communicate', latex: '\\text{Listen} + \\text{Watch} + \\text{Read}', description: 'We listen to the radio, watch television and read the newspaper.' },
    ],
    conceptNotes: [
      'We talk to people near us and phone people far away.',
      'Radio, television and newspapers bring us news.',
      'Show messages from strangers to a grown-up, and take breaks from screens.',
    ],
    quiz: [
      { id: 'c1ev10-q1', question: 'Which one do we read?', options: ['Radio', 'Newspaper', 'Telephone', 'Television'], correctIndex: 1, explanation: 'We read a newspaper.', boardTag: 'Class 1 EVS' },
      { id: 'c1ev10-q2', question: 'How can we quickly talk to someone far away?', options: ['Phone them', 'Draw a picture', 'Clap our hands', 'Go to sleep'], correctIndex: 0, explanation: 'A phone lets us talk to people who are far away.', boardTag: 'Class 1 EVS' },
      { id: 'c1ev10-q3', question: 'A stranger sends a message. What should you do?', options: ['Reply to it', 'Send your address', 'Show a grown-up', 'Keep it secret'], correctIndex: 2, explanation: 'Always show messages from strangers to a grown-up.', boardTag: 'Class 1 EVS' },
    ],
  },
  {
    ...base,
    subject: 'EVS & Science',
    id: 'cls1-evs-me-people',
    title: 'All About Me: My Details, My Feelings and My People',
    chapterNumber: 'Class 1 • EVS Ch 11',
    defaultSimulationMode: 'evs-me-people',
    summary: 'Learn the details every child should know, name your feelings, and meet the people in your world: family, friends and neighbours.',
    syllabusAlignment: {
      cbseChapter: `${NO_EVS_BOOK} NCERT Mridang 1 Unit 1: My Family and Me`,
      icseChapter: 'CISCE Class I EVS — Theme 1: About Me; Theme 2: Others in my World',
      examRelevance: 'CISCE Class I EVS and social-emotional learning',
      differenceNote: 'CISCE asks children to share personal details, name feelings, and talk about family, friends, neighbours and celebrations.',
    },
    keyFormulas: [
      { label: 'My feelings', latex: '\\text{Happy} \\quad \\text{Sad} \\quad \\text{Angry} \\quad \\text{Surprised} \\quad \\text{Excited}', description: 'All feelings are okay. We can name them and talk about them.' },
    ],
    conceptNotes: [
      'Know your name, your parents’ names, your address and a grown-up’s phone number.',
      'Share these details only with people you trust.',
      'Families can be big or small. All families are special.',
    ],
    quiz: [
      { id: 'c1ev11-q1', question: 'Who should you tell your home address to?', options: ['Anyone on the road', 'People you trust', 'A stranger online', 'A stranger at the shop'], correctIndex: 1, explanation: 'Share your details only with people you trust.', boardTag: 'Class 1 EVS' },
      { id: 'c1ev11-q2', question: 'You lost your favourite toy. How might you feel?', options: ['Sad', 'Hungry', 'Sleepy', 'Tall'], correctIndex: 0, explanation: 'It is okay to feel sad when we lose something we like.', boardTag: 'Class 1 EVS' },
      { id: 'c1ev11-q3', question: 'Who lives near our house?', options: ['Pilots', 'Astronauts', 'Neighbours', 'Kings'], correctIndex: 2, explanation: 'Neighbours are people who live near us.', boardTag: 'Class 1 EVS' },
    ],
  },
  {
    ...base,
    subject: 'EVS & Science',
    id: 'cls1-evs-keeping-safe',
    title: 'Keeping Safe: My Body, Safe Touch and Safety Around Me',
    chapterNumber: 'Class 1 • EVS Ch 12',
    defaultSimulationMode: 'evs-keeping-safe',
    summary: 'Learn that your body is yours, the difference between safe and unsafe touch, and what to do: say No, Go, and Tell a grown-up you trust.',
    syllabusAlignment: {
      cbseChapter: `${NO_EVS_BOOK} school safety and value-education activities`,
      icseChapter: 'CISCE Class I EVS — Theme 8: Keeping Oneself Clean, Safe and Healthy (good and bad touch, safety)',
      examRelevance: 'Personal safety for every child',
      differenceNote: 'CISCE names good and bad touch and safety at home and in public places for Class I. Every child needs this, whichever the board.',
    },
    keyFormulas: [
      { label: 'Stay safe', latex: '\\text{NO} \\rightarrow \\text{GO} \\rightarrow \\text{TELL}', description: 'Say no, go away, and tell a grown-up you trust.' },
    ],
    conceptNotes: [
      'My body is mine. I can say no to a touch I do not like.',
      'If something feels wrong: say NO, GO away, and TELL a grown-up you trust.',
      'It is never my fault, and unsafe secrets must be told.',
    ],
    quiz: [
      { id: 'c1ev12-q1', question: 'What are the three steps to stay safe?', options: ['Sit, wait, hide', 'Run, jump, sing', 'No, go, tell', 'Eat, sleep, play'], correctIndex: 2, explanation: 'Say no, go away, and tell a grown-up you trust.', boardTag: 'Class 1 EVS' },
      { id: 'c1ev12-q2', question: 'Someone asks you to keep an unsafe touch secret. What should you do?', options: ['Tell a grown-up you trust', 'Keep the secret', 'Forget about it', 'Feel it is your fault'], correctIndex: 0, explanation: 'Unsafe secrets must be told. It is never your fault.', boardTag: 'Class 1 EVS' },
      { id: 'c1ev12-q3', question: 'Which is safe to do?', options: ['Play with matches', 'Wear a seat belt', 'Touch a plug with wet hands', 'Go with a stranger'], correctIndex: 1, explanation: 'A seat belt keeps us safe in the car.', boardTag: 'Class 1 EVS' },
    ],
  },
  {
    ...base,
    subject: 'Computer Studies',
    id: 'cls1-comp-uses-storage',
    title: 'What Computers Do and Where They Keep Things',
    chapterNumber: 'Class 1 • Computer Ch 3',
    defaultSimulationMode: 'computer-uses-storage',
    summary: 'See how computers help us at home, at school and in banks, stations and hospitals, then meet the pen drive, data card, CD and DVD.',
    syllabusAlignment: {
      cbseChapter: 'Not prescribed by NCERT for Class 1 — school-level digital literacy',
      icseChapter: 'CISCE Class I Computer Studies — Topic 2: Uses of a Computer; Topic 7: Storage Devices',
      examRelevance: 'CISCE Class I Computer Studies',
      differenceNote: 'CISCE sets these as Class I computer topics. CBSE has no Class 1 computer textbook.',
    },
    keyFormulas: [
      { label: 'Storage', latex: '\\text{Data} \\rightarrow \\text{Storage device}', description: 'Data is kept safe on a storage device, like books in a bag.' },
    ],
    conceptNotes: [
      'Computers help us type, listen to music, play games, use the internet and send email.',
      'Banks, hospitals and railway stations use computers too.',
      'Data means words, pictures and songs. Pen drives, data cards, CDs and DVDs store data.',
    ],
    quiz: [
      { id: 'c1cp3-q1', question: 'Which of these is a storage device?', options: ['Mouse', 'Speaker', 'Pen drive', 'Keyboard'], correctIndex: 2, explanation: 'A pen drive stores data.', boardTag: 'ICSE Class 1 Computer' },
      { id: 'c1cp3-q2', question: 'Where are computers used to book train tickets?', options: ['Railway stations', 'Playgrounds', 'Gardens', 'Kitchens'], correctIndex: 0, explanation: 'Railway stations use computers to book tickets.', boardTag: 'ICSE Class 1 Computer' },
      { id: 'c1cp3-q3', question: 'What can we do on a computer?', options: ['Brush our teeth', 'Type a story', 'Eat our lunch', 'Ride a bicycle'], correctIndex: 1, explanation: 'We can type stories on a computer.', boardTag: 'ICSE Class 1 Computer' },
    ],
  },
  {
    ...base,
    subject: 'Mathematics',
    id: 'cls1-math-my-day',
    title: 'The Order of My Day: Earlier, Later, Short Time and Long Time',
    chapterNumber: 'Class 1 • Math Ch 13',
    defaultSimulationMode: 'math-my-day',
    summary: 'Name the parts of the day, put daily events in order, and sort what takes a short time from what takes a long time.',
    syllabusAlignment: {
      cbseChapter: 'NCERT Joyful Mathematics 1 — Ch 10: How do I Spend my Day?',
      icseChapter: 'CISCE Class I Mathematics — Theme 4: Measurement (time: earlier, later, short and long events)',
      examRelevance: 'Class 1 time concepts',
      differenceNote: 'Both boards start time with the order of daily events, before anyone reads a clock.',
    },
    keyFormulas: [
      { label: 'Parts of the day', latex: '\\text{Morning} \\rightarrow \\text{Afternoon} \\rightarrow \\text{Evening} \\rightarrow \\text{Night}', description: 'Every day follows the same order.' },
    ],
    conceptNotes: [
      'A day has morning, afternoon, evening and night.',
      'Earlier means before. Later means after.',
      'Some things take a short time, and some take a long time.',
    ],
    quiz: [
      { id: 'c1m13-q1', question: 'Which comes first in the day?', options: ['Night', 'Evening', 'Morning', 'Afternoon'], correctIndex: 2, explanation: 'The day starts in the morning.', boardTag: 'Class 1 Math' },
      { id: 'c1m13-q2', question: 'Which takes a long time?', options: ['A day at school', 'Clapping your hands', 'Opening a door', 'Blinking your eyes'], correctIndex: 0, explanation: 'A day at school takes many hours.', boardTag: 'Class 1 Math' },
      { id: 'c1m13-q3', question: 'What happens later: lunch or waking up?', options: ['Waking up', 'Lunch', 'They happen together', 'Neither happens'], correctIndex: 1, explanation: 'We wake up in the morning and eat lunch later.', boardTag: 'Class 1 Math' },
    ],
  },
  {
    ...base,
    subject: 'English',
    id: 'cls1-eng-words-in-use',
    title: 'Words in Use: In, On, Under, He or She, and Yesterday, Today, Tomorrow',
    chapterNumber: 'Class 1 • English Ch 9',
    defaultSimulationMode: 'eng-words-in-use',
    summary: 'Use position words, he and she, and sentences about yesterday, today and tomorrow.',
    syllabusAlignment: {
      cbseChapter: 'NCERT Mridang 1 — language practice in activities (grammar terms are an extension)',
      icseChapter: 'CISCE Class I English — Grammar and Vocabulary in Context (prepositions, gender, simple tenses)',
      examRelevance: 'CISCE Class I English grammar in context',
      differenceNote: 'CISCE lists prepositions, gender and simple past, present and future for Class I, to be used in context. No grammar terms are needed at this age.',
    },
    keyFormulas: [
      { label: 'When did it happen?', latex: '\\text{I played} \\rightarrow \\text{I am playing} \\rightarrow \\text{I will play}', description: 'Yesterday, today and tomorrow change the words we use.' },
    ],
    conceptNotes: [
      'Position words tell us where things are: in, on, under, behind, above.',
      'We say he for a boy or man, and she for a girl or woman.',
      'I played means yesterday, I am playing means now, and I will play means tomorrow.',
    ],
    quiz: [
      { id: 'c1en9-q1', question: 'The book is ___ the table.', options: ['on', 'in', 'behind', 'under'], correctIndex: 0, explanation: 'We put a book on the table.', boardTag: 'Class 1 English' },
      { id: 'c1en9-q2', question: 'Which word fits? My mother is kind. ___ helps me.', options: ['He', 'It', 'She', 'They'], correctIndex: 2, explanation: 'We say she for mother.', boardTag: 'Class 1 English' },
      { id: 'c1en9-q3', question: 'Which sentence is about tomorrow?', options: ['I played.', 'I will play.', 'I am playing.', 'I walked.'], correctIndex: 1, explanation: 'Will tells us about tomorrow.', boardTag: 'Class 1 English' },
    ],
  },
];
