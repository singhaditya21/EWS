// Where each board's Class 1 syllabus is covered in the app.
// CBSE: NCERT textbook chapters (fixed books). ICSE: typical topics, because CISCE does not
// prescribe Class 1 textbooks and schools choose their own publishers.
import { SchoolBoard } from '../types/curriculum.types';

export type Coverage = 'full' | 'partial' | 'gap';

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
      u('Ch 10: How do I Spend my Day?', ['cls1-math-clock-money'], 'full', 'NCERT teaches parts of the day here; reading o’clock / half past on a clock face is an extension.'),
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
      u('Unit 2: Picture Time', ['cls1-eng-nouns-this-that'], 'partial', 'Picture reading with number songs; the app practises naming words but has no picture-reading activity yet.'),
      u('Unit 2: The Cap-Seller and the Monkeys', ['cls1-eng-mridang-stories']),
      u('Unit 2: A Farm', ['cls1-evs-animals-food-safety'], 'partial', 'A farm song and short reading; farm animals are covered in EVS, but there is no English farm song activity yet.'),
      u('Unit 3: Fun with Pictures', [], 'gap', 'Picture talk and a fruit poem; not covered yet.'),
      u('Unit 3: The Food We Eat', ['cls1-evs-houses-food']),
      u('Unit 4: The Four Seasons', ['cls1-evs-seasons-sky'], 'partial', 'A seasons poem and picture-story sequencing; seasons are covered in EVS, but there is no English poem activity yet.'),
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
      u('इकाई 1 परिवार: मीना का परिवार, दादा-दादी, रीना का दिन, रानी भी', ['cls1-evs-body-senses'], 'partial', 'Family themes appear in EVS; the Sarangi stories themselves are not in the app yet.'),
      u('इकाई 2 जीव-जगत: मिठाई, तीन साथी, वाह मेरे घोड़े!, ख़तरे में साँप', ['cls1-evs-animals-food-safety'], 'partial', 'Animals appear in EVS; the Hindi stories are not in the app yet.'),
      u('इकाई 3 हमारा खान-पान: आलू की सड़क, झूलम-झूली, भुट्टे, फूली रोटी', ['cls1-evs-houses-food'], 'partial', 'Food appears in EVS; the Hindi stories are not in the app yet.'),
      u('इकाई 4 त्योहार और मेले: मेला, बरखा और मेघा, होली, जन्मदिवस पर पेड़ लगाओ', [], 'gap', 'Not covered yet.'),
      u('इकाई 5 हरी-भरी दुनिया: हवा, कितनी प्यारी है ये दुनिया, चाँद का बच्चा', ['cls1-evs-water-air-habits', 'cls1-evs-seasons-sky'], 'partial', 'Air and the night sky appear in EVS; the Hindi poems are not in the app yet.'),
    ],
  },
  {
    title: 'No separate textbook in CBSE Class 1',
    units: [
      u('EVS themes (met through Mridang and school activities)', [
        'cls1-evs-body-senses',
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
  'http://web.archive.org/web/20210822150952/https://www.cisce.org/pdf/Curiculum-Preschool-Class-VIII/PrimaryCurriculum.pdf';

export const ICSE_TOPICS: SyllabusBook[] = [
  {
    title: 'Mathematics',
    source: CISCE_PRIMARY_CURRICULUM,
    units: [
      u('Pre-number concepts', ['cls1-math-spatial-furry-cat']),
      u('Numbers 1–100, before/after/between, comparison', ['cls1-math-numbers-comparison', 'cls1-math-abacus', 'cls1-math-vertical-staircase']),
      u('Ordinal numbers', ['cls1-math-ordinals-fractions', 'cls1-math-ordinals-groups-data']),
      u('Addition and subtraction (incl. column method)', ['cls1-math-add-sub-frog', 'cls1-math-vertical-staircase']),
      u('Word problems', ['cls1-math-word-problems-tables']),
      u('Multiplication as repeated addition, early tables', ['cls1-math-ordinals-groups-data', 'cls1-math-word-problems-tables']),
      u('Shapes and patterns', ['cls1-math-shapes-roll-slide', 'cls1-math-patterns-pictograph']),
      u('Measurement, time and money', ['cls1-math-measurement-balance', 'cls1-math-clock-money']),
      u('Halves (equal sharing)', ['cls1-math-ordinals-fractions']),
      u('Data handling (pictographs)', ['cls1-math-patterns-pictograph']),
    ],
  },
  {
    title: 'English',
    units: [
      u('Phonics, vowels, a/an', ['cls1-eng-phonics-vowels']),
      u('Naming words, this/that/these/those', ['cls1-eng-nouns-this-that']),
      u('Action words, opposites, one/many', ['cls1-eng-grammar-opposites']),
      u('Pronouns and describing words', ['cls1-eng-pronouns-adjectives']),
      u('Digraphs and sentences', ['cls1-eng-digraphs-sentences']),
      u('Rhymes and stories (reader)', ['cls1-eng-mridang-stories'], 'partial', 'ICSE readers vary by school; the app uses general stories and rhymes.'),
    ],
  },
  {
    title: 'Hindi',
    units: [
      u('वर्णमाला', ['cls1-hindi-varnamala']),
      u('शब्द रचना', ['cls1-hindi-shabd-train']),
      u('मात्राएँ, विलोम, वचन', ['cls1-hindi-barahkhadi-vyakaran']),
    ],
  },
  {
    title: 'EVS',
    units: [
      u('Me, my body and good habits', ['cls1-evs-body-senses', 'cls1-evs-water-air-habits']),
      u('Food, houses and clothes', ['cls1-evs-houses-food', 'cls1-evs-clothes-places-games']),
      u('Plants and animals', ['cls1-evs-plants-living', 'cls1-evs-animals-food-safety']),
      u('Helpers, neighbourhood and transport', ['cls1-evs-helpers-transport', 'cls1-evs-clothes-places-games']),
      u('Weather, seasons, water, air and sky', ['cls1-evs-seasons-sky', 'cls1-evs-water-air-habits']),
      u('Our country and manners', ['cls1-evs-india-manners']),
    ],
  },
  {
    title: 'Computer Studies',
    units: [
      u('Computer as a machine, parts', ['cls1-comp-smart-machine']),
      u('Paint and lab manners', ['cls1-comp-paint-manners']),
    ],
  },
];

export const syllabusFor = (board: SchoolBoard) => (board === 'CBSE' ? CBSE_BOOKS : ICSE_TOPICS);
