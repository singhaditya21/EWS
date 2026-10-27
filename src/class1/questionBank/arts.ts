import { BankQuestion } from './types';

export const ARTS_QUESTIONS: BankQuestion[] = [
  // a.colours — Primary and secondary colours
  { id: 'a.colours-01', skillId: 'a.colours', prompt: 'Red + yellow makes which colour?', options: ['green', 'orange', 'purple', 'brown'], answer: 1, explain: 'Mixing red and yellow gives orange.' },
  { id: 'a.colours-02', skillId: 'a.colours', prompt: 'Blue + yellow makes which colour?', options: ['orange', 'purple', 'green', 'pink'], answer: 2, explain: 'Mixing blue and yellow gives green.' },
  { id: 'a.colours-03', skillId: 'a.colours', prompt: 'Red + blue makes which colour?', options: ['orange', 'green', 'pink', 'purple'], answer: 3, explain: 'Mixing red and blue gives purple.' },
  { id: 'a.colours-04', skillId: 'a.colours', prompt: 'Which one is a primary colour?', options: ['green', 'orange', 'red', 'purple'], answer: 2, explain: 'Red, blue and yellow are the primary colours.' },
  { id: 'a.colours-05', skillId: 'a.colours', prompt: 'Which one is NOT a primary colour?', options: ['red', 'green', 'blue', 'yellow'], answer: 1, explain: 'Green is made by mixing blue and yellow, so it is not primary.' },
  { id: 'a.colours-06', skillId: 'a.colours', prompt: 'How many primary colours are there?', options: ['2', '3', '4', '7'], answer: 1, explain: 'There are three primary colours: red, blue and yellow.' },
  { id: 'a.colours-07', skillId: 'a.colours', prompt: 'Red + white makes which colour?', options: ['pink', 'grey', 'brown', 'black'], answer: 0, explain: 'Adding white to red makes a light red: pink.' },
  { id: 'a.colours-08', skillId: 'a.colours', prompt: 'Green is made by mixing ___.', options: ['red and yellow', 'blue and yellow', 'red and blue', 'red and white'], answer: 1, explain: 'Blue and yellow mix to make green.' },
  { id: 'a.colours-09', skillId: 'a.colours', prompt: 'Black + white makes which colour?', options: ['pink', 'orange', 'grey', 'green'], answer: 2, explain: 'Mixing black and white gives grey.' },
  { id: 'a.colours-10', skillId: 'a.colours', prompt: 'Orange is made by mixing red and ___.', options: ['blue', 'green', 'black', 'yellow'], answer: 3, explain: 'Red and yellow mix to make orange.' },
  { id: 'a.colours-11', skillId: 'a.colours', prompt: 'Purple is made by mixing ___.', options: ['blue and yellow', 'red and yellow', 'red and blue'], answer: 2, explain: 'Red and blue mix to make purple.' },

  // a.music — Sa Re Ga Ma and rhythm
  { id: 'a.music-01', skillId: 'a.music', prompt: 'Sa, Re, Ga, ___. Which note comes next?', options: ['Ma', 'Pa', 'Ni', 'Dha'], answer: 0, explain: 'The notes go Sa, Re, Ga, Ma, Pa, Dha, Ni.' },
  { id: 'a.music-02', skillId: 'a.music', prompt: 'How many notes are in Sa Re Ga Ma Pa Dha Ni?', options: ['5', '6', '7', '8'], answer: 2, explain: 'There are seven swaras: Sa, Re, Ga, Ma, Pa, Dha, Ni.' },
  { id: 'a.music-03', skillId: 'a.music', prompt: 'Which note comes after Pa?', options: ['Ma', 'Dha', 'Ni', 'Sa'], answer: 1, explain: 'Ma, Pa, Dha — Dha comes after Pa.' },
  { id: 'a.music-04', skillId: 'a.music', prompt: 'Which instrument is played by tapping with the hands?', options: ['flute', 'sitar', 'harmonium', 'tabla'], answer: 3, explain: 'We tap the tabla with our fingers and palms.' },
  { id: 'a.music-05', skillId: 'a.music', prompt: 'Which instrument do we blow into?', options: ['tabla', 'flute', 'dholak', 'sitar'], answer: 1, explain: 'We blow air into a flute (bansuri) to play it.' },
  { id: 'a.music-06', skillId: 'a.music', prompt: 'Which instrument has strings?', options: ['tabla', 'flute', 'sitar', 'dholak'], answer: 2, explain: 'The sitar has strings that we pluck.' },
  { id: 'a.music-07', skillId: 'a.music', prompt: "A lion's roar is a ___ sound.", options: ['soft', 'quiet', 'loud'], answer: 2, explain: 'A roar is very loud.' },
  { id: 'a.music-08', skillId: 'a.music', prompt: 'How do we sing a lullaby (lori) to a baby?', options: ['softly', 'loudly', 'angrily'], answer: 0, explain: 'A lullaby is sung softly to help a baby sleep.' },
  { id: 'a.music-09', skillId: 'a.music', prompt: 'If we clap very quickly, the beat is ___.', options: ['slow', 'fast', 'soft'], answer: 1, explain: 'Quick claps make a fast beat.' },
  { id: 'a.music-10', skillId: 'a.music', prompt: 'Which note comes just before Ni?', options: ['Pa', 'Ma', 'Ga', 'Dha'], answer: 3, explain: 'Pa, Dha, Ni — Dha comes just before Ni.' },
  { id: 'a.music-11', skillId: 'a.music', prompt: 'The dholak is a kind of ___.', options: ['flute', 'drum', 'bell'], answer: 1, explain: 'The dholak is a drum played with both hands.' },

  // a.reasoning — Odd one out, analogies and patterns
  { id: 'a.reasoning-01', skillId: 'a.reasoning', prompt: 'Find the odd one out.', options: ['apple', 'mango', 'carrot', 'banana'], answer: 2, explain: 'Carrot is a vegetable. The others are fruits.' },
  { id: 'a.reasoning-02', skillId: 'a.reasoning', prompt: 'Find the odd one out.', options: ['rose', 'cow', 'dog', 'cat'], answer: 0, explain: 'Rose is a flower. The others are animals.' },
  { id: 'a.reasoning-03', skillId: 'a.reasoning', prompt: 'Bird is to nest as dog is to ___.', options: ['hive', 'kennel', 'web', 'stable'], answer: 1, explain: 'A bird lives in a nest; a dog lives in a kennel.' },
  { id: 'a.reasoning-04', skillId: 'a.reasoning', prompt: 'What comes next? 2, 4, 6, 8, ___', options: ['9', '12', '7', '10'], answer: 3, explain: 'We add 2 each time: 8 + 2 = 10.' },
  { id: 'a.reasoning-05', skillId: 'a.reasoning', prompt: 'What comes next? circle, square, circle, square, ___', options: ['triangle', 'circle', 'square', 'star'], answer: 1, explain: 'Circle and square take turns, so circle comes next.' },
  { id: 'a.reasoning-06', skillId: 'a.reasoning', prompt: 'Find the odd one out.', options: ['car', 'bus', 'banana', 'truck'], answer: 2, explain: 'Banana is a fruit. The others are vehicles.' },
  { id: 'a.reasoning-07', skillId: 'a.reasoning', prompt: 'Hand is to glove as foot is to ___.', options: ['hat', 'ring', 'sock', 'belt'], answer: 2, explain: 'A glove covers the hand; a sock covers the foot.' },
  { id: 'a.reasoning-08', skillId: 'a.reasoning', prompt: 'What comes next? 5, 10, 15, 20, ___', options: ['21', '25', '30', '22'], answer: 1, explain: 'We add 5 each time: 20 + 5 = 25.' },
  { id: 'a.reasoning-09', skillId: 'a.reasoning', prompt: 'Find the odd one out.', options: ['red', 'blue', 'green', 'chair'], answer: 3, explain: 'Chair is a thing. The others are colours.' },
  { id: 'a.reasoning-10', skillId: 'a.reasoning', prompt: 'Day is to night as hot is to ___.', options: ['cold', 'warm', 'sun', 'fire'], answer: 0, explain: 'Day and night are opposites, and so are hot and cold.' },
  { id: 'a.reasoning-11', skillId: 'a.reasoning', prompt: 'What comes next? A, B, C, D, ___', options: ['F', 'E', 'G', 'A'], answer: 1, explain: 'E comes after D in the alphabet.' },
];
