// Topic activities for Class 1: learn with picture cards, then sort, order or choose.
// These close the gaps found against CISCE's Class I curriculum. All text is original.
import { ReadingQuestion } from './readingSets';

export type TopicMode =
  | 'evs-communication'
  | 'evs-me-people'
  | 'evs-keeping-safe'
  | 'computer-uses-storage'
  | 'math-my-day'
  | 'eng-words-in-use';

export interface TopicCard {
  picture: string;
  name: string;
  fact: string;
}

interface SectionBase {
  id: string;
  title: string;
}
export interface CardsSection extends SectionBase {
  kind: 'cards';
  cards: TopicCard[];
}
export interface SortSection extends SectionBase {
  kind: 'sort';
  skillId: string;
  buckets: { id: string; label: string; picture: string }[];
  items: { text: string; picture: string; bucket: string }[];
}
export interface OrderSection extends SectionBase {
  kind: 'order';
  skillId: string;
  /** In the right order; shuffled on screen. */
  steps: { text: string; picture: string }[];
}
export interface ChooseSection extends SectionBase {
  kind: 'choose';
  skillId: string;
  questions: ReadingQuestion[];
}
export type TopicSection = CardsSection | SortSection | OrderSection | ChooseSection;

export interface TopicSet {
  mode: TopicMode;
  chapterId: string;
  sections: TopicSection[];
}

export const TOPIC_SETS: TopicSet[] = [
  {
    mode: 'evs-communication',
    chapterId: 'cls1-evs-communication',
    sections: [
      {
        id: 'ways',
        kind: 'cards',
        title: '📣 Ways we share news',
        cards: [
          { picture: '🗣️', name: 'Talking', fact: 'We talk to people who are near us.' },
          { picture: '📱', name: 'Phone', fact: 'We call people who are far away.' },
          { picture: '✉️', name: 'Letter', fact: 'We write a letter and post it.' },
          { picture: '📻', name: 'Radio', fact: 'We listen to songs and news.' },
          { picture: '📺', name: 'Television', fact: 'We watch shows and news.' },
          { picture: '📰', name: 'Newspaper', fact: 'We read the news of the day.' },
          { picture: '💻', name: 'Email and messages', fact: 'We send words quickly on a phone or computer.' },
        ],
      },
      {
        id: 'senses',
        kind: 'sort',
        title: '🧺 Listen, watch or read?',
        skillId: 'v.communication',
        buckets: [
          { id: 'listen', label: 'Listen', picture: '👂' },
          { id: 'watch', label: 'Watch', picture: '👀' },
          { id: 'read', label: 'Read', picture: '📖' },
        ],
        items: [
          { text: 'A song on the radio', picture: '📻', bucket: 'listen' },
          { text: 'A phone call', picture: '📞', bucket: 'listen' },
          { text: 'A cartoon on television', picture: '📺', bucket: 'watch' },
          { text: 'A letter from Grandma', picture: '✉️', bucket: 'read' },
          { text: 'The newspaper', picture: '📰', bucket: 'read' },
          { text: 'A storybook', picture: '📚', bucket: 'read' },
        ],
      },
      {
        id: 'use-well',
        kind: 'choose',
        title: '🤔 Using them well',
        skillId: 'v.communication',
        questions: [
          { prompt: 'Grandma lives far away. How can you talk to her today?', options: ['Shout loudly', 'Phone her', 'Wait for a year'], answer: 1, explain: 'A phone lets us talk to people who are far away.' },
          { prompt: 'A stranger sends a message on a phone. What should you do?', options: ['Reply with your name', 'Tap the link', 'Show a grown-up'], answer: 2, explain: 'Always show messages from strangers to a grown-up.' },
          { prompt: 'You have watched TV for a long time. What is best?', options: ['Play outside', 'Watch all night', 'Sit closer to it'], answer: 0, explain: 'Too much screen time is bad for our eyes, so go and play.' },
        ],
      },
    ],
  },
  {
    mode: 'evs-me-people',
    chapterId: 'cls1-evs-me-people',
    sections: [
      {
        id: 'about-me',
        kind: 'cards',
        title: '🙋 All about me',
        cards: [
          { picture: '🏷️', name: 'My name', fact: 'Learn to say your full name.' },
          { picture: '👪', name: 'My parents', fact: 'Learn the names of your parents.' },
          { picture: '🏠', name: 'My address', fact: 'Learn where you live, in case you get lost.' },
          { picture: '☎️', name: 'A phone number', fact: 'Learn a grown-up’s phone number by heart.' },
          { picture: '🎂', name: 'My birthday', fact: 'Learn the day and month you were born.' },
          { picture: '🔒', name: 'Keep it safe', fact: 'Tell these things only to people you trust.' },
        ],
      },
      {
        id: 'feelings',
        kind: 'cards',
        title: '😊 My feelings',
        cards: [
          { picture: '😊', name: 'Happy', fact: 'I feel happy when I play with my friends.' },
          { picture: '😢', name: 'Sad', fact: 'I feel sad when I lose my toy.' },
          { picture: '😠', name: 'Angry', fact: 'When I am angry, I take slow, deep breaths.' },
          { picture: '😮', name: 'Surprised', fact: 'I feel surprised when something new happens.' },
          { picture: '🤩', name: 'Excited', fact: 'I feel excited before my birthday.' },
        ],
      },
      {
        id: 'feelings-choose',
        kind: 'choose',
        title: '💛 What would you do?',
        skillId: 'v.me',
        questions: [
          { prompt: 'Your friend fell down and is crying. What should you do?', options: ['Laugh', 'Walk away', 'Help and call a teacher'], answer: 2, explain: 'Kind friends help when someone is hurt.' },
          { prompt: 'You feel very angry. What helps?', options: ['Take deep breaths', 'Hit someone', 'Break a toy'], answer: 0, explain: 'Deep breaths help us calm down.' },
          { prompt: 'Your friend likes a different game. What should you say?', options: ['Your game is bad', 'Let us take turns', 'Go away'], answer: 1, explain: 'We can like different things and still be friends.' },
        ],
      },
      {
        id: 'my-people',
        kind: 'cards',
        title: '👨‍👩‍👧 My people',
        cards: [
          { picture: '👨‍👩‍👧', name: 'Family', fact: 'Family members love and care for one another.' },
          { picture: '🏘️', name: 'All families', fact: 'Some families are big and some are small. All families are special.' },
          { picture: '🧑‍🤝‍🧑', name: 'Friends', fact: 'Friends play, share and help each other.' },
          { picture: '🏡', name: 'Neighbours', fact: 'Neighbours live near us and help us.' },
          { picture: '🐕', name: 'Pets', fact: 'Pets need food, water and love.' },
          { picture: '🎉', name: 'Celebrations', fact: 'We share birthdays and festivals with family and friends.' },
        ],
      },
      {
        id: 'family-friends',
        kind: 'sort',
        title: '🧺 Family or friends?',
        skillId: 'v.me',
        buckets: [
          { id: 'family', label: 'Family', picture: '🏠' },
          { id: 'friends', label: 'Friends', picture: '⚽' },
        ],
        items: [
          { text: 'Mother', picture: '👩', bucket: 'family' },
          { text: 'Grandfather', picture: '👴', bucket: 'family' },
          { text: 'My sister', picture: '👧', bucket: 'family' },
          { text: 'My classmate', picture: '🎒', bucket: 'friends' },
          { text: 'My playmate in the park', picture: '🛝', bucket: 'friends' },
        ],
      },
    ],
  },
  {
    mode: 'evs-keeping-safe',
    chapterId: 'cls1-evs-keeping-safe',
    sections: [
      {
        id: 'my-body',
        kind: 'cards',
        title: '🛡️ My body is mine',
        cards: [
          { picture: '💪', name: 'My body is mine', fact: 'I can say no to a touch I do not like.' },
          { picture: '🤗', name: 'Safe touch', fact: 'A safe touch feels kind, like a hug I want from my family.' },
          { picture: '🚫', name: 'Unsafe touch', fact: 'A touch that scares me, or touches the parts under my underwear, is not okay.' },
          { picture: '🩺', name: 'At the doctor', fact: 'A doctor may check me when my parent is with me.' },
          { picture: '✋', name: 'Say NO', fact: 'Say NO in a loud voice.' },
          { picture: '🏃', name: 'GO', fact: 'Go away quickly to a grown-up you trust.' },
          { picture: '🗣️', name: 'TELL', fact: 'Tell a grown-up you trust. Keep telling until someone helps.' },
          { picture: '💛', name: 'Not my fault', fact: 'It is never my fault. I will not keep it a secret.' },
        ],
      },
      {
        id: 'safe-or-not',
        kind: 'sort',
        title: '🧺 Safe or not safe?',
        skillId: 'v.safety',
        buckets: [
          { id: 'safe', label: 'Safe', picture: '✅' },
          { id: 'unsafe', label: 'Not safe', picture: '⚠️' },
        ],
        items: [
          { text: 'Holding a grown-up’s hand on the road', picture: '🤝', bucket: 'safe' },
          { text: 'Playing with matches', picture: '🔥', bucket: 'unsafe' },
          { text: 'Touching a plug with wet hands', picture: '🔌', bucket: 'unsafe' },
          { text: 'Wearing a seat belt in the car', picture: '🚗', bucket: 'safe' },
          { text: 'Taking sweets from a stranger', picture: '🍬', bucket: 'unsafe' },
          { text: 'Keeping away from a hot stove', picture: '🍳', bucket: 'safe' },
        ],
      },
      {
        id: 'what-to-do',
        kind: 'choose',
        title: '🤔 What should you do?',
        skillId: 'v.safety',
        questions: [
          { prompt: 'Someone says, “Come with me, I have a toy.” You do not know them.', options: ['Go with them', 'Say no and run to a grown-up you trust', 'Ask for two toys'], answer: 1, explain: 'Never go with a stranger. Say no, go, and tell.' },
          { prompt: 'A touch makes you feel bad. The person says, “Keep it a secret.”', options: ['Keep the secret', 'Feel it is your fault', 'Tell a grown-up you trust'], answer: 2, explain: 'Unsafe secrets must be told. It is never your fault.' },
          { prompt: 'You get lost in a busy market. What should you do?', options: ['Ask a police officer or shopkeeper', 'Walk away alone', 'Go with anyone'], answer: 0, explain: 'Stay where people can see you and ask a police officer or shopkeeper.' },
        ],
      },
    ],
  },
  {
    mode: 'computer-uses-storage',
    chapterId: 'cls1-comp-uses-storage',
    sections: [
      {
        id: 'uses',
        kind: 'cards',
        title: '💻 What computers do',
        cards: [
          { picture: '📝', name: 'Typing', fact: 'We type stories and letters.' },
          { picture: '🎵', name: 'Music', fact: 'We listen to songs.' },
          { picture: '🎮', name: 'Games', fact: 'We play learning games.' },
          { picture: '🌐', name: 'Internet', fact: 'We find information with a grown-up’s help.' },
          { picture: '✉️', name: 'Email', fact: 'We send messages to people far away.' },
          { picture: '🚉', name: 'Tickets', fact: 'Railway stations use computers to book tickets.' },
          { picture: '🏦', name: 'Banks', fact: 'Banks use computers to keep records of money.' },
          { picture: '🏥', name: 'Hospitals', fact: 'Hospitals use computers to keep records of patients.' },
        ],
      },
      {
        id: 'can-it',
        kind: 'sort',
        title: '🧺 Can a computer help?',
        skillId: 'c.uses',
        buckets: [
          { id: 'yes', label: 'Yes', picture: '💻' },
          { id: 'no', label: 'No', picture: '🙅' },
        ],
        items: [
          { text: 'Typing a story', picture: '📝', bucket: 'yes' },
          { text: 'Brushing your teeth', picture: '🪥', bucket: 'no' },
          { text: 'Playing a learning game', picture: '🎮', bucket: 'yes' },
          { text: 'Eating lunch', picture: '🍱', bucket: 'no' },
          { text: 'Sending an email', picture: '✉️', bucket: 'yes' },
          { text: 'Riding a bicycle', picture: '🚲', bucket: 'no' },
        ],
      },
      {
        id: 'storage',
        kind: 'cards',
        title: '💾 Where a computer keeps things',
        cards: [
          { picture: '🗂️', name: 'Data', fact: 'Data means the words, pictures and songs on a computer.' },
          { picture: '🎒', name: 'Storage', fact: 'A storage device keeps data safe, like a bag keeps your books.' },
          { picture: '🔌', name: 'Pen drive', fact: 'A small stick that plugs into a computer and carries data.' },
          { picture: '💳', name: 'Data card', fact: 'A tiny card that keeps photos and data.' },
          { picture: '💿', name: 'CD', fact: 'A round, shiny disc that keeps songs and data.' },
          { picture: '📀', name: 'DVD', fact: 'A round disc like a CD. It can keep films.' },
        ],
      },
      {
        id: 'storage-choose',
        kind: 'choose',
        title: '🤔 Which one?',
        skillId: 'c.storage',
        questions: [
          { prompt: 'Where can you keep your drawing to open it later?', options: ['On a mouse', 'On a pen drive', 'On a speaker'], answer: 1, explain: 'A pen drive is a storage device.' },
          { prompt: 'Which one is round and shiny?', options: ['A CD', 'A keyboard', 'A mouse'], answer: 0, explain: 'CDs and DVDs are round, shiny discs.' },
          { prompt: 'What is data?', options: ['Water in a glass', 'A kind of chair', 'Words and pictures on a computer'], answer: 2, explain: 'Data means the words, pictures and songs on a computer.' },
        ],
      },
    ],
  },
  {
    mode: 'math-my-day',
    chapterId: 'cls1-math-my-day',
    sections: [
      {
        id: 'parts',
        kind: 'cards',
        title: '🌅 Parts of my day',
        cards: [
          { picture: '🌅', name: 'Morning', fact: 'In the morning I wake up and get ready for school.' },
          { picture: '☀️', name: 'Afternoon', fact: 'In the afternoon I eat lunch and come home.' },
          { picture: '🌇', name: 'Evening', fact: 'In the evening I play and do my homework.' },
          { picture: '🌙', name: 'Night', fact: 'At night I eat dinner and go to sleep.' },
        ],
      },
      {
        id: 'order-day',
        kind: 'order',
        title: '🔢 Put my day in order',
        skillId: 'm.dayorder',
        steps: [
          { text: 'I wake up.', picture: '🌅' },
          { text: 'I brush my teeth.', picture: '🪥' },
          { text: 'I go to school.', picture: '🎒' },
          { text: 'I eat lunch.', picture: '🍱' },
          { text: 'I play in the evening.', picture: '⚽' },
          { text: 'I go to sleep.', picture: '😴' },
        ],
      },
      {
        id: 'short-long',
        kind: 'sort',
        title: '🧺 Short time or long time?',
        skillId: 'm.dayorder',
        buckets: [
          { id: 'short', label: 'Short time', picture: '⚡' },
          { id: 'long', label: 'Long time', picture: '🐢' },
        ],
        items: [
          { text: 'Clapping your hands', picture: '👏', bucket: 'short' },
          { text: 'Sleeping at night', picture: '😴', bucket: 'long' },
          { text: 'Drinking a glass of water', picture: '🥛', bucket: 'short' },
          { text: 'A day at school', picture: '🏫', bucket: 'long' },
          { text: 'Opening a door', picture: '🚪', bucket: 'short' },
          { text: 'A train trip to another city', picture: '🚆', bucket: 'long' },
        ],
      },
      {
        id: 'earlier-later',
        kind: 'choose',
        title: '🤔 Earlier or later?',
        skillId: 'm.dayorder',
        questions: [
          { prompt: 'Which happens earlier in the day?', options: ['Dinner', 'Breakfast', 'Bedtime'], answer: 1, explain: 'We eat breakfast in the morning.' },
          { prompt: 'Which happens later in the day?', options: ['Waking up', 'Going to school', 'Going to sleep'], answer: 2, explain: 'We go to sleep at night.' },
          { prompt: 'What do we do before we eat?', options: ['Wash our hands', 'Go to sleep', 'Go home'], answer: 0, explain: 'We wash our hands before we eat.' },
        ],
      },
    ],
  },
  {
    mode: 'eng-words-in-use',
    chapterId: 'cls1-eng-words-in-use',
    sections: [
      {
        id: 'position-cards',
        kind: 'cards',
        title: '📍 Where is it?',
        cards: [
          { picture: '🐟', name: 'in', fact: 'The fish is in the water.' },
          { picture: '📕', name: 'on', fact: 'The book is on the table.' },
          { picture: '👟', name: 'under', fact: 'The shoes are under the bed.' },
          { picture: '🌳', name: 'behind', fact: 'The boy is hiding behind the tree.' },
          { picture: '🐦', name: 'above', fact: 'The bird is flying above the house.' },
        ],
      },
      {
        id: 'position-choose',
        kind: 'choose',
        title: '🤔 Choose the word',
        skillId: 'e.prepositions',
        questions: [
          { prompt: 'The fish is ___ the water.', options: ['in', 'on', 'above'], answer: 0, explain: 'Fish swim in water.' },
          { prompt: 'The shoes are on the floor, ___ the bed.', options: ['above', 'on', 'under'], answer: 2, explain: 'The shoes are under the bed.' },
          { prompt: 'We cannot see the boy. He is ___ the tree.', options: ['on', 'behind', 'in'], answer: 1, explain: 'He is hiding behind the tree.' },
        ],
      },
      {
        id: 'he-she',
        kind: 'sort',
        title: '🧺 He or she?',
        skillId: 'e.gender',
        buckets: [
          { id: 'he', label: 'He', picture: '👦' },
          { id: 'she', label: 'She', picture: '👧' },
        ],
        items: [
          { text: 'Father', picture: '👨', bucket: 'he' },
          { text: 'Mother', picture: '👩', bucket: 'she' },
          { text: 'Brother', picture: '👦', bucket: 'he' },
          { text: 'Sister', picture: '👧', bucket: 'she' },
          { text: 'King', picture: '🤴', bucket: 'he' },
          { text: 'Queen', picture: '👸', bucket: 'she' },
        ],
      },
      {
        id: 'when',
        kind: 'sort',
        title: '🧺 Yesterday, today or tomorrow?',
        skillId: 'e.tenses',
        buckets: [
          { id: 'past', label: 'Yesterday', picture: '⏪' },
          { id: 'now', label: 'Today', picture: '▶️' },
          { id: 'next', label: 'Tomorrow', picture: '⏩' },
        ],
        items: [
          { text: 'I played with my friend.', picture: '⚽', bucket: 'past' },
          { text: 'I am reading a book.', picture: '📖', bucket: 'now' },
          { text: 'I will go to the park.', picture: '🌳', bucket: 'next' },
          { text: 'She walked to school.', picture: '🎒', bucket: 'past' },
          { text: 'He is eating an apple.', picture: '🍎', bucket: 'now' },
          { text: 'We will sing a song.', picture: '🎵', bucket: 'next' },
        ],
      },
    ],
  },
];

export const topicSetFor = (mode: string) => TOPIC_SETS.find((s) => s.mode === mode);
