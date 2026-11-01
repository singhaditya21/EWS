// Where each board's Class 1 syllabus is covered in the app.
// CBSE: NCERT textbook chapters. ICSE: the Class I themes in CISCE's Curriculum for Primary
// Classes (I–V), 2016. CISCE prescribes no textbooks, so schools choose their own publishers.
import { SchoolBoard } from '../types/curriculum.types';

/** themed = original activities on the unit's theme; the textbook's own text isn't reproduced. */
export type Coverage = 'full' | 'themed' | 'partial' | 'gap';

export interface SyllabusUnit {
  /** Chapter / topic name as the board or book names it. */
  name: string;
  /** App chapters that teach it. */
  chapterIds: string[];
  coverage: Coverage;
  note?: string;
}

export interface SyllabusBook {
  title: string;
  source?: string;
  units: SyllabusUnit[];
}

const u = (name: string, chapterIds: string[], coverage: Coverage = 'full', note?: string): SyllabusUnit => ({
  name,
  chapterIds,
  coverage,
  note,
});

const THEMED = 'Original stories, poems or activities on this theme. The book’s own text isn’t reproduced, so use it alongside the textbook.';

export const CBSE_BOOKS: SyllabusBook[] = [
  {
    title: 'NCERT Joyful Mathematics 1',
    source: 'https://ncert.nic.in/textbook/pdf/aejm1ps.pdf',
    units: [
      u('Ch 1: Finding the Furry Cat!', ['cls1-math-spatial-furry-cat']),
      u('Ch 2: What is Long? What is Round?', ['cls1-math-shapes-roll-slide']),
      u('Ch 3: Mango Treat', ['cls1-math-numbers-comparison']),
      u('Ch 4: Making 10', ['cls1-math-numbers-comparison']),
      u('Ch 5: How Many?', ['cls1-math-add-sub-frog']),
      u('Ch 6: Vegetable Farm', ['cls1-math-add-sub-frog']),
      u('Ch 7: Lina’s Family', ['cls1-math-measurement-balance']),
      u('Ch 8: Fun with Numbers', ['cls1-math-abacus']),
      u('Ch 9: Utsav', ['cls1-math-patterns-pictograph', 'cls1-math-shapes-roll-slide']),
      u('Ch 10: How do I Spend my Day?', ['cls1-math-my-day', 'cls1-math-clock-money'], 'full', 'NCERT teaches parts of the day here; reading o’clock and half past on a clock is an extension.'),
      u('Ch 11: How Many Times?', ['cls1-math-ordinals-groups-data']),
      u('Ch 12: How Much Can We Spend?', ['cls1-math-clock-money']),
      u('Ch 13: So Many Toys', ['cls1-math-patterns-pictograph', 'cls1-math-ordinals-groups-data']),
    ],
  },
  {
    title: 'NCERT Mridang 1 (English)',
    source: 'https://ncert.nic.in/textbook/pdf/aemr1ps.pdf',
    units: [
      u('Unit 1: Two Little Hands', ['cls1-eng-mridang-stories']),
      u('Unit 1: Greetings', ['cls1-eng-mridang-stories']),
      u('Unit 2: Picture Time', ['cls1-eng-picture-talk'], 'themed', THEMED),
      u('Unit 2: The Cap-Seller and the Monkeys', ['cls1-eng-mridang-stories']),
      u('Unit 2: A Farm', ['cls1-eng-farm-seasons'], 'themed', THEMED),
      u('Unit 3: Fun with Pictures', ['cls1-eng-picture-talk'], 'themed', THEMED),
      u('Unit 3: The Food We Eat', ['cls1-evs-houses-food']),
      u('Unit 4: The Four Seasons', ['cls1-eng-farm-seasons'], 'themed', THEMED),
      u('Unit 4: Anandi’s Rainbow', ['cls1-eng-mridang-stories', 'cls1-arts-colors-music']),
    ],
  },
  {
    title: 'NCERT सारंगी 1 (Hindi) — 19 story/poem lessons in 5 units',
    source: 'https://ncert.nic.in/textbook/pdf/ahsr1ps.pdf',
    units: [
      u('अक्षर, शब्द और मात्राएँ (practised across all lessons, incl. अक्षर गीत)', [
        'cls1-hindi-varnamala',
        'cls1-hindi-shabd-train',
        'cls1-hindi-barahkhadi-vyakaran',
      ]),
      u('इकाई 1 परिवार: मीना का परिवार, दादा-दादी, रीना का दिन, रानी भी', ['cls1-hindi-parivar'], 'themed', THEMED),
      u('इकाई 2 जीव-जगत: मिठाई, तीन साथी, वाह मेरे घोड़े!, ख़तरे में साँप', ['cls1-hindi-jeev-jagat'], 'themed', THEMED),
      u('इकाई 3 हमारा खान-पान: आलू की सड़क, झूलम-झूली, भुट्टे, फूली रोटी', ['cls1-hindi-khan-paan'], 'themed', THEMED),
      u('इकाई 4 त्योहार और मेले: मेला, बरखा और मेघा, होली, जन्मदिवस पर पेड़ लगाओ', ['cls1-hindi-tyohar'], 'themed', THEMED),
      u('इकाई 5 हरी-भरी दुनिया: हवा, कितनी प्यारी है ये दुनिया, चाँद का बच्चा', ['cls1-hindi-hari-bhari'], 'themed', THEMED),
    ],
  },
  {
    title: 'No separate textbook in CBSE Class 1',
    units: [
      u('EVS themes (met through Mridang and school activities)', [
        'cls1-evs-body-senses',
        'cls1-evs-me-people',
        'cls1-evs-communication',
        'cls1-evs-keeping-safe',
        'cls1-evs-plants-living',
        'cls1-evs-animals-food-safety',
        'cls1-evs-houses-food',
        'cls1-evs-seasons-sky',
        'cls1-evs-clothes-places-games',
        'cls1-evs-water-air-habits',
        'cls1-evs-helpers-transport',
        'cls1-evs-india-manners',
      ]),
      u('Art education (NCF-FS)', ['cls1-arts-colors-music']),
    ],
  },
];

/** CISCE "Curriculum for Primary Classes (I – V)", 2016. CISCE prescribes no Class 1 textbooks. */
export const CISCE_PRIMARY_CURRICULUM =
  'https://web.archive.org/web/20210822150952/https://www.cisce.org/pdf/Curiculum-Preschool-Class-VIII/PrimaryCurriculum.pdf';

const source = CISCE_PRIMARY_CURRICULUM;

export const ICSE_TOPICS: SyllabusBook[] = [
  {
    title: 'Mathematics (6 themes)',
    source,
    units: [
      u('Theme 1: Numbers', ['cls1-math-numbers-comparison', 'cls1-math-abacus']),
      u('Theme 2: Number Operations', ['cls1-math-add-sub-frog', 'cls1-math-vertical-staircase', 'cls1-math-word-problems-tables']),
      u('Theme 3: Geometry', ['cls1-math-shapes-roll-slide', 'cls1-math-spatial-furry-cat']),
      u('Theme 4: Measurement', ['cls1-math-measurement-balance', 'cls1-math-my-day', 'cls1-math-spatial-furry-cat']),
      u('Theme 5: Data Handling', ['cls1-math-patterns-pictograph']),
      u('Theme 6: Patterns', ['cls1-math-patterns-pictograph', 'cls1-math-shapes-roll-slide']),
    ],
  },
  {
    title: 'English (3 strands)',
    source,
    units: [
      u('Listening and Speaking', ['cls1-eng-mridang-stories', 'cls1-eng-picture-talk', 'cls1-eng-farm-seasons']),
      u('Reading and Writing', ['cls1-eng-phonics-vowels', 'cls1-eng-digraphs-sentences', 'cls1-eng-farm-seasons']),
      u('Grammar and Vocabulary in Context', ['cls1-eng-nouns-this-that', 'cls1-eng-grammar-opposites', 'cls1-eng-pronouns-adjectives', 'cls1-eng-words-in-use', 'cls1-eng-phonics-vowels']),
    ],
  },
  {
    title: 'Hindi, as second language (2 themes)',
    source,
    units: [
      u('थीम 1: सुनना और बोलना', ['cls1-hindi-parivar', 'cls1-hindi-jeev-jagat', 'cls1-hindi-tyohar']),
      u('थीम 2: पढ़ना एवं लिखना', ['cls1-hindi-varnamala', 'cls1-hindi-shabd-train', 'cls1-hindi-barahkhadi-vyakaran', 'cls1-hindi-khan-paan', 'cls1-hindi-hari-bhari']),
    ],
  },
  {
    title: 'Environmental Studies (14 themes)',
    source,
    units: [
      u('Theme 1: About Me', ['cls1-evs-body-senses', 'cls1-evs-me-people']),
      u('Theme 2: Others in my World', ['cls1-evs-me-people', 'cls1-hindi-parivar']),
      u('Theme 3: My Needs, Food We Eat', ['cls1-evs-houses-food', 'cls1-evs-animals-food-safety']),
      u('Theme 4: My Needs, Water', ['cls1-evs-water-air-habits']),
      u('Theme 5: My Needs, Shelter', ['cls1-evs-houses-food']),
      u('Theme 6: My Needs, Clothing', ['cls1-evs-clothes-places-games', 'cls1-evs-seasons-sky']),
      u('Theme 7: My Needs, Air', ['cls1-evs-water-air-habits']),
      u('Theme 8: Keeping Oneself Clean, Safe and Healthy', ['cls1-evs-keeping-safe', 'cls1-evs-body-senses', 'cls1-evs-water-air-habits', 'cls1-evs-clothes-places-games']),
      u('Theme 9: Places in the Neighbourhood', ['cls1-evs-clothes-places-games', 'cls1-evs-helpers-transport']),
      u('Theme 10: Plants', ['cls1-evs-plants-living']),
      u('Theme 11: Animals', ['cls1-evs-animals-food-safety']),
      u('Theme 12: Transport', ['cls1-evs-helpers-transport', 'cls1-evs-animals-food-safety']),
      u('Theme 13: Communication', ['cls1-evs-communication']),
      u('Theme 14: The World around Me', ['cls1-evs-seasons-sky']),
    ],
  },
  {
    title: 'Computer Studies (7 topics)',
    source,
    units: [
      u('Topic 1: Computer, A Machine', ['cls1-comp-smart-machine']),
      u('Topic 2: Uses of a Computer', ['cls1-comp-uses-storage']),
      u('Topic 3: Parts of a Computer', ['cls1-comp-smart-machine']),
      u('Topic 4: Using Computers, Do’s and Don’ts', ['cls1-comp-paint-manners']),
      u('Topic 5: Computer Mouse', ['cls1-comp-smart-machine']),
      u('Topic 6: Computer Keyboard', ['cls1-comp-smart-machine']),
      u('Topic 7: Storage Devices', ['cls1-comp-uses-storage']),
    ],
  },
];

export const syllabusFor = (board: SchoolBoard) => (board === 'CBSE' ? CBSE_BOOKS : ICSE_TOPICS);
