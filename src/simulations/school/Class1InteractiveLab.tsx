import React, { useEffect, useRef, useState } from 'react';
import { Canvas2DWrapper, CanvasRenderContext } from '../../components/engine/Canvas2DWrapper';
import { ParameterPanel } from '../../components/engine/ParameterPanel';
import {
  playPop,
  playSuccessChime,
  playFanfare,
  playMusicalNote,
} from '../../utils/soundEffects';
import { cancelSpeech, speakText, useHasVoice } from '../../utils/speech';
import { progress, useProgress } from '../../class1/progressStore';
import { ProgressReport } from '../../class1/components/ProgressReport';
import { SchoolBoard } from '../../types/curriculum.types';
import {
  Calculator,
  Shapes,
  Clock,
  IndianRupee,
  Sprout,
  Eye,
  Sun,
  Sparkles,
  Plus,
  Minus,
  CheckCircle2,
  Volume2,
  VolumeX,
  Trophy,
  Target,
  BookOpen,
  Monitor,
  Flag,
  Languages,
  Palette,
  Music,
  Truck,
  Award,
  X,
  Mic,
  Gamepad2,
  Home,
} from 'lucide-react';

export type Class1LabMode =
  | 'spatial-prenumber'
  | 'number-line-tenframe'
  | 'addition-subtraction'
  | 'tens-ones-abacus'
  | 'shapes-roll-slide'
  | 'measurement-balance'
  | 'clock-money'
  | 'patterns-pictograph'
  | 'spatial-ordinals-data'
  | 'math-vertical-staircase'
  | 'math-ordinals-fractions'
  | 'math-word-problems-tables'
  | 'eng-phonics-vowels'
  | 'eng-grammar-opposites'
  | 'eng-mridang-stories'
  | 'eng-nouns-this-that'
  | 'eng-pronouns-adjectives'
  | 'eng-digraphs-sentences'
  | 'hindi-varnamala'
  | 'hindi-shabd-train'
  | 'hindi-barahkhadi-vyakaran'
  | 'computer-smart-machine'
  | 'computer-paint-manners'
  | 'evs-sense-organs'
  | 'evs-plants-living'
  | 'evs-animals-food-safety'
  | 'evs-seasons-sky'
  | 'evs-india-manners'
  | 'evs-helpers-transport'
  | 'evs-houses-food'
  | 'evs-water-air-habits'
  | 'evs-clothes-places-games'
  | 'arts-colors-music'
  | 'olympiad-reasoning-gym';

type Class1SubjectGroup = 'math' | 'english' | 'hindi' | 'evs' | 'computer' | 'arts';

const MODE_CATALOG: {
  id: Class1LabMode;
  subject: Class1SubjectGroup;
  label: string;
  icon: React.FC<{ className?: string }>;
}[] = [
  { id: 'spatial-prenumber', subject: 'math', label: '1. Spatial (Furry Cat)', icon: Sparkles },
  { id: 'number-line-tenframe', subject: 'math', label: '2. Numbers 1–20 & Making 10', icon: Sparkles },
  { id: 'addition-subtraction', subject: 'math', label: '3. Add & Subtract Frog', icon: Calculator },
  { id: 'tens-ones-abacus', subject: 'math', label: '4. Tens & Ones Abacus', icon: Plus },
  { id: 'shapes-roll-slide', subject: 'math', label: '5. Shapes: Roll & Slide', icon: Shapes },
  { id: 'measurement-balance', subject: 'math', label: '6. Handspan & Balance', icon: Calculator },
  { id: 'clock-money', subject: 'math', label: '7. Clock, Calendar & ₹ Shop', icon: Clock },
  { id: 'patterns-pictograph', subject: 'math', label: '8. Patterns & Pictograph', icon: Shapes },
  { id: 'spatial-ordinals-data', subject: 'math', label: '9. Ordinals & Equal Groups', icon: Sparkles },
  { id: 'math-vertical-staircase', subject: 'math', label: '10. Vertical T|O Sums & Stairs 🪜', icon: Calculator },
  { id: 'math-ordinals-fractions', subject: 'math', label: '11. 1st–10th Race & Pizza Halves 🍕', icon: Trophy },
  { id: 'math-word-problems-tables', subject: 'math', label: '12. Story Sums & Musical Tables (2×, 5×, 10×) 🧮', icon: Calculator },
  { id: 'eng-phonics-vowels', subject: 'english', label: '1. Vowels (A,E,I,O,U) & CVC', icon: BookOpen },
  { id: 'eng-grammar-opposites', subject: 'english', label: '2. Opposites, Plurals & Verbs', icon: BookOpen },
  { id: 'eng-mridang-stories', subject: 'english', label: '3. Mridang Poems & Stories 🎭', icon: Sparkles },
  { id: 'eng-nouns-this-that', subject: 'english', label: '4. Nouns (4 Baskets) & This/That 🧺', icon: BookOpen },
  { id: 'eng-pronouns-adjectives', subject: 'english', label: '5. Pronouns (He/She/It) & Adjectives 🌟', icon: BookOpen },
  { id: 'eng-digraphs-sentences', subject: 'english', label: '6. Digraphs (ch/sh/th) & Sentence Builder ✍️', icon: BookOpen },
  { id: 'hindi-varnamala', subject: 'hindi', label: '1. सारंगी: वर्णमाला, मात्रा, गिनती व कविता', icon: Languages },
  { id: 'hindi-shabd-train', subject: 'hindi', label: '2. दो, तीन व चार अक्षर वाले शब्द रेलगाड़ी 🚂', icon: Languages },
  { id: 'hindi-barahkhadi-vyakaran', subject: 'hindi', label: '3. बारहखड़ी (क–कः), विलोम व एक–अनेक 🪔', icon: Languages },
  { id: 'evs-sense-organs', subject: 'evs', label: '1. My Body & 5 Sense Organs', icon: Eye },
  { id: 'evs-plants-living', subject: 'evs', label: '2. Growing Plant & Living Things', icon: Sprout },
  { id: 'evs-animals-food-safety', subject: 'evs', label: '3. Animals (Babies/Homes) & Safety', icon: CheckCircle2 },
  { id: 'evs-seasons-sky', subject: 'evs', label: '4. Seasons & Day/Night Sky', icon: Sun },
  { id: 'evs-india-manners', subject: 'evs', label: '5. Our India 🇮🇳 & Good Manners', icon: Flag },
  { id: 'evs-helpers-transport', subject: 'evs', label: '6. Helpers, Home & Transport 🚒', icon: Truck },
  { id: 'evs-houses-food', subject: 'evs', label: '7. Houses (Kutcha/Pucca) & Food 🏡🍎', icon: Home },
  { id: 'evs-water-air-habits', subject: 'evs', label: '8. Water 💧, Air 🌬️ & Daily Habits 🪥', icon: Sun },
  { id: 'evs-clothes-places-games', subject: 'evs', label: '9. Clothes 👕, Neighbourhood 🏥 & Games ♟️⚽', icon: Home },
  { id: 'computer-smart-machine', subject: 'computer', label: '1. Computer, Keyboard & Mouse 🖥️', icon: Monitor },
  { id: 'computer-paint-manners', subject: 'computer', label: '2. Kid Paint Studio 🎨 & Lab Manners ✅', icon: Monitor },
  { id: 'arts-colors-music', subject: 'arts', label: '1. Color Mixing & Xylophone 🎵', icon: Palette },
  { id: 'olympiad-reasoning-gym', subject: 'arts', label: '2. Olympiad Brain Gym (Odd One Out & Analogies) 🧠', icon: Trophy },
];

// The frog number line runs 0–20, so hops can't overshoot either end.
const maxFrogHops = (start: number, op: 'add' | 'sub') => (op === 'add' ? 20 - start : start);

const WORD_PROBLEM_STORIES = [
  {
    title: '🍎 Apples in the Basket (Addition +)',
    story: 'Riya has 8 red apples 🍎 in her basket. Her mother gives her 5 more green apples 🍏. How many apples does Riya have ALTOGETHER?',
    clueWord: 'ALTOGETHER / IN ALL → means ADD (+)',
    a: 8,
    b: 5,
    op: '+' as const,
    ans: 13,
    iconA: '🍎',
    iconB: '🍏',
  },
  {
    title: '🐦 Birds on a Tree Branch (Subtraction -)',
    story: 'There were 12 little birds 🐦 sitting on a mango tree. 4 birds FLEW AWAY into the sky. How many birds are LEFT on the tree?',
    clueWord: 'FLEW AWAY / LEFT → means SUBTRACT (-)',
    a: 12,
    b: 4,
    op: '-' as const,
    ans: 8,
    iconA: '🐦',
    iconB: '🐦',
  },
  {
    title: '🎈 Birthday Party Balloons (Addition +)',
    story: 'Aarav blew up 9 blue balloons 🎈 and his sister blew up 6 yellow balloons 🎈. What is the TOTAL number of balloons?',
    clueWord: 'TOTAL → means ADD (+)',
    a: 9,
    b: 6,
    op: '+' as const,
    ans: 15,
    iconA: '🎈',
    iconB: '🎈',
  },
  {
    title: '🍪 Cookies on a Plate (Subtraction -)',
    story: 'Grandma baked 15 yummy chocolate cookies 🍪. Hungry puppy Bruno ATE 5 cookies! How many cookies REMAIN on the plate?',
    clueWord: 'ATE / REMAIN → means SUBTRACT (-)',
    a: 15,
    b: 5,
    op: '-' as const,
    ans: 10,
    iconA: '🍪',
    iconB: '🍪',
  },
];

const DIGRAPH_CARDS = [
  { digraph: 'CH', sound: 'ch (च)', words: ['Chair 🪑', 'Cheese 🧀', 'Chick 🐥', 'Chalk 🖍️'], sentence: 'The little CHick sat on a CHair.' },
  { digraph: 'SH', sound: 'sh (श)', words: ['Ship 🚢', 'Shell 🐚', 'Shoe 👟', 'Sheep 🐑'], sentence: 'She found a pink SHell near the SHip.' },
  { digraph: 'TH', sound: 'th (थ/द)', words: ['Thumb 👍', 'Three 3️⃣', 'Think 💭', 'Bath 🛁'], sentence: 'I have THree rings on my THumb.' },
  { digraph: 'WH', sound: 'wh (व्ह)', words: ['Whale 🐋', 'Wheel 🛞', 'Whistle 🪈', 'White ⚪'], sentence: 'A big blue WHale swam in the sea.' },
];

const JUMBLED_SENTENCES = [
  {
    jumbled: ['sky', 'blue.', 'is', 'The'],
    correct: 'The sky is blue.',
    rule: 'Start with CAPITAL "The" and end with a Full Stop (.)!',
  },
  {
    jumbled: ['milk.', 'drinks', 'cat', 'The'],
    correct: 'The cat drinks milk.',
    rule: 'Subject (The cat) + Action (drinks) + Object (milk.)!',
  },
  {
    jumbled: ['your', 'name?', 'is', 'What'],
    correct: 'What is your name?',
    rule: 'A question starts with a Question Word (What) and ends with a Question Mark (?)!',
  },
];

const BARAHKHADI_CONSONANTS = [
  { base: 'क', name: 'क (Ka)', forms: ['क', 'का', 'कि', 'की', 'कु', 'कू', 'के', 'कै', 'को', 'कौ', 'कं', 'कः'] },
  { base: 'ग', name: 'ग (Ga)', forms: ['ग', 'गा', 'गि', 'गी', 'गु', 'गू', 'गे', 'गै', 'गो', 'गौ', 'गं', 'गः'] },
  { base: 'च', name: 'च (Cha)', forms: ['च', 'चा', 'चि', 'ची', 'चु', 'चू', 'चे', 'चै', 'चो', 'चौ', 'चं', 'चः'] },
  { base: 'म', name: 'म (Ma)', forms: ['म', 'मा', 'मि', 'मी', 'मु', 'मू', 'मे', 'मै', 'मो', 'मौ', 'मं', 'मः'] },
  { base: 'स', name: 'स (Sa)', forms: ['स', 'सा', 'सि', 'सी', 'सु', 'सू', 'से', 'सै', 'सो', 'सौ', 'सं', 'सः'] },
];

const HINDI_VILOM_VACHAN = {
  vilom: [
    { a: 'दिन (Day) ☀️', b: 'रात (Night) 🌙' },
    { a: 'बड़ा (Big) 🐘', b: 'छोटा (Small) 🐜' },
    { a: 'ठंडा (Cold) 🍦', b: 'गरम (Hot) ☕' },
    { a: 'ऊपर (Up) ⬆️', b: 'नीचे (Down) ⬇️' },
    { a: 'हँसना (Laugh) 😄', b: 'रोना (Cry) 😢' },
    { a: 'अंदर (Inside) 📦', b: 'बाहर (Outside) 🏃' },
  ],
  vachan: [
    { ek: 'एक तारा ⭐', anek: 'अनेक तारे ⭐⭐⭐' },
    { ek: 'एक लड़का 👦', anek: 'अनेक लड़के 👦👦' },
    { ek: 'एक किताब 📖', anek: 'अनेक किताबें 📚' },
    { ek: 'एक तितली 🦋', anek: 'अनेक तितलियाँ 🦋🦋' },
    { ek: 'एक केला 🍌', anek: 'अनेक केले 🍌🍌' },
  ],
};

const CLOTHES_PLACES_GAMES = {
  clothes: [
    { season: 'Summer Clothes ☀️', items: 'Light Cotton Shirt, Frock, Shorts & Cap 👕🧢', source: 'We get COTTON from the fluffy white pods of the Cotton Plant 🌱!' },
    { season: 'Winter Clothes ❄️', items: 'Warm Woollen Sweater, Jacket, Muffler & Gloves 🧣🧤', source: 'We get soft warm WOOL from the fleece of a Sheep 🐑!' },
    { season: 'Rainy / Monsoon Clothes 🌧️', items: 'Waterproof Raincoat, Gumboots & Umbrella 🧥☔', source: 'Waterproof plastic and rubber keep us dry in the rain!' },
  ],
  places: [
    { place: 'Hospital 🏥', who: 'Doctor & Nurse 👩‍⚕️', why: 'We go here when we are sick or hurt to get medicine and care.' },
    { place: 'Post Office 🏤', who: 'Postmaster & Postman 📮', why: 'We buy stamps, postcards, and send letters and parcels here.' },
    { place: 'School 🏫', who: 'Principal & Teachers 👩‍🏫', why: 'We learn to read, write, count, paint, and make friends here!' },
    { place: 'Fire Station 🚒', who: 'Brave Firefighters 👨‍🚒', why: 'Red fire engines stay ready here to put out fires!' },
    { place: 'Park & Playground 🏞️', who: 'Children, Families & Gardener 👨‍🌾', why: 'We play on swings, slides, and walk among green trees!' },
  ],
  games: [
    { name: 'Chess & Carrom ♟️', type: 'Indoor Game (Inside Home)', benefit: 'Sharpens our brain and focus!' },
    { name: 'Ludo & Snakes-and-Ladders 🎲', type: 'Indoor Game (Inside Home)', benefit: 'Fun number counting with family!' },
    { name: 'Football & Cricket ⚽🏏', type: 'Outdoor Game (Playground)', benefit: 'Makes our legs, heart, and muscles strong!' },
    { name: 'Badminton & Cycling 🏸🚲', type: 'Outdoor Game (Park)', benefit: 'Gives us fresh air and balance!' },
  ],
};

const PAINT_TOOLS_MANNERS = {
  tools: [
    { name: 'Pencil / Brush Tool 🖌️', desc: 'Used to draw freehand lines and color pictures just like a real crayon!' },
    { name: 'Fill with Color (Bucket) 🪣', desc: 'Fills an entire closed shape with your favorite bright color in 1 click!' },
    { name: 'Eraser Tool 🧽', desc: 'Rubs out any mistake on the drawing canvas cleanly!' },
    { name: 'Shapes Tool (Circle/Rectangle) ◯▭', desc: 'Draws neat circles, squares, stars, and straight lines automatically!' },
    { name: 'Text Tool (A) 🔤', desc: 'Lets you type your name on your drawing using the Keyboard!' },
  ],
  manners: [
    { rule: 'Sit straight at arm’s length from the monitor', good: true, icon: '✅🪑' },
    { rule: 'Remove shoes or keep the computer lab clean & dust-free', good: true, icon: '✅✨' },
    { rule: 'Press keyboard keys gently and move the mouse on a mouse pad', good: true, icon: '✅⌨️' },
    { rule: 'Never eat food or spill water/juice near the computer!', good: false, icon: '❌🥤' },
    { rule: 'Never pull electric wires or touch plugs with wet hands!', good: false, icon: '❌🔌' },
  ],
};

const OLYMPIAD_PUZZLES = [
  {
    category: 'Odd One Out (Find the Different One)',
    question: 'Look at the 4 items below. Three belong to the same family, and ONE is different. Tap the Odd One Out!',
    options: ['🍎 Apple', '🍌 Banana', '🚗 Car', '🥭 Mango'],
    correct: 2,
    explanation: 'Apple, Banana, and Mango are FRUITS we eat, while a Car 🚗 is a vehicle!',
  },
  {
    category: 'Picture Analogy (Pair Matching)',
    question: 'Bird 🐦 lives in a Nest 🪺. In the same way, a Lion 🦁 lives in a ___?',
    options: ['Kennel 🏠', 'Den 🪨', 'Stable 🐴', 'Aquarium 🐠'],
    correct: 1,
    explanation: 'A Bird lives in a Nest, and a Lion lives in a Den!',
  },
  {
    category: 'Shape Counting (Visual Geometry)',
    question: 'A toy snowman ⛄ is drawn using 1 small circle for the head, 1 big circle for the body, and 2 tiny circles for eyes. How many CIRCLES in total?',
    options: ['2 Circles', '3 Circles', '4 Circles', '6 Circles'],
    correct: 2,
    explanation: '1 (head) + 1 (body) + 2 (eyes) = 4 Circles in total!',
  },
  {
    category: 'Number Pattern Detective (IMO Olympiad)',
    question: 'Find the missing number in the jumping pattern: 5, 10, 15, ___, 25',
    options: ['16', '20', '22', '30'],
    correct: 1,
    explanation: 'We are skip counting by 5s: 5, 10, 15, 20, 25!',
  },
];

const YOGA_STRETCHES = [
  { name: '🌳 Tall Tree Pose (Vrikshasana)', action: 'Stand tall like a green mango tree and stretch both arms high toward the sun!' },
  { name: '🦋 Butterfly Wings (Titli Asana)', action: 'Sit comfortably, join your feet, and gently flap your knees like a colorful butterfly!' },
  { name: '🦁 Brave Lion Breath (Simhasana)', action: 'Take a deep breath in through your nose, open your mouth wide, and let out a gentle HAAA!' },
  { name: '⭐ Twinkling Star Stretch', action: 'Spread your arms wide like a shining star and wiggle your 10 fingers!' },
];

const ORDINAL_RUNNERS = [
  { pos: 1, ord: '1st', word: 'First', animal: 'Cheetah 🐆', fact: '1st (First) is at the very front of the race!' },
  { pos: 2, ord: '2nd', word: 'Second', animal: 'Horse 🐎', fact: '2nd (Second) comes right after 1st!' },
  { pos: 3, ord: '3rd', word: 'Third', animal: 'Rabbit 🐇', fact: '3rd (Third) wins the bronze medal!' },
  { pos: 4, ord: '4th', word: 'Fourth', animal: 'Deer 🦌', fact: '4th (Fourth) comes after 3rd!' },
  { pos: 5, ord: '5th', word: 'Fifth', animal: 'Dog 🐶', fact: '5th (Fifth) is right in the middle of 10!' },
  { pos: 6, ord: '6th', word: 'Sixth', animal: 'Cat 🐱', fact: '6th (Sixth) comes after 5th!' },
  { pos: 7, ord: '7th', word: 'Seventh', animal: 'Elephant 🐘', fact: '7th (Seventh) is marching steadily!' },
  { pos: 8, ord: '8th', word: 'Eighth', animal: 'Panda 🐼', fact: '8th (Eighth) comes before 9th!' },
  { pos: 9, ord: '9th', word: 'Ninth', animal: 'Duck 🦆', fact: '9th (Ninth) is just before 10th!' },
  { pos: 10, ord: '10th', word: 'Tenth', animal: 'Tortoise 🐢', fact: '10th (Tenth) never gives up and finishes the race!' },
];

const PRONOUN_CARDS = [
  {
    noun: 'Aarav (A Boy) 👦',
    pronoun: 'HE',
    sentence: 'Aarav is playing football. → HE is playing football.',
    rule: 'We use HE for one boy, man, father, brother, or uncle.',
  },
  {
    noun: 'Riya (A Girl) 👧',
    pronoun: 'SHE',
    sentence: 'Riya is reading a story book. → SHE is reading a story book.',
    rule: 'We use SHE for one girl, woman, mother, sister, or aunt.',
  },
  {
    noun: 'A Red Ball / A Puppy ⚽🐶',
    pronoun: 'IT',
    sentence: 'The ball is round. → IT is round.',
    rule: 'We use IT for one animal, bird, tree, or non-living thing.',
  },
  {
    noun: 'Riya, Aarav & Friends 👧👦🧒',
    pronoun: 'THEY',
    sentence: 'The children are happy. → THEY are happy.',
    rule: 'We use THEY when talking about more than one person, animal, or thing.',
  },
  {
    noun: 'My Friend and I (Me + You) 🙌',
    pronoun: 'WE',
    sentence: 'My sister and I study in Class 1. → WE study in Class 1.',
    rule: 'We use WE when talking about ourselves together with others.',
  },
];

const ADJECTIVE_ITEMS = [
  { adj: 'RED & SWEET', noun: 'Apple 🍎', type: 'Color & Taste', sentence: 'This is a RED and SWEET apple.' },
  { adj: 'TALL', noun: 'Giraffe 🦒', type: 'Size / Height', sentence: 'The giraffe has a TALL neck.' },
  { adj: 'WARM', noun: 'Milk Glass 🥛♨️', type: 'Touch / Feel', sentence: 'Grandma gave me WARM milk.' },
  { adj: 'COLD', noun: 'Ice-Cream 🍦❄️', type: 'Touch / Feel', sentence: 'Ice-cream is COLD and yummy.' },
  { adj: 'THREE', noun: 'Balloons 🎈🎈🎈', type: 'Number (How Many)', sentence: 'I have THREE colorful balloons.' },
  { adj: 'HAPPY', noun: 'Puppy 🐶', type: 'Feeling', sentence: 'The HAPPY puppy wagged its tail.' },
];

const HINDI_SHABD_TRAIN = {
  two: [
    { parts: ['घ', 'र'], word: 'घर', eng: 'House 🏠', sentence: 'चल, अब घर चल।' },
    { parts: ['ज', 'ल'], word: 'जल', eng: 'Water 💧', sentence: 'साफ़ जल पी।' },
    { parts: ['फ', 'ल'], word: 'फल', eng: 'Fruits 🍎🍌', sentence: 'ताज़ा फल चख।' },
    { parts: ['ब', 'स'], word: 'बस', eng: 'Bus 🚌', sentence: 'बस पर चढ़।' },
    { parts: ['न', 'ल'], word: 'नल', eng: 'Water Tap 🚰', sentence: 'नल बंद रख।' },
  ],
  three: [
    { parts: ['क', 'म', 'ल'], word: 'कमल', eng: 'Lotus 🪷', sentence: 'तालाब में कमल खिला है।' },
    { parts: ['म', 'ट', 'र'], word: 'मटर', eng: 'Green Peas 🫛', sentence: 'हरी मटर चख।' },
    { parts: ['ब', 'त', 'ख'], word: 'बतख', eng: 'Duck 🦆', sentence: 'बतख जल में तैरती है।' },
    { parts: ['स', 'ड़', 'क'], word: 'सड़क', eng: 'Road 🛣️', sentence: 'सड़क पर मत दौड़।' },
    { parts: ['श', 'ह', 'द'], word: 'शहद', eng: 'Honey 🍯', sentence: 'मीठा शहद चख।' },
  ],
  four: [
    { parts: ['अ', 'ज', 'ग', 'र'], word: 'अजगर', eng: 'Python 🐍', sentence: 'पेड़ पर बड़ा अजगर है।' },
    { parts: ['श', 'र', 'ब', 'त'], word: 'शरबत', eng: 'Sweet Drink 🍹', sentence: 'ठंडा शरबत पी।' },
    { parts: ['थ', 'र', 'म', 'स'], word: 'थरमस', eng: 'Thermos Flask 🍼', sentence: 'थरमस इधर रख।' },
    { parts: ['ब', 'र', 'ग', 'द'], word: 'बरगद', eng: 'Banyan Tree 🌳', sentence: 'बरगद हमारा राष्ट्रीय पेड़ है।' },
  ],
};

const WATER_AIR_HABITS = {
  waterSources: [
    { name: 'Rain (Main Source) 🌧️', use: 'Fills rivers, lakes, ponds, and underground wells!' },
    { name: 'River & Lake 🏞️', use: 'Fresh water flows from mountains into rivers and lakes.' },
    { name: 'Home Tap & Filter 🚰', use: 'Always drink clean, filtered or boiled water, and turn off taps to save every drop!' },
  ],
  waterUses: ['Drinking 🥤', 'Cooking Food 🍲', 'Bathing & Brushing 🚿', 'Washing Clothes 👕', 'Watering Plants 🌱'],
  airFacts: [
    { title: 'We Cannot See Air, But We Feel It! 🌬️', detail: 'Air is all around us. Moving air is called WIND. A gentle wind is a BREEZE; a strong wind is a STORM!' },
    { title: 'All Living Things Breathe Air 🫁', detail: 'People, animals, birds, and plants need fresh air to breathe and stay alive.' },
    { title: 'Air Takes Up Space & Has Weight 🎈', detail: 'When we blow air into a flat balloon or football, it becomes big and round!' },
  ],
  dailyHabits: [
    { time: '6:30 AM 🌅', habit: 'Wake up early & say Good Morning to parents', icon: '🌞' },
    { time: '7:00 AM 🪥', habit: 'Brush teeth twice a day (Morning & Night) and take a bath', icon: '🚿' },
    { time: '8:00 AM 🥛', habit: 'Wash hands with soap before & after eating healthy breakfast', icon: '🍎' },
    { time: '9:00 AM 🏫', habit: 'Go to school on time, listen to teachers & share with friends', icon: '🎒' },
    { time: '5:00 PM ⚽', habit: 'Play outdoor games in the park and water garden plants', icon: '🌱' },
    { time: '9:00 PM 🌙', habit: 'Brush teeth at night, pack school bag & sleep on time', icon: '🛌' },
  ],
};

const NOUN_SORT_ITEMS: {
  word: string;
  icon: string;
  category: 'Person' | 'Place' | 'Animal' | 'Thing';
  hint: string;
}[] = [
  { word: 'Teacher', icon: '👩‍🏫', category: 'Person', hint: 'A Teacher is a PERSON who teaches us!' },
  { word: 'School', icon: '🏫', category: 'Place', hint: 'A School is a PLACE where we go to study!' },
  { word: 'Tiger', icon: '🐯', category: 'Animal', hint: 'A Tiger is an ANIMAL that lives in the forest!' },
  { word: 'Pencil', icon: '✏️', category: 'Thing', hint: 'A Pencil is a non-living THING we write with!' },
  { word: 'Doctor', icon: '👩‍⚕️', category: 'Person', hint: 'A Doctor is a PERSON who treats sick people!' },
  { word: 'Park', icon: '🏞️', category: 'Place', hint: 'A Park is a PLACE where children play!' },
  { word: 'Elephant', icon: '🐘', category: 'Animal', hint: 'An Elephant is a big ANIMAL with a trunk!' },
  { word: 'Ball', icon: '⚽', category: 'Thing', hint: 'A Ball is a THING we kick and play with!' },
];

const HOUSE_TYPES = [
  {
    id: 'pucca',
    name: 'Pucca House (Strong Brick House) 🏢',
    materials: 'Bricks, Cement, Steel, Wood & Glass',
    where: 'Towns and Cities',
    fact: 'A Pucca house is very strong and permanent. It protects us from heavy rain, heat, and storms!',
  },
  {
    id: 'kutcha',
    name: 'Kutcha House (Mud & Straw Hut) 🛖',
    materials: 'Mud, Bamboo, Dry Leaves & Straw Thatch',
    where: 'Villages',
    fact: 'A Kutcha hut stays cool in summer, but it is not as strong as a brick Pucca house.',
  },
  {
    id: 'igloo',
    name: 'Igloo (Snow House) ❄️',
    materials: 'Blocks of Hard White Snow & Ice',
    where: 'Very Cold Polar Lands',
    fact: 'An Igloo has a round dome shape that traps warmth inside even when it is freezing outside!',
  },
  {
    id: 'houseboat',
    name: 'Houseboat (Floating House) 🛶',
    materials: 'Carved Wood Floating on Water',
    where: 'Dal Lake (Kashmir) & Backwaters (Kerala)',
    fact: 'A Houseboat is a special wooden house that floats on calm lakes and rivers!',
  },
  {
    id: 'tent',
    name: 'Tent (Temporary Cloth House) ⛺',
    materials: 'Waterproof Canvas Cloth, Ropes & Poles',
    where: 'Camps, Deserts & Mountains',
    fact: 'A Tent can be folded and carried in a backpack by campers, soldiers, and mountaineers!',
  },
];

const HEALTHY_VS_JUNK_FOODS = [
  { name: 'Fresh Milk 🥛', type: 'healthy', benefit: 'Makes our bones and teeth strong!' },
  { name: 'Apple & Banana 🍎🍌', type: 'healthy', benefit: 'Protective foods full of vitamins!' },
  { name: 'Dal, Rice & Roti 🍛', type: 'healthy', benefit: 'Gives us energy to study and play!' },
  { name: 'Green Spinach 🥬', type: 'healthy', benefit: 'Keeps our eyes and blood healthy!' },
  { name: 'Fizzy Soda Can 🥤', type: 'junk', benefit: 'Too much sugar—bad for teeth! Drink clean water or milk instead.' },
  { name: 'Oily Chips Packet 🍟', type: 'junk', benefit: 'Salty and fried—eat only rarely, not every day!' },
];

const ARCADE_MISSIONS = [
  {
    prompt: '🔊 Number Bond Mission: Which number joins with 6 to make 10? (6 + ? = 10)',
    options: ['2', '4', '7', '9'],
    correct: 1,
    rewardMsg: 'Super! 6 plus 4 makes 10!',
  },
  {
    prompt: '🔊 English Noun Mission: Is “SCHOOL 🏫” a Person, Place, Animal, or Thing?',
    options: ['Person 👧', 'Place 🏫', 'Animal 🐶', 'Thing ⚽'],
    correct: 1,
    rewardMsg: 'Awesome! A School is a PLACE where we learn!',
  },
  {
    prompt: '🔊 Hindi Varnamala Mission: “आ से ___” — Which sweet yellow fruit starts with आ?',
    options: ['अनार', 'आम', 'उल्लू', 'कमल'],
    correct: 1,
    rewardMsg: 'शाबाश! आ से आम (Mango)!',
  },
  {
    prompt: '🔊 EVS Animal Baby Mission: What is the baby (young one) of a DOG 🐶 called?',
    options: ['Kitten 🐱', 'Puppy 🐶', 'Calf 🐄', 'Cub 🦁'],
    correct: 1,
    rewardMsg: 'Wonderful! A baby dog is called a Puppy!',
  },
  {
    prompt: '🔊 Computer Whiz Mission: Which key is the LONGEST key on a computer keyboard?',
    options: ['Enter Key ↵', 'Spacebar ━━━', 'Letter A', 'Number 1'],
    correct: 1,
    rewardMsg: 'Spot on! The Spacebar is the longest key on the keyboard!',
  },
  {
    prompt: '🔊 Color Mixing Mission: What Secondary Color do you get when you mix BLUE 🔵 + YELLOW 🟡?',
    options: ['Orange 🟠', 'Green 🟢', 'Purple 🟣', 'Red 🔴'],
    correct: 1,
    rewardMsg: 'Brilliant! Blue and Yellow mix to make Green!',
  },
];

const SPEAK_PRACTICE_WORDS = [
  { word: 'Good Morning', icon: '🌅', hint: 'Say: “Good Morning”' },
  { word: 'Apple', icon: '🍎', hint: 'Say: “Apple”' },
  { word: 'Thank You', icon: '🙏', hint: 'Say: “Thank You”' },
  { word: 'Peacock', icon: '🦚', hint: 'Say: “Peacock”' },
  { word: 'Twenty', icon: '2️⃣0️⃣', hint: 'Say: “Twenty”' },
];

const DAYS_OF_WEEK = [
  { day: 'Monday', order: '1st Day of School Week', activity: 'Fresh start to school! 🎒' },
  { day: 'Tuesday', order: '2nd Day of the Week', activity: 'Story & Art day! 🎨' },
  { day: 'Wednesday', order: '3rd Day of the Week', activity: 'Games & Playground fun! ⚽' },
  { day: 'Thursday', order: '4th Day of the Week', activity: 'Numbers & Abacus day! 🧮' },
  { day: 'Friday', order: '5th Day of the Week', activity: 'Music & Rhymes day! 🎵' },
  { day: 'Saturday', order: '6th Day (Weekend)', activity: 'Family park & hobby time! 🚲' },
  { day: 'Sunday', order: '7th Day (Holiday!)', activity: 'Fun holiday with family & grandparents! 🏡' },
];

const MONTHS_OF_YEAR = [
  { m: 'January', days: 31, note: '1st Month • Winter & Republic Day (26 Jan) 🇮🇳' },
  { m: 'February', days: 28, note: '2nd Month • Shortest month (28/29 days) 🌸' },
  { m: 'March', days: 31, note: '3rd Month • Spring & Festival of Colors (Holi) 🎨' },
  { m: 'April', days: 30, note: '4th Month • New Class 1 session begins! 📚' },
  { m: 'May', days: 31, note: '5th Month • Sunny Summer & Mango season 🥭' },
  { m: 'June', days: 30, note: '6th Month • Summer vacation & first monsoon clouds ⛅' },
  { m: 'July', days: 31, note: '7th Month • Monsoon rains & paper boats 🌧️' },
  { m: 'August', days: 31, note: '8th Month • Independence Day (15 Aug) 🇮🇳' },
  { m: 'September', days: 30, note: '9th Month • Teachers’ Day (5 Sep) 👩‍🏫' },
  { m: 'October', days: 31, note: '10th Month • Gandhi Jayanti & Festive season 🪔' },
  { m: 'November', days: 30, note: '11th Month • Children’s Day (14 Nov) 🎈' },
  { m: 'December', days: 31, note: '12th Month • Cool Winter & Christmas (25 Dec) 🎄' },
];

const MRIDANG_STORIES = [
  {
    id: 'two-little-hands',
    unit: 'Mridang Unit 1 • Ch 1 (Poem)',
    title: 'Two Little Hands to Clap, Clap, Clap! 👏',
    icon: '🙌',
    lines: [
      'Two little hands go clap, clap, clap!',
      'Two little legs go tap, tap, tap!',
      'Two little eyes are open wide,',
      'One little head goes side to side!',
    ],
    moral: 'Our body parts work together to help us play, clap, walk, and see!',
  },
  {
    id: 'greetings',
    unit: 'Mridang Unit 1 • Ch 2 (Greetings)',
    title: 'Polite Greetings Throughout the Day 🌅',
    icon: '🌞',
    lines: [
      'When the sun rises in the morning, we say: GOOD MORNING!',
      'At 12 o’clock noon, we say: GOOD AFTERNOON!',
      'When we play in the park at sunset, we say: GOOD EVENING!',
      'Before going to sleep in bed with stars in the sky, we say: GOOD NIGHT!',
    ],
    moral: 'Greeting elders, teachers, and friends with a warm smile is a wonderful habit.',
  },
  {
    id: 'cap-seller',
    unit: 'Mridang Unit 2 • Ch 4 (Classic Story)',
    title: 'The Cap-Seller and the Monkeys 🧢🐒',
    icon: '🐒',
    lines: [
      'A cap-seller was sleeping under a shady tree with a basket of colorful caps.',
      'Naughty monkeys on the tree came down and wore all his caps!',
      'The clever cap-seller waved his hands—the monkeys copied him!',
      'He threw his own cap on the ground, and all the monkeys threw the caps back into his basket!',
    ],
    moral: 'Clever thinking and staying calm solves every problem!',
  },
  {
    id: 'anandi-rainbow',
    unit: 'Mridang Unit 4 • Ch 9 (Story)',
    title: 'Anandi’s Rainbow 🌈',
    icon: '🌈',
    lines: [
      'Anandi woke up and saw a huge, bright Rainbow across the clear blue sky!',
      'She took her paintbrush and painted the garden flowers with the 7 colors of the rainbow:',
      'Violet, Indigo, Blue, Green, Yellow, Orange, and Red (VIBGYOR)!',
      'She left the bright Yellow color for the warm, smiling Sun!',
    ],
    moral: 'Nature is full of vibrant colors—always keep the Sun bright and warm!',
  },
];

const HINDI_MATRAS = [
  { matra: 'ा (आ की मात्रा)', base: 'क', result: 'का', word: 'काला / कार 🚗', speech: 'क में आ की मात्रा का, कार' },
  { matra: 'ि (छोटी इ की मात्रा)', base: 'क', result: 'कि', word: 'किताब 📖', speech: 'क में छोटी इ की मात्रा कि, किताब' },
  { matra: 'ी (बड़ी ई की मात्रा)', base: 'म', result: 'मी', word: 'मीना 👧', speech: 'म में बड़ी ई की मात्रा मी, मीना' },
  { matra: 'ु (छोटा उ की मात्रा)', base: 'ग', result: 'गु', word: 'गुलाब 🌹', speech: 'ग में छोटा उ की मात्रा गु, गुलाब' },
  { matra: 'ू (बड़ा ऊ की मात्रा)', base: 'च', result: 'चू', word: 'चूहा 🐭', speech: 'च में बड़ा ऊ की मात्रा चू, चूहा' },
  { matra: 'े (ए की मात्रा)', base: 'र', result: 'रे', word: 'रेलगाड़ी 🚂', speech: 'र में ए की मात्रा रे, रेलगाड़ी' },
  { matra: 'ो (ओ की मात्रा)', base: 'म', result: 'मो', word: 'मोर 🦚', speech: 'म में ओ की मात्रा मो, मोर' },
];

const HINDI_GINTI = [
  { num: '१', eng: 1, word: 'एक (Ek)', icons: '🍎' },
  { num: '२', eng: 2, word: 'दो (Do)', icons: '🍎🍎' },
  { num: '३', eng: 3, word: 'तीन (Teen)', icons: '🍎🍎🍎' },
  { num: '४', eng: 4, word: 'चार (Chaar)', icons: '🍎🍎🍎🍎' },
  { num: '५', eng: 5, word: 'पाँच (Paanch)', icons: '⭐⭐⭐⭐⭐' },
  { num: '६', eng: 6, word: 'छह (Chhah)', icons: '⭐⭐⭐⭐⭐⭐' },
  { num: '७', eng: 7, word: 'सात (Saat)', icons: '🌈 (७ रंग)' },
  { num: '८', eng: 8, word: 'आठ (Aath)', icons: '🐙 (८ भुजाएँ)' },
  { num: '९', eng: 9, word: 'नौ (Nau)', icons: '⭐⭐⭐⭐⭐⭐⭐⭐⭐' },
  { num: '१०', eng: 10, word: 'दस (Das)', icons: '👐 (१० उँगलियाँ)' },
];

const SARANGI_POEMS = [
  {
    title: 'मछली जल की रानी है 🐟 (Fish is Queen of Water)',
    unit: 'NCERT Sarangi & Popular Balgeet',
    lines: [
      'मछली जल की रानी है, जीवन उसका पानी है!',
      'हाथ लगाओ तो डर जाएगी, बाहर निकालो तो मर जाएगी!',
      'पानी में डालो तो तैर जाएगी!',
    ],
  },
  {
    title: 'चंदा मामा दूर के 🌙 (Chanda Mama)',
    unit: 'NCERT Sarangi Unit 5 • चाँद का बच्चा',
    lines: [
      'चंदा मामा दूर के, पुए पकाएँ बूर के!',
      'आप खाएँ थाली में, मुन्ने को दें प्याली में!',
    ],
  },
  {
    title: 'मीना का परिवार 👨‍👩‍👧‍👦 (Meena’s Family)',
    unit: 'NCERT Sarangi Unit 1 • पाठ 1',
    lines: [
      'मीना के परिवार में दादा, दादी, माता, पिता, चाचा और छोटा भाई दिवाकर हैं!',
      'सब मिलजुल कर प्यार से रहते हैं और पेड़-पौधों में पानी देते हैं।',
    ],
  },
];

const ANIMAL_FAMILIES = [
  { animal: 'Lion 🦁', baby: 'Cub', home: 'Den', sound: 'Roars!' },
  { animal: 'Dog 🐶', baby: 'Puppy', home: 'Kennel', sound: 'Barks (Bow-Wow)!' },
  { animal: 'Cat 🐱', baby: 'Kitten', home: 'Home / Basket', sound: 'Meows!' },
  { animal: 'Cow 🐄', baby: 'Calf', home: 'Shed', sound: 'Moos!' },
  { animal: 'Horse 🐎', baby: 'Foal / Colt', home: 'Stable', sound: 'Neighs!' },
  { animal: 'Bird 🐦', baby: 'Chick / Nestling', home: 'Nest on Tree', sound: 'Chirps!' },
];

const COMMUNITY_HELPERS = [
  { role: 'Doctor 👩‍⚕️', place: 'Hospital 🏥', tool: 'Stethoscope 🩺 & Medicine', job: 'Treats sick people and keeps us healthy!' },
  { role: 'Teacher 👩‍🏫', place: 'School 🏫', tool: 'Blackboard & Books 📚', job: 'Teaches us reading, math, and good values!' },
  { role: 'Firefighter 👨‍🚒', place: 'Fire Station 🚒', tool: 'Red Fire Engine & Water Hose', job: 'Bravely puts out fires and rescues people!' },
  { role: 'Postman 📮', place: 'Post Office 🏤', tool: 'Letter Bag & Parcels ✉️', job: 'Delivers letters, cards, and parcels to our home!' },
  { role: 'Farmer 👨‍🌾', place: 'Green Farm 🌾', tool: 'Tractor & Plough 🚜', job: 'Grows wheat, rice, fruits, and vegetables for everyone!' },
  { role: 'Police Officer 👮', place: 'Police Station 🚓', tool: 'Patrol Car & Whistle', job: 'Keeps our neighborhood safe and helps lost children!' },
];

const XYLOPHONE_KEYS = [
  { sargam: 'सा (Sa)', western: 'C4', freq: 261.63, color: 'bg-rose-500 border-rose-300' },
  { sargam: 'रे (Re)', western: 'D4', freq: 293.66, color: 'bg-orange-500 border-orange-300' },
  { sargam: 'ग (Ga)', western: 'E4', freq: 329.63, color: 'bg-amber-400 border-amber-200 text-slate-950' },
  { sargam: 'म (Ma)', western: 'F4', freq: 349.23, color: 'bg-emerald-500 border-emerald-300' },
  { sargam: 'प (Pa)', western: 'G4', freq: 392.0, color: 'bg-cyan-500 border-cyan-300 text-slate-950' },
  { sargam: 'ध (Dha)', western: 'A4', freq: 440.0, color: 'bg-blue-500 border-blue-300' },
  { sargam: 'नी (Ni)', western: 'B4', freq: 493.88, color: 'bg-indigo-500 border-indigo-300' },
  { sargam: 'सां (High Sa)', western: 'C5', freq: 523.25, color: 'bg-fuchsia-500 border-fuchsia-300' },
];

const HINDI_SWAR = [
  { letter: 'अ', roman: 'a', word: 'अ से अनानास', eng: 'Pineapple', icon: '🍍', speech: 'अ से अनानास' },
  { letter: 'आ', roman: 'aa', word: 'आ से आम', eng: 'Mango', icon: '🥭', speech: 'आ से आम' },
  { letter: 'इ', roman: 'i', word: 'इ से इमली', eng: 'Tamarind', icon: '🫘', speech: 'इ से इमली' },
  { letter: 'ई', roman: 'ee', word: 'ई से ईख', eng: 'Sugarcane', icon: '🎋', speech: 'ई से ईख' },
  { letter: 'उ', roman: 'u', word: 'उ से उल्लू', eng: 'Owl', icon: '🦉', speech: 'उ से उल्लू' },
  { letter: 'ऊ', roman: 'oo', word: 'ऊ से ऊन', eng: 'Wool', icon: '🧶', speech: 'ऊ से ऊन' },
  { letter: 'ऋ', roman: 'ri', word: 'ऋ से ऋषि', eng: 'Sage', icon: '🧘', speech: 'ऋ से ऋषि' },
  { letter: 'ए', roman: 'e', word: 'ए से एड़ी', eng: 'Heel', icon: '🦶', speech: 'ए से एड़ी' },
  { letter: 'ऐ', roman: 'ai', word: 'ऐ से ऐनक', eng: 'Spectacles', icon: '👓', speech: 'ऐ से ऐनक' },
  { letter: 'ओ', roman: 'o', word: 'ओ से ओखली', eng: 'Mortar', icon: '🥣', speech: 'ओ से ओखली' },
  { letter: 'औ', roman: 'au', word: 'औ से औरत', eng: 'Woman', icon: '👩', speech: 'औ से औरत' },
  { letter: 'अं', roman: 'am', word: 'अं से अंगूर', eng: 'Grapes', icon: '🍇', speech: 'अं से अंगूर' },
  { letter: 'अः', roman: 'aha', word: 'अः खाली!', eng: 'Clap Hands!', icon: '👏', speech: 'अः खाली, बच्चों बजाओ ताली!' },
];

const HINDI_VYANJAN = [
  { letter: 'क', roman: 'ka', word: 'क से कबूतर', eng: 'Pigeon', icon: '🕊️', speech: 'क से कबूतर' },
  { letter: 'ख', roman: 'kha', word: 'ख से खरगोश', eng: 'Rabbit', icon: '🐰', speech: 'ख से खरगोश' },
  { letter: 'ग', roman: 'ga', word: 'ग से गमला', eng: 'Flower Pot', icon: '🪴', speech: 'ग से गमला' },
  { letter: 'घ', roman: 'gha', word: 'घ से घड़ी', eng: 'Clock / Watch', icon: '⌚', speech: 'घ से घड़ी' },
  { letter: 'च', roman: 'cha', word: 'च से चम्मच', eng: 'Spoon', icon: '🥄', speech: 'च से चम्मच' },
  { letter: 'छ', roman: 'chha', word: 'छ से छतरी', eng: 'Umbrella', icon: '☂️', speech: 'छ से छतरी' },
  { letter: 'ज', roman: 'ja', word: 'ज से जहाज', eng: 'Ship', icon: '🚢', speech: 'ज से जहाज' },
  { letter: 'झ', roman: 'jha', word: 'झ से झंडा', eng: 'National Flag', icon: '🇮🇳', speech: 'झ से झंडा' },
  { letter: 'ट', roman: 'ta', word: 'ट से टमाटर', eng: 'Tomato', icon: '🍅', speech: 'ट से टमाटर' },
  { letter: 'प', roman: 'pa', word: 'प से पतंग', eng: 'Kite', icon: '🪁', speech: 'प से पतंग' },
  { letter: 'म', roman: 'ma', word: 'म से मछली', eng: 'Fish', icon: '🐟', speech: 'म से मछली' },
  { letter: 'कमल', roman: 'ka-ma-la', word: 'क + म + ल = कमल', eng: 'Lotus (2/3-Letter Word)', icon: '🪷', speech: 'क म ल, कमल' },
];

const COMPUTER_PARTS = [
  {
    id: 'monitor',
    name: 'Monitor (Screen) 🖥️',
    role: 'Shows cartoons, pictures, words, and games just like a TV screen!',
    type: 'Output Device',
    tip: 'Sit at arm’s length from the monitor to protect your eyes.',
  },
  {
    id: 'cpu',
    name: 'CPU (Central Processing Unit) 🧠',
    role: 'The BRAIN of the computer! It thinks, calculates, and remembers everything.',
    type: 'Processing Brain',
    tip: 'Without the CPU box, a computer cannot think or work.',
  },
  {
    id: 'keyboard',
    name: 'Keyboard (Typing Keys) ⌨️',
    role: 'Has Alphabet keys (A–Z), Number keys (0–9), and a long Spacebar to type words!',
    type: 'Input Device',
    tip: 'Press the keys gently—never bang on the keyboard.',
  },
  {
    id: 'mouse',
    name: 'Mouse (Point & Click) 🖱️',
    role: 'Moves the little arrow (pointer) on the screen to click and draw pictures!',
    type: 'Pointing Device',
    tip: 'Keep the mouse on a smooth mouse-pad.',
  },
  {
    id: 'speakers',
    name: 'Speakers (Sound) 🔊',
    role: 'Helps us hear music, rhymes, and voice lessons from the computer.',
    type: 'Audio Output',
    tip: 'Keep the volume pleasant so it does not hurt your ears.',
  },
  {
    id: 'printer',
    name: 'Printer (Paper Copy) 🖨️',
    role: 'Prints our colorful drawings and worksheets onto paper!',
    type: 'Paper Output',
    tip: 'Save paper—only print when needed!',
  },
];

const NATIONAL_SYMBOLS = [
  {
    id: 'flag',
    title: 'National Flag: Tiranga 🇮🇳',
    fact: 'Has 3 bands: Saffron (Courage) at top, White (Peace) in middle with 24-spoke Navy Blue Ashoka Chakra, and Green (Growth) at bottom!',
    icon: '🇮🇳',
  },
  {
    id: 'bird',
    title: 'National Bird: Peacock 🦚',
    fact: 'The colorful Indian Peacock dances joyfully when monsoon rain clouds arrive!',
    icon: '🦚',
  },
  {
    id: 'animal',
    title: 'National Animal: Royal Bengal Tiger 🐯',
    fact: 'Strong, graceful, and striped in yellow and black! It lives in forests.',
    icon: '🐯',
  },
  {
    id: 'flower',
    title: 'National Flower: Lotus 🪷',
    fact: 'Blooms pink and pure on water ponds!',
    icon: '🪷',
  },
  {
    id: 'fruit',
    title: 'National Fruit: Mango 🥭',
    fact: 'Sweet, juicy yellow mango is called the King of Fruits!',
    icon: '🥭',
  },
];

const GOLDEN_MANNER_WORDS = [
  {
    word: 'PLEASE 🙏',
    situation: 'When you ask someone for a pencil, water, or help.',
    sentence: 'May I PLEASE have a glass of water?',
  },
  {
    word: 'THANK YOU 😊',
    situation: 'When someone gives you a gift, food, or helps you.',
    sentence: 'THANK YOU for sharing your crayons with me!',
  },
  {
    word: 'SORRY ❤️',
    situation: 'When you make a mistake or accidentally bump into someone.',
    sentence: 'I am SORRY for dropping your book.',
  },
  {
    word: 'EXCUSE ME 🙋',
    situation: 'When you sneeze, cough, or politely want someone’s attention.',
    sentence: 'EXCUSE ME teacher, may I ask a question?',
  },
  {
    word: 'YOU ARE WELCOME 🌟',
    situation: 'When someone says Thank You to you!',
    sentence: 'YOU ARE WELCOME, my friend!',
  },
];

const ONES_WORDS = [
  'Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
  'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
  'Seventeen', 'Eighteen', 'Nineteen',
];
const TENS_WORDS = [
  '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety',
];

export function numberToWords(n: number): string {
  if (n < 0) return 'Zero';
  if (n < 20) return ONES_WORDS[n];
  if (n === 100) return 'One Hundred';
  const t = Math.floor(n / 10);
  const o = n % 10;
  return o === 0 ? TENS_WORDS[t] : `${TENS_WORDS[t]}-${ONES_WORDS[o]}`;
}

const CVC_WORDS = [
  { word: 'CAT', c1: 'C', vowel: 'A', c2: 'T', icon: '🐱', hint: 'A furry pet that says Meow!' },
  { word: 'HEN', c1: 'H', vowel: 'E', c2: 'N', icon: '🐔', hint: 'A farm bird that gives us eggs!' },
  { word: 'PIG', c1: 'P', vowel: 'I', c2: 'G', icon: '🐷', hint: 'A pink farm animal that says Oink!' },
  { word: 'DOG', c1: 'D', vowel: 'O', c2: 'G', icon: '🐶', hint: 'A loyal pet that barks and guards our home!' },
  { word: 'SUN', c1: 'S', vowel: 'U', c2: 'N', icon: '☀️', hint: 'Shines brightly in the day sky!' },
  { word: 'BUS', c1: 'B', vowel: 'U', c2: 'S', icon: '🚌', hint: 'Takes children to school!' },
];

const TOY_SHOP_ITEMS = [
  { id: 'ball', name: 'Colorful Ball', icon: '⚽', price: 12 },
  { id: 'car', name: 'Red Toy Car', icon: '🚗', price: 18 },
  { id: 'teddy', name: 'Teddy Bear', icon: '🧸', price: 27 },
  { id: 'crayons', name: 'Crayon Box', icon: '🖍️', price: 35 },
];

const SENSE_ORGANS = [
  {
    id: 'eyes',
    organ: 'Eyes (Sense of Sight) 👀',
    action: 'We SEE shapes, colors, big/small, and light with our eyes.',
    stimulus: '🌈 Rainbow & Storybook',
    careTip: 'Read in good light and wash your eyes with clean cold water.',
  },
  {
    id: 'ears',
    organ: 'Ears (Sense of Hearing) 👂',
    action: 'We HEAR loud, soft, pleasant music, and bird sounds with our ears.',
    stimulus: '🔔 Ringing School Bell & Birds Chirping',
    careTip: 'Never put sharp objects inside your ears; avoid very loud noises.',
  },
  {
    id: 'nose',
    organ: 'Nose (Sense of Smell) 👃',
    action: 'We SMELL pleasant fragrances and foul odors, and breathe through our nose.',
    stimulus: '🌹 Fresh Rose & Hot Soup',
    careTip: 'Always use a clean handkerchief when sneezing or blowing your nose.',
  },
  {
    id: 'tongue',
    organ: 'Tongue (Sense of Taste) 👅',
    action: 'Taste buds help us TASTE Sweet, Salty, Sour, and Bitter foods; helps us speak!',
    stimulus: '🥭 Sweet Mango vs. 🍋 Sour Lemon',
    careTip: 'Clean your tongue gently every morning while brushing your teeth.',
  },
  {
    id: 'skin',
    organ: 'Skin (Sense of Touch & Feel) 🖐️',
    action: 'Skin covers our whole body and helps us FEEL Hot, Cold, Soft, Hard, Rough, and Smooth.',
    stimulus: '🧊 Cold Ice Cube vs. ☁️ Soft Cotton',
    careTip: 'Take a bath daily with soap and clean water to keep skin healthy.',
  },
];

const SHAPES_3D = [
  {
    id: 'sphere',
    name: 'Sphere (Ball / Orange)',
    faces: '1 Curved Surface, 0 Flat Faces',
    edgesCorners: '0 Edges, 0 Corners',
    behavior: 'ROLLS ONLY',
    canRoll: true,
    color: '#f43f5e',
  },
  {
    id: 'cube',
    name: 'Cube (Dice / Chalk Box)',
    faces: '6 Flat Square Faces',
    edgesCorners: '12 Straight Edges, 8 Corners',
    behavior: 'SLIDES & STACKS',
    canRoll: false,
    color: '#38bdf8',
  },
  {
    id: 'cylinder',
    name: 'Cylinder (Pencil Cell / Drum)',
    faces: '2 Flat Circular Faces + 1 Curved Surface',
    edgesCorners: '2 Circular Edges, 0 Corners',
    behavior: 'BOTH ROLLS & SLIDES',
    canRoll: true,
    color: '#10b981',
  },
  {
    id: 'cone',
    name: 'Cone (Birthday Cap / Ice-Cream)',
    faces: '1 Flat Circular Base + 1 Curved Surface',
    edgesCorners: '1 Circular Edge, 1 Pointed Corner',
    behavior: 'BOTH ROLLS & SLIDES',
    canRoll: true,
    color: '#f59e0b',
  },
];

export const Class1InteractiveLab: React.FC<{
  initialMode?: string;
  board?: SchoolBoard;
  /** Called when the child picks another activity, so the chapter panel follows along. */
  onModeChange?: (mode: string) => void;
}> = ({ initialMode, board = 'CBSE', onModeChange }) => {
  const [mode, setMode] = useState<Class1LabMode>(
    (initialMode as Class1LabMode) || 'spatial-prenumber'
  );
  const store = useProgress();
  const profile = store.profiles[store.activeProfileId];
  const voiceEnabled = store.prefs.voice;
  const stars = profile.stars;
  const childName = profile.name;
  const recognitionRef = useRef<{ abort?: () => void } | null>(null);
  const hasHindiVoice = useHasVoice('hi-IN');

  // Stop talking and listening when the child leaves this chapter.
  useEffect(
    () => () => {
      cancelSpeech();
      recognitionRef.current?.abort?.();
    },
    []
  );

  const goToMode = (next: Class1LabMode) => {
    setMissionBanner(null);
    if (onModeChange) onModeChange(next);
    else setMode(next);
  };
  const [missionBanner, setMissionBanner] = useState<string | null>(null);

  // Mode states
  const [catPosition, setCatPosition] = useState<'inside' | 'outside' | 'on' | 'under' | 'near' | 'far'>('on');
  const [leftCount, setLeftCount] = useState(14);
  const [rightCount, setRightCount] = useState(9);

  const [startNum, setStartNum] = useState(8);
  const [changeNum, setChangeNum] = useState(5);
  const [operation, setOperation] = useState<'add' | 'sub'>('add');

  const [twoDigitNum, setTwoDigitNum] = useState(46);
  const [targetAbacusMission, setTargetAbacusMission] = useState(37);
  const [skipStep, setSkipStep] = useState<2 | 5 | 10>(2);

  const [selectedShapeIdx, setSelectedShapeIdx] = useState(0);
  const [rampAngle, setRampAngle] = useState(22);

  const [objectHandspans, setObjectHandspans] = useState(5);
  const [leftPanBlocks, setLeftPanBlocks] = useState(6);
  const [rightPanBlocks, setRightPanBlocks] = useState(4);
  const [jugCups, setJugCups] = useState(4);

  const [clockHour, setClockHour] = useState(4);
  const [clockHalfHour, setClockHalfHour] = useState(false);
  const [selectedToyIdx, setSelectedToyIdx] = useState(1); // ₹18 Car
  const [walletCoins, setWalletCoins] = useState<number[]>([10, 5, 2, 1]);

  const [patternType, setPatternType] = useState<'ABAB' | 'AAB' | 'ABC' | 'NUM'>('ABAB');
  const [toyCounts, setToyCounts] = useState({ cars: 5, dolls: 3, balls: 7, blocks: 4 });

  const [groupsCount, setGroupsCount] = useState(4);
  const [itemsPerGroup, setItemsPerGroup] = useState(3);
  const [selectedOrdinal, setSelectedOrdinal] = useState(3);

  // English Phonics & Grammar states
  const [cvcIdx, setCvcIdx] = useState(0);
  const [chosenVowel, setChosenVowel] = useState<string>('A');
  const [articleWordIdx, setArticleWordIdx] = useState(0);
  const [oppositeIdx, setOppositeIdx] = useState(0);

  // EVS states
  const [selectedSenseIdx, setSelectedSenseIdx] = useState(0);
  const [waterLevel, setWaterLevel] = useState(80);
  const [sunlightLevel, setSunlightLevel] = useState(85);
  const [trafficLight, setTrafficLight] = useState<'red' | 'yellow' | 'green'>('green');
  const [animalCategory, setAnimalCategory] = useState<'wild' | 'domestic' | 'pet' | 'water'>('wild');
  const [season, setSeason] = useState<'summer' | 'monsoon' | 'winter' | 'spring'>('summer');
  const [isNightSky, setIsNightSky] = useState(false);

  // Hindi Varnamala, Computer & India/Manners states
  const [hindiTab, setHindiTab] = useState<'swar' | 'vyanjan' | 'matra' | 'ginti' | 'poems'>('swar');
  const [selectedSwarIdx, setSelectedSwarIdx] = useState(0);
  const [selectedVyanjanIdx, setSelectedVyanjanIdx] = useState(0);
  const [selectedMatraIdx, setSelectedMatraIdx] = useState(0);
  const [selectedGintiIdx, setSelectedGintiIdx] = useState(0);
  const [selectedPoemIdx, setSelectedPoemIdx] = useState(0);
  const [selectedComputerPartIdx, setSelectedComputerPartIdx] = useState(0);
  const [machineSortChoice, setMachineSortChoice] = useState<'natural' | 'manmade'>('manmade');
  const [keyboardKeyInfo, setKeyboardKeyInfo] = useState<string>(
    'SPACEBAR (Longest Key): Adds a blank space between two words!'
  );
  const [selectedSymbolIdx, setSelectedSymbolIdx] = useState(0);
  const [selectedMannerIdx, setSelectedMannerIdx] = useState(0);

  // Research-Backed Additions: Making 10 Bonds, Calendar (Days/Months), Mridang Stories, Animal Families, Helpers/Transport, Color Mixing & Sticker Book
  const [bondLeft, setBondLeft] = useState(6);
  const [selectedDayIdx, setSelectedDayIdx] = useState(0);
  const [selectedMonthIdx, setSelectedMonthIdx] = useState(0);
  const [selectedStoryIdx, setSelectedStoryIdx] = useState(0);
  const [activeStoryLine, setActiveStoryLine] = useState(0);
  const [selectedAnimalFamilyIdx, setSelectedAnimalFamilyIdx] = useState(0);
  const [selectedHelperIdx, setSelectedHelperIdx] = useState(0);
  const [transportType, setTransportType] = useState<'land' | 'water' | 'air'>('land');
  const [colorA, setColorA] = useState<'red' | 'blue' | 'yellow'>('red');
  const [colorB, setColorB] = useState<'red' | 'blue' | 'yellow'>('yellow');
  const [activeXylophoneKey, setActiveXylophoneKey] = useState<number | null>(null);
  const [stickerModalOpen, setStickerModalOpen] = useState(false);

  // Vertical T|O Sums, Staircase Ordering, Noun 4-Basket Sorter, Houses/Food, Arcade & Mic states
  const [vertA, setVertA] = useState(24);
  const [vertB, setVertB] = useState(15);
  const [vertOp, setVertOp] = useState<'add' | 'sub'>('add');
  const [stairOrder, setStairOrder] = useState<'asc' | 'desc'>('asc');
  const [evenOddTestNum, setEvenOddTestNum] = useState(8);

  const [activeNounIdx, setActiveNounIdx] = useState(0);
  const [nounFeedback, setNounFeedback] = useState<string | null>(null);
  const [pointingMode, setPointingMode] = useState<'this' | 'that' | 'these' | 'those'>('this');

  const [selectedHouseIdx, setSelectedHouseIdx] = useState(0);
  const [selectedRoom, setSelectedRoom] = useState<'kitchen' | 'bedroom' | 'bathroom' | 'living'>('kitchen');

  const [arcadeOpen, setArcadeOpen] = useState(false);
  const [arcadeMissionIdx, setArcadeMissionIdx] = useState(0);
  const [arcadeStreak, setArcadeStreak] = useState(0);

  const [micModalOpen, setMicModalOpen] = useState(false);
  const [speakWordIdx, setSpeakWordIdx] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [spokenTranscript, setSpokenTranscript] = useState<string>('');
  const [bilingualMode, setBilingualMode] = useState(false);

  // New Class 1 States (Ordinals/Fractions, Pronouns/Adjectives, Hindi Shabd Train, Water/Air/Habits)
  const [raceSelectedOrd, setRaceSelectedOrd] = useState(1);
  const [beforeAfterNum, setBeforeAfterNum] = useState(15);
  const [pizzaSlices, setPizzaSlices] = useState<1 | 2 | 4>(2);
  const [activePronounIdx, setActivePronounIdx] = useState(0);
  const [activeAdjIdx, setActiveAdjIdx] = useState(0);
  const [shabdType, setShabdType] = useState<'two' | 'three' | 'four'>('two');
  const [activeShabdIdx, setActiveShabdIdx] = useState(0);
  const [activeHabitIdx, setActiveHabitIdx] = useState(0);

  // States for 6 Final Curriculum & Olympiad Modules + Brain Break & Report Card Modals
  const [breathingModalOpen, setBreathingModalOpen] = useState(false);
  const [breathIn, setBreathIn] = useState(true);
  const [reportCardOpen, setReportCardOpen] = useState(false);
  const [storyProblemIdx, setStoryProblemIdx] = useState(0);
  const [tableMultiplier, setTableMultiplier] = useState<1 | 2 | 5 | 10>(2);
  const [digraphIdx, setDigraphIdx] = useState(0);
  const [jumbledIdx, setJumbledIdx] = useState(0);
  const [storyGuess, setStoryGuess] = useState<number | null>(null);
  const [builtWords, setBuiltWords] = useState<number[]>([]);
  const [barahkhadiIdx, setBarahkhadiIdx] = useState(0);
  const [barahkhadiFormIdx, setBarahkhadiFormIdx] = useState(0);
  const [clothesSeasonIdx, setClothesSeasonIdx] = useState(0);
  const [placeIdx, setPlaceIdx] = useState(0);
  const [paintToolIdx, setPaintToolIdx] = useState(0);
  const [olympiadIdx, setOlympiadIdx] = useState(0);
  const [olympiadFeedback, setOlympiadFeedback] = useState<string | null>(null);

  const handleStartMicPractice = () => {
    const target = SPEAK_PRACTICE_WORDS[speakWordIdx].word;
    const SpeechRec =
      (window as unknown as { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown })
        .SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition;

    if (!SpeechRec) {
      setIsListening(false);
      setSpokenTranscript('🎙️ This browser can’t listen to speech. Try Chrome or Edge, or say the word to a grown-up!');
      return;
    }

    const normalise = (t: string) => t.toLowerCase().replace(/[^a-z\u0900-\u097f ]/g, ' ').replace(/\s+/g, ' ').trim();
    const wanted = normalise(target);

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rec = new (SpeechRec as any)();
      recognitionRef.current = rec;
      rec.lang = 'en-IN';
      rec.interimResults = false;
      rec.maxAlternatives = 3;
      setIsListening(true);
      setSpokenTranscript('Listening... Speak now! 🎙️');

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      rec.onresult = (event: any) => {
        const alts: string[] = Array.from(event.results?.[0] ?? []).map(
          (alt) => (alt as { transcript: string }).transcript
        );
        const heard = alts[0] ?? '';
        const matched = alts.some((t) => normalise(t).split(' ').includes(wanted) || normalise(t) === wanted);
        setIsListening(false);
        if (matched) {
          setSpokenTranscript(heard);
          awardStar(`Awesome! You said "${target}" clearly!`, 'en-IN', `mic:${target}`);
        } else {
          setSpokenTranscript(heard ? `I heard "${heard}". Try saying "${target}" again!` : `Try saying "${target}" again!`);
          speak(`Nice try! Say ${target} again.`);
        }
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      rec.onerror = (event: any) => {
        setIsListening(false);
        setSpokenTranscript(
          event?.error === 'not-allowed' || event?.error === 'service-not-allowed'
            ? '🎙️ The microphone is blocked. Ask a grown-up to allow it in the browser settings.'
            : 'I didn’t catch that. Tap the mic and try again!'
        );
      };
      rec.onend = () => {
        setIsListening(false);
      };
      rec.start();
    } catch {
      setIsListening(false);
      setSpokenTranscript('I couldn’t start the microphone. Tap the mic and try again!');
    }
  };

  const currentSubjectGroup: Class1SubjectGroup =
    MODE_CATALOG.find((m) => m.id === mode)?.subject || 'math';

  const speak = (text: string, force = false, lang: 'en-IN' | 'hi-IN' = 'en-IN') => {
    playPop();
    speakText(text, { force, lang });
    if (bilingualMode && lang === 'en-IN') {
      speakText('शाबाश बच्चों! ध्यान से सीखो!', { force, lang: 'hi-IN', queue: true });
    }
  };

  /**
   * Gives a star once per activity per day. Repeat taps on the same thing still get praise,
   * but no extra star, so the star count means something to parents.
   */
  const awardStar = (msg: string, lang: 'en-IN' | 'hi-IN' = 'en-IN', key?: string) => {
    const earned = progress.awardStar(`${mode}:${key ?? msg}`);
    if (earned) {
      playSuccessChime();
      setMissionBanner(`🎉 ${msg} (+1 ⭐ Star!)`);
    } else {
      playPop();
      setMissionBanner(`👍 ${msg} (You already earned this star today — try a new activity!)`);
    }
    speakText(msg, { lang });
    if (earned && bilingualMode && lang === 'en-IN') {
      speakText('बहुत बढ़िया! आपको एक स्टार मिला!', { lang: 'hi-IN', queue: true });
    }
  };

  const compSymbol = leftCount > rightCount ? '>' : leftCount < rightCount ? '<' : '=';
  const compWord =
    leftCount > rightCount
      ? 'is greater than'
      : leftCount < rightCount
      ? 'is less than'
      : 'is equal to';

  const resultNum =
    operation === 'add' ? startNum + changeNum : Math.max(0, startNum - changeNum);

  const tensDigit = Math.floor(twoDigitNum / 10);
  const onesDigit = twoDigitNum % 10;
  const totalMoney = walletCoins.reduce((a, b) => a + b, 0);
  const activeToy = TOY_SHOP_ITEMS[selectedToyIdx];

  const renderFrogNumberLine = ({ ctx, width, height, elapsedTime }: CanvasRenderContext) => {
    const lineY = height * 0.68;
    const startX = 40;
    const endX = width - 40;
    const maxN = 20;
    const stepPx = (endX - startX) / maxN;

    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(startX, lineY);
    ctx.lineTo(endX, lineY);
    ctx.stroke();

    ctx.font = 'bold 12px JetBrains Mono, monospace';
    ctx.textAlign = 'center';
    for (let i = 0; i <= maxN; i++) {
      const x = startX + i * stepPx;
      ctx.strokeStyle = i === startNum || i === resultNum ? '#fde047' : '#64748b';
      ctx.lineWidth = i % 5 === 0 ? 3 : 1.5;
      ctx.beginPath();
      ctx.moveTo(x, lineY - 8);
      ctx.lineTo(x, lineY + 8);
      ctx.stroke();

      ctx.fillStyle =
        i === resultNum ? '#10b981' : i === startNum ? '#fde047' : '#cbd5e1';
      ctx.fillText(`${i}`, x, lineY + 26);
    }

    const steps = Math.abs(resultNum - startNum);
    const dir = operation === 'add' ? 1 : -1;
    ctx.strokeStyle = operation === 'add' ? '#10b981' : '#f43f5e';
    ctx.lineWidth = 2.5;
    for (let s = 0; s < steps; s++) {
      const n1 = startNum + s * dir;
      const n2 = n1 + dir;
      if (n2 < 0 || n2 > maxN) continue;
      const x1 = startX + n1 * stepPx;
      const x2 = startX + n2 * stepPx;
      const midX = (x1 + x2) / 2;
      ctx.beginPath();
      ctx.moveTo(x1, lineY - 6);
      ctx.quadraticCurveTo(midX, lineY - 58, x2, lineY - 6);
      ctx.stroke();
    }

    const frogX = startX + Math.min(maxN, resultNum) * stepPx;
    const bounce = Math.abs(Math.sin(elapsedTime * 4)) * 12;
    const frogY = lineY - 22 - bounce;

    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.arc(frogX, frogY, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(frogX - 5, frogY - 6, 4, 0, Math.PI * 2);
    ctx.arc(frogX + 5, frogY - 6, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 16px JetBrains Mono, monospace';
    ctx.textAlign = 'left';
    ctx.fillText(
      `Frog Jumps: ${startNum} ${operation === 'add' ? '+' : '-'} ${changeNum} = ${resultNum} (${numberToWords(resultNum)})`,
      35,
      42
    );
  };

  const renderShapeRamp = ({ ctx, width, height, elapsedTime }: CanvasRenderContext) => {
    const activeShape = SHAPES_3D[selectedShapeIdx];
    const rad = (rampAngle * Math.PI) / 180;
    const rampStartX = 90;
    const rampStartY = 95;
    const rampLen = Math.min(width - 180, 380);

    ctx.save();
    ctx.translate(rampStartX, rampStartY);
    ctx.rotate(rad);

    ctx.fillStyle = '#334155';
    ctx.fillRect(0, 0, rampLen, 14);

    const dist = ((elapsedTime * (45 + rampAngle * 2.5)) % (rampLen - 40)) + 20;
    const spin = activeShape.canRoll ? elapsedTime * 6 : 0;

    ctx.save();
    ctx.translate(dist, -22);
    ctx.rotate(spin);
    ctx.fillStyle = activeShape.color;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;

    if (activeShape.id === 'sphere' || activeShape.id === 'cylinder') {
      ctx.beginPath();
      ctx.arc(0, 0, 20, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-18, 0);
      ctx.lineTo(18, 0);
      ctx.moveTo(0, -18);
      ctx.lineTo(0, 18);
      ctx.stroke();
    } else if (activeShape.id === 'cube') {
      ctx.fillRect(-20, -20, 40, 40);
      ctx.strokeRect(-20, -20, 40, 40);
    } else {
      ctx.beginPath();
      ctx.moveTo(0, -22);
      ctx.lineTo(-20, 18);
      ctx.lineTo(20, 18);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();
    ctx.restore();

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 14px JetBrains Mono, monospace';
    ctx.fillText(
      `${activeShape.name} → ${activeShape.behavior} (${activeShape.faces})`,
      30,
      36
    );
  };

  const renderPlantGrowth = ({ ctx, width, height, elapsedTime }: CanvasRenderContext) => {
    const health = (waterLevel + sunlightLevel) / 200;
    const groundY = height * 0.72;
    const cx = width * 0.5;

    ctx.fillStyle = '#0c192c';
    ctx.fillRect(0, 0, width, groundY);
    ctx.fillStyle = '#422006';
    ctx.fillRect(0, groundY, width, height - groundY);

    const sunR = 20 + (sunlightLevel / 100) * 22;
    ctx.fillStyle = '#fde047';
    ctx.beginPath();
    ctx.arc(85, 65, sunR, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 3;
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath();
      ctx.moveTo(cx, groundY);
      ctx.lineTo(cx + i * 26 * health, groundY + 45 * health);
      ctx.stroke();
    }

    const stemH = 35 + health * 145;
    const sway = Math.sin(elapsedTime * 2) * 5;
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(cx, groundY);
    ctx.quadraticCurveTo(cx + sway, groundY - stemH * 0.5, cx + sway, groundY - stemH);
    ctx.stroke();

    if (health > 0.3) {
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.ellipse(cx - 24, groundY - stemH * 0.45, 22, 10, -0.4, 0, Math.PI * 2);
      ctx.ellipse(cx + 24, groundY - stemH * 0.62, 22, 10, 0.4, 0, Math.PI * 2);
      ctx.fill();
    }

    if (health > 0.65) {
      const fx = cx + sway;
      const fy = groundY - stemH;
      ctx.fillStyle = '#f43f5e';
      for (let p = 0; p < 6; p++) {
        const a = (p / 6) * Math.PI * 2 + elapsedTime * 0.5;
        ctx.beginPath();
        ctx.arc(fx + Math.cos(a) * 16, fy + Math.sin(a) * 16, 9, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.arc(fx, fy, 9, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 11px JetBrains Mono, monospace';
    ctx.fillText('1. ROOTS (Absorb Water & Minerals)', cx + 65, groundY + 35);
    ctx.fillText('2. STEM (Carries Water & Supports Plant)', cx + 45, groundY - stemH * 0.3);
    if (health > 0.3) {
      ctx.fillText('3. LEAVES (Kitchen of Plant — Make Food)', cx - 265, groundY - stemH * 0.5);
    }
    if (health > 0.65) {
      ctx.fillStyle = '#fde047';
      ctx.fillText('4. FLOWER & FRUIT (Produces Seeds)', cx + 35, groundY - stemH - 8);
    }
  };

  const renderSeasonsAndSky = ({ ctx, width, height, elapsedTime }: CanvasRenderContext) => {
    const groundY = height * 0.74;
    const skyColors = {
      summer: '#0284c7',
      monsoon: '#1e293b',
      winter: '#334155',
      spring: '#0369a1',
    };
    ctx.fillStyle = isNightSky ? '#030712' : skyColors[season];
    ctx.fillRect(0, 0, width, groundY);

    ctx.fillStyle = season === 'winter' ? '#e2e8f0' : '#15803d';
    ctx.fillRect(0, groundY, width, height - groundY);

    if (isNightSky) {
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(width - 95, 75, 28, 0, Math.PI * 2);
      ctx.fill();

      for (let s = 0; s < 24; s++) {
        const sx = (s * 67) % (width - 40) + 20;
        const sy = (s * 43) % (groundY - 60) + 20;
        const r = 1.5 + Math.abs(Math.sin(elapsedTime * 3 + s)) * 2;
        ctx.beginPath();
        ctx.arc(sx, sy, r, 0, Math.PI * 2);
        ctx.fill();
      }
    } else {
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.arc(95, 75, season === 'summer' ? 36 : 24, 0, Math.PI * 2);
      ctx.fill();
    }

    if (season === 'monsoon' || season === 'winter') {
      ctx.strokeStyle = '#bae6fd';
      ctx.fillStyle = '#f8fafc';
      for (let i = 0; i < 28; i++) {
        const rx = ((i * 53 + elapsedTime * 30) % (width - 20)) + 10;
        const ry = ((i * 41 + elapsedTime * 120) % (groundY - 20)) + 10;
        if (season === 'monsoon') {
          ctx.beginPath();
          ctx.moveTo(rx, ry);
          ctx.lineTo(rx - 4, ry + 12);
          ctx.stroke();
        } else {
          ctx.beginPath();
          ctx.arc(rx, ry, 3.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    const clothingNote = {
      summer: 'SUMMER: Hot & Sunny • Wear light Cotton clothes • Drink plenty of water',
      monsoon: 'MONSOON (RAINY): Dark clouds & Rain • Use Umbrella, Raincoat & Gumboots',
      winter: 'WINTER: Cold & Breezy • Wear warm Woolen Sweaters, Jackets & Mufflers',
      spring: 'SPRING: Pleasant weather • New leaves & colorful flowers bloom on trees',
    };

    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 12px JetBrains Mono, monospace';
    ctx.fillText(
      `${isNightSky ? 'NIGHT SKY (Moon & Stars)' : 'DAY SKY (Bright Sun)'} | ${clothingNote[season]}`,
      20,
      30
    );
  };

  return (
    <div className="space-y-4" data-class1-lab>
      {currentSubjectGroup === 'hindi' && !hasHindiVoice && (
        <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-400/60 text-xs text-amber-100">
          🔈 This device has no Hindi voice, so Hindi letters may be read wrongly or not at all. A grown-up can add
          one: on Android, Settings → Text-to-speech → install Hindi; on Windows, Settings → Time &amp; language →
          Speech → add Hindi; on iPhone/iPad and Mac, Hindi is usually built in.
        </div>
      )}
      {/* Top Kid-Friendly Voice Narration & Star Reward Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-2xl bg-gradient-to-r from-cyan-950/60 via-slate-900 to-emerald-950/60 border border-cyan-500/30 shadow-md">
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-400 flex items-center gap-1.5">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-extrabold text-amber-200">
              ⭐ {stars} Stars Earned!
            </span>
          </div>

          {missionBanner ? (
            <span className="text-xs font-bold text-emerald-300 bg-emerald-500/15 border border-emerald-500/40 px-3 py-1 rounded-xl animate-pulse">
              {missionBanner}
            </span>
          ) : (
            <span className="text-xs text-slate-300 hidden sm:inline">
              Tap objects directly or click 🔊 to hear voice narration!
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              playPop();
              setArcadeOpen((o) => !o);
              setMicModalOpen(false);
              setStickerModalOpen(false);
              speak(ARCADE_MISSIONS[arcadeMissionIdx].prompt, true);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all shadow-sm ${
              arcadeOpen
                ? 'bg-emerald-400 text-slate-950 ring-2 ring-white'
                : 'bg-emerald-500/25 border border-emerald-400 text-emerald-200 hover:bg-emerald-500/35'
            }`}
          >
            <Gamepad2 className="w-3.5 h-3.5" />
            🎯 Challenge Arcade {arcadeStreak > 0 ? `(🔥${arcadeStreak})` : ''}
          </button>

          <button
            type="button"
            onClick={() => {
              playPop();
              setMicModalOpen((o) => !o);
              setArcadeOpen(false);
              setStickerModalOpen(false);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all shadow-sm ${
              micModalOpen
                ? 'bg-rose-500 text-white ring-2 ring-white'
                : 'bg-rose-500/25 border border-rose-400 text-rose-200 hover:bg-rose-500/35'
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            🎤 Speak to Mic
          </button>

          <button
            type="button"
            onClick={() => {
              playPop();
              setBreathingModalOpen((o) => !o);
              setReportCardOpen(false);
              setArcadeOpen(false);
              setMicModalOpen(false);
              setStickerModalOpen(false);
              speak('Time for a 1-minute Panchakosha Brain Break! Breathe in slowly like a big balloon, and breathe out gently!', true);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all shadow-sm ${
              breathingModalOpen
                ? 'bg-teal-400 text-slate-950 ring-2 ring-white'
                : 'bg-teal-500/20 border border-teal-400 text-teal-200 hover:bg-teal-500/30'
            }`}
          >
            🧘‍♂️ Brain Break
          </button>

          <button
            type="button"
            onClick={() => {
              playPop();
              setReportCardOpen((o) => !o);
              setBreathingModalOpen(false);
              setArcadeOpen(false);
              setMicModalOpen(false);
              setStickerModalOpen(false);
              speak('Opening your Class 1 NIPUN Bharat Skill Report Card!', true);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all shadow-sm ${
              reportCardOpen
                ? 'bg-violet-400 text-slate-950 ring-2 ring-white'
                : 'bg-violet-500/20 border border-violet-400 text-violet-200 hover:bg-violet-500/30'
            }`}
          >
            📊 Report Card
          </button>

          <button
            type="button"
            onClick={() => {
              playFanfare();
              setStickerModalOpen((o) => !o);
              setArcadeOpen(false);
              setMicModalOpen(false);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400 text-slate-950 text-xs font-extrabold hover:bg-amber-300 transition-colors shadow-sm"
          >
            <Award className="w-3.5 h-3.5" />
            🏅 Sticker Book
          </button>

          <button
            type="button"
            onClick={() =>
              speak(
                'Welcome to Class 1 Interactive Learning Lab! Click any activity to play and earn stars!',
                true
              )
            }
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500 text-slate-950 text-xs font-extrabold hover:bg-cyan-400 transition-colors"
          >
            <Volume2 className="w-3.5 h-3.5" />
            🔊 Speak Aloud
          </button>

          <button
            type="button"
            onClick={() => {
              setBilingualMode((b) => !b);
              speak('नमस्ते बच्चों! Bilingual English and Hindi voice helper is ready!', true, 'hi-IN');
            }}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-extrabold border transition-all ${
              bilingualMode
                ? 'bg-orange-500 text-slate-950 border-white shadow-sm'
                : 'bg-slate-800 border-slate-700 text-amber-200 hover:border-amber-400'
            }`}
            title="NEP 2020 Bilingual English + Hindi Voice Scaffolding"
          >
            🇮🇳 {bilingualMode ? 'EN + हिंदी: ON' : 'EN + हिंदी'}
          </button>

          <button
            type="button"
            onClick={() => progress.setVoice(!voiceEnabled)}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold border ${
              voiceEnabled
                ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200'
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
          >
            {voiceEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            Voice: {voiceEnabled ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>

      {/* Jadui Pitara Sticker Book & Superstar Certificate Modal */}
      {stickerModalOpen && (
        <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-950/60 via-[#111827] to-cyan-950/60 border-2 border-amber-400/70 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-amber-500/30 pb-3">
            <div className="flex items-center gap-2">
              <Trophy className="w-6 h-6 text-amber-400" />
              <div>
                <h3 className="text-base font-black text-white">
                  🏅 Class 1 Jadui Pitara Sticker Book & Superstar Certificate
                </h3>
                <p className="text-xs text-amber-200">
                  Collect stars across Math, English, Hindi, EVS, Computer & Arts!
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setStickerModalOpen(false)}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            <div className="md:col-span-5 p-4 rounded-xl bg-[#090D16] border border-amber-400/50 space-y-3 text-center">
              <div className="text-xs font-mono uppercase text-amber-300 font-bold">
                🌟 Official Class 1 Superstar Certificate 🌟
              </div>
              <div className="text-xs text-slate-400">Proudly presented to:</div>
              <input
                type="text"
                value={childName}
                onChange={(e) => progress.renameProfile(profile.id, e.target.value)}
                placeholder="Type Child's Name..."
                className="w-full text-center px-3 py-1.5 rounded-lg bg-slate-900 border border-amber-400/60 text-base font-extrabold text-amber-200 focus:outline-none"
              />
              <div className="text-xs text-slate-200">
                For earning <strong className="text-amber-300 text-sm">⭐ {stars} Stars</strong> in CBSE & ICSE Class 1 Interactive Labs!
              </div>
              <button
                type="button"
                onClick={() => {
                  playFanfare();
                  speak(
                    `Congratulations ${childName}! You have earned ${stars} shining stars in Class 1 OmniLearn Labs!`,
                    true
                  );
                }}
                className="w-full py-2 rounded-xl bg-amber-400 text-slate-950 text-xs font-black hover:bg-amber-300"
              >
                🎉 Play Fanfare & Read Certificate Aloud!
              </button>
            </div>

            <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { name: 'Furry Cat Finder', icon: '🐱', req: 1 },
                { name: 'Number Bond 10', icon: '🌈', req: 3 },
                { name: 'Frog Hop Master', icon: '🐸', req: 5 },
                { name: 'Abacus Whiz', icon: '🧮', req: 7 },
                { name: 'Mridang Story Star', icon: '📖', req: 9 },
                { name: 'Sarangi Hindi Star', icon: '🇮🇳', req: 11 },
                { name: 'Nature & Helpers', icon: '🚒', req: 13 },
                { name: 'Music & Rainbow', icon: '🎵', req: 15 },
              ].map((badge) => {
                const unlocked = stars >= badge.req;
                return (
                  <button
                    key={badge.name}
                    type="button"
                    onClick={() =>
                      speak(
                        unlocked
                          ? `Sticker unlocked: ${badge.name}!`
                          : `Earn ${badge.req} stars to unlock ${badge.name}!`,
                        true
                      )
                    }
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      unlocked
                        ? 'bg-emerald-950/40 border-emerald-400 text-white'
                        : 'bg-[#090D16]/60 border-slate-800 text-slate-500'
                    }`}
                  >
                    <div className="text-2xl">{unlocked ? badge.icon : '🔒'}</div>
                    <div className="text-[11px] font-bold mt-1">{badge.name}</div>
                    <div className="text-[9px] font-mono text-amber-300">
                      {unlocked ? '✓ Unlocked' : `Needs ⭐${badge.req}`}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Voice-Prompted Challenge Arcade Modal */}
      {arcadeOpen && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/70 via-[#111827] to-cyan-950/70 border-2 border-emerald-400/70 shadow-xl space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Gamepad2 className="w-5 h-5 text-emerald-400" />
              <span className="text-sm font-black text-white">
                🎯 Class 1 Voice-Prompted Treasure Hunt Arcade
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-400 text-xs font-mono font-bold text-amber-300">
                🔥 Streak: {arcadeStreak}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => speak(ARCADE_MISSIONS[arcadeMissionIdx].prompt, true)}
                className="px-2.5 py-1 rounded-lg bg-cyan-500 text-slate-950 text-xs font-extrabold"
              >
                🔊 Repeat Question
              </button>
              <button
                type="button"
                onClick={() => setArcadeOpen(false)}
                className="p-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#090D16] border border-emerald-500/40 space-y-3">
            <p className="text-sm font-bold text-emerald-200">
              {ARCADE_MISSIONS[arcadeMissionIdx].prompt}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {ARCADE_MISSIONS[arcadeMissionIdx].options.map((opt, idx) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    if (idx === ARCADE_MISSIONS[arcadeMissionIdx].correct) {
                      playFanfare();
                      setArcadeStreak((s) => s + 1);
                      awardStar(ARCADE_MISSIONS[arcadeMissionIdx].rewardMsg);
                      const nextIdx = (arcadeMissionIdx + 1) % ARCADE_MISSIONS.length;
                      setArcadeMissionIdx(nextIdx);
                    } else {
                      setArcadeStreak(0);
                      speak('Good try! Listen carefully and tap another option!', true);
                    }
                  }}
                  className="p-3 rounded-xl bg-[#111827] hover:bg-emerald-500/25 border-2 border-slate-700 hover:border-emerald-400 text-sm font-extrabold text-white transition-all"
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Microphone "Speak to Learn" Oral Pronunciation Check */}
      {micModalOpen && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-950/70 via-[#111827] to-amber-950/70 border-2 border-rose-400/70 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mic className="w-5 h-5 text-rose-400" />
              <div>
                <h4 className="text-sm font-black text-white">
                  🎤 Speak-to-Learn Oral Reading & Pronunciation Studio
                </h4>
                <p className="text-xs text-rose-200">
                  Pick a word, listen to how it sounds, and tap the Microphone to say it aloud!
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setMicModalOpen(false)}
              className="p-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {SPEAK_PRACTICE_WORDS.map((item, idx) => (
              <button
                key={item.word}
                type="button"
                onClick={() => {
                  setSpeakWordIdx(idx);
                  setSpokenTranscript('');
                  speak(item.word, true);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold border ${
                  speakWordIdx === idx
                    ? 'bg-rose-500 text-white border-white'
                    : 'bg-[#090D16] text-slate-300 border-slate-800'
                }`}
              >
                {item.icon} {item.word}
              </button>
            ))}
          </div>

          <div className="p-4 rounded-xl bg-[#090D16] border border-rose-500/40 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-4xl">{SPEAK_PRACTICE_WORDS[speakWordIdx].icon}</span>
              <div>
                <div className="text-base font-black text-white">
                  Target Word: &ldquo;{SPEAK_PRACTICE_WORDS[speakWordIdx].word}&rdquo;
                </div>
                <div className="text-xs text-amber-300 font-mono">
                  {spokenTranscript
                    ? `You Spoke: "${spokenTranscript}" 🌟`
                    : 'Tap "🎤 Speak Now" and say the word aloud!'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => speak(SPEAK_PRACTICE_WORDS[speakWordIdx].word, true)}
                className="px-3 py-2 rounded-xl bg-slate-800 text-cyan-300 text-xs font-bold border border-slate-700"
              >
                🔊 Hear Word
              </button>
              <button
                type="button"
                onClick={handleStartMicPractice}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 ${
                  isListening
                    ? 'bg-amber-400 text-slate-950 animate-pulse'
                    : 'bg-rose-500 text-white hover:bg-rose-400'
                }`}
              >
                <Mic className="w-3.5 h-3.5" />
                {isListening ? 'Listening...' : '🎤 Speak Now (+1 ⭐)'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Panchakosha 1-Minute Brain Break & Kids Yoga Breathing Modal */}
      {breathingModalOpen && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-teal-950/75 via-[#111827] to-cyan-950/75 border-2 border-teal-400/70 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-teal-500/30 pb-2">
            <div>
              <h4 className="text-sm font-black text-white">
                🧘‍♂️ NCF-FS Panchakosha 1-Minute Brain Break & Kids Yoga Buddy
              </h4>
              <p className="text-xs text-teal-200">
                Refresh your mind and body with Balloon Belly Breathing and playful Animal Stretches!
              </p>
            </div>
            <button
              type="button"
              onClick={() => setBreathingModalOpen(false)}
              className="p-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            <div className="md:col-span-5 p-4 rounded-xl bg-[#090D16] border border-teal-500/40 flex flex-col items-center space-y-3">
              <div
                onClick={() => {
                  setBreathIn((b) => !b);
                  speak(
                    !breathIn
                      ? 'Breathe IN slowly through your nose... 1, 2, 3!'
                      : 'Breathe OUT gently through your mouth... 1, 2, 3!',
                    true
                  );
                }}
                className={`cursor-pointer rounded-full flex items-center justify-center transition-all duration-700 font-black text-xs text-slate-950 shadow-lg ${
                  breathIn
                    ? 'w-28 h-28 bg-teal-400 scale-110 ring-4 ring-teal-200'
                    : 'w-20 h-20 bg-cyan-300 scale-95'
                }`}
              >
                {breathIn ? '🎈 Breathe IN' : '🌬️ Breathe OUT'}
              </div>
              <button
                type="button"
                onClick={() => {
                  setBreathIn((b) => !b);
                  awardStar('Great mindful Balloon Breathing! Your brain is fresh and ready!');
                }}
                className="px-3 py-1.5 rounded-xl bg-teal-400 text-slate-950 text-xs font-extrabold"
              >
                Tap Balloon to Switch Inhale / Exhale (+1 ⭐)
              </button>
            </div>

            <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-2">
              {YOGA_STRETCHES.map((y) => (
                <button
                  key={y.name}
                  type="button"
                  onClick={() => awardStar(`${y.name}: ${y.action}`)}
                  className="p-3 rounded-xl bg-[#090D16] border border-slate-800 hover:border-teal-400 text-left space-y-1"
                >
                  <div className="text-xs font-extrabold text-teal-300">{y.name}</div>
                  <p className="text-[11px] text-slate-300 leading-snug">{y.action}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* NIPUN Bharat & CISCE Class 1 Parent/Teacher Report Card Modal */}
      {reportCardOpen && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-violet-950/75 via-[#111827] to-indigo-950/75 border-2 border-violet-400/70 shadow-xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-violet-500/30 pb-2">
            <div>
              <h4 className="text-sm font-black text-white">
                📊 Class 1 NIPUN Bharat (FLN) & CBSE/ICSE Competency Report Card
              </h4>
              <p className="text-xs text-violet-200">
                Holistic 360° Foundational Literacy & Numeracy (FLN) Progress Tracker for {childName}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-3 py-1 rounded-lg bg-amber-400 text-slate-950 text-xs font-extrabold"
              >
                🖨️ Print Report Card
              </button>
              <button
                type="button"
                onClick={() => setReportCardOpen(false)}
                className="p-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <ProgressReport board={board} compact />
        </div>
      )}

      {/* Categorized Subject & Activity Selector Bar (Decluttered for 6-Year-Olds!) */}
      <div className="p-3 rounded-2xl bg-[#111827] border border-[#1F2937] space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-800/80">
          <div className="flex flex-wrap items-center gap-1.5">
            {(
              [
                { id: 'math', label: '📐 Math (12)', color: 'bg-cyan-500 text-slate-950' },
                { id: 'english', label: '📖 English / Mridang (6)', color: 'bg-amber-500 text-slate-950' },
                { id: 'hindi', label: '🇮🇳 Hindi / सारंगी (3)', color: 'bg-rose-500 text-white' },
                { id: 'evs', label: '🌱 EVS & GK (9)', color: 'bg-emerald-500 text-slate-950' },
                { id: 'computer', label: '💻 Computer (2)', color: 'bg-violet-500 text-white' },
                { id: 'arts', label: '🎨 Arts & Olympiad (2)', color: 'bg-pink-500 text-white' },
              ] as const
            ).map((subj) => {
              const activeSubj = currentSubjectGroup === subj.id;
              return (
                <button
                  key={subj.id}
                  type="button"
                  onClick={() => {
                    const firstInGroup = MODE_CATALOG.find((m) => m.subject === subj.id);
                    if (firstInGroup) goToMode(firstInGroup.id);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                    activeSubj
                      ? `${subj.color} shadow-sm scale-102`
                      : 'bg-[#090D16] text-slate-300 border border-slate-800 hover:text-white'
                  }`}
                >
                  {subj.label}
                </button>
              );
            })}
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            Showing {MODE_CATALOG.filter((m) => m.subject === currentSubjectGroup).length} Lessons in{' '}
            <strong className="text-cyan-300 uppercase">{currentSubjectGroup}</strong>
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {MODE_CATALOG.filter((m) => m.subject === currentSubjectGroup).map((m) => {
            const Icon = m.icon;
            const active = mode === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => goToMode(m.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  active
                    ? 'bg-cyan-500/25 text-cyan-200 border-2 border-cyan-400 shadow-sm'
                    : 'bg-[#090D16] text-slate-300 border border-slate-800 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5 text-cyan-400" />
                {m.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* MODE 1: SPATIAL PRE-NUMBER CONCEPTS (FINDING THE FURRY CAT!) */}
      {mode === 'spatial-prenumber' && (
        <div className="p-4 rounded-xl bg-[#111827] border border-[#1F2937] space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                NCERT Ch 1: Finding the Furry Cat! — Pre-Number Spatial Vocabulary
              </h4>
              <p className="text-xs text-slate-400">
                Tap any position button below to move the Furry Cat 🐱 and hear the sentence!
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(
                [
                  { id: 'on', label: 'ON the Table', speech: 'The furry cat is sitting ON the table!' },
                  { id: 'under', label: 'UNDER the Table', speech: 'The furry cat is hiding UNDER the table!' },
                  { id: 'inside', label: 'INSIDE the Box', speech: 'The furry cat is INSIDE the box!' },
                  { id: 'outside', label: 'OUTSIDE the Box', speech: 'The furry cat jumped OUTSIDE the box!' },
                  { id: 'near', label: 'NEAR the Tree', speech: 'The furry cat is standing NEAR the tree!' },
                  { id: 'far', label: 'FAR from the Tree', speech: 'The furry cat is FAR away from the tree!' },
                ] as const
              ).map((pos) => (
                <button
                  key={pos.id}
                  type="button"
                  onClick={() => {
                    setCatPosition(pos.id);
                    awardStar(pos.speech);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                    catPosition === pos.id
                      ? 'bg-cyan-500 text-slate-950 border-white'
                      : 'bg-[#090D16] text-slate-300 border-slate-800'
                  }`}
                >
                  {pos.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl bg-[#090D16] border border-slate-800">
            <div className="p-4 rounded-xl bg-[#111827] border border-slate-800 flex flex-col items-center justify-between h-48">
              <span className="text-xs font-mono text-cyan-300 font-bold">
                ON vs. UNDER the Table
              </span>
              <div className="relative w-40 h-28 flex flex-col items-center justify-center">
                {catPosition === 'on' && (
                  <div className="text-3xl animate-bounce mb-1">🐱</div>
                )}
                <div className="w-36 h-3 bg-amber-600 rounded" />
                <div className="w-28 flex justify-between">
                  <div className="w-2.5 h-14 bg-amber-700" />
                  <div className="w-2.5 h-14 bg-amber-700" />
                </div>
                {catPosition === 'under' && (
                  <div className="absolute bottom-1 text-3xl animate-bounce">🐱</div>
                )}
              </div>
              <span className="text-[11px] text-slate-400">
                {catPosition === 'on'
                  ? 'The cat is ON the table.'
                  : catPosition === 'under'
                  ? 'The cat is UNDER the table.'
                  : 'Tap ON or UNDER'}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-[#111827] border border-slate-800 flex flex-col items-center justify-between h-48">
              <span className="text-xs font-mono text-emerald-300 font-bold">
                INSIDE vs. OUTSIDE the Box
              </span>
              <div className="flex items-center gap-4">
                <div className="w-24 h-20 rounded-b-xl border-4 border-t-0 border-emerald-500 bg-emerald-950/30 flex items-center justify-center text-3xl">
                  {catPosition === 'inside' ? '🐱' : '📦'}
                </div>
                {catPosition === 'outside' && (
                  <div className="text-3xl animate-bounce">🐱</div>
                )}
              </div>
              <span className="text-[11px] text-slate-400">
                {catPosition === 'inside'
                  ? 'The cat is INSIDE the box!'
                  : catPosition === 'outside'
                  ? 'The cat is OUTSIDE the box!'
                  : 'Tap INSIDE or OUTSIDE'}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-[#111827] border border-slate-800 flex flex-col items-center justify-between h-48">
              <span className="text-xs font-mono text-amber-300 font-bold">
                NEAR vs. FAR from the Tree
              </span>
              <div className="w-full flex items-center justify-between px-3">
                <div className="flex items-center gap-1">
                  <span className="text-4xl">🌳</span>
                  {catPosition === 'near' && (
                    <span className="text-3xl animate-bounce">🐱</span>
                  )}
                </div>
                {catPosition === 'far' && (
                  <span className="text-3xl animate-bounce">🐱</span>
                )}
              </div>
              <span className="text-[11px] text-slate-400">
                {catPosition === 'near'
                  ? 'The cat is NEAR the tree.'
                  : catPosition === 'far'
                  ? 'The cat is FAR from the tree.'
                  : 'Tap NEAR or FAR'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* MODE 2: NUMBERS 1-20, TEN-FRAMES & CROCODILE COMPARISON */}
      {mode === 'number-line-tenframe' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-11 gap-4 items-center p-4 rounded-xl bg-[#111827] border border-[#1F2937]">
            {/* Left Ten-Frames (Tap any cell!) */}
            <div className="lg:col-span-4 p-3.5 rounded-xl bg-[#090D16] border border-slate-800 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-cyan-400 uppercase">
                  Tap Apples ({numberToWords(leftCount)})
                </span>
                <button
                  type="button"
                  onClick={() => speak(`${leftCount}, ${numberToWords(leftCount)} apples!`, true)}
                  className="text-base font-mono font-extrabold text-white bg-cyan-500/20 px-2.5 py-0.5 rounded border border-cyan-400"
                >
                  {leftCount} ({numberToWords(leftCount)}) 🔊
                </button>
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {Array.from({ length: 20 }).map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      const next = i + 1;
                      setLeftCount(next);
                      speak(`${next}, ${numberToWords(next)} apples`);
                    }}
                    className={`h-8 rounded-lg border flex items-center justify-center text-sm transition-transform hover:scale-105 ${
                      i < leftCount
                        ? 'bg-cyan-500/25 border-cyan-400 text-cyan-200'
                        : 'bg-slate-900/60 border-slate-800 text-slate-700'
                    }`}
                  >
                    {i < leftCount ? '🍎' : i + 1}
                  </button>
                ))}
              </div>
              <div className="text-[11px] font-mono text-slate-400">
                Before {leftCount} is <strong className="text-white">{leftCount - 1}</strong> • After {leftCount} is{' '}
                <strong className="text-white">{leftCount + 1}</strong>
              </div>
            </div>

            {/* Center Crocodile Mouth */}
            <div className="lg:col-span-3 flex flex-col items-center justify-center p-4 rounded-xl bg-[#090D16] border border-emerald-500/30 space-y-2">
              <span className="text-[11px] font-mono uppercase text-emerald-400">
                Hungry Crocodile Mouth 🐊
              </span>
              <div className="text-4xl font-mono font-black text-emerald-400">
                {leftCount} {compSymbol} {rightCount}
              </div>
              <p className="text-xs text-center text-slate-200 font-semibold">
                {numberToWords(leftCount)} {compWord} {numberToWords(rightCount)}
              </p>
              <button
                type="button"
                onClick={() =>
                  awardStar(`${leftCount} ${compWord} ${rightCount}!`)
                }
                className="px-3 py-1 rounded-lg bg-emerald-500 text-slate-950 text-xs font-extrabold"
              >
                🔊 Speak Comparison
              </button>
            </div>

            {/* Right Ten-Frames */}
            <div className="lg:col-span-4 p-3.5 rounded-xl bg-[#090D16] border border-slate-800 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-amber-400 uppercase">
                  Tap Mangoes ({numberToWords(rightCount)})
                </span>
                <button
                  type="button"
                  onClick={() => speak(`${rightCount}, ${numberToWords(rightCount)} mangoes!`, true)}
                  className="text-base font-mono font-extrabold text-white bg-amber-500/20 px-2.5 py-0.5 rounded border border-amber-400"
                >
                  {rightCount} ({numberToWords(rightCount)}) 🔊
                </button>
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {Array.from({ length: 20 }).map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      const next = i + 1;
                      setRightCount(next);
                      speak(`${next}, ${numberToWords(next)} mangoes`);
                    }}
                    className={`h-8 rounded-lg border flex items-center justify-center text-sm transition-transform hover:scale-105 ${
                      i < rightCount
                        ? 'bg-amber-500/25 border-amber-400 text-amber-200'
                        : 'bg-slate-900/60 border-slate-800 text-slate-700'
                    }`}
                  >
                    {i < rightCount ? '🥭' : i + 1}
                  </button>
                ))}
              </div>
              <div className="text-[11px] font-mono text-slate-400">
                {Math.floor(rightCount / 10)} Ten and {rightCount % 10} Ones
              </div>
            </div>
          </div>

          {/* NCERT Ch 4: Making 10 — Interactive Number Bond Rainbow Builder */}
          <div className="p-4 rounded-xl bg-[#111827] border border-amber-500/40 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300">
                  🌈 NCERT Ch 4 (Making 10) & ICSE Number Bonds to 10
                </h4>
                <p className="text-xs text-slate-300">
                  Tap any number (0–10) to see its Rainbow Partner that makes 10!
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  awardStar(`${bondLeft} plus ${10 - bondLeft} makes 10!`)
                }
                className="px-3 py-1 rounded-lg bg-amber-400 text-slate-950 text-xs font-extrabold"
              >
                🔊 {bondLeft} + {10 - bondLeft} = 10
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {Array.from({ length: 11 }, (_, i) => i).map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => {
                    setBondLeft(n);
                    speak(`${n} and ${10 - n} make 10!`);
                  }}
                  className={`px-3 py-1.5 rounded-xl font-mono text-xs font-extrabold border transition-all ${
                    bondLeft === n
                      ? 'bg-amber-400 text-slate-950 border-white scale-105'
                      : 'bg-[#090D16] text-slate-300 border-slate-800'
                  }`}
                >
                  {n} + {10 - n}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-10 gap-1.5 p-3 rounded-xl bg-[#090D16] border border-slate-800">
              {Array.from({ length: 10 }, (_, idx) => {
                const isFirstPart = idx < bondLeft;
                return (
                  <div
                    key={idx}
                    className={`h-9 rounded-lg border flex items-center justify-center text-base font-bold ${
                      isFirstPart
                        ? 'bg-cyan-500/30 border-cyan-400 text-cyan-200'
                        : 'bg-rose-500/30 border-rose-400 text-rose-200'
                    }`}
                  >
                    {isFirstPart ? '🔵' : '🔴'}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* MODE 3: ADDITION & SUBTRACTION FROG NUMBER LINE */}
      {mode === 'addition-subtraction' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const hops = Math.min(changeNum, maxFrogHops(startNum, 'add'));
                  setOperation('add');
                  setChangeNum(hops);
                  speak(`${startNum} plus ${hops} equals ${startNum + hops}`);
                }}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold ${
                  operation === 'add'
                    ? 'bg-emerald-500 text-slate-950'
                    : 'bg-[#111827] text-slate-300 border border-slate-800'
                }`}
              >
                <Plus className="w-3.5 h-3.5" /> Addition (+ Forward Jumps)
              </button>
              <button
                type="button"
                onClick={() => {
                  const hops = Math.min(changeNum, maxFrogHops(startNum, 'sub'));
                  setOperation('sub');
                  setChangeNum(hops);
                  speak(`${startNum} minus ${hops} equals ${startNum - hops}`);
                }}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold ${
                  operation === 'sub'
                    ? 'bg-rose-500 text-white'
                    : 'bg-[#111827] text-slate-300 border border-slate-800'
                }`}
              >
                <Minus className="w-3.5 h-3.5" /> Subtraction (- Backward Jumps)
              </button>
            </div>

            <button
              type="button"
              onClick={() =>
                awardStar(
                  `${startNum} ${operation === 'add' ? 'plus' : 'minus'} ${changeNum} equals ${resultNum}!`
                )
              }
              className="px-3 py-1.5 rounded-lg bg-cyan-500/20 border border-cyan-400 text-xs font-bold text-cyan-200"
            >
              🔊 Speak Number Sentence ({startNum} {operation === 'add' ? '+' : '-'} {changeNum} = {resultNum})
            </button>
          </div>

          <Canvas2DWrapper
            title="Class 1 Number Line Frog Hops (0 to 20)"
            subtitle="Watch the green frog hop forward for Addition (+) and hop backward for Subtraction (-)"
            height={290}
            kidFriendly
            onRender={renderFrogNumberLine}
          />

          <ParameterPanel
            title="Addition & Subtraction Controls"
            sliders={[
              {
                id: 's',
                label: 'Starting Number on Line',
                value: startNum,
                min: 1,
                max: 14,
                step: 1,
                onChange: (v: number) => {
                  setStartNum(v);
                  setChangeNum((c) => Math.min(c, maxFrogHops(v, operation)));
                },
              },
              {
                id: 'c',
                label: 'Number of Frog Hops',
                value: changeNum,
                min: 0,
                max: maxFrogHops(startNum, operation),
                step: 1,
                onChange: setChangeNum,
              },
            ]}
          />
        </div>
      )}

      {/* MODE 4: TENS & ONES ABACUS + MISSION CHALLENGE + SKIP COUNTING */}
      {mode === 'tens-ones-abacus' && (
        <div className="space-y-4">
          {/* Interactive Abacus Challenge Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-[#111827] border border-amber-500/40">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-white">
                🎯 Abacus Mission: Can you make{' '}
                <strong className="text-amber-300 text-sm">
                  {targetAbacusMission} ({numberToWords(targetAbacusMission)})
                </strong>{' '}
                using the + / - rod buttons?
              </span>
            </div>
            <div className="flex items-center gap-2">
              {twoDigitNum === targetAbacusMission ? (
                <button
                  type="button"
                  onClick={() => {
                    const nextTarget = Math.floor(Math.random() * 88) + 11;
                    awardStar(`You made ${targetAbacusMission}, ${numberToWords(targetAbacusMission)}!`);
                    setTargetAbacusMission(nextTarget);
                  }}
                  className="px-3 py-1 rounded-lg bg-emerald-500 text-slate-950 text-xs font-extrabold animate-bounce"
                >
                  🎉 Matched {targetAbacusMission}! Claim +1 ⭐ & Next Mission
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    const nextTarget = Math.floor(Math.random() * 88) + 11;
                    setTargetAbacusMission(nextTarget);
                    speak(`New mission! Can you make ${nextTarget}, ${numberToWords(nextTarget)}?`, true);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 text-xs text-amber-300 border border-slate-700"
                >
                  New Target Number
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Direct-Tap 2-Rod Spike Abacus with Number Word Spelling */}
            <div className="p-4 rounded-xl bg-[#111827] border border-[#1F2937] space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                    Tens & Ones Spike Abacus
                  </h4>
                  <p className="text-sm font-extrabold text-white mt-0.5">
                    {twoDigitNum} = &ldquo;{numberToWords(twoDigitNum)}&rdquo;
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    speak(
                      `${twoDigitNum}, ${numberToWords(twoDigitNum)}, has ${tensDigit} Tens and ${onesDigit} Ones`,
                      true
                    )
                  }
                  className="px-3 py-1.5 rounded-lg bg-cyan-500/20 border border-cyan-400 text-xs font-mono font-bold text-cyan-200"
                >
                  🔊 {tensDigit} Tens + {onesDigit} Ones
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-[#090D16] border border-slate-800">
                {/* Tens Rod */}
                <div className="flex flex-col items-center">
                  <span className="text-xs font-bold text-amber-400 mb-1">
                    TENS ROD (10s)
                  </span>
                  <div className="relative h-36 w-full flex flex-col justify-end items-center py-2">
                    <div className="absolute inset-y-0 w-1.5 bg-slate-700 rounded-full" />
                    {Array.from({ length: tensDigit }).map((_, i) => (
                      <div
                        key={i}
                        className="relative z-10 w-12 h-3 rounded-full bg-amber-500 my-0.5 border border-white/30"
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => setTwoDigitNum((n) => Math.max(0, n - 10))}
                      className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-amber-300 border border-slate-700"
                    >
                      -1 Ten
                    </button>
                    <span className="font-mono text-sm font-bold text-white">{tensDigit}</span>
                    <button
                      type="button"
                      onClick={() => setTwoDigitNum((n) => Math.min(99, n + 10))}
                      className="px-3 py-1 rounded-lg bg-amber-500 text-slate-950 text-xs font-extrabold"
                    >
                      +1 Ten
                    </button>
                  </div>
                </div>

                {/* Ones Rod */}
                <div className="flex flex-col items-center">
                  <span className="text-xs font-bold text-cyan-400 mb-1">
                    ONES ROD (1s)
                  </span>
                  <div className="relative h-36 w-full flex flex-col justify-end items-center py-2">
                    <div className="absolute inset-y-0 w-1.5 bg-slate-700 rounded-full" />
                    {Array.from({ length: onesDigit }).map((_, i) => (
                      <div
                        key={i}
                        className="relative z-10 w-12 h-3 rounded-full bg-cyan-500 my-0.5 border border-white/30"
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => setTwoDigitNum((n) => Math.max(0, n - 1))}
                      className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-cyan-300 border border-slate-700"
                    >
                      -1 One
                    </button>
                    <span className="font-mono text-sm font-bold text-white">{onesDigit}</span>
                    <button
                      type="button"
                      onClick={() => setTwoDigitNum((n) => Math.min(99, n + 1))}
                      className="px-3 py-1 rounded-lg bg-cyan-500 text-slate-950 text-xs font-extrabold"
                    >
                      +1 One
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Skip Counting by 2s, 5s, 10s Board */}
            <div className="p-4 rounded-xl bg-[#111827] border border-[#1F2937] space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  Tap Any Number (Skip Counting by {skipStep}s)
                </h4>
                <div className="flex gap-1">
                  {([2, 5, 10] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setSkipStep(st)}
                      className={`px-2.5 py-1 rounded text-xs font-mono font-bold ${
                        skipStep === st
                          ? 'bg-emerald-500 text-slate-950'
                          : 'bg-[#090D16] text-slate-300 border border-slate-800'
                      }`}
                    >
                      Skip by {st}s
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-10 gap-1 p-2.5 rounded-xl bg-[#090D16] border border-slate-800">
                {Array.from({ length: 50 }, (_, idx) => idx + 1).map((n) => {
                  const isSkipMatch = n % skipStep === 0;
                  return (
                    <button
                      key={n}
                      type="button"
                      onClick={() => {
                        setTwoDigitNum(n);
                        speak(`${n}, ${numberToWords(n)}`);
                      }}
                      className={`h-7 rounded text-[11px] font-mono font-bold transition-all ${
                        n === twoDigitNum
                          ? 'bg-cyan-400 text-slate-950 ring-2 ring-white'
                          : isSkipMatch
                          ? 'bg-emerald-500/25 border border-emerald-400 text-emerald-200'
                          : 'bg-slate-900 text-slate-500'
                      }`}
                    >
                      {n}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODE 5: 2D & 3D SHAPES — ROLLING VS SLIDING RAMP */}
      {mode === 'shapes-roll-slide' && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {SHAPES_3D.map((sh, idx) => (
              <button
                key={sh.id}
                type="button"
                onClick={() => {
                  setSelectedShapeIdx(idx);
                  speak(`${sh.name}, ${sh.behavior}`);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  selectedShapeIdx === idx
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200'
                    : 'bg-[#111827] border-slate-800 text-slate-300'
                }`}
              >
                {sh.name}
              </button>
            ))}
          </div>

          <Canvas2DWrapper
            title="What is Long? What is Round? — Rolling vs. Sliding Inclined Plane"
            subtitle="Curved surfaces ROLL down the ramp; flat faces SLIDE down the ramp"
            height={290}
            kidFriendly
            onRender={renderShapeRamp}
          />

          <ParameterPanel
            title="Ramp Slope Control"
            sliders={[
              {
                id: 'ramp',
                label: 'Ramp Tilt Angle',
                value: rampAngle,
                min: 10,
                max: 35,
                step: 1,
                unit: '°',
                onChange: setRampAngle,
              },
            ]}
          />
        </div>
      )}

      {/* MODE 6: NON-STANDARD MEASUREMENT (HANDSPANS, PAN BALANCE & CAPACITY) */}
      {mode === 'measurement-balance' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-[#111827] border border-[#1F2937] space-y-3">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-bold uppercase text-cyan-400">
                1. Length in Handspans ✋
              </h4>
              <span className="text-xs font-mono font-bold text-white bg-[#090D16] px-2 py-0.5 rounded border border-slate-800">
                {objectHandspans} Handspans
              </span>
            </div>
            <div className="p-3 rounded-xl bg-[#090D16] border border-slate-800 space-y-2">
              <div className="h-6 rounded bg-amber-600/80 border border-amber-400 flex items-center justify-center text-xs font-bold text-slate-950">
                Study Table ({objectHandspans} Handspans)
              </div>
              <div className="flex justify-start gap-1 text-xl">
                {Array.from({ length: objectHandspans }).map((_, i) => (
                  <span key={i}>🖐️</span>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setObjectHandspans((h) => Math.max(2, h - 1))}
                className="flex-1 py-1 rounded bg-slate-800 text-xs font-bold"
              >
                -1 Handspan
              </button>
              <button
                type="button"
                onClick={() => setObjectHandspans((h) => Math.min(9, h + 1))}
                className="flex-1 py-1 rounded bg-cyan-500 text-slate-950 text-xs font-bold"
              >
                +1 Handspan
              </button>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#111827] border border-[#1F2937] space-y-3">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-bold uppercase text-emerald-400">
                2. Heavier vs. Lighter Balance ⚖️
              </h4>
              <span className="text-xs font-mono font-bold text-emerald-300">
                {leftPanBlocks > rightPanBlocks
                  ? 'Left is HEAVIER'
                  : leftPanBlocks < rightPanBlocks
                  ? 'Right is HEAVIER'
                  : 'BALANCED!'}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-[#090D16] border border-slate-800 flex flex-col items-center justify-center h-28">
              <div
                className="w-48 h-2 bg-slate-400 rounded flex justify-between items-center transition-transform duration-300"
                style={{
                  transform: `rotate(${(rightPanBlocks - leftPanBlocks) * 4}deg)`,
                }}
              >
                <div className="px-2 py-1 rounded bg-rose-500 text-white text-xs font-mono font-bold -mt-6">
                  🍉 ({leftPanBlocks})
                </div>
                <div className="px-2 py-1 rounded bg-cyan-500 text-slate-950 text-xs font-mono font-bold -mt-6">
                  🧱 ({rightPanBlocks})
                </div>
              </div>
              <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-b-[20px] border-b-amber-500 mt-1" />
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setLeftPanBlocks((n) => (n >= 10 ? 1 : n + 1))}
                className="py-1 rounded bg-slate-800 text-rose-300 font-mono font-bold"
              >
                Left: {leftPanBlocks} (Tap +)
              </button>
              <button
                type="button"
                onClick={() => setRightPanBlocks((n) => (n >= 10 ? 1 : n + 1))}
                className="py-1 rounded bg-slate-800 text-cyan-300 font-mono font-bold"
              >
                Right: {rightPanBlocks} (Tap +)
              </button>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#111827] border border-[#1F2937] space-y-3">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-bold uppercase text-amber-400">
                3. Jug & Glasses Capacity 🫗
              </h4>
              <span className="text-xs font-mono font-bold text-amber-300">
                1 Jug = {jugCups} Glasses
              </span>
            </div>
            <div className="p-3 rounded-xl bg-[#090D16] border border-slate-800 flex items-center justify-around h-28">
              <div className="text-center">
                <div className="text-3xl">🏺</div>
                <span className="text-[10px] font-mono text-slate-400">1 Big Jug</span>
              </div>
              <span className="text-lg font-bold text-cyan-400">=</span>
              <div className="flex flex-wrap gap-1 justify-center max-w-[130px]">
                {Array.from({ length: jugCups }).map((_, i) => (
                  <span key={i} className="text-xl">
                    🥛
                  </span>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setJugCups((c) => Math.max(2, c - 1))}
                className="flex-1 py-1 rounded bg-slate-800 text-xs font-bold"
              >
                -1 Glass
              </button>
              <button
                type="button"
                onClick={() => setJugCups((c) => Math.min(8, c + 1))}
                className="flex-1 py-1 rounded bg-amber-500 text-slate-950 text-xs font-bold"
              >
                +1 Glass
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODE 7: INTERACTIVE TAP-ON-DIAL CLOCK & TOY SHOP CASHIER GAME */}
      {mode === 'clock-money' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Tap-on-Numbers Analog Clock */}
          <div className="p-4 rounded-xl bg-[#111827] border border-[#1F2937] space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                Tap Any Number (1–12) on the Clock Face!
              </h4>
              <button
                type="button"
                onClick={() =>
                  speak(
                    clockHalfHour
                      ? `It is half past ${clockHour}`
                      : `It is ${clockHour} o'clock`,
                    true
                  )
                }
                className="px-2.5 py-1 rounded bg-cyan-500/20 border border-cyan-400 font-mono text-xs font-bold text-cyan-200"
              >
                🔊 {clockHour}:{clockHalfHour ? '30' : '00'} ({clockHalfHour ? `Half past ${clockHour}` : `${clockHour} o'clock`})
              </button>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-around gap-4 p-4 rounded-xl bg-[#090D16] border border-slate-800">
              <svg width="185" height="185" viewBox="-92 -92 184 184">
                <circle r="84" fill="#111827" stroke="#38bdf8" strokeWidth="4" />
                {Array.from({ length: 12 }, (_, i) => i + 1).map((hr) => {
                  const angle = ((hr * 30 - 90) * Math.PI) / 180;
                  const x = Math.cos(angle) * 66;
                  const y = Math.sin(angle) * 66;
                  const isSelected = clockHour === hr;
                  return (
                    <g
                      key={hr}
                      onClick={() => {
                        setClockHour(hr);
                        speak(`${hr} o'clock`);
                      }}
                      className="cursor-pointer"
                    >
                      <circle
                        cx={x}
                        cy={y}
                        r="13"
                        fill={isSelected ? '#06b6d4' : '#1e293b'}
                      />
                      <text
                        x={x}
                        y={y + 4}
                        textAnchor="middle"
                        fill={isSelected ? '#090d16' : '#f8fafc'}
                        fontSize="12"
                        fontWeight="bold"
                        fontFamily="monospace"
                      >
                        {hr}
                      </text>
                    </g>
                  );
                })}
                {/* Short Hour Hand */}
                {(() => {
                  const hrDeg = (clockHour % 12) * 30 + (clockHalfHour ? 15 : 0) - 90;
                  const hrRad = (hrDeg * Math.PI) / 180;
                  return (
                    <line
                      x1="0"
                      y1="0"
                      x2={Math.cos(hrRad) * 40}
                      y2={Math.sin(hrRad) * 40}
                      stroke="#f43f5e"
                      strokeWidth="5"
                      strokeLinecap="round"
                    />
                  );
                })()}
                {/* Long Minute Hand */}
                {(() => {
                  const minDeg = (clockHalfHour ? 180 : 0) - 90;
                  const minRad = (minDeg * Math.PI) / 180;
                  return (
                    <line
                      x1="0"
                      y1="0"
                      x2={Math.cos(minRad) * 54}
                      y2={Math.sin(minRad) * 54}
                      stroke="#10b981"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />
                  );
                })()}
                <circle r="5" fill="#fde047" />
              </svg>

              <div className="space-y-2.5 w-full sm:w-44">
                <p className="text-xs text-slate-300">
                  🔴 <strong>Short Red Hand</strong> = Hour ({clockHour})
                  <br />
                  🟢 <strong>Long Green Hand</strong> = Minutes
                </p>
                <button
                  type="button"
                  onClick={() => setClockHalfHour((h) => !h)}
                  className="w-full py-2 rounded-lg bg-emerald-500/20 border border-emerald-400 text-xs font-bold text-emerald-200"
                >
                  Switch to {clockHalfHour ? "O'Clock (:00)" : 'Half-Past (:30)'}
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Toy Shop Cashier Game */}
          <div className="p-4 rounded-xl bg-[#111827] border border-[#1F2937] space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <IndianRupee className="w-4 h-4" />
                Class 1 Toy Shop Cashier Game
              </h4>
              <span
                className={`px-2.5 py-1 rounded font-mono text-xs font-bold border ${
                  totalMoney === activeToy.price
                    ? 'bg-emerald-500 text-slate-950 border-white'
                    : 'bg-amber-500/20 border-amber-400 text-amber-200'
                }`}
              >
                Your Coins: ₹{totalMoney} / Price: ₹{activeToy.price}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#090D16] border border-slate-800 space-y-3">
              {/* Pick a Toy to Buy */}
              <div className="grid grid-cols-4 gap-1.5">
                {TOY_SHOP_ITEMS.map((toy, idx) => (
                  <button
                    key={toy.id}
                    type="button"
                    onClick={() => {
                      setSelectedToyIdx(idx);
                      setWalletCoins([]);
                      speak(`Can you pay ${toy.price} rupees for the ${toy.name}?`);
                    }}
                    className={`p-2 rounded-lg border text-center transition-all ${
                      selectedToyIdx === idx
                        ? 'bg-amber-500/25 border-amber-400 text-white'
                        : 'bg-[#111827] border-slate-800 text-slate-400'
                    }`}
                  >
                    <div className="text-xl">{toy.icon}</div>
                    <div className="text-[10px] truncate">{toy.name}</div>
                    <div className="text-xs font-mono font-bold text-amber-300">
                      ₹{toy.price}
                    </div>
                  </button>
                ))}
              </div>

              {/* Add Coins & Notes */}
              <div className="flex flex-wrap items-center gap-1.5">
                {[1, 2, 5, 10, 20].map((denom) => (
                  <button
                    key={denom}
                    type="button"
                    onClick={() => setWalletCoins((prev) => [...prev, denom])}
                    className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400 text-xs font-mono font-bold text-amber-200"
                  >
                    + ₹{denom}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setWalletCoins([])}
                  className="px-2.5 py-1 rounded-lg bg-rose-500/20 border border-rose-500/40 text-xs font-mono text-rose-300"
                >
                  Reset ₹0
                </button>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#111827] border border-slate-800">
                <div className="flex flex-wrap gap-1">
                  {walletCoins.length === 0 ? (
                    <span className="text-xs text-slate-500">
                      Tap coins above to make ₹{activeToy.price}
                    </span>
                  ) : (
                    walletCoins.map((c, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-mono text-xs font-bold"
                      >
                        ₹{c}
                      </span>
                    ))
                  )}
                </div>

                {totalMoney === activeToy.price && (
                  <button
                    type="button"
                    onClick={() =>
                      awardStar(`Exact change! You bought the ${activeToy.name} for ${activeToy.price} rupees!`)
                    }
                    className="px-3 py-1 rounded-lg bg-emerald-500 text-slate-950 text-xs font-extrabold shrink-0"
                  >
                    🎉 Buy Toy (+1 ⭐)
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* NCERT Ch 10 & ICSE Calendar: 7 Days of the Week & 12 Months of the Year */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-[#111827] border border-[#1F2937] space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                🗓️ 7 Days of the Week (Yesterday, Today & Tomorrow)
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {DAYS_OF_WEEK.map((d, idx) => (
                  <button
                    key={d.day}
                    type="button"
                    onClick={() => {
                      setSelectedDayIdx(idx);
                      speak(`${d.day} is the ${d.order}. ${d.activity}`);
                    }}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-extrabold border ${
                      selectedDayIdx === idx
                        ? 'bg-emerald-500 text-slate-950 border-white'
                        : 'bg-[#090D16] text-slate-300 border-slate-800'
                    }`}
                  >
                    {idx + 1}. {d.day}
                  </button>
                ))}
              </div>
              <div className="p-3 rounded-xl bg-[#090D16] border border-emerald-500/30 space-y-1 text-xs">
                <div className="font-extrabold text-white">
                  Today is <span className="text-emerald-300">{DAYS_OF_WEEK[selectedDayIdx].day}</span> ({DAYS_OF_WEEK[selectedDayIdx].order})
                </div>
                <p className="text-slate-300">{DAYS_OF_WEEK[selectedDayIdx].activity}</p>
                <div className="text-[11px] font-mono text-slate-400 pt-1">
                  Yesterday was <strong className="text-amber-300">{DAYS_OF_WEEK[(selectedDayIdx + 6) % 7].day}</strong> • Tomorrow will be{' '}
                  <strong className="text-cyan-300">{DAYS_OF_WEEK[(selectedDayIdx + 1) % 7].day}</strong>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#111827] border border-[#1F2937] space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                📅 12 Months of the Year (1 Year = 12 Months)
              </h4>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
                {MONTHS_OF_YEAR.map((item, idx) => (
                  <button
                    key={item.m}
                    type="button"
                    onClick={() => {
                      setSelectedMonthIdx(idx);
                      speak(`${item.m}, ${item.days} days. ${item.note}`);
                    }}
                    className={`p-1.5 rounded-lg text-[11px] font-bold border text-center ${
                      selectedMonthIdx === idx
                        ? 'bg-cyan-500 text-slate-950 border-white'
                        : 'bg-[#090D16] text-slate-300 border-slate-800'
                    }`}
                  >
                    {idx + 1}. {item.m.slice(0, 3)}
                  </button>
                ))}
              </div>
              <div className="p-3 rounded-xl bg-[#090D16] border border-cyan-500/30 text-xs space-y-1">
                <div className="font-extrabold text-cyan-300">
                  {MONTHS_OF_YEAR[selectedMonthIdx].m} ({MONTHS_OF_YEAR[selectedMonthIdx].days} Days)
                </div>
                <p className="text-slate-200">{MONTHS_OF_YEAR[selectedMonthIdx].note}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODE 8: PATTERNS (UTSAV) & TOY PICTOGRAPH DATA HANDLING */}
      {mode === 'patterns-pictograph' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-[#111827] border border-[#1F2937] space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase text-cyan-400">
                NCERT Ch 9 (Utsav): What Comes Next in the Pattern?
              </h4>
              <div className="flex gap-1">
                {(['ABAB', 'AAB', 'ABC', 'NUM'] as const).map((pt) => (
                  <button
                    key={pt}
                    type="button"
                    onClick={() => setPatternType(pt)}
                    className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold ${
                      patternType === pt
                        ? 'bg-cyan-500 text-slate-950'
                        : 'bg-[#090D16] text-slate-400 border border-slate-800'
                    }`}
                  >
                    {pt}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#090D16] border border-slate-800 space-y-3">
              <div className="flex items-center justify-around text-2xl py-2">
                {(patternType === 'ABAB'
                  ? ['🔴', '🟦', '🔴', '🟦', '🔴', '🟦']
                  : patternType === 'AAB'
                  ? ['⭐', '⭐', '🌙', '⭐', '⭐', '🌙']
                  : patternType === 'ABC'
                  ? ['🍎', '🍌', '🍇', '🍎', '🍌', '🍇']
                  : ['2', '4', '6', '8', '10', '12']
                ).map((item, idx) => (
                  <span
                    key={idx}
                    className="w-11 h-11 rounded-lg bg-[#111827] border border-cyan-500/30 flex items-center justify-center font-mono font-bold text-base"
                  >
                    {item}
                  </span>
                ))}
              </div>
              <p className="text-xs text-slate-300 font-mono">
                Rule:{' '}
                {patternType === 'ABAB'
                  ? 'Alternating Circle and Square (A-B-A-B)'
                  : patternType === 'AAB'
                  ? 'Two Stars followed by One Moon (A-A-B)'
                  : patternType === 'ABC'
                  ? 'Three repeating fruits (A-B-C)'
                  : 'Growing Number Pattern (+2 each step)'}
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#111827] border border-[#1F2937] space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase text-emerald-400">
                NCERT Ch 13 (So Many Toys): Interactive Pictograph
              </h4>
              <span className="text-xs font-mono text-emerald-300">
                Total Toys = {toyCounts.cars + toyCounts.dolls + toyCounts.balls + toyCounts.blocks}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#090D16] border border-slate-800 space-y-2">
              {(
                [
                  { key: 'cars', label: 'Toy Cars', icon: '🚗', count: toyCounts.cars },
                  { key: 'dolls', label: 'Dolls', icon: '🪆', count: toyCounts.dolls },
                  { key: 'balls', label: 'Balls', icon: '⚽', count: toyCounts.balls },
                  { key: 'blocks', label: 'Blocks', icon: '🧱', count: toyCounts.blocks },
                ] as const
              ).map((row) => (
                <div
                  key={row.key}
                  className="flex items-center justify-between gap-2 p-2 rounded-lg bg-[#111827] border border-slate-800"
                >
                  <span className="text-xs font-semibold w-24 text-slate-200">
                    {row.label} ({row.count})
                  </span>
                  <div className="flex-1 flex gap-1 text-base overflow-x-auto">
                    {Array.from({ length: row.count }).map((_, i) => (
                      <span key={i}>{row.icon}</span>
                    ))}
                  </div>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() =>
                        setToyCounts((prev) => ({
                          ...prev,
                          [row.key]: Math.max(1, prev[row.key] - 1),
                        }))
                      }
                      className="px-2 py-0.5 rounded bg-slate-800 text-xs font-bold"
                    >
                      -
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setToyCounts((prev) => ({
                          ...prev,
                          [row.key]: Math.min(9, prev[row.key] + 1),
                        }))
                      }
                      className="px-2 py-0.5 rounded bg-slate-800 text-xs font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODE 9: ORDINALS (1st-10th) & REPEATED ADDITION GROUPS */}
      {mode === 'spatial-ordinals-data' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-[#111827] border border-[#1F2937] space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                Ordinal Numbers (1st First to 10th Tenth)
              </h4>
              <span className="px-2.5 py-1 rounded bg-cyan-500/20 border border-cyan-400 text-xs font-mono font-bold text-cyan-200">
                Position #{selectedOrdinal}
              </span>
            </div>

            <div className="grid grid-cols-5 gap-2 p-3 rounded-xl bg-[#090D16] border border-slate-800">
              {[
                { pos: 1, ord: '1st', word: 'First', icon: '🥇' },
                { pos: 2, ord: '2nd', word: 'Second', icon: '🥈' },
                { pos: 3, ord: '3rd', word: 'Third', icon: '🥉' },
                { pos: 4, ord: '4th', word: 'Fourth', icon: '🏃' },
                { pos: 5, ord: '5th', word: 'Fifth', icon: '🏃' },
                { pos: 6, ord: '6th', word: 'Sixth', icon: '🏃' },
                { pos: 7, ord: '7th', word: 'Seventh', icon: '🏃' },
                { pos: 8, ord: '8th', word: 'Eighth', icon: '🏃' },
                { pos: 9, ord: '9th', word: 'Ninth', icon: '🏃' },
                { pos: 10, ord: '10th', word: 'Tenth', icon: '🏁' },
              ].map((item) => (
                <button
                  key={item.pos}
                  type="button"
                  onClick={() => {
                    setSelectedOrdinal(item.pos);
                    speak(`${item.ord}, ${item.word} position!`);
                  }}
                  className={`p-2 rounded-lg border text-center transition-all ${
                    selectedOrdinal === item.pos
                      ? 'bg-cyan-500/25 border-cyan-400 text-white scale-105'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  <div className="text-base">{item.icon}</div>
                  <div className="text-xs font-mono font-bold text-cyan-300">{item.ord}</div>
                  <div className="text-[10px]">{item.word}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#111827] border border-[#1F2937] space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">
                Equal Groups ({groupsCount} groups of {itemsPerGroup})
              </h4>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => setGroupsCount((g) => (g >= 6 ? 2 : g + 1))}
                  className="px-2 py-0.5 rounded bg-slate-800 text-xs font-mono text-amber-300"
                >
                  Groups: {groupsCount}
                </button>
                <button
                  type="button"
                  onClick={() => setItemsPerGroup((i) => (i >= 5 ? 2 : i + 1))}
                  className="px-2 py-0.5 rounded bg-slate-800 text-xs font-mono text-cyan-300"
                >
                  Each: {itemsPerGroup}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 p-3 rounded-xl bg-[#090D16] border border-slate-800">
              {Array.from({ length: groupsCount }).map((_, gIdx) => (
                <div
                  key={gIdx}
                  className="p-2.5 rounded-lg bg-[#111827] border border-amber-500/30 flex flex-col items-center gap-1"
                >
                  <span className="text-[10px] font-mono text-slate-400">Group {gIdx + 1}</span>
                  <div className="flex flex-wrap justify-center gap-1 text-base">
                    {Array.from({ length: itemsPerGroup }).map((__, sIdx) => (
                      <span key={sIdx}>⭐</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs font-mono text-slate-300 bg-[#090D16] p-2.5 rounded-lg border border-slate-800">
              {Array.from({ length: groupsCount })
                .map(() => itemsPerGroup)
                .join(' + ')}{' '}
              = <strong className="text-amber-300">{groupsCount * itemsPerGroup}</strong> (
              {numberToWords(groupsCount * itemsPerGroup)} Stars)
            </p>
          </div>
        </div>
      )}

      {/* MODE 10: CLASS 1 ENGLISH — VOWELS (A, E, I, O, U), PHONICS CVC BUILDER & A/AN */}
      {mode === 'eng-phonics-vowels' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* CVC 3-Letter Vowel Word Builder */}
          <div className="p-4 rounded-xl bg-[#111827] border border-[#1F2937] space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase text-cyan-400">
                NCERT Mridang & ICSE English: 5 Vowels (A, E, I, O, U) Word Builder
              </h4>
              <span className="text-xs font-mono text-emerald-300">
                Tap a Vowel to Complete the Word!
              </span>
            </div>

            <div className="p-4 rounded-xl bg-[#090D16] border border-slate-800 flex flex-col items-center space-y-3">
              <div className="flex gap-1.5">
                {CVC_WORDS.map((item, idx) => (
                  <button
                    key={item.word}
                    type="button"
                    onClick={() => {
                      setCvcIdx(idx);
                      setChosenVowel(item.vowel);
                      speak(`${item.word}! ${item.hint}`);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-sm border ${
                      cvcIdx === idx
                        ? 'bg-cyan-500/25 border-cyan-400 text-white'
                        : 'bg-[#111827] border-slate-800'
                    }`}
                  >
                    {item.icon}
                  </button>
                ))}
              </div>

              <div className="text-5xl">{CVC_WORDS[cvcIdx].icon}</div>
              <p className="text-xs text-slate-300">{CVC_WORDS[cvcIdx].hint}</p>

              {/* 3 Letter Tiles */}
              <div className="flex items-center gap-2 text-2xl font-mono font-black">
                <span className="w-12 h-12 rounded-xl bg-[#111827] border border-slate-700 flex items-center justify-center text-white">
                  {CVC_WORDS[cvcIdx].c1}
                </span>
                <span
                  className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center ${
                    chosenVowel === CVC_WORDS[cvcIdx].vowel
                      ? 'bg-emerald-500/30 border-emerald-400 text-emerald-200'
                      : 'bg-rose-500/30 border-rose-400 text-rose-200'
                  }`}
                >
                  {chosenVowel}
                </span>
                <span className="w-12 h-12 rounded-xl bg-[#111827] border border-slate-700 flex items-center justify-center text-white">
                  {CVC_WORDS[cvcIdx].c2}
                </span>
              </div>

              {/* 5 Vowel Buttons */}
              <div className="flex gap-2">
                {['A', 'E', 'I', 'O', 'U'].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => {
                      setChosenVowel(v);
                      if (v === CVC_WORDS[cvcIdx].vowel) {
                        awardStar(
                          `Correct! ${CVC_WORDS[cvcIdx].c1}, ${v}, ${CVC_WORDS[cvcIdx].c2} spells ${CVC_WORDS[cvcIdx].word}!`
                        );
                      } else {
                        speak(`Try another vowel for ${CVC_WORDS[cvcIdx].word}`);
                      }
                    }}
                    className={`w-10 h-10 rounded-xl font-mono font-extrabold text-sm border transition-all ${
                      chosenVowel === v
                        ? 'bg-cyan-500 text-slate-950 border-white scale-110'
                        : 'bg-[#111827] text-cyan-300 border-cyan-500/40 hover:bg-cyan-500/20'
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Use of 'A' vs 'An' Article Explorer */}
          <div className="p-4 rounded-xl bg-[#111827] border border-[#1F2937] space-y-3">
            <h4 className="text-xs font-bold uppercase text-amber-400">
              Use of &ldquo;An&rdquo; (Before Vowel Sounds A, E, I, O, U) vs. &ldquo;A&rdquo;
            </h4>

            <div className="p-4 rounded-xl bg-[#090D16] border border-slate-800 space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { word: 'Apple', article: 'An', icon: '🍎', isVowel: true },
                  { word: 'Elephant', article: 'An', icon: '🐘', isVowel: true },
                  { word: 'Ice-Cream', article: 'An', icon: '🍦', isVowel: true },
                  { word: 'Orange', article: 'An', icon: '🍊', isVowel: true },
                  { word: 'Umbrella', article: 'An', icon: '☂️', isVowel: true },
                  { word: 'Ball', article: 'A', icon: '⚽', isVowel: false },
                ].map((item, idx) => (
                  <button
                    key={item.word}
                    type="button"
                    onClick={() => {
                      setArticleWordIdx(idx);
                      speak(`${item.article} ${item.word}!`);
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      articleWordIdx === idx
                        ? 'bg-amber-500/20 border-amber-400 text-white'
                        : 'bg-[#111827] border-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="text-2xl">{item.icon}</div>
                    <div className="text-xs font-bold mt-1">
                      <span className="text-amber-300 underline mr-1">{item.article}</span>
                      {item.word}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {item.isVowel ? 'Starts with Vowel' : 'Starts with Consonant'}
                    </div>
                  </button>
                ))}
              </div>
              <p className="text-xs text-slate-300">
                Rule: Use <strong className="text-amber-300">An</strong> before words starting with a vowel sound (<strong>A, E, I, O, U</strong>) and <strong className="text-cyan-300">A</strong> before consonant sounds!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* MODE 11: CLASS 1 ENGLISH — OPPOSITES, ACTION WORDS (VERBS) & ONE/MANY */}
      {mode === 'eng-grammar-opposites' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Opposites (Antonyms) Explorer */}
          <div className="p-4 rounded-xl bg-[#111827] border border-[#1F2937] space-y-3">
            <h4 className="text-xs font-bold uppercase text-cyan-400">
              Class 1 English — Opposites (Antonyms) Explorer
            </h4>
            <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-[#090D16] border border-slate-800">
              {[
                { w1: '🔥 Hot Tea', w2: '🧊 Cold Ice', speech: 'The opposite of Hot is Cold!' },
                { w1: '🐘 Big Elephant', w2: '🐭 Small Mouse', speech: 'The opposite of Big is Small!' },
                { w1: '☀️ Day', w2: '🌙 Night', speech: 'The opposite of Day is Night!' },
                { w1: '😊 Happy', w2: '😢 Sad', speech: 'The opposite of Happy is Sad!' },
                { w1: '🐇 Fast Rabbit', w2: '🐢 Slow Tortoise', speech: 'The opposite of Fast is Slow!' },
                { w1: '⬆️ Up', w2: '⬇️ Down', speech: 'The opposite of Up is Down!' },
              ].map((pair, idx) => (
                <button
                  key={pair.w1}
                  type="button"
                  onClick={() => {
                    setOppositeIdx(idx);
                    awardStar(pair.speech);
                  }}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-between ${
                    oppositeIdx === idx
                      ? 'bg-cyan-500/20 border-cyan-400 text-white'
                      : 'bg-[#111827] border-slate-800 text-slate-300'
                  }`}
                >
                  <span>{pair.w1}</span>
                  <span className="text-cyan-400">↔</span>
                  <span>{pair.w2}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Action Words (Verbs) & One/Many (Singular/Plural) */}
          <div className="p-4 rounded-xl bg-[#111827] border border-[#1F2937] space-y-3">
            <h4 className="text-xs font-bold uppercase text-emerald-400">
              Action Words (Doing Words) & One vs. Many (Plurals)
            </h4>
            <div className="p-3.5 rounded-xl bg-[#090D16] border border-slate-800 space-y-3">
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { verb: '📖 Reading a book', speech: 'Reading is an action word!' },
                  { verb: '🏃 Running fast', speech: 'Running is an action word!' },
                  { verb: '🏊 Swimming in water', speech: 'Swimming is an action word!' },
                  { verb: '🎤 Singing a song', speech: 'Singing is an action word!' },
                ].map((v) => (
                  <button
                    key={v.verb}
                    type="button"
                    onClick={() => speak(v.speech, true)}
                    className="p-2 rounded-lg bg-[#111827] border border-emerald-500/30 text-emerald-200 font-semibold text-left hover:border-emerald-400"
                  >
                    {v.verb} 🔊
                  </button>
                ))}
              </div>

              <div className="p-2.5 rounded-lg bg-[#111827] border border-slate-800 text-xs text-slate-300 space-y-1">
                <div className="font-bold text-amber-300">One and Many (Singular & Plural):</div>
                <div>• One Cat 🐱 → Many <strong>Cats</strong> 🐱🐱🐱</div>
                <div>• One Star ⭐ → Many <strong>Stars</strong> ⭐⭐⭐</div>
                <div>• One Mango 🥭 → Many <strong>Mangoes</strong> 🥭🥭🥭</div>
              </div>

              <div className="p-2.5 rounded-lg bg-[#111827] border border-cyan-500/30 text-xs text-slate-300 space-y-1">
                <div className="font-bold text-cyan-300">ICSE Pronouns (Words Used Instead of Naming Words):</div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {[
                    { p: 'HE 👦', use: 'Used for a boy or man (He is my brother).' },
                    { p: 'SHE 👧', use: 'Used for a girl or woman (She is my sister).' },
                    { p: 'IT 🐶', use: 'Used for an animal, bird, or thing (It is a red ball).' },
                    { p: 'THEY 👫', use: 'Used when talking about more than one person or thing!' },
                  ].map((pr) => (
                    <button
                      key={pr.p}
                      type="button"
                      onClick={() => speak(`${pr.p}. ${pr.use}`, true)}
                      className="px-2 py-1 rounded bg-[#090D16] border border-slate-700 hover:border-cyan-400 text-[11px] font-bold text-cyan-200"
                    >
                      {pr.p} 🔊
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODE 11B: NCERT MRIDANG POEMS, STORIES & GREETINGS THEATRE */}
      {mode === 'eng-mridang-stories' && (
        <div className="p-4 rounded-2xl bg-[#111827] border border-[#1F2937] space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">
                🎭 NCERT Class 1 Mridang — Interactive Poems, Stories & Greetings Theatre
              </h4>
              <p className="text-xs text-slate-300">
                Choose a story or poem from your Mridang textbook and tap any line for Read-Along voice!
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {MRIDANG_STORIES.map((st, idx) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => {
                    setSelectedStoryIdx(idx);
                    setActiveStoryLine(0);
                    speak(`${st.title}. ${st.lines[0]}`);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold border transition-all ${
                    selectedStoryIdx === idx
                      ? 'bg-amber-500 text-slate-950 border-white'
                      : 'bg-[#090D16] text-slate-300 border-slate-800'
                  }`}
                >
                  {st.icon} {st.title.split(' ')[0]} {st.title.split(' ')[1]}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#090D16] border border-amber-500/30 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2.5">
                <span className="text-3xl">{MRIDANG_STORIES[selectedStoryIdx].icon}</span>
                <div>
                  <span className="text-[10px] font-mono text-amber-300 uppercase">
                    {MRIDANG_STORIES[selectedStoryIdx].unit}
                  </span>
                  <h5 className="text-sm font-black text-white">
                    {MRIDANG_STORIES[selectedStoryIdx].title}
                  </h5>
                </div>
              </div>
              <button
                type="button"
                onClick={() =>
                  awardStar(
                    `${MRIDANG_STORIES[selectedStoryIdx].title}. ${MRIDANG_STORIES[
                      selectedStoryIdx
                    ].lines.join(' ')}`
                  )
                }
                className="px-3 py-1.5 rounded-xl bg-amber-400 text-slate-950 text-xs font-extrabold"
              >
                🔊 Read Whole Story Aloud (+1 ⭐)
              </button>
            </div>

            <div className="space-y-2">
              {MRIDANG_STORIES[selectedStoryIdx].lines.map((line, lIdx) => (
                <button
                  key={lIdx}
                  type="button"
                  onClick={() => {
                    setActiveStoryLine(lIdx);
                    speak(line, true);
                  }}
                  className={`w-full text-left p-3 rounded-xl border text-xs sm:text-sm font-semibold flex items-center justify-between gap-2 transition-all ${
                    activeStoryLine === lIdx
                      ? 'bg-amber-500/20 border-amber-400 text-amber-100 scale-[1.01]'
                      : 'bg-[#111827] border-slate-800 text-slate-300 hover:text-white'
                  }`}
                >
                  <span>
                    <strong className="text-amber-400 font-mono mr-2">{lIdx + 1}.</strong>
                    {line}
                  </span>
                  <span className="text-xs text-amber-300 shrink-0">🔊 Listen</span>
                </button>
              ))}
            </div>

            <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-500/30 text-xs text-emerald-200">
              🌟 <strong>Story Takeaway:</strong> {MRIDANG_STORIES[selectedStoryIdx].moral}
            </div>
          </div>
        </div>
      )}

      {/* MODE 12: EVS 5 SENSE ORGANS */}
      {mode === 'evs-sense-organs' && (
        <div className="p-4 rounded-xl bg-[#111827] border border-[#1F2937] space-y-4">
          <div className="flex flex-wrap gap-2">
            {SENSE_ORGANS.map((s, idx) => (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  setSelectedSenseIdx(idx);
                  speak(`${s.organ}. ${s.action}`);
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
                  selectedSenseIdx === idx
                    ? 'bg-cyan-500 text-slate-950 border-white'
                    : 'bg-[#090D16] text-slate-300 border-slate-800 hover:text-white'
                }`}
              >
                {s.organ}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl bg-[#090D16] border border-slate-800">
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase text-cyan-400">
                What this Sense Organ Does
              </span>
              <h4 className="text-base font-bold text-white">
                {SENSE_ORGANS[selectedSenseIdx].organ}
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                {SENSE_ORGANS[selectedSenseIdx].action}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase text-amber-400">
                Real-World Stimulus Example
              </span>
              <div className="p-3 rounded-lg bg-[#111827] border border-amber-500/30 text-xs font-semibold text-amber-200">
                {SENSE_ORGANS[selectedSenseIdx].stimulus}
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase text-emerald-400">
                Healthy Hygiene & Care Habit
              </span>
              <div className="p-3 rounded-lg bg-[#111827] border border-emerald-500/30 text-xs text-emerald-200 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
                <span>{SENSE_ORGANS[selectedSenseIdx].careTip}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODE 13: EVS GROWING PLANT & LIVING VS NON-LIVING */}
      {mode === 'evs-plants-living' && (
        <div className="space-y-4">
          <Canvas2DWrapper
            title="Class 1 EVS — Parts of a Plant & What Plants Need to Grow"
            subtitle="Adjust Sunlight and Water to help the seed grow Roots, Stem, Leaves, and Flowers"
            height={320}
            kidFriendly
            onRender={renderPlantGrowth}
          />
          <ParameterPanel
            title="Plant Growth Care Controls"
            sliders={[
              {
                id: 'water',
                label: 'Watering Level (Roots Absorb Water)',
                value: waterLevel,
                min: 10,
                max: 100,
                step: 5,
                unit: '%',
                onChange: setWaterLevel,
              },
              {
                id: 'sun',
                label: 'Warm Sunlight (Leaves Make Food)',
                value: sunlightLevel,
                min: 10,
                max: 100,
                step: 5,
                unit: '%',
                onChange: setSunlightLevel,
              },
            ]}
          />
        </div>
      )}

      {/* MODE 14: EVS ANIMALS & TRAFFIC SAFETY */}
      {mode === 'evs-animals-food-safety' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-[#111827] border border-[#1F2937] space-y-3">
            <h4 className="text-xs font-bold uppercase text-emerald-400">
              Class 1 EVS — Animals Around Us (Wild, Domestic, Pet & Water)
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {(
                [
                  { id: 'wild', label: 'Wild Animals (Jungle)' },
                  { id: 'domestic', label: 'Domestic / Farm Helpers' },
                  { id: 'pet', label: 'Pet Animals (Home)' },
                  { id: 'water', label: 'Aquatic (Water) Animals' },
                ] as const
              ).map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setAnimalCategory(cat.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                    animalCategory === cat.id
                      ? 'bg-emerald-500 text-slate-950'
                      : 'bg-[#090D16] text-slate-300 border border-slate-800'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="p-4 rounded-xl bg-[#090D16] border border-slate-800 space-y-2">
              <div className="text-2xl flex justify-around py-2">
                {animalCategory === 'wild' && (
                  <>
                    <span>🦁 Lion</span>
                    <span>🐘 Elephant</span>
                    <span>🐯 Tiger</span>
                  </>
                )}
                {animalCategory === 'domestic' && (
                  <>
                    <span>🐄 Cow</span>
                    <span>🐑 Sheep</span>
                    <span>🐎 Horse</span>
                  </>
                )}
                {animalCategory === 'pet' && (
                  <>
                    <span>🐶 Dog</span>
                    <span>🐱 Cat</span>
                    <span>🦜 Parrot</span>
                  </>
                )}
                {animalCategory === 'water' && (
                  <>
                    <span>🐟 Fish</span>
                    <span>🐬 Dolphin</span>
                    <span>🐙 Octopus</span>
                  </>
                )}
              </div>
              <p className="text-xs text-slate-300">
                {animalCategory === 'wild'
                  ? 'Wild animals live in forests and jungles. The Lion lives in a Den.'
                  : animalCategory === 'domestic'
                  ? 'Domestic farm animals help us: Cows give milk (Shed), Sheep give wool, Horses pull carts (Stable).'
                  : animalCategory === 'pet'
                  ? 'Pet animals live with us at home as our friends. A dog guards our house (Kennel).'
                  : 'Water (aquatic) animals live in rivers, lakes, and oceans.'}
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#111827] border border-[#1F2937] space-y-3">
            <h4 className="text-xs font-bold uppercase text-amber-400">
              Class 1 EVS — Tap the Traffic Signal Lights! 🚦
            </h4>
            <div className="flex items-center justify-around p-4 rounded-xl bg-[#090D16] border border-slate-800">
              <div className="p-3 rounded-2xl bg-slate-900 border-2 border-slate-700 flex flex-col gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setTrafficLight('red');
                    speak('Red light says STOP!');
                  }}
                  className={`w-10 h-10 rounded-full transition-all ${
                    trafficLight === 'red'
                      ? 'bg-rose-500 shadow-lg shadow-rose-500/60 scale-110'
                      : 'bg-rose-950/50'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => {
                    setTrafficLight('yellow');
                    speak('Yellow light says WAIT and get ready!');
                  }}
                  className={`w-10 h-10 rounded-full transition-all ${
                    trafficLight === 'yellow'
                      ? 'bg-amber-400 shadow-lg shadow-amber-400/60 scale-110'
                      : 'bg-amber-950/50'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => {
                    setTrafficLight('green');
                    speak('Green light says GO safely!');
                  }}
                  className={`w-10 h-10 rounded-full transition-all ${
                    trafficLight === 'green'
                      ? 'bg-emerald-500 shadow-lg shadow-emerald-500/60 scale-110'
                      : 'bg-emerald-950/50'
                  }`}
                />
              </div>

              <div className="max-w-xs space-y-2">
                <div className="text-sm font-mono font-bold text-white">
                  {trafficLight === 'red'
                    ? '🔴 RED LIGHT SAYS: STOP!'
                    : trafficLight === 'yellow'
                    ? '🟡 YELLOW LIGHT SAYS: WAIT!'
                    : '🟢 GREEN LIGHT SAYS: GO!'}
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Always cross the road at the black-and-white{' '}
                  <strong className="text-cyan-300">Zebra Crossing</strong> with an elder!
                </p>
              </div>
            </div>
          </div>

          {/* ICSE & CBSE Class 1: Animal Babies (Young Ones), Homes & Sounds */}
          <div className="lg:col-span-2 p-4 rounded-xl bg-[#111827] border border-[#1F2937] space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400">
              🐾 Animal Babies (Young Ones), Animal Homes & Sounds (ICSE & CBSE Class 1)
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
              {ANIMAL_FAMILIES.map((af, idx) => (
                <button
                  key={af.animal}
                  type="button"
                  onClick={() => {
                    setSelectedAnimalFamilyIdx(idx);
                    awardStar(
                      `A ${af.animal}'s baby is a ${af.baby}. It lives in a ${af.home} and ${af.sound}`
                    );
                  }}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    selectedAnimalFamilyIdx === idx
                      ? 'bg-cyan-500/25 border-2 border-cyan-400 text-white'
                      : 'bg-[#090D16] border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="text-xs font-extrabold">{af.animal}</div>
                  <div className="text-[10px] text-amber-300 mt-0.5">Baby: {af.baby}</div>
                  <div className="text-[10px] text-emerald-300">Home: {af.home}</div>
                </button>
              ))}
            </div>
            <div className="p-3 rounded-xl bg-[#090D16] border border-cyan-500/30 flex flex-wrap items-center justify-between gap-2 text-xs">
              <span>
                <strong>{ANIMAL_FAMILIES[selectedAnimalFamilyIdx].animal}</strong> → Baby is called{' '}
                <strong className="text-amber-300">{ANIMAL_FAMILIES[selectedAnimalFamilyIdx].baby}</strong> • Lives in a{' '}
                <strong className="text-emerald-300">{ANIMAL_FAMILIES[selectedAnimalFamilyIdx].home}</strong> • Sound:{' '}
                <strong className="text-cyan-300">{ANIMAL_FAMILIES[selectedAnimalFamilyIdx].sound}</strong>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* MODE 15: EVS SEASONS, WEATHER & DAY/NIGHT SKY */}
      {mode === 'evs-seasons-sky' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-[#111827] border border-[#1F2937]">
            <div className="flex flex-wrap gap-1.5">
              {(['summer', 'monsoon', 'winter', 'spring'] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    setSeason(s);
                    speak(`${s} season`);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase ${
                    season === s
                      ? 'bg-cyan-500 text-slate-950'
                      : 'bg-[#090D16] text-slate-300 border border-slate-800'
                  }`}
                >
                  {s} Season
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setIsNightSky((n) => !n)}
              className="px-3 py-1.5 rounded-lg bg-indigo-500/20 border border-indigo-400 text-xs font-bold text-indigo-200"
            >
              {isNightSky ? 'Switch to Day Sky ☀️' : 'Switch to Night Sky 🌙'}
            </button>
          </div>

          <Canvas2DWrapper
            title="Class 1 EVS — Seasons, Clothes We Wear & The Sky Above Us"
            subtitle="Observe Summer, Monsoon Rain, Winter Snow, Spring Flowers, and Day vs. Night Sky"
            height={320}
            kidFriendly
            onRender={renderSeasonsAndSky}
          />
        </div>
      )}

      {/* MODE 16: HINDI VARNAMALA (SWAR & VYANJAN — NCERT SARANGI & ICSE HINDI) */}
      {mode === 'hindi-varnamala' && (
        <div className="p-4 rounded-2xl bg-[#111827] border border-[#1F2937] space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400">
                NCERT Class 1 Sarangi (सारंगी) & ICSE Hindi — स्वर (Swar) और व्यंजन (Vyanjan)
              </h4>
              <p className="text-xs text-slate-300">
                Tap any Hindi letter to see its picture, English sound, and hear Hindi pronunciation!
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(
                [
                  { id: 'swar', label: 'स्वर (अ – अः)', color: 'bg-rose-500 text-white' },
                  { id: 'vyanjan', label: 'व्यंजन (क – कमल)', color: 'bg-amber-500 text-slate-950' },
                  { id: 'matra', label: '✨ मात्रा जादू (का, कि, की)', color: 'bg-cyan-500 text-slate-950' },
                  { id: 'ginti', label: '🔢 गिनती १–१० (1–10)', color: 'bg-emerald-500 text-slate-950' },
                  { id: 'poems', label: '🎶 सारंगी कविताएँ', color: 'bg-violet-500 text-white' },
                ] as const
              ).map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setHindiTab(t.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold ${
                    hindiTab === t.id
                      ? t.color
                      : 'bg-[#090D16] text-slate-300 border border-slate-800'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {hindiTab === 'swar' && (
            <div className="space-y-4">
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                {HINDI_SWAR.map((item, idx) => (
                  <button
                    key={item.letter}
                    type="button"
                    onClick={() => {
                      setSelectedSwarIdx(idx);
                      awardStar(`${item.speech} (${item.eng})`, 'hi-IN');
                    }}
                    className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                      selectedSwarIdx === idx
                        ? 'bg-rose-500/25 border-2 border-rose-400 scale-105'
                        : 'bg-[#090D16] border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-2xl font-extrabold text-white">{item.letter}</span>
                    <span className="text-lg">{item.icon}</span>
                    <span className="text-[10px] font-mono text-rose-300">{item.roman}</span>
                  </button>
                ))}
              </div>

              <div className="p-4 rounded-xl bg-[#090D16] border border-rose-500/30 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-2xl bg-rose-500/20 border-2 border-rose-400 flex items-center justify-center text-4xl font-black text-white">
                    {HINDI_SWAR[selectedSwarIdx].letter}
                  </div>
                  <div className="space-y-1">
                    <div className="text-lg font-extrabold text-white flex items-center gap-2">
                      <span>{HINDI_SWAR[selectedSwarIdx].word}</span>
                      <span className="text-2xl">{HINDI_SWAR[selectedSwarIdx].icon}</span>
                    </div>
                    <p className="text-xs text-slate-300">
                      Sound: <strong className="text-rose-300">&ldquo;{HINDI_SWAR[selectedSwarIdx].roman}&rdquo;</strong> • Meaning:{' '}
                      <strong className="text-emerald-300">{HINDI_SWAR[selectedSwarIdx].eng}</strong>
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    speak(HINDI_SWAR[selectedSwarIdx].speech, true, 'hi-IN')
                  }
                  className="px-4 py-2 rounded-xl bg-rose-500 text-white text-xs font-extrabold"
                >
                  🔊 सुनो (Speak Hindi)
                </button>
              </div>
            </div>
          )}

          {hindiTab === 'vyanjan' && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {HINDI_VYANJAN.map((item, idx) => (
                  <button
                    key={item.letter}
                    type="button"
                    onClick={() => {
                      setSelectedVyanjanIdx(idx);
                      awardStar(`${item.speech} (${item.eng})`, 'hi-IN');
                    }}
                    className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                      selectedVyanjanIdx === idx
                        ? 'bg-amber-500/25 border-2 border-amber-400 scale-105'
                        : 'bg-[#090D16] border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-2xl font-extrabold text-white">{item.letter}</span>
                    <span className="text-lg">{item.icon}</span>
                    <span className="text-[10px] font-mono text-amber-300">{item.roman}</span>
                  </button>
                ))}
              </div>

              <div className="p-4 rounded-xl bg-[#090D16] border border-amber-500/30 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-2xl bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center text-3xl font-black text-white">
                    {HINDI_VYANJAN[selectedVyanjanIdx].letter}
                  </div>
                  <div className="space-y-1">
                    <div className="text-lg font-extrabold text-white flex items-center gap-2">
                      <span>{HINDI_VYANJAN[selectedVyanjanIdx].word}</span>
                      <span className="text-2xl">{HINDI_VYANJAN[selectedVyanjanIdx].icon}</span>
                    </div>
                    <p className="text-xs text-slate-300">
                      Sound: <strong className="text-amber-300">&ldquo;{HINDI_VYANJAN[selectedVyanjanIdx].roman}&rdquo;</strong> • Meaning:{' '}
                      <strong className="text-emerald-300">{HINDI_VYANJAN[selectedVyanjanIdx].eng}</strong>
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    speak(HINDI_VYANJAN[selectedVyanjanIdx].speech, true, 'hi-IN')
                  }
                  className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 text-xs font-extrabold"
                >
                  🔊 सुनो (Speak Hindi)
                </button>
              </div>
            </div>
          )}

          {hindiTab === 'matra' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {HINDI_MATRAS.map((m, idx) => (
                  <button
                    key={m.matra}
                    type="button"
                    onClick={() => {
                      setSelectedMatraIdx(idx);
                      awardStar(m.speech, 'hi-IN');
                    }}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      selectedMatraIdx === idx
                        ? 'bg-cyan-500/25 border-2 border-cyan-400 text-white'
                        : 'bg-[#090D16] border-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="text-xl font-black text-cyan-300">
                      {m.base} + {m.matra.split(' ')[0]} = {m.result}
                    </div>
                    <div className="text-xs font-bold mt-1">{m.word}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {hindiTab === 'ginti' && (
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {HINDI_GINTI.map((g, idx) => (
                <button
                  key={g.num}
                  type="button"
                  onClick={() => {
                    setSelectedGintiIdx(idx);
                    awardStar(`${g.num}, ${g.word}`, 'hi-IN');
                  }}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    selectedGintiIdx === idx
                      ? 'bg-emerald-500/25 border-2 border-emerald-400 text-white scale-105'
                      : 'bg-[#090D16] border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="text-2xl font-black text-emerald-300">
                    {g.num} ({g.eng})
                  </div>
                  <div className="text-xs font-bold mt-1">{g.word}</div>
                  <div className="text-xs mt-1">{g.icons}</div>
                </button>
              ))}
            </div>
          )}

          {hindiTab === 'poems' && (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {SARANGI_POEMS.map((p, idx) => (
                  <button
                    key={p.title}
                    type="button"
                    onClick={() => {
                      setSelectedPoemIdx(idx);
                      speak(p.lines.join(' '), true, 'hi-IN');
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-extrabold border ${
                      selectedPoemIdx === idx
                        ? 'bg-violet-500 text-white border-white'
                        : 'bg-[#090D16] text-slate-300 border-slate-800'
                    }`}
                  >
                    {p.title}
                  </button>
                ))}
              </div>

              <div className="p-4 rounded-xl bg-[#090D16] border border-violet-500/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-violet-300">
                    {SARANGI_POEMS[selectedPoemIdx].unit}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      awardStar(SARANGI_POEMS[selectedPoemIdx].lines.join(' '), 'hi-IN')
                    }
                    className="px-3 py-1 rounded-lg bg-violet-500 text-white text-xs font-extrabold"
                  >
                    🔊 कविता सुनो (+1 ⭐)
                  </button>
                </div>
                {SARANGI_POEMS[selectedPoemIdx].lines.map((line, i) => (
                  <p key={i} className="text-sm font-bold text-white leading-relaxed">
                    • {line}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODE 17: COMPUTER STUDIES — A SMART MACHINE, KEYBOARD & MOUSE (ICSE & CBSE CLASS 1) */}
      {mode === 'computer-smart-machine' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-7 p-4 rounded-2xl bg-[#111827] border border-[#1F2937] space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-violet-400">
              ICSE & CBSE Class 1 Computer Studies — Parts of a Computer 🖥️
            </h4>
            <p className="text-xs text-slate-300">
              Tap each part of the computer to learn what job it does!
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {COMPUTER_PARTS.map((part, idx) => (
                <button
                  key={part.id}
                  type="button"
                  onClick={() => {
                    setSelectedComputerPartIdx(idx);
                    awardStar(`${part.name}: ${part.role}`);
                  }}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    selectedComputerPartIdx === idx
                      ? 'bg-violet-500/25 border-2 border-violet-400 text-white'
                      : 'bg-[#090D16] border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="text-xs font-extrabold">{part.name}</div>
                  <div className="text-[10px] font-mono text-violet-300 mt-1">
                    {part.type}
                  </div>
                </button>
              ))}
            </div>

            <div className="p-4 rounded-xl bg-[#090D16] border border-violet-500/40 space-y-1.5">
              <div className="text-sm font-extrabold text-violet-300">
                {COMPUTER_PARTS[selectedComputerPartIdx].name}
              </div>
              <p className="text-xs text-slate-200 leading-relaxed">
                {COMPUTER_PARTS[selectedComputerPartIdx].role}
              </p>
              <p className="text-[11px] text-emerald-300 font-semibold">
                💡 Computer Lab Manners: {COMPUTER_PARTS[selectedComputerPartIdx].tip}
              </p>
            </div>
          </div>

          <div className="lg:col-span-5 p-4 rounded-2xl bg-[#111827] border border-[#1F2937] space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400">
              Natural Things vs. Man-Made Machines ⚙️
            </h4>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setMachineSortChoice('manmade');
                  speak('Man-made machines make our work fast and easy! A computer is a smart machine.');
                }}
                className={`flex-1 py-2 rounded-xl text-xs font-extrabold ${
                  machineSortChoice === 'manmade'
                    ? 'bg-cyan-500 text-slate-950'
                    : 'bg-[#090D16] text-slate-300 border border-slate-800'
                }`}
              >
                🤖 Man-Made Machines
              </button>
              <button
                type="button"
                onClick={() => {
                  setMachineSortChoice('natural');
                  speak('Natural things are made by nature, like trees, sun, mountains, and birds!');
                }}
                className={`flex-1 py-2 rounded-xl text-xs font-extrabold ${
                  machineSortChoice === 'natural'
                    ? 'bg-emerald-500 text-slate-950'
                    : 'bg-[#090D16] text-slate-300 border border-slate-800'
                }`}
              >
                🌳 Natural Things
              </button>
            </div>

            <div className="p-4 rounded-xl bg-[#090D16] border border-slate-800 space-y-2.5">
              {machineSortChoice === 'manmade' ? (
                <>
                  <div className="text-2xl flex justify-around py-1">
                    <span>💻 Computer</span>
                    <span>🚗 Car</span>
                    <span>🚲 Bicycle</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    <strong className="text-cyan-300">Machines</strong> are made by humans to save time and effort! Some run on{' '}
                    <strong>Electricity</strong> (Computer, Fan), some on <strong>Fuel</strong> (Car, Bus), and some on{' '}
                    <strong>Human Power</strong> (Bicycle).
                  </p>
                </>
              ) : (
                <>
                  <div className="text-2xl flex justify-around py-1">
                    <span>🌳 Tree</span>
                    <span>☀️ Sun</span>
                    <span>🐦 Bird</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    <strong className="text-emerald-300">Natural Things</strong> are given to us by nature and are NOT made by humans in factories!
                  </p>
                </>
              )}
            </div>
          </div>

          {/* ICSE Class 1 Ch 4 & 5: Interactive Keyboard Special Keys & Mouse Trainer */}
          <div className="lg:col-span-12 p-4 rounded-2xl bg-[#111827] border border-[#1F2937] space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">
              ⌨️ ICSE Class 1 Keyboard Special Keys & Mouse Actions Trainer
            </h4>
            <div className="flex flex-wrap gap-2">
              {[
                {
                  key: '🔤 Alphabet Keys (A–Z)',
                  desc: '26 Alphabet Keys (A to Z) are used to type words, names, and sentences!',
                },
                {
                  key: '🔢 Number Keys (0–9)',
                  desc: '10 Number Keys (0 to 9) are used to type numbers, age, and roll numbers!',
                },
                {
                  key: '━━━ SPACEBAR (Longest Key) ━━━',
                  desc: 'The Spacebar is the longest key on the keyboard! It adds a blank space between words.',
                },
                {
                  key: '↵ ENTER Key',
                  desc: 'The Enter Key moves the cursor down to the next new line!',
                },
                {
                  key: '⌫ BACKSPACE Key',
                  desc: 'The Backspace Key works like an eraser to delete a mistyped letter to the left!',
                },
                {
                  key: '🖱️ Mouse Click & Drag',
                  desc: 'A Computer Mouse has Left Button (Click/Select), Right Button, and a Scroll Wheel to move up and down!',
                },
              ].map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => {
                    setKeyboardKeyInfo(item.desc);
                    awardStar(item.desc);
                  }}
                  className="px-3 py-2 rounded-xl bg-[#090D16] hover:bg-amber-500/20 border border-slate-700 hover:border-amber-400 text-xs font-mono font-bold text-amber-200"
                >
                  {item.key}
                </button>
              ))}
            </div>
            <div className="p-3 rounded-xl bg-[#090D16] border border-amber-500/30 text-xs text-slate-200 font-semibold">
              💡 {keyboardKeyInfo}
            </div>
          </div>
        </div>
      )}

      {/* MODE 18: EVS & GK — OUR COUNTRY INDIA & 5 GOLDEN MAGIC WORDS */}
      {mode === 'evs-india-manners' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-6 p-4 rounded-2xl bg-[#111827] border border-[#1F2937] space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Our Country India 🇮🇳 — National Symbols
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {NATIONAL_SYMBOLS.map((sym, idx) => (
                <button
                  key={sym.id}
                  type="button"
                  onClick={() => {
                    setSelectedSymbolIdx(idx);
                    awardStar(`${sym.title}. ${sym.fact}`);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold ${
                    selectedSymbolIdx === idx
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-[#090D16] text-slate-300 border border-slate-800'
                  }`}
                >
                  {sym.icon} {sym.title.split(':')[1]}
                </button>
              ))}
            </div>

            <div className="p-4 rounded-xl bg-[#090D16] border border-amber-500/30 space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-4xl">{NATIONAL_SYMBOLS[selectedSymbolIdx].icon}</span>
                <div className="text-sm font-extrabold text-white">
                  {NATIONAL_SYMBOLS[selectedSymbolIdx].title}
                </div>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed">
                {NATIONAL_SYMBOLS[selectedSymbolIdx].fact}
              </p>
            </div>
          </div>

          <div className="lg:col-span-6 p-4 rounded-2xl bg-[#111827] border border-[#1F2937] space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              🌟 The 5 Golden Magic Words of Good Manners
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {GOLDEN_MANNER_WORDS.map((m, idx) => (
                <button
                  key={m.word}
                  type="button"
                  onClick={() => {
                    setSelectedMannerIdx(idx);
                    awardStar(`${m.word}! ${m.sentence}`);
                  }}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-extrabold ${
                    selectedMannerIdx === idx
                      ? 'bg-emerald-500 text-slate-950'
                      : 'bg-[#090D16] text-slate-300 border border-slate-800'
                  }`}
                >
                  {m.word}
                </button>
              ))}
            </div>

            <div className="p-4 rounded-xl bg-[#090D16] border border-emerald-500/30 space-y-1.5">
              <div className="text-sm font-extrabold text-emerald-300">
                Magic Word: {GOLDEN_MANNER_WORDS[selectedMannerIdx].word}
              </div>
              <p className="text-xs text-slate-300">
                <strong>When to say it:</strong> {GOLDEN_MANNER_WORDS[selectedMannerIdx].situation}
              </p>
              <p className="text-xs text-cyan-200 font-semibold italic">
                &ldquo;{GOLDEN_MANNER_WORDS[selectedMannerIdx].sentence}&rdquo;
              </p>
            </div>
          </div>
        </div>
      )}

      {/* MODE 19: EVS — COMMUNITY HELPERS, MY HOME & MEANS OF TRANSPORT */}
      {mode === 'evs-helpers-transport' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-7 p-4 rounded-2xl bg-[#111827] border border-[#1F2937] space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              👩‍⚕️ People Who Help Us (Community Helpers & Neighbourhood)
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {COMMUNITY_HELPERS.map((h, idx) => (
                <button
                  key={h.role}
                  type="button"
                  onClick={() => {
                    setSelectedHelperIdx(idx);
                    awardStar(`${h.role} works at the ${h.place}. ${h.job}`);
                  }}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    selectedHelperIdx === idx
                      ? 'bg-emerald-500/25 border-2 border-emerald-400 text-white'
                      : 'bg-[#090D16] border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="text-xs font-extrabold">{h.role}</div>
                  <div className="text-[10px] text-emerald-300 mt-0.5">{h.place}</div>
                </button>
              ))}
            </div>
            <div className="p-3.5 rounded-xl bg-[#090D16] border border-emerald-500/30 space-y-1 text-xs">
              <div className="font-extrabold text-white text-sm">
                {COMMUNITY_HELPERS[selectedHelperIdx].role} • {COMMUNITY_HELPERS[selectedHelperIdx].place}
              </div>
              <p className="text-amber-300">
                <strong>Tools Used:</strong> {COMMUNITY_HELPERS[selectedHelperIdx].tool}
              </p>
              <p className="text-slate-200">{COMMUNITY_HELPERS[selectedHelperIdx].job}</p>
            </div>
          </div>

          <div className="lg:col-span-5 p-4 rounded-2xl bg-[#111827] border border-[#1F2937] space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400">
              🚂 Means of Transport (Land, Water & Air)
            </h4>
            <div className="flex gap-1.5">
              {(
                [
                  { id: 'land', label: '🚗 Land' },
                  { id: 'water', label: '🚢 Water' },
                  { id: 'air', label: '✈️ Air' },
                ] as const
              ).map((tr) => (
                <button
                  key={tr.id}
                  type="button"
                  onClick={() => {
                    setTransportType(tr.id);
                    speak(`${tr.id} transport`);
                  }}
                  className={`flex-1 py-2 rounded-xl text-xs font-extrabold ${
                    transportType === tr.id
                      ? 'bg-cyan-500 text-slate-950'
                      : 'bg-[#090D16] text-slate-300 border border-slate-800'
                  }`}
                >
                  {tr.label}
                </button>
              ))}
            </div>

            <div className="p-4 rounded-xl bg-[#090D16] border border-slate-800 space-y-2 text-xs">
              <div className="text-2xl flex justify-around py-1">
                {transportType === 'land' && (
                  <>
                    <span>🚲 Bicycle</span>
                    <span>🚌 Bus</span>
                    <span>🚂 Train</span>
                  </>
                )}
                {transportType === 'water' && (
                  <>
                    <span>⛵ Boat</span>
                    <span>🚢 Ship</span>
                    <span>🛥️ Yacht</span>
                  </>
                )}
                {transportType === 'air' && (
                  <>
                    <span>✈️ Aeroplane</span>
                    <span>🚁 Helicopter</span>
                    <span>🚀 Rocket</span>
                  </>
                )}
              </div>
              <p className="text-slate-300 leading-relaxed">
                {transportType === 'land'
                  ? 'Land transport moves on roads or railway tracks using wheels!'
                  : transportType === 'water'
                  ? 'Water transport sails across rivers, lakes, and oceans!'
                  : 'Air transport flies high in the sky and is the fastest way to travel far!'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* MODE 20: JOYFUL ARTS & MUSIC — COLOR MIXING CAULDRON & 8-NOTE XYLOPHONE */}
      {mode === 'arts-colors-music' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Primary & Secondary Color Mixing Lab */}
          <div className="lg:col-span-5 p-4 rounded-2xl bg-[#111827] border border-[#1F2937] space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-pink-400">
              🎨 Primary & Secondary Color Mixing Magic
            </h4>
            <p className="text-xs text-slate-300">
              Mix any two Primary Colors (Red, Blue, Yellow) to make a new Secondary Color!
            </p>

            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 rounded-xl bg-[#090D16] border border-slate-800 space-y-1.5">
                <span className="text-[10px] font-mono text-slate-400">First Color</span>
                <div className="flex gap-1.5">
                  {(['red', 'blue', 'yellow'] as const).map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => {
                        setColorA(c);
                        playPop();
                      }}
                      className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold uppercase border ${
                        colorA === c ? 'border-white scale-105' : 'border-transparent opacity-60'
                      } ${
                        c === 'red'
                          ? 'bg-rose-500 text-white'
                          : c === 'blue'
                          ? 'bg-blue-500 text-white'
                          : 'bg-amber-400 text-slate-950'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-[#090D16] border border-slate-800 space-y-1.5">
                <span className="text-[10px] font-mono text-slate-400">Second Color</span>
                <div className="flex gap-1.5">
                  {(['red', 'blue', 'yellow'] as const).map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => {
                        setColorB(c);
                        playPop();
                      }}
                      className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold uppercase border ${
                        colorB === c ? 'border-white scale-105' : 'border-transparent opacity-60'
                      } ${
                        c === 'red'
                          ? 'bg-rose-500 text-white'
                          : c === 'blue'
                          ? 'bg-blue-500 text-white'
                          : 'bg-amber-400 text-slate-950'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {(() => {
              const pair = [colorA, colorB].sort().join('+');
              const mix =
                colorA === colorB
                  ? {
                      name: `${colorA.toUpperCase()} (Same Primary Color)`,
                      bg:
                        colorA === 'red'
                          ? 'bg-rose-500'
                          : colorA === 'blue'
                          ? 'bg-blue-500'
                          : 'bg-amber-400 text-slate-950',
                      fact: 'Pick two different primary colors to create a new secondary color!',
                    }
                  : pair === 'red+yellow'
                  ? {
                      name: 'ORANGE 🟠 (Secondary Color!)',
                      bg: 'bg-orange-500 text-white',
                      fact: 'Red + Yellow makes bright ORANGE like a juicy orange or marigold flower!',
                    }
                  : pair === 'blue+yellow'
                  ? {
                      name: 'GREEN 🟢 (Secondary Color!)',
                      bg: 'bg-emerald-500 text-slate-950',
                      fact: 'Blue + Yellow makes fresh GREEN like tree leaves and grass!',
                    }
                  : {
                      name: 'PURPLE / VIOLET 🟣 (Secondary Color!)',
                      bg: 'bg-purple-600 text-white',
                      fact: 'Red + Blue makes royal PURPLE like grapes and brinjal!',
                    };

              return (
                <div className="p-4 rounded-xl bg-[#090D16] border border-pink-500/30 space-y-2 text-center">
                  <div
                    className={`py-3 px-4 rounded-xl font-black text-sm shadow-inner ${mix.bg}`}
                  >
                    {colorA.toUpperCase()} + {colorB.toUpperCase()} = {mix.name}
                  </div>
                  <p className="text-xs text-slate-300">{mix.fact}</p>
                  <button
                    type="button"
                    onClick={() => awardStar(mix.fact)}
                    className="px-3 py-1 rounded-lg bg-pink-500 text-white text-xs font-extrabold"
                  >
                    🔊 Speak Color Rule (+1 ⭐)
                  </button>
                </div>
              );
            })()}
          </div>

          {/* 8-Key Rainbow Musical Xylophone (Sargam + Western Scale) */}
          <div className="lg:col-span-7 p-4 rounded-2xl bg-[#111827] border border-[#1F2937] space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                  <Music className="w-4 h-4 text-amber-400" />
                  🎵 8-Key Rainbow Xylophone (सा रे ग म प ध नी सां)
                </h4>
                <p className="text-xs text-slate-300">
                  Tap the colorful bars to play real musical notes!
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  XYLOPHONE_KEYS.forEach((k, i) => {
                    setTimeout(() => {
                      setActiveXylophoneKey(i);
                      playMusicalNote(k.freq);
                    }, i * 180);
                  });
                }}
                className="px-3 py-1.5 rounded-xl bg-amber-400 text-slate-950 text-xs font-extrabold"
              >
                🎶 Play Full Sargam Scale
              </button>
            </div>

            <div className="grid grid-cols-8 gap-1.5 items-end h-44 p-3 rounded-xl bg-[#090D16] border border-slate-800">
              {XYLOPHONE_KEYS.map((k, idx) => {
                const barHeight = 100 - idx * 5;
                const isActive = activeXylophoneKey === idx;
                return (
                  <button
                    key={k.sargam}
                    type="button"
                    style={{ height: `${barHeight}%` }}
                    onClick={() => {
                      setActiveXylophoneKey(idx);
                      playMusicalNote(k.freq);
                    }}
                    className={`rounded-xl border-2 flex flex-col items-center justify-between p-2 font-extrabold transition-transform ${
                      k.color
                    } ${isActive ? 'scale-105 ring-2 ring-white' : 'hover:scale-102'}`}
                  >
                    <span className="text-[10px] font-mono opacity-90">{k.western}</span>
                    <span className="text-xs sm:text-sm">{k.sargam.split(' ')[0]}</span>
                    <span className="w-2 h-2 rounded-full bg-white/70" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* MODE 21: MATH — VERTICAL TENS | ONES COLUMN SUMS, STAIRCASE ORDERING & ODD/EVEN PAIRS */}
      {mode === 'math-vertical-staircase' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Vertical Tens | Ones Column Addition & Subtraction Box */}
          <div className="lg:col-span-6 p-4 rounded-2xl bg-[#111827] border border-[#1F2937] space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                  🧮 Vertical Tens | Ones (T | O) Column Sums
                </h4>
                <p className="text-xs text-slate-300">
                  Step 1: Add/Subtract ONES column first • Step 2: Then TENS column!
                </p>
              </div>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setVertOp('add');
                    setVertA(24);
                    setVertB(15);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-extrabold ${
                    vertOp === 'add'
                      ? 'bg-emerald-500 text-slate-950'
                      : 'bg-[#090D16] text-slate-300 border border-slate-800'
                  }`}
                >
                  + Add
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setVertOp('sub');
                    setVertA(48);
                    setVertB(12);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-extrabold ${
                    vertOp === 'sub'
                      ? 'bg-rose-500 text-white'
                      : 'bg-[#090D16] text-slate-300 border border-slate-800'
                  }`}
                >
                  - Subtract
                </button>
              </div>
            </div>

            {(() => {
              const t1 = Math.floor(vertA / 10);
              const o1 = vertA % 10;
              const t2 = Math.floor(vertB / 10);
              const o2 = vertB % 10;
              const ans = vertOp === 'add' ? vertA + vertB : Math.max(0, vertA - vertB);
              const ansT = Math.floor(ans / 10);
              const ansO = ans % 10;

              return (
                <div className="p-4 rounded-xl bg-[#090D16] border border-cyan-500/30 space-y-3">
                  <div className="max-w-[240px] mx-auto font-mono text-center space-y-1">
                    <div className="grid grid-cols-3 gap-2 text-xs font-bold text-slate-400 border-b border-slate-800 pb-1">
                      <span>Sign</span>
                      <span className="text-amber-300">TENS (T)</span>
                      <span className="text-cyan-300">ONES (O)</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xl font-black text-white py-1">
                      <span />
                      <span className="bg-amber-500/15 rounded-lg py-1 text-amber-300">{t1}</span>
                      <span className="bg-cyan-500/15 rounded-lg py-1 text-cyan-300">{o1}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xl font-black text-white border-b-2 border-slate-600 pb-2">
                      <span className={vertOp === 'add' ? 'text-emerald-400' : 'text-rose-400'}>
                        {vertOp === 'add' ? '+' : '−'}
                      </span>
                      <span className="bg-amber-500/15 rounded-lg py-1 text-amber-300">{t2}</span>
                      <span className="bg-cyan-500/15 rounded-lg py-1 text-cyan-300">{o2}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-2xl font-black pt-1">
                      <span className="text-xs font-sans text-emerald-400 self-center">Ans =</span>
                      <span className="bg-emerald-500/25 border border-emerald-400 rounded-lg py-1 text-emerald-300">
                        {ansT}
                      </span>
                      <span className="bg-emerald-500/25 border border-emerald-400 rounded-lg py-1 text-emerald-300">
                        {ansO}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap justify-center gap-1.5 pt-1">
                    {[
                      { a: 24, b: 15, op: 'add' as const, label: '24 + 15' },
                      { a: 32, b: 26, op: 'add' as const, label: '32 + 26' },
                      { a: 48, b: 12, op: 'sub' as const, label: '48 − 12' },
                      { a: 57, b: 24, op: 'sub' as const, label: '57 − 24' },
                    ].map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => {
                          setVertA(preset.a);
                          setVertB(preset.b);
                          setVertOp(preset.op);
                          const res = preset.op === 'add' ? preset.a + preset.b : preset.a - preset.b;
                          awardStar(
                            `${preset.a} ${preset.op === 'add' ? 'plus' : 'minus'} ${preset.b} equals ${res}!`
                          );
                        }}
                        className="px-2.5 py-1 rounded-lg bg-[#111827] border border-slate-700 hover:border-cyan-400 text-xs font-mono font-bold text-slate-200"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Ascending vs. Descending Staircase + Even/Odd Pairing */}
          <div className="lg:col-span-6 p-4 rounded-2xl bg-[#111827] border border-[#1F2937] space-y-4">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  🪜 Ascending (Smallest→Greatest) & Descending Stairs
                </h4>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setStairOrder('asc');
                      speak('Ascending order goes UP the stairs from Smallest to Greatest: 12, 25, 38, 54, 79!');
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-extrabold ${
                      stairOrder === 'asc'
                        ? 'bg-amber-400 text-slate-950'
                        : 'bg-[#090D16] text-slate-300 border border-slate-800'
                    }`}
                  >
                    ⬆️ Ascending (Up)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setStairOrder('desc');
                      speak('Descending order goes DOWN the stairs from Greatest to Smallest: 79, 54, 38, 25, 12!');
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-extrabold ${
                      stairOrder === 'desc'
                        ? 'bg-cyan-400 text-slate-950'
                        : 'bg-[#090D16] text-slate-300 border border-slate-800'
                    }`}
                  >
                    ⬇️ Descending (Down)
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-5 gap-2 items-end h-28 p-3 rounded-xl bg-[#090D16] border border-slate-800">
                {(stairOrder === 'asc' ? [12, 25, 38, 54, 79] : [79, 54, 38, 25, 12]).map(
                  (num, idx) => {
                    const hPct = stairOrder === 'asc' ? 35 + idx * 16 : 99 - idx * 16;
                    return (
                      <button
                        key={num}
                        type="button"
                        style={{ height: `${hPct}%` }}
                        onClick={() => speak(`${num}, ${numberToWords(num)}`)}
                        className="rounded-lg bg-gradient-to-t from-amber-500/30 to-cyan-500/40 border border-cyan-400 flex items-center justify-center font-mono text-sm font-black text-white"
                      >
                        {num}
                      </button>
                    );
                  }
                )}
              </div>
            </div>

            {/* Even vs. Odd Shoe Pairing */}
            <div className="p-3 rounded-xl bg-[#090D16] border border-emerald-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-300">
                  👟 Even (All in Pairs of 2) vs. Odd (1 Left Alone!)
                </span>
                <div className="flex gap-1">
                  {[4, 5, 6, 7, 8, 9].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => {
                        setEvenOddTestNum(n);
                        speak(
                          `${n} is an ${n % 2 === 0 ? 'EVEN' : 'ODD'} number!`
                        );
                      }}
                      className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${
                        evenOddTestNum === n
                          ? 'bg-emerald-400 text-slate-950'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-200">
                <div className="flex flex-wrap gap-1.5 text-base">
                  {Array.from({ length: Math.floor(evenOddTestNum / 2) }).map((_, i) => (
                    <span
                      key={i}
                      className="px-1.5 py-0.5 rounded bg-emerald-500/20 border border-emerald-400"
                    >
                      👟👟
                    </span>
                  ))}
                  {evenOddTestNum % 2 === 1 && (
                    <span className="px-1.5 py-0.5 rounded bg-rose-500/30 border border-rose-400">
                      👟 (1 Left!)
                    </span>
                  )}
                </div>
                <span className="font-mono font-extrabold text-amber-300">
                  {evenOddTestNum} is {evenOddTestNum % 2 === 0 ? 'EVEN' : 'ODD'}!
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODE 22: ENGLISH — NAMING WORDS (NOUNS 4-BASKET SORTER) & THIS / THAT / THESE / THOSE */}
      {mode === 'eng-nouns-this-that' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* 4-Basket Naming Words (Nouns) Game */}
          <div className="lg:col-span-7 p-4 rounded-2xl bg-[#111827] border border-[#1F2937] space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">
              🧺 Naming Words (Nouns) 4-Basket Sorter: Person, Place, Animal, or Thing!
            </h4>
            <p className="text-xs text-slate-300">
              Everything around us has a name! Put the word below into the right Noun Basket:
            </p>

            <div className="p-4 rounded-xl bg-[#090D16] border border-amber-500/40 flex flex-col items-center space-y-3">
              <div className="flex flex-wrap gap-1.5">
                {NOUN_SORT_ITEMS.map((item, idx) => (
                  <button
                    key={item.word}
                    type="button"
                    onClick={() => {
                      setActiveNounIdx(idx);
                      setNounFeedback(null);
                      speak(item.word);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${
                      activeNounIdx === idx
                        ? 'bg-amber-400 text-slate-950 border-white'
                        : 'bg-[#111827] text-slate-300 border-slate-800'
                    }`}
                  >
                    {item.icon} {item.word}
                  </button>
                ))}
              </div>

              <div className="text-4xl">{NOUN_SORT_ITEMS[activeNounIdx].icon}</div>
              <div className="text-base font-black text-white">
                Which basket does &ldquo;{NOUN_SORT_ITEMS[activeNounIdx].word}&rdquo; belong in?
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full">
                {(
                  [
                    { cat: 'Person', icon: '👧 Person' },
                    { cat: 'Place', icon: '🏫 Place' },
                    { cat: 'Animal', icon: '🐶 Animal' },
                    { cat: 'Thing', icon: '⚽ Thing' },
                  ] as const
                ).map((b) => (
                  <button
                    key={b.cat}
                    type="button"
                    onClick={() => {
                      if (b.cat === NOUN_SORT_ITEMS[activeNounIdx].category) {
                        setNounFeedback(`✅ Correct! ${NOUN_SORT_ITEMS[activeNounIdx].hint}`);
                        awardStar(NOUN_SORT_ITEMS[activeNounIdx].hint);
                      } else {
                        setNounFeedback(`Try again! Think about what ${NOUN_SORT_ITEMS[activeNounIdx].word} is.`);
                        speak('Try another basket!');
                      }
                    }}
                    className="p-2.5 rounded-xl bg-[#111827] hover:bg-amber-500/20 border-2 border-slate-700 hover:border-amber-400 text-xs font-extrabold text-white"
                  >
                    🧺 {b.icon}
                  </button>
                ))}
              </div>

              {nounFeedback && (
                <div className="text-xs font-bold text-emerald-300">{nounFeedback}</div>
              )}
            </div>
          </div>

          {/* This / That / These / Those Pointing Finger */}
          <div className="lg:col-span-5 p-4 rounded-2xl bg-[#111827] border border-[#1F2937] space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400">
              👉 This, That, These & Those (Near vs. Far)
            </h4>
            <div className="grid grid-cols-2 gap-1.5">
              {(
                [
                  { id: 'this', label: 'THIS (1 Near)' },
                  { id: 'that', label: 'THAT (1 Far)' },
                  { id: 'these', label: 'THESE (Many Near)' },
                  { id: 'those', label: 'THOSE (Many Far)' },
                ] as const
              ).map((pt) => (
                <button
                  key={pt.id}
                  type="button"
                  onClick={() => {
                    setPointingMode(pt.id);
                    const sentences = {
                      this: 'THIS is an apple near me!',
                      that: 'THAT is a tree far away!',
                      these: 'THESE are apples near me!',
                      those: 'THOSE are trees far away!',
                    };
                    speak(sentences[pt.id], true);
                  }}
                  className={`py-2 px-2.5 rounded-xl text-xs font-extrabold border ${
                    pointingMode === pt.id
                      ? 'bg-cyan-500 text-slate-950 border-white'
                      : 'bg-[#090D16] text-slate-300 border-slate-800'
                  }`}
                >
                  {pt.label}
                </button>
              ))}
            </div>

            <div className="p-4 rounded-xl bg-[#090D16] border border-cyan-500/30 space-y-2 text-center">
              <div className="text-2xl py-2 font-mono">
                {pointingMode === 'this' && '👉 🍎 (Near & One)'}
                {pointingMode === 'that' && '👉 ┈┈┈┈┈┈┈┈┈ 🌳 (Far & One)'}
                {pointingMode === 'these' && '👉 🍎🍎🍎 (Near & Many)'}
                {pointingMode === 'those' && '👉 ┈┈┈┈┈┈┈┈┈ 🌳🌳🌳 (Far & Many)'}
              </div>
              <p className="text-xs font-bold text-white">
                {pointingMode === 'this' && '“THIS is a sweet red apple.”'}
                {pointingMode === 'that' && '“THAT is a tall green tree.”'}
                {pointingMode === 'these' && '“THESE are sweet red apples.”'}
                {pointingMode === 'those' && '“THOSE are tall green trees.”'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* MODE 23: EVS — TYPES OF HOUSES (KUTCHA/PUCCA), ROOMS IN A HOME & HEALTHY FOOD PLATE */}
      {mode === 'evs-houses-food' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-6 p-4 rounded-2xl bg-[#111827] border border-[#1F2937] space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              🏡 Houses We Live In (Pucca, Kutcha, Igloo, Houseboat & Tent)
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {HOUSE_TYPES.map((h, idx) => (
                <button
                  key={h.id}
                  type="button"
                  onClick={() => {
                    setSelectedHouseIdx(idx);
                    awardStar(`${h.name}. ${h.fact}`);
                  }}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-extrabold border ${
                    selectedHouseIdx === idx
                      ? 'bg-emerald-500 text-slate-950 border-white'
                      : 'bg-[#090D16] text-slate-300 border-slate-800'
                  }`}
                >
                  {h.name.split(' (')[0]}
                </button>
              ))}
            </div>

            <div className="p-3.5 rounded-xl bg-[#090D16] border border-emerald-500/30 space-y-1 text-xs">
              <div className="font-extrabold text-white text-sm">
                {HOUSE_TYPES[selectedHouseIdx].name}
              </div>
              <div className="text-amber-300">
                <strong>Made of:</strong> {HOUSE_TYPES[selectedHouseIdx].materials} •{' '}
                <strong>Found in:</strong> {HOUSE_TYPES[selectedHouseIdx].where}
              </div>
              <p className="text-slate-200 leading-relaxed">{HOUSE_TYPES[selectedHouseIdx].fact}</p>
            </div>

            {/* Rooms in Our Home */}
            <div className="p-3 rounded-xl bg-[#090D16] border border-slate-800 space-y-2">
              <span className="text-[11px] font-bold text-cyan-300 uppercase">
                🚪 Rooms in Our House (Tap a Room):
              </span>
              <div className="grid grid-cols-4 gap-1.5">
                {(
                  [
                    { id: 'kitchen', label: '🍳 Kitchen', desc: 'We cook healthy food in the Kitchen!' },
                    { id: 'bedroom', label: '🛏️ Bedroom', desc: 'We rest and sleep in the Bedroom!' },
                    { id: 'bathroom', label: '🚿 Bathroom', desc: 'We brush and take a bath in the Bathroom!' },
                    { id: 'living', label: '🛋️ Living', desc: 'We welcome guests and sit with family in the Living Room!' },
                  ] as const
                ).map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => {
                      setSelectedRoom(r.id);
                      speak(r.desc, true);
                    }}
                    className={`p-1.5 rounded-lg text-[11px] font-bold border ${
                      selectedRoom === r.id
                        ? 'bg-cyan-500 text-slate-950 border-white'
                        : 'bg-[#111827] text-slate-300 border-slate-800'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 p-4 rounded-2xl bg-[#111827] border border-[#1F2937] space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">
              🍎 Healthy Everyday Food Plate vs. Junk Food
            </h4>
            <p className="text-xs text-slate-300">
              Tap each food item to see if it makes us strong and healthy or if it is junk food!
            </p>
            <div className="grid grid-cols-2 gap-2">
              {HEALTHY_VS_JUNK_FOODS.map((f) => (
                <button
                  key={f.name}
                  type="button"
                  onClick={() => speak(`${f.name}: ${f.benefit}`, true)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    f.type === 'healthy'
                      ? 'bg-emerald-950/30 border-emerald-500/50 hover:border-emerald-400'
                      : 'bg-rose-950/30 border-rose-500/50 hover:border-rose-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-white">{f.name}</span>
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold uppercase ${
                        f.type === 'healthy'
                          ? 'bg-emerald-500 text-slate-950'
                          : 'bg-rose-500 text-white'
                      }`}
                    >
                      {f.type === 'healthy' ? '✓ Healthy' : '⚠ Junk'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-1 leading-snug">{f.benefit}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODE 25: MATH — ORDINAL NUMBERS (1ST TO 10TH RACE), BEFORE/BETWEEN/AFTER & EQUAL SHARING PIZZA FRACTIONS */}
      {mode === 'math-ordinals-fractions' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* 1st to 10th Animal Race Track */}
          <div className="lg:col-span-7 p-4 rounded-2xl bg-[#111827] border border-[#1F2937] space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400">
              🏁 Ordinal Numbers (1st First to 10th Tenth) Animal Race Track!
            </h4>
            <p className="text-xs text-slate-300">
              Ordinal numbers tell us the <strong>POSITION</strong> of an object in a line! Tap any runner from 1st to 10th:
            </p>
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
              {ORDINAL_RUNNERS.map((r) => (
                <button
                  key={r.pos}
                  type="button"
                  onClick={() => {
                    setRaceSelectedOrd(r.pos);
                    awardStar(`${r.animal} is in ${r.ord} (${r.word}) place!`);
                  }}
                  className={`p-2 rounded-xl border text-center transition-all ${
                    raceSelectedOrd === r.pos
                      ? 'bg-cyan-500 text-slate-950 border-white scale-105 font-black'
                      : 'bg-[#090D16] text-slate-200 border-slate-800 hover:border-cyan-400'
                  }`}
                >
                  <div className="text-xl">{r.animal.split(' ')[1]}</div>
                  <div className="text-xs font-mono font-extrabold">{r.ord}</div>
                  <div className="text-[9px] opacity-80">{r.word}</div>
                </button>
              ))}
            </div>

            {(() => {
              const activeRunner = ORDINAL_RUNNERS[raceSelectedOrd - 1] || ORDINAL_RUNNERS[0];
              return (
                <div className="p-3.5 rounded-xl bg-[#090D16] border border-cyan-500/40 flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-black text-white">
                      🏆 Position {activeRunner.ord} ({activeRunner.word}) — {activeRunner.animal}
                    </div>
                    <p className="text-xs text-cyan-200 mt-0.5">{activeRunner.fact}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => speak(`${activeRunner.ord} is spelled ${activeRunner.word}. ${activeRunner.fact}`, true)}
                    className="px-3 py-1.5 rounded-xl bg-cyan-500 text-slate-950 text-xs font-extrabold shrink-0"
                  >
                    🔊 Speak Position
                  </button>
                </div>
              );
            })()}

            {/* Before, Between & After Number Explorer */}
            <div className="p-3.5 rounded-xl bg-[#090D16] border border-amber-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-amber-300">
                  🔢 Before, Between & After Explorer (1 to 99)
                </span>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => setBeforeAfterNum((n) => Math.max(2, n - 1))}
                    className="px-2.5 py-0.5 rounded bg-slate-800 text-xs font-bold text-white"
                  >
                    -1
                  </button>
                  <button
                    type="button"
                    onClick={() => setBeforeAfterNum((n) => Math.min(98, n + 1))}
                    className="px-2.5 py-0.5 rounded bg-amber-400 text-slate-950 text-xs font-extrabold"
                  >
                    +1
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center font-mono">
                <div className="p-2 rounded-xl bg-[#111827] border border-rose-500/40">
                  <div className="text-[10px] text-rose-300 uppercase">Just BEFORE (-1)</div>
                  <div className="text-xl font-black text-white">{beforeAfterNum - 1}</div>
                </div>
                <div className="p-2 rounded-xl bg-amber-500/20 border-2 border-amber-400">
                  <div className="text-[10px] text-amber-200 uppercase">BETWEEN (Middle)</div>
                  <div className="text-xl font-black text-amber-300">{beforeAfterNum}</div>
                </div>
                <div className="p-2 rounded-xl bg-[#111827] border border-emerald-500/40">
                  <div className="text-[10px] text-emerald-300 uppercase">Just AFTER (+1)</div>
                  <div className="text-xl font-black text-white">{beforeAfterNum + 1}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Equal Sharing Pizza Slicer (Whole, Half 1/2, Quarter 1/4) */}
          <div className="lg:col-span-5 p-4 rounded-2xl bg-[#111827] border border-[#1F2937] space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">
              🍕 Equal Sharing Pizza Slicer (Whole, Half & Quarter)
            </h4>
            <p className="text-xs text-slate-300">
              When we share food with friends, every piece must be <strong>EQUAL</strong>! Choose how to slice the pizza:
            </p>
            <div className="grid grid-cols-3 gap-1.5">
              {(
                [
                  { parts: 1, label: '1 Whole Pizza', msg: '1 Whole Pizza with no cuts!' },
                  { parts: 2, label: '2 Equal Halves (½)', msg: 'Cut into 2 equal parts! Each part is One-Half!' },
                  { parts: 4, label: '4 Equal Quarters (¼)', msg: 'Cut into 4 equal parts! Each part is One-Quarter!' },
                ] as const
              ).map((sl) => (
                <button
                  key={sl.parts}
                  type="button"
                  onClick={() => {
                    setPizzaSlices(sl.parts);
                    awardStar(sl.msg);
                  }}
                  className={`py-2 px-2 rounded-xl text-xs font-extrabold border ${
                    pizzaSlices === sl.parts
                      ? 'bg-amber-400 text-slate-950 border-white'
                      : 'bg-[#090D16] text-slate-300 border-slate-800'
                  }`}
                >
                  {sl.label}
                </button>
              ))}
            </div>

            <div className="p-4 rounded-xl bg-[#090D16] border border-amber-500/30 flex flex-col items-center space-y-2">
              <svg width="160" height="160" viewBox="-80 -80 160 160">
                <circle r="68" fill="#f59e0b" stroke="#b45309" strokeWidth="6" />
                <circle r="56" fill="#ef4444" />
                <circle cx="-22" cy="-18" r="7" fill="#fde047" />
                <circle cx="22" cy="-18" r="7" fill="#fde047" />
                <circle cx="-20" cy="22" r="7" fill="#fde047" />
                <circle cx="20" cy="22" r="7" fill="#fde047" />
                {pizzaSlices >= 2 && (
                  <line x1="0" y1="-68" x2="0" y2="68" stroke="#090D16" strokeWidth="4" strokeDasharray="4 2" />
                )}
                {pizzaSlices === 4 && (
                  <line x1="-68" y1="0" x2="68" y2="0" stroke="#090D16" strokeWidth="4" strokeDasharray="4 2" />
                )}
              </svg>
              <div className="text-xs font-extrabold text-amber-200 text-center">
                {pizzaSlices === 1 && '🍕 1 Whole = 1 Complete Pizza for everyone!'}
                {pizzaSlices === 2 && '🍕 2 Equal Halves = 2 Friends get 1 Half (1/2) each!'}
                {pizzaSlices === 4 && '🍕 4 Equal Quarters = 4 Friends get 1 Quarter (1/4) each!'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODE 26: ENGLISH — PRONOUNS (HE, SHE, IT, WE, THEY) & DESCRIBING WORDS (ADJECTIVES) */}
      {mode === 'eng-pronouns-adjectives' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-6 p-4 rounded-2xl bg-[#111827] border border-[#1F2937] space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400">
              🙋‍♀️ Pronouns (Words Used in Place of Naming Words: He, She, It, We, They)
            </h4>
            <p className="text-xs text-slate-300">
              Instead of repeating a Naming Word again and again, we use a special helper word called a <strong>PRONOUN</strong>!
            </p>
            <div className="flex flex-wrap gap-1.5">
              {PRONOUN_CARDS.map((p, idx) => (
                <button
                  key={p.pronoun}
                  type="button"
                  onClick={() => {
                    setActivePronounIdx(idx);
                    awardStar(`${p.pronoun}: ${p.sentence}`);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold border ${
                    activePronounIdx === idx
                      ? 'bg-cyan-500 text-slate-950 border-white'
                      : 'bg-[#090D16] text-slate-300 border-slate-800'
                  }`}
                >
                  {p.pronoun} ({p.noun.split(' (')[0]})
                </button>
              ))}
            </div>

            <div className="p-4 rounded-xl bg-[#090D16] border border-cyan-500/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-slate-400">
                  Naming Word: <strong className="text-white">{PRONOUN_CARDS[activePronounIdx].noun}</strong>
                </span>
                <span className="px-3 py-0.5 rounded-full bg-cyan-500 text-slate-950 font-mono text-xs font-black">
                  Pronoun: {PRONOUN_CARDS[activePronounIdx].pronoun}
                </span>
              </div>
              <div className="text-sm font-black text-emerald-300">
                &ldquo;{PRONOUN_CARDS[activePronounIdx].sentence}&rdquo;
              </div>
              <p className="text-xs text-slate-300">{PRONOUN_CARDS[activePronounIdx].rule}</p>
            </div>
          </div>

          <div className="lg:col-span-6 p-4 rounded-2xl bg-[#111827] border border-[#1F2937] space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">
              🌈 Describing Words (Adjectives: Color, Size, Number & Feeling)
            </h4>
            <p className="text-xs text-slate-300">
              Words that tell us <strong>more about a Naming Word</strong> (how it looks, feels, or how many) are called <strong>Describing Words</strong>!
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {ADJECTIVE_ITEMS.map((item, idx) => (
                <button
                  key={item.noun}
                  type="button"
                  onClick={() => {
                    setActiveAdjIdx(idx);
                    awardStar(item.sentence);
                  }}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    activeAdjIdx === idx
                      ? 'bg-amber-500/25 border-amber-400 text-white'
                      : 'bg-[#090D16] border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="text-[10px] font-mono text-amber-300 uppercase">{item.type}</div>
                  <div className="text-xs font-black text-white mt-0.5">
                    <span className="text-amber-300 underline">{item.adj}</span> {item.noun}
                  </div>
                </button>
              ))}
            </div>
            <div className="p-3.5 rounded-xl bg-[#090D16] border border-amber-500/40 flex items-center justify-between gap-2">
              <div className="text-xs text-slate-200">
                <strong className="text-amber-300">Sentence:</strong> &ldquo;{ADJECTIVE_ITEMS[activeAdjIdx].sentence}&rdquo;
              </div>
              <button
                type="button"
                onClick={() => speak(ADJECTIVE_ITEMS[activeAdjIdx].sentence, true)}
                className="px-3 py-1 rounded-lg bg-amber-400 text-slate-950 text-xs font-extrabold shrink-0"
              >
                🔊 Speak
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODE 27: HINDI — दो, तीन और चार अक्षर वाले शब्द रेलगाड़ी (2, 3 & 4-LETTER WORD TRAIN) */}
      {mode === 'hindi-shabd-train' && (
        <div className="p-4 rounded-2xl bg-[#111827] border border-[#1F2937] space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400">
                🚂 NCERT सारंगी: दो, तीन और चार अक्षर वाले बिना मात्रा के शब्द (Hindi Word Train)
              </h4>
              <p className="text-xs text-slate-300">
                अक्षरों के डिब्बों को जोड़कर नया शब्द बनाएँ और उसका वाक्य सुनें!
              </p>
            </div>
            <div className="flex gap-1.5">
              {(
                [
                  { id: 'two', label: '२ अक्षर (घर, जल)' },
                  { id: 'three', label: '३ अक्षर (कमल, मटर)' },
                  { id: 'four', label: '४ अक्षर (अजगर, शरबत)' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setShabdType(tab.id);
                    setActiveShabdIdx(0);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold border ${
                    shabdType === tab.id
                      ? 'bg-rose-500 text-white border-white'
                      : 'bg-[#090D16] text-slate-300 border-slate-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {(() => {
            const list = HINDI_SHABD_TRAIN[shabdType];
            const item = list[activeShabdIdx] || list[0];
            return (
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {list.map((w, idx) => (
                    <button
                      key={w.word}
                      type="button"
                      onClick={() => {
                        setActiveShabdIdx(idx);
                        awardStar(`${w.parts.join(' जमा ')} बराबर ${w.word}! ${w.sentence}`, 'hi-IN');
                      }}
                      className={`px-3.5 py-2 rounded-xl text-sm font-black border transition-all ${
                        activeShabdIdx === idx
                          ? 'bg-amber-400 text-slate-950 border-white scale-105'
                          : 'bg-[#090D16] text-slate-200 border-slate-800'
                      }`}
                    >
                      {w.word} ({w.eng})
                    </button>
                  ))}
                </div>

                {/* Animated Train Coaches */}
                <div className="p-5 rounded-2xl bg-[#090D16] border border-rose-500/40 flex flex-wrap items-center justify-center gap-3">
                  <div className="text-3xl">🚂</div>
                  {item.parts.map((ch, idx) => (
                    <React.Fragment key={idx}>
                      <div className="px-5 py-3 rounded-2xl bg-rose-500/20 border-2 border-rose-400 text-2xl font-black text-white shadow-md">
                        {ch}
                      </div>
                      {idx < item.parts.length - 1 && (
                        <span className="text-xl font-black text-amber-400">+</span>
                      )}
                    </React.Fragment>
                  ))}
                  <span className="text-2xl font-black text-emerald-400">=</span>
                  <div className="px-6 py-3 rounded-2xl bg-emerald-500/25 border-2 border-emerald-400 text-2xl font-black text-emerald-200">
                    {item.word} ({item.eng})
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#090D16] border border-slate-800 flex items-center justify-between">
                  <div className="text-sm font-bold text-amber-200">
                    📖 वाक्य (Sentence): &ldquo;{item.sentence}&rdquo;
                  </div>
                  <button
                    type="button"
                    onClick={() => speak(`${item.word}। ${item.sentence}`, true, 'hi-IN')}
                    className="px-3 py-1.5 rounded-xl bg-rose-500 text-white text-xs font-extrabold"
                  >
                    🔊 हिंदी में सुनें
                  </button>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* MODE 28: EVS & MORAL SCIENCE — WATER, AIR & DAILY GOOD HABITS CLOCK */}
      {mode === 'evs-water-air-habits' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Water & Air Science */}
          <div className="lg:col-span-6 p-4 rounded-2xl bg-[#111827] border border-[#1F2937] space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400">
              💧 Precious Water & 🌬️ Fresh Air Around Us
            </h4>
            <div className="space-y-2">
              {WATER_AIR_HABITS.waterSources.map((ws) => (
                <button
                  key={ws.name}
                  type="button"
                  onClick={() => speak(`${ws.name}. ${ws.use}`, true)}
                  className="w-full text-left p-2.5 rounded-xl bg-[#090D16] border border-cyan-500/30 hover:border-cyan-400"
                >
                  <div className="text-xs font-extrabold text-cyan-300">{ws.name}</div>
                  <div className="text-[11px] text-slate-300">{ws.use}</div>
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {WATER_AIR_HABITS.waterUses.map((u) => (
                <span
                  key={u}
                  onClick={() => speak(`We use water for ${u}`, true)}
                  className="cursor-pointer px-2.5 py-1 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-[11px] font-bold text-cyan-200"
                >
                  {u}
                </span>
              ))}
            </div>
            <div className="space-y-1.5 pt-1">
              {WATER_AIR_HABITS.airFacts.map((af) => (
                <div
                  key={af.title}
                  onClick={() => speak(`${af.title}. ${af.detail}`, true)}
                  className="cursor-pointer p-2.5 rounded-xl bg-[#090D16] border border-emerald-500/30 text-xs"
                >
                  <div className="font-bold text-emerald-300">{af.title}</div>
                  <div className="text-[11px] text-slate-300">{af.detail}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Morning-to-Night Good Habits Routine */}
          <div className="lg:col-span-6 p-4 rounded-2xl bg-[#111827] border border-[#1F2937] space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">
              🪥 Morning-to-Night Good Daily Habits & Moral Values
            </h4>
            <p className="text-xs text-slate-300">
              Tap each time of the day to practice healthy Class 1 habits and earn a star!
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {WATER_AIR_HABITS.dailyHabits.map((h, idx) => (
                <button
                  key={h.time}
                  type="button"
                  onClick={() => {
                    setActiveHabitIdx(idx);
                    awardStar(`${h.time}: ${h.habit}`);
                  }}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    activeHabitIdx === idx
                      ? 'bg-amber-500/25 border-amber-400 text-white'
                      : 'bg-[#090D16] border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-extrabold text-amber-300">{h.time}</span>
                    <span className="text-lg">{h.icon}</span>
                  </div>
                  <p className="text-xs font-semibold text-white mt-1 leading-snug">{h.habit}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODE 29: MATH — STORY WORD PROBLEMS (READ → PICTURE → SIGN → ANSWER) & MUSICAL TABLES (1×, 2×, 5×, 10×) */}
      {mode === 'math-word-problems-tables' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Step-by-Step Story Word Problem Solver */}
          <div className="lg:col-span-7 p-4 rounded-2xl bg-[#111827] border border-[#1F2937] space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400">
              📖 Step-by-Step Story Word Problem Detective (Add + vs. Subtract -)
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {WORD_PROBLEM_STORIES.map((wp, idx) => (
                <button
                  key={wp.title}
                  type="button"
                  onClick={() => {
                    setStoryProblemIdx(idx);
                    setStoryGuess(null);
                    speak(wp.story);
                  }}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-extrabold border ${
                    storyProblemIdx === idx
                      ? 'bg-cyan-500 text-slate-950 border-white'
                      : 'bg-[#090D16] text-slate-300 border-slate-800'
                  }`}
                >
                  {wp.title}
                </button>
              ))}
            </div>

            {(() => {
              const st = WORD_PROBLEM_STORIES[storyProblemIdx] || WORD_PROBLEM_STORIES[0];
              return (
                <div className="p-4 rounded-xl bg-[#090D16] border border-cyan-500/40 space-y-3">
                  <p className="text-sm font-bold text-white leading-relaxed">&ldquo;{st.story}&rdquo;</p>
                  <div className="p-2.5 rounded-lg bg-amber-500/15 border border-amber-400/50 text-xs text-amber-200 font-bold">
                    🔍 Clue Word Detective: <span className="text-white">{st.clueWord}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#111827] border border-slate-800 space-y-3">
                    <div className="text-lg tracking-widest leading-relaxed">
                      {st.op === '+' ? (
                        <>
                          {st.iconA.repeat(st.a)}{' '}
                          <span className="font-mono font-black text-cyan-400 mx-1">+</span>{' '}
                          {st.iconB.repeat(st.b)}
                        </>
                      ) : (
                        <>
                          {st.iconA.repeat(st.a - st.b)}
                          <span className="opacity-25 grayscale">{st.iconB.repeat(st.b)}</span>
                          <span className="ml-2 text-xs font-mono font-black text-rose-300 tracking-normal">
                            ({st.b} taken away)
                          </span>
                        </>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold text-slate-300">
                        {st.a} {st.op} {st.b} = ?
                      </span>
                      {[st.ans - 1, st.ans, st.ans + 2]
                        .sort((x, y) => ((x * 7 + st.a) % 5) - ((y * 7 + st.a) % 5))
                        .map((choice) => {
                          const picked = storyGuess === choice;
                          const solved = storyGuess === st.ans;
                          return (
                            <button
                              key={choice}
                              type="button"
                              disabled={solved}
                              onClick={() => {
                                setStoryGuess(choice);
                                if (choice === st.ans) {
                                  awardStar(`${st.a} ${st.op === '+' ? 'plus' : 'minus'} ${st.b} equals ${st.ans}!`);
                                } else {
                                  playPop();
                                  speak('Not quite! Count the pictures again.');
                                }
                              }}
                              className={`px-3.5 py-1.5 rounded-xl font-mono text-sm font-black border ${
                                picked && choice === st.ans
                                  ? 'bg-emerald-400 text-slate-950 border-white'
                                  : picked
                                  ? 'bg-rose-500/30 text-rose-200 border-rose-400'
                                  : 'bg-[#090D16] text-slate-200 border-slate-700'
                              }`}
                            >
                              {choice}
                            </button>
                          );
                        })}
                    </div>
                    {storyGuess === st.ans && (
                      <div className="text-sm font-mono font-black text-emerald-300">
                        ✓ {st.a} {st.op} {st.b} = {st.ans}
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Musical Multiplication Tables (1×, 2×, 5×, 10×) */}
          <div className="lg:col-span-5 p-4 rounded-2xl bg-[#111827] border border-[#1F2937] space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">
                🎵 Musical Multiplication Tables ({tableMultiplier}×)
              </h4>
              <div className="flex gap-1">
                {([1, 2, 5, 10] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => {
                      setTableMultiplier(m);
                      speak(`Table of ${m}!`);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono font-extrabold border ${
                      tableMultiplier === m
                        ? 'bg-amber-400 text-slate-950 border-white'
                        : 'bg-[#090D16] text-slate-300 border-slate-800'
                    }`}
                  >
                    {m}×
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              {Array.from({ length: 10 }, (_, i) => i + 1).map((step) => {
                const prod = tableMultiplier * step;
                return (
                  <button
                    key={step}
                    type="button"
                    onClick={() => {
                      playMusicalNote(240 + step * 28);
                      speak(`${tableMultiplier} times ${step} is ${prod}`, true);
                    }}
                    className="p-2 rounded-xl bg-[#090D16] hover:bg-amber-500/20 border border-slate-800 hover:border-amber-400 font-mono text-xs font-bold text-slate-200 flex items-center justify-between"
                  >
                    <span>
                      {tableMultiplier} × {step} =
                    </span>
                    <span className="text-amber-300 font-black text-sm">{prod}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* MODE 30: ENGLISH — DIGRAPHS (CH, SH, TH, WH), PUNCTUATION & JUMBLED SENTENCE BUILDER */}
      {mode === 'eng-digraphs-sentences' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-6 p-4 rounded-2xl bg-[#111827] border border-[#1F2937] space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">
              🔤 Two-Letter Special Sounds (Digraphs: CH, SH, TH, WH)
            </h4>
            <p className="text-xs text-slate-300">
              When two letters hold hands to make ONE new sound, we call it a <strong>Digraph</strong>!
            </p>
            <div className="grid grid-cols-4 gap-2">
              {DIGRAPH_CARDS.map((d, idx) => (
                <button
                  key={d.digraph}
                  type="button"
                  onClick={() => {
                    setDigraphIdx(idx);
                    awardStar(`${d.digraph} makes the ${d.sound} sound! ${d.sentence}`);
                  }}
                  className={`py-2.5 rounded-xl font-mono text-base font-black border ${
                    digraphIdx === idx
                      ? 'bg-amber-400 text-slate-950 border-white'
                      : 'bg-[#090D16] text-slate-200 border-slate-800'
                  }`}
                >
                  {d.digraph}
                </button>
              ))}
            </div>
            <div className="p-4 rounded-xl bg-[#090D16] border border-amber-500/40 space-y-2">
              <div className="text-xs font-mono text-amber-300 font-bold">
                Sound: {DIGRAPH_CARDS[digraphIdx].sound}
              </div>
              <div className="flex flex-wrap gap-2">
                {DIGRAPH_CARDS[digraphIdx].words.map((w) => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => speak(w, true)}
                    className="px-3 py-1.5 rounded-xl bg-[#111827] border border-slate-700 text-xs font-extrabold text-white"
                  >
                    {w} 🔊
                  </button>
                ))}
              </div>
              <p className="text-xs text-emerald-300 font-bold pt-1">
                📖 &ldquo;{DIGRAPH_CARDS[digraphIdx].sentence}&rdquo;
              </p>
            </div>
          </div>

          <div className="lg:col-span-6 p-4 rounded-2xl bg-[#111827] border border-[#1F2937] space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400">
              ✍️ Sentence Rules (Capital Letter, Full Stop . & Question Mark ?)
            </h4>
            <div className="flex gap-1.5">
              {JUMBLED_SENTENCES.map((js, idx) => (
                <button
                  key={js.correct}
                  type="button"
                  onClick={() => {
                    setJumbledIdx(idx);
                    setBuiltWords([]);
                    speak('Tap the words in the right order to make a sentence!');
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold border ${
                    jumbledIdx === idx
                      ? 'bg-cyan-500 text-slate-950 border-white'
                      : 'bg-[#090D16] text-slate-300 border-slate-800'
                  }`}
                >
                  Sentence #{idx + 1}
                </button>
              ))}
            </div>

            {(() => {
              const js = JUMBLED_SENTENCES[jumbledIdx];
              const built = builtWords.map((i) => js.jumbled[i]).join(' ');
              const isDone = builtWords.length === js.jumbled.length;
              const isRight = isDone && built === js.correct;
              return (
                <div className="p-4 rounded-xl bg-[#090D16] border border-cyan-500/40 space-y-3">
                  <div className="text-xs text-slate-400">
                    Tap the jumbled words in the right order:
                    <div className="mt-2 flex flex-wrap gap-2">
                      {js.jumbled.map((w, i) => {
                        const used = builtWords.includes(i);
                        return (
                          <button
                            key={w}
                            type="button"
                            disabled={used || isDone}
                            onClick={() => {
                              playPop();
                              const next = [...builtWords, i];
                              setBuiltWords(next);
                              if (next.length === js.jumbled.length) {
                                const attempt = next.map((k) => js.jumbled[k]).join(' ');
                                if (attempt === js.correct) {
                                  awardStar(`${js.correct} ${js.rule}`);
                                } else {
                                  speak('Not quite! Tap Try Again and start with the capital letter word.');
                                }
                              }
                            }}
                            className={`px-3 py-2 rounded-lg font-mono text-sm font-bold border ${
                              used
                                ? 'bg-slate-900 text-slate-600 border-slate-800'
                                : 'bg-slate-800 text-amber-300 border-amber-400/40 hover:bg-slate-700'
                            }`}
                          >
                            {w}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div
                    className={`p-3 rounded-xl border flex flex-wrap items-center justify-between gap-2 ${
                      isRight
                        ? 'bg-emerald-950/30 border-emerald-500/50'
                        : isDone
                        ? 'bg-rose-950/30 border-rose-500/50'
                        : 'bg-slate-900/60 border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="text-[10px] font-mono uppercase text-slate-400">
                        {isRight ? '✓ Well done!' : isDone ? 'Not quite — try again!' : 'Your sentence'}
                      </div>
                      <div className="text-base font-black text-white min-h-[1.5rem]">{built || '…'}</div>
                    </div>
                    {builtWords.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setBuiltWords([])}
                        className="px-3 py-1.5 rounded-xl bg-slate-700 text-white text-xs font-extrabold"
                      >
                        ↺ Try Again
                      </button>
                    )}
                  </div>
                  {isRight && <p className="text-xs text-cyan-200">{js.rule}</p>}
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* MODE 31: HINDI — बारहखड़ी (12-SOUND BARAHKHADI STRIP), विलोम शब्द (OPPOSITES) & एक–अनेक (PLURALS) */}
      {mode === 'hindi-barahkhadi-vyakaran' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-[#111827] border border-[#1F2937] space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400">
                🪔 बारहखड़ी (12-Sound Consonant + Matra Strip: क से कः)
              </h4>
              <div className="flex gap-1.5">
                {BARAHKHADI_CONSONANTS.map((bc, idx) => (
                  <button
                    key={bc.base}
                    type="button"
                    onClick={() => {
                      setBarahkhadiIdx(idx);
                      setBarahkhadiFormIdx(0);
                      speak(bc.forms.join(', '), true, 'hi-IN');
                    }}
                    className={`px-3 py-1 rounded-xl text-xs font-extrabold border ${
                      barahkhadiIdx === idx
                        ? 'bg-rose-500 text-white border-white'
                        : 'bg-[#090D16] text-slate-300 border-slate-800'
                    }`}
                  >
                    {bc.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5">
              {BARAHKHADI_CONSONANTS[barahkhadiIdx].forms.map((fm, fIdx) => (
                <button
                  key={fm}
                  type="button"
                  onClick={() => {
                    setBarahkhadiFormIdx(fIdx);
                    speak(fm, true, 'hi-IN');
                  }}
                  className={`py-2.5 rounded-xl text-lg font-black border transition-all ${
                    barahkhadiFormIdx === fIdx
                      ? 'bg-amber-400 text-slate-950 border-white scale-105'
                      : 'bg-[#090D16] text-white border-slate-800 hover:border-rose-400'
                  }`}
                >
                  {fm}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-[#111827] border border-[#1F2937] space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">
                🔄 विलोम शब्द (Ulte Arth Wale Shabd / Hindi Opposites)
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {HINDI_VILOM_VACHAN.vilom.map((v) => (
                  <button
                    key={v.a}
                    type="button"
                    onClick={() => awardStar(`${v.a} का उल्टा ${v.b}`, 'hi-IN')}
                    className="p-2.5 rounded-xl bg-[#090D16] border border-slate-800 hover:border-amber-400 text-xs font-bold text-slate-200 flex items-center justify-between"
                  >
                    <span>{v.a}</span>
                    <span className="text-amber-400">⇄</span>
                    <span className="text-emerald-300">{v.b}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#111827] border border-[#1F2937] space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                🌟 एक और अनेक (वचन बदलो / One vs. Many in Hindi)
              </h4>
              <div className="space-y-2">
                {HINDI_VILOM_VACHAN.vachan.map((vc) => (
                  <button
                    key={vc.ek}
                    type="button"
                    onClick={() => awardStar(`${vc.ek}, ${vc.anek}`, 'hi-IN')}
                    className="w-full p-2.5 rounded-xl bg-[#090D16] border border-slate-800 hover:border-cyan-400 text-xs font-bold text-white flex items-center justify-between"
                  >
                    <span className="text-cyan-300">{vc.ek}</span>
                    <span>→</span>
                    <span className="text-amber-300">{vc.anek}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODE 32: EVS — CLOTHES WE WEAR (COTTON/WOOL/RAINCOAT), NEIGHBOURHOOD PLACES & INDOOR/OUTDOOR GAMES */}
      {mode === 'evs-clothes-places-games' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-6 p-4 rounded-2xl bg-[#111827] border border-[#1F2937] space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              👕🧣 Clothes We Wear in Different Seasons (Cotton, Wool & Raincoat)
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {CLOTHES_PLACES_GAMES.clothes.map((c, idx) => (
                <button
                  key={c.season}
                  type="button"
                  onClick={() => {
                    setClothesSeasonIdx(idx);
                    awardStar(`${c.season}: ${c.items}. ${c.source}`);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold border ${
                    clothesSeasonIdx === idx
                      ? 'bg-emerald-500 text-slate-950 border-white'
                      : 'bg-[#090D16] text-slate-300 border-slate-800'
                  }`}
                >
                  {c.season}
                </button>
              ))}
            </div>
            <div className="p-3.5 rounded-xl bg-[#090D16] border border-emerald-500/40 space-y-1 text-xs">
              <div className="font-extrabold text-white text-sm">
                {CLOTHES_PLACES_GAMES.clothes[clothesSeasonIdx].items}
              </div>
              <p className="text-emerald-200">{CLOTHES_PLACES_GAMES.clothes[clothesSeasonIdx].source}</p>
            </div>

            <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 pt-1">
              🏥🏤 Important Places in Our Neighbourhood
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {CLOTHES_PLACES_GAMES.places.map((pl, idx) => (
                <button
                  key={pl.place}
                  type="button"
                  onClick={() => {
                    setPlaceIdx(idx);
                    speak(`${pl.place}: ${pl.why}`, true);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${
                    placeIdx === idx
                      ? 'bg-cyan-500 text-slate-950 border-white'
                      : 'bg-[#090D16] text-slate-300 border-slate-800'
                  }`}
                >
                  {pl.place}
                </button>
              ))}
            </div>
            <div className="p-3 rounded-xl bg-[#090D16] border border-cyan-500/30 text-xs space-y-0.5">
              <div className="font-bold text-cyan-300">
                {CLOTHES_PLACES_GAMES.places[placeIdx].place} — {CLOTHES_PLACES_GAMES.places[placeIdx].who}
              </div>
              <p className="text-slate-300">{CLOTHES_PLACES_GAMES.places[placeIdx].why}</p>
            </div>
          </div>

          <div className="lg:col-span-6 p-4 rounded-2xl bg-[#111827] border border-[#1F2937] space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">
              ♟️⚽ Indoor Games (Inside Home) vs. Outdoor Games (Playground)
            </h4>
            <p className="text-xs text-slate-300">
              Tap each game to see if it is played indoors or outdoors and how it helps us!
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {CLOTHES_PLACES_GAMES.games.map((g) => (
                <button
                  key={g.name}
                  type="button"
                  onClick={() => awardStar(`${g.name} is an ${g.type}. ${g.benefit}`)}
                  className="p-3.5 rounded-xl bg-[#090D16] border border-slate-800 hover:border-amber-400 text-left space-y-1"
                >
                  <div className="text-xs font-extrabold text-white">{g.name}</div>
                  <div className="text-[10px] font-mono text-amber-300 uppercase">{g.type}</div>
                  <p className="text-[11px] text-slate-300">{g.benefit}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODE 33: COMPUTER CH 2 — KID PAINT / TUX PAINT TOOLS & SAFE COMPUTER LAB MANNERS */}
      {mode === 'computer-paint-manners' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-6 p-4 rounded-2xl bg-[#111827] border border-[#1F2937] space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-violet-400">
              🎨 Fun with MS Paint / Tux Paint Drawing Tools
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {PAINT_TOOLS_MANNERS.tools.map((t, idx) => (
                <button
                  key={t.name}
                  type="button"
                  onClick={() => {
                    setPaintToolIdx(idx);
                    awardStar(`${t.name}: ${t.desc}`);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold border ${
                    paintToolIdx === idx
                      ? 'bg-violet-500 text-white border-white'
                      : 'bg-[#090D16] text-slate-300 border-slate-800'
                  }`}
                >
                  {t.name}
                </button>
              ))}
            </div>
            <div className="p-4 rounded-xl bg-[#090D16] border border-violet-500/40 space-y-1">
              <div className="text-sm font-black text-white">
                {PAINT_TOOLS_MANNERS.tools[paintToolIdx].name}
              </div>
              <p className="text-xs text-violet-200">{PAINT_TOOLS_MANNERS.tools[paintToolIdx].desc}</p>
            </div>
          </div>

          <div className="lg:col-span-6 p-4 rounded-2xl bg-[#111827] border border-[#1F2937] space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              ✅ Computer Lab Manners (Do&apos;s and Don&apos;ts)
            </h4>
            <div className="space-y-2">
              {PAINT_TOOLS_MANNERS.manners.map((m) => (
                <button
                  key={m.rule}
                  type="button"
                  onClick={() => speak(m.rule, true)}
                  className={`w-full p-2.5 rounded-xl border text-left text-xs font-bold flex items-center justify-between ${
                    m.good
                      ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                      : 'bg-rose-950/30 border-rose-500/40 text-rose-200'
                  }`}
                >
                  <span>
                    {m.icon} {m.rule}
                  </span>
                  <span className="font-mono text-[10px] uppercase px-2 py-0.5 rounded bg-black/40">
                    {m.good ? 'Always DO' : 'NEVER DO'}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODE 34: OLYMPIAD & LOGICAL REASONING BRAIN GYM (SOF IMO / NSO / IEO / IGKO CLASS 1) */}
      {mode === 'olympiad-reasoning-gym' && (
        <div className="p-4 rounded-2xl bg-[#111827] border border-[#1F2937] space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-pink-400">
                🧠 Class 1 Olympiad Logical Reasoning Brain Gym (Odd One Out, Analogies & Shape Count)
              </h4>
              <p className="text-xs text-slate-300">
                Practice SOF IMO / NSO / IEO / IGKO Section-1 Logical Thinking puzzles!
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {OLYMPIAD_PUZZLES.map((pz, idx) => (
                <button
                  key={pz.category}
                  type="button"
                  onClick={() => {
                    setOlympiadIdx(idx);
                    setOlympiadFeedback(null);
                    speak(pz.question);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold border ${
                    olympiadIdx === idx
                      ? 'bg-pink-500 text-white border-white'
                      : 'bg-[#090D16] text-slate-300 border-slate-800'
                  }`}
                >
                  Puzzle #{idx + 1}: {pz.category.split(' (')[0]}
                </button>
              ))}
            </div>
          </div>

          {(() => {
            const pz = OLYMPIAD_PUZZLES[olympiadIdx] || OLYMPIAD_PUZZLES[0];
            return (
              <div className="p-4 rounded-xl bg-[#090D16] border border-pink-500/40 space-y-3">
                <div className="text-xs font-mono uppercase text-pink-300 font-bold">{pz.category}</div>
                <p className="text-sm font-black text-white">{pz.question}</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {pz.options.map((opt, oIdx) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => {
                        if (oIdx === pz.correct) {
                          setOlympiadFeedback(`🏆 Brilliant! ${pz.explanation}`);
                          awardStar(pz.explanation);
                        } else {
                          setOlympiadFeedback('Think carefully and try another option!');
                          speak('Try again!');
                        }
                      }}
                      className="p-3 rounded-xl bg-[#111827] hover:bg-pink-500/20 border-2 border-slate-700 hover:border-pink-400 text-xs font-extrabold text-white"
                    >
                      {opt}
                    </button>
                  ))}
                </div>
                {olympiadFeedback && (
                  <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-400/50 text-xs font-bold text-emerald-200">
                    {olympiadFeedback}
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};
