// Class 1 skills: the unit that progress, practice and review are tracked against.
// A chapter teaches one or more skills; questions in the bank each test exactly one skill.

export type Class1Subject = 'math' | 'english' | 'hindi' | 'evs' | 'computer' | 'arts';

export interface Class1Skill {
  id: string;
  subject: Class1Subject;
  label: string;
  /** Foundational literacy / numeracy strand this skill builds toward (NIPUN Bharat), if any. */
  fln?: 'numeracy' | 'literacy';
}

export const SUBJECT_LABELS: Record<Class1Subject, string> = {
  math: 'Mathematics',
  english: 'English',
  hindi: 'Hindi (हिंदी)',
  evs: 'EVS',
  computer: 'Computer Studies',
  arts: 'Arts, Music & Logic',
};

export const CLASS1_SKILLS: Class1Skill[] = [
  // Mathematics
  { id: 'm.position', subject: 'math', label: 'Position words (inside/outside, on/under, near/far)', fln: 'numeracy' },
  { id: 'm.count20', subject: 'math', label: 'Count and read numbers to 20', fln: 'numeracy' },
  { id: 'm.compare', subject: 'math', label: 'Compare numbers (more, less, equal)', fln: 'numeracy' },
  { id: 'm.make10', subject: 'math', label: 'Number pairs that make 10', fln: 'numeracy' },
  { id: 'm.add20', subject: 'math', label: 'Add within 20', fln: 'numeracy' },
  { id: 'm.sub20', subject: 'math', label: 'Subtract within 20', fln: 'numeracy' },
  { id: 'm.placevalue', subject: 'math', label: 'Tens and ones up to 99', fln: 'numeracy' },
  { id: 'm.skipcount', subject: 'math', label: 'Skip counting by 2s, 5s and 10s', fln: 'numeracy' },
  { id: 'm.order', subject: 'math', label: 'Before, after, between and ordering numbers', fln: 'numeracy' },
  { id: 'm.evenodd', subject: 'math', label: 'Even and odd (pairing objects)' },
  { id: 'm.shapes', subject: 'math', label: 'Shapes: flat and solid, roll or slide' },
  { id: 'm.patterns', subject: 'math', label: 'Patterns with shapes and numbers' },
  { id: 'm.measure', subject: 'math', label: 'Longer/shorter, heavier/lighter, holds more' },
  { id: 'm.time', subject: 'math', label: 'Time: o’clock, half past, days of the week' },
  { id: 'm.money', subject: 'math', label: 'Indian coins and notes' },
  { id: 'm.data', subject: 'math', label: 'Reading a picture graph' },
  { id: 'm.ordinal', subject: 'math', label: 'Ordinal numbers (1st to 10th)' },
  { id: 'm.groups', subject: 'math', label: 'Equal groups and repeated addition' },
  { id: 'm.halves', subject: 'math', label: 'Halves and equal sharing' },
  { id: 'm.wordproblem', subject: 'math', label: 'Story sums (add or take away)', fln: 'numeracy' },
  { id: 'm.tables', subject: 'math', label: 'Tables of 2, 5 and 10 (extension)' },

  // English
  { id: 'e.letters', subject: 'english', label: 'Letter sounds and vowels', fln: 'literacy' },
  { id: 'e.cvc', subject: 'english', label: 'Reading 3-letter words', fln: 'literacy' },
  { id: 'e.article', subject: 'english', label: 'Using a and an' },
  { id: 'e.opposites', subject: 'english', label: 'Opposites' },
  { id: 'e.verbs', subject: 'english', label: 'Action words' },
  { id: 'e.plurals', subject: 'english', label: 'One and many' },
  { id: 'e.nouns', subject: 'english', label: 'Naming words' },
  { id: 'e.thisthat', subject: 'english', label: 'This, that, these, those' },
  { id: 'e.pronouns', subject: 'english', label: 'He, she, it, we, they' },
  { id: 'e.adjectives', subject: 'english', label: 'Describing words' },
  { id: 'e.digraphs', subject: 'english', label: 'ch, sh, th, wh sounds', fln: 'literacy' },
  { id: 'e.sentences', subject: 'english', label: 'Capital letters, full stop, question mark', fln: 'literacy' },
  { id: 'e.listening', subject: 'english', label: 'Listening to stories, poems and greetings', fln: 'literacy' },

  // Hindi
  { id: 'h.swar', subject: 'hindi', label: 'स्वर (vowels)', fln: 'literacy' },
  { id: 'h.vyanjan', subject: 'hindi', label: 'व्यंजन (consonants)', fln: 'literacy' },
  { id: 'h.shabd', subject: 'hindi', label: 'बिना मात्रा के शब्द (words without matras)', fln: 'literacy' },
  { id: 'h.matra', subject: 'hindi', label: 'मात्राएँ और बारहखड़ी', fln: 'literacy' },
  { id: 'h.vilom', subject: 'hindi', label: 'विलोम शब्द (opposites)' },
  { id: 'h.vachan', subject: 'hindi', label: 'एक–अनेक (one and many)' },
  { id: 'h.ginti', subject: 'hindi', label: 'हिंदी गिनती (numbers in Hindi)' },

  // EVS
  { id: 'v.body', subject: 'evs', label: 'My body and sense organs' },
  { id: 'v.hygiene', subject: 'evs', label: 'Cleanliness and good habits' },
  { id: 'v.living', subject: 'evs', label: 'Living and non-living things' },
  { id: 'v.plants', subject: 'evs', label: 'Parts of a plant' },
  { id: 'v.animals', subject: 'evs', label: 'Animals and their homes' },
  { id: 'v.food', subject: 'evs', label: 'Healthy food' },
  { id: 'v.safety', subject: 'evs', label: 'Road and home safety' },
  { id: 'v.seasons', subject: 'evs', label: 'Weather, seasons and clothes' },
  { id: 'v.sky', subject: 'evs', label: 'Day and night sky' },
  { id: 'v.waterair', subject: 'evs', label: 'Water and air' },
  { id: 'v.helpers', subject: 'evs', label: 'People who help us' },
  { id: 'v.transport', subject: 'evs', label: 'Means of transport' },
  { id: 'v.houses', subject: 'evs', label: 'Houses and rooms' },
  { id: 'v.india', subject: 'evs', label: 'Our country India' },
  { id: 'v.manners', subject: 'evs', label: 'Polite words and manners' },
  { id: 'v.neighbourhood', subject: 'evs', label: 'Places in our neighbourhood' },
  { id: 'v.games', subject: 'evs', label: 'Indoor and outdoor games' },

  // Computer
  { id: 'c.machines', subject: 'computer', label: 'Natural and man-made things; machines' },
  { id: 'c.parts', subject: 'computer', label: 'Parts of a computer' },
  { id: 'c.paint', subject: 'computer', label: 'Drawing with Paint tools' },
  { id: 'c.labsafety', subject: 'computer', label: 'Computer lab manners and safety' },

  // Arts, music & logic
  { id: 'a.colours', subject: 'arts', label: 'Primary and secondary colours' },
  { id: 'a.music', subject: 'arts', label: 'Sa Re Ga Ma and rhythm' },
  { id: 'a.reasoning', subject: 'arts', label: 'Odd one out, analogies and patterns' },
];

export const SKILL_BY_ID: Record<string, Class1Skill> = Object.fromEntries(
  CLASS1_SKILLS.map((s) => [s.id, s])
);
