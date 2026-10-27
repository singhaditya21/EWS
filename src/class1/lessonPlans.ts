// Class 1 teacher lesson plans and parent home activities, one per chapter.
// Play-based and activity-based in the spirit of NCF-FS: toys, stories, songs and local context, no written tests.
// Keys are the chapter ids from src/data/curriculum.ts (classLevel: 1).

export interface Class1LessonPlan {
  /** 2–3 "The child can…" objectives, observable and Class-1 sized. */
  objectives: string[];
  /** 5-minute warm-up the teacher does with the whole class (no special materials). */
  warmUp: string;
  /** 15–20 minute main hands-on activity using cheap classroom materials (sticks, bottle caps, chalk, chart paper, real coins, fruits, etc.). */
  activity: string;
  /** How to check understanding in 2–3 minutes (one or two quick oral/visual checks). */
  check: string;
  /** Simple extra support for a child who is struggling. */
  support: string;
  /** Parent home activity: 5–10 minutes, everyday household items, playful, works in any Indian home. */
  homeActivity: string;
  /** Materials list (short strings). */
  materials: string[];
}

export const CLASS1_LESSON_PLANS: Record<string, Class1LessonPlan> = {
  // ---------------------------------------------------------------------------
  // Mathematics
  // ---------------------------------------------------------------------------
  'cls1-math-spatial-furry-cat': {
    objectives: [
      'The child can place an object on, under, inside, outside, near or far when asked.',
      'The child can say where a toy is using one position word.',
      'The child can compare two things as bigger/smaller or taller/shorter.',
    ],
    warmUp:
      'Play "Simon Says" with position words: hands ON your head, hands UNDER the desk, stand NEAR the door, step FAR from the board. Speed up as the class gets confident.',
    activity:
      'In small groups, each child takes turns hiding a soft toy "cat" on, under, inside or outside a box or desk while the group calls out where it is. Then two children stand near and far from a tree in the school yard, and the class compares pairs of objects (two pencils, two bags) as longer/shorter or bigger/smaller.',
    check:
      'Put an eraser in different places and ask "Where is it?" around the room. Then hold up two objects and ask which one is bigger.',
    support:
      'Use the child’s own body first (sit ON the mat, crawl UNDER the table) and teach one pair of opposites at a time before mixing them.',
    homeActivity:
      'Play "Find the Teddy": hide a toy at home and give position clues like "It is UNDER the bed" or "It is INSIDE the steel dabba". Then let your child hide it and give you the clues.',
    materials: ['Soft toy or puppet', 'Cardboard box', 'Desks and chairs', 'Pencils and bags of different sizes'],
  },
  'cls1-math-numbers-comparison': {
    objectives: [
      'The child can count objects up to 20 and show the number on a ten-frame.',
      'The child can say the number just before and just after a given number up to 20.',
      'The child can compare two groups and say which has more, fewer or the same.',
    ],
    warmUp:
      'Count aloud from 1 to 20 while clapping, then count back from 10 to 1 like a rocket launch. Ask "What comes after 7?" and "What comes before 12?" as quick fire questions.',
    activity:
      'Draw ten-frames (2 rows of 5 boxes) with chalk on the floor or on chart paper and let pairs fill them with bottle caps to show numbers called out by the teacher, such as 14 as one full frame and 4 more. Then each pair makes two heaps of caps, counts them, and places a paper "crocodile mouth" (< or >) so the mouth opens towards the bigger heap, or an = card if they are equal.',
    check:
      'Show two heaps of caps and ask which has more. Ask one child to show 9 on a ten-frame and another to say the number after 9.',
    support:
      'Let the child touch and move each cap while counting, and work only up to 10 with one ten-frame before moving to teen numbers.',
    homeActivity:
      'Use an empty egg tray or ice tray as a ten-frame and fill it with rajma, chana or buttons to make numbers you call out. Make two piles of peanuts and ask which pile the "hungry crocodile" would eat.',
    materials: ['Bottle caps or seeds', 'Chalk or chart paper ten-frames', 'Paper crocodile mouth cut-out', 'Number cards 1–20'],
  },
  'cls1-math-add-sub-frog': {
    objectives: [
      'The child can add two numbers with a total up to 20 using objects or a number line.',
      'The child can subtract within 20 by taking away or hopping back.',
      'The child can tell that 5 + 8 and 8 + 5 give the same answer.',
    ],
    warmUp:
      'Play "Frog Jumps": children hop forward 2 steps, then 3 more, and say how many hops in all. Then hop back 1 and count again.',
    activity:
      'Draw a big 0–20 number line with chalk on the floor; one child is the frog and hops forward to add (start at 8, hop 5) and backward to subtract while the class counts the hops aloud. In pairs, children also solve the same sums with sticks or bottle caps, putting together and taking away, and try making 10 first (8 + 2, then 3 more).',
    check:
      'Ask "Start at 6 and hop 4 forward, where do you land?" and "You have 9 caps, I take 3, how many are left?" Watch who counts on and who counts all.',
    support:
      'Keep numbers under 10, use real objects before the number line, and let the child say each hop number aloud while moving.',
    homeActivity:
      'Play "Laddoo Shop" with biscuits or toy pieces: put 4 on a plate, add 3 more and ask how many in all, then "eat" 2 and ask how many are left. Swap roles so your child asks you the questions.',
    materials: ['Chalk for a floor number line', 'Sticks or bottle caps', 'Number cards 0–20'],
  },
  'cls1-math-abacus': {
    objectives: [
      'The child can show a 2-digit number as tens and ones with bundles and loose sticks.',
      'The child can read and say numbers up to 99.',
      'The child can skip count by 2s, 5s and 10s.',
    ],
    warmUp:
      'Count to 100 in tens while stamping feet (10, 20, 30…), then count by 2s with a clap on each number. Ask "How many fingers do 2 children have?" and count by 10s to check.',
    activity:
      'Give each group about 50 ice-cream sticks and rubber bands to bundle tens; the teacher calls a number like 34 and groups show 3 bundles and 4 loose sticks. Groups then show it on a simple abacus made from clay and two pencils (or bead strings), noticing that 40 has 4 tens and 0 ones.',
    check:
      'Show 2 bundles and 6 loose sticks and ask "What number is this?" Ask the class to skip count by 5s from 5 to 50.',
    support:
      'Work with numbers up to 30 first, and let the child physically tie each bundle of 10 to feel that one ten is ten ones.',
    homeActivity:
      'Collect matchsticks, straws or toothpicks and tie them into bundles of 10 with a rubber band to make your house number or a family member’s age. Count chappals in pairs (2, 4, 6…) by the door.',
    materials: ['Ice-cream sticks or straws', 'Rubber bands', 'Clay and pencils or bead strings for an abacus', 'Number cards 1–99'],
  },
  'cls1-math-shapes-roll-slide': {
    objectives: [
      'The child can name a ball, box, can and cone shape from everyday objects.',
      'The child can test and say whether an object rolls, slides or does both.',
      'The child can continue a simple shape pattern.',
    ],
    warmUp:
      'Play "I Spy Shapes" around the classroom: find something round like a ball, something like a box, and something like a can. Children trace a circle, square and triangle in the air.',
    activity:
      'Make a ramp with a book or plank and let groups test a ball, chalk box, steel tumbler or tin, and a paper cone, sorting them on chart paper into Rolls, Slides and Both. Finish with groups making a shape pattern on the floor with leaves and stones or chalk circles and squares.',
    check:
      'Hold up an object and ask "Will it roll or slide?" before testing. Ask a child to name one thing at home shaped like a ball.',
    support:
      'Let the child feel the curved and flat surfaces with eyes closed and test one object at a time on the ramp.',
    homeActivity:
      'Make a ramp with a tray or chopping board and test a lemon or orange, a soap bar, a steel glass and a small box. Ask your child to predict first, then check which ones roll and which slide.',
    materials: ['Book or plank for a ramp', 'Ball, chalk box, tin can, paper cone', 'Chart paper', 'Leaves and stones for patterns'],
  },
  'cls1-math-clock-money': {
    objectives: [
      'The child can read o’clock and half-past times on a clock face.',
      'The child can recognise Indian coins and notes and make ₹10 in more than one way.',
      'The child can measure a short length with handspans or footsteps.',
    ],
    warmUp:
      'Children become a human clock: arms make the hands for 3 o’clock, 6 o’clock and 12 o’clock. Then sing a "What do we do at 8 o’clock?" daily routine chant.',
    activity:
      'Set up a classroom "kirana shop" with toy or real coins and price tags of ₹1–₹20 on items like a pencil, banana or eraser; children take turns as shopkeeper and buyer and find different ways to pay ₹10. Groups also make paper plate clocks with chalk or card hands and show times the teacher calls.',
    check:
      'Show a clock at 4 o’clock and ask the time. Ask a child to give you ₹10 using only ₹2 and ₹5 coins.',
    support:
      'Start with just ₹1, ₹2 and ₹5 coins and only o’clock times, letting the child match coins to a picture card.',
    homeActivity:
      'Let your child pay for one small item at the local shop or play shop at home with real coins. At meal times, point to the clock and say "It is 8 o’clock, time for dinner."',
    materials: ['Real or toy Indian coins and notes', 'Paper plates and card for clocks', 'Price tags', 'Small classroom items to "sell"'],
  },
  'cls1-math-measurement-balance': {
    objectives: [
      'The child can measure the length of a table or book in handspans.',
      'The child can tell which of two things is heavier using hands or a balance.',
      'The child can say which container holds more water.',
    ],
    warmUp:
      'Show how to stretch a handspan, thumb to little finger, then children measure their desk and call out the number. Ask why two children got different answers.',
    activity:
      'Make a balance with a hanger and two small bags or a ruler on a pencil, and let groups compare a pencil box and an eraser, a mango and a lemon, saying which side goes down. Then groups pour water from a jug into cups and a bucket using a mug to count how many mugs each holds.',
    check:
      'Ask "Which is heavier, your school bag or a pencil?" and let them test with hands. Show a mug and a spoon and ask which holds more water.',
    support:
      'Let the child hold one object in each hand first to feel heavy and light before using the balance.',
    homeActivity:
      'In the kitchen, ask your child to guess which is heavier, a potato or an onion, and check by holding both. Let them count how many katoris of water fill a steel glass.',
    materials: ['Hanger, string and two small bags (balance)', 'Fruits and classroom objects', 'Jug, mug, cups, bucket', 'Water'],
  },
  'cls1-math-patterns-pictograph': {
    objectives: [
      'The child can copy and continue an AB, AAB or ABC pattern.',
      'The child can make a picture chart by placing one picture for each object.',
      'The child can read a picture chart to say which has the most and the least.',
    ],
    warmUp:
      'Do a clap–stamp–clap–stamp body pattern, then clap–clap–stamp, and ask children to guess what comes next. Let one child invent a new pattern for the class.',
    activity:
      'Groups make a festive rangoli or toran pattern on chart paper using leaves, bottle caps, bangles or chalk colours, naming the repeating part. Then the class makes a toy pictograph: each child sticks one drawing of their favourite toy (ball, doll, car, kite) in the right row, and the class counts to find the most and least liked toy.',
    check:
      'Show red–blue–red–blue and ask what comes next. Point to the pictograph and ask which row has the most pictures.',
    support:
      'Start with a two-colour AB pattern using real objects and let the child say the pattern aloud ("red, blue, red, blue").',
    homeActivity:
      'Make a pattern with spoons and forks or with rice and dal grains on a plate and ask your child to continue it. Count the fruits in the kitchen and draw a simple picture chart together.',
    materials: ['Leaves, bottle caps, bangles', 'Coloured chalk', 'Chart paper', 'Small paper squares for toy drawings', 'Glue'],
  },
  'cls1-math-ordinals-groups-data': {
    objectives: [
      'The child can say the position of a child in a line using 1st to 10th.',
      'The child can make equal groups and find how many in all by adding again and again.',
      'The child can sort and count objects into groups and tell which group has more.',
    ],
    warmUp:
      'Line up 10 children for a pretend race; the class calls out who is 1st, 2nd, 3rd and so on. Ask "Who is 5th?" and "What position is Riya?"',
    activity:
      'Groups make equal groups of 3 bottle caps on 4 paper plates and find the total by counting on (3, 6, 9, 12), then try other groups like 2 groups of 5. Next they sort a mixed heap of buttons or leaves by colour or shape and count each pile to find which has the most.',
    check:
      'Ask the 3rd child in the row to stand up. Show 3 plates with 2 caps each and ask how many in all.',
    support:
      'Use only 1st to 5th positions first, and let the child touch and count each object in every group.',
    homeActivity:
      'Line up family members or toys and ask "Who is 1st? Who is 3rd?" Put 2 biscuits each on 3 plates and ask how many biscuits there are altogether.',
    materials: ['Bottle caps or pebbles', 'Paper plates or circles', 'Ordinal number cards 1st–10th', 'Buttons or leaves for sorting'],
  },
  'cls1-math-vertical-staircase': {
    objectives: [
      'The child can add or subtract 2-digit numbers without carrying, ones first then tens.',
      'The child can arrange 4–5 numbers in ascending and descending order.',
      'The child can tell if a small group is even or odd by making pairs.',
    ],
    warmUp:
      'Children stand up in a line holding number cards and the class rearranges them from smallest to greatest like climbing stairs, then greatest to smallest. Ask "Can everyone find a partner?" to see if the class number is even or odd.',
    activity:
      'Draw a T | O chart on chart paper and let pairs show sums like 24 + 15 with bundles of ten sticks and loose sticks, adding the ones first and then the tens, and writing the answer under each column with chalk. Then give each group a heap of chappals or paper cut-out shoes to pair up and decide if the number is even (all paired) or odd (one left over).',
    check:
      'Ask "In 32 + 6, what do we add first?" Show 7 caps and ask if it is even or odd.',
    support:
      'Use real bundles and loose sticks on the T | O mat for every sum, and keep numbers under 30.',
    homeActivity:
      'Pair up family members’ chappals at the door and ask if any shoe is left without a partner. Write 5 numbers on paper slips and let your child arrange them like stairs from small to big.',
    materials: ['Ice-cream sticks and rubber bands', 'T | O chart on chart paper', 'Number cards', 'Paper shoe cut-outs or real chappals'],
  },
  'cls1-math-ordinals-fractions': {
    objectives: [
      'The child can use 1st to 10th to say the position of a child or animal in a race.',
      'The child can say the number before, after and between up to 50.',
      'The child can fold or cut a whole into 2 or 4 equal parts and call them halves or quarters.',
    ],
    warmUp:
      'Hold an animal race with 10 children wearing paper animal masks or name cards; the class announces the 1st to 10th positions. Ask "What number is between 15 and 17?"',
    activity:
      'Give each child a paper circle "roti" or "pizza" to fold into 2 equal halves and then 4 equal quarters, colouring one part. Discuss whether a roti broken into one big and one small piece is really halves, and share a real fruit like a banana or chikki into equal parts.',
    check:
      'Show a paper circle cut into 2 unequal pieces and ask "Are these halves?" Ask "What comes just after 29?"',
    support:
      'Start with folding paper squares edge to edge so the two halves match exactly before moving to circles.',
    homeActivity:
      'When sharing a roti, apple or laddoo, ask your child to break it into 2 equal halves for two people, then into 4 quarters. Ask who came 1st, 2nd and 3rd to the dinner table.',
    materials: ['Paper circles and squares', 'Crayons', 'Animal masks or name cards', 'A banana or chikki to share'],
  },
  'cls1-math-word-problems-tables': {
    objectives: [
      'The child can listen to a short story sum and say whether to add or subtract.',
      'The child can solve story sums within 20 using objects or drawings.',
      'The child can say the tables of 2, 5 and 10 using groups of objects.',
    ],
    warmUp:
      'Tell a quick story: "5 birds sat on a tree, 2 flew away." Children act it out and say how many are left. Then count hands in 5s and 10s together.',
    activity:
      'The teacher tells short local story sums (Aarav had 6 mangoes, Didi gave him 4 more, how many altogether?) and children act them out with bottle caps, raising a "+" card or a "–" card for the clue word. Then groups make equal groups of 2, 5 or 10 sticks and chant the table while counting the groups.',
    check:
      'Ask "If 3 out of 8 laddoos were eaten, do we add or take away?" Ask a child to show 2 × 3 using sticks.',
    support:
      'Use small numbers and act out every story with real objects, underlining the clue word by saying it louder.',
    homeActivity:
      'Make up story sums at dinner: "There are 4 rotis, Papa makes 3 more, how many in all?" Count shoes by 2s or rupee ₹5 coins by 5s together.',
    materials: ['Bottle caps or sticks', '+ and – cards', 'Story picture cards (optional)'],
  },

  // ---------------------------------------------------------------------------
  // English
  // ---------------------------------------------------------------------------
  'cls1-eng-phonics-vowels': {
    objectives: [
      'The child can say the 5 vowels and their short sounds.',
      'The child can blend 3 sounds to read a CVC word like cat, pen or bus.',
      'The child can choose "a" or "an" before a word like apple or ball.',
    ],
    warmUp:
      'Sing a vowel song with actions: A for apple (bite), E for egg (crack), I for insect (crawl fingers), O for octopus (wave arms), U for umbrella (hold up). Repeat the short sounds together.',
    activity:
      'Write letters on bottle caps or card squares and let pairs slide three together to make words like c-a-t, h-e-n, p-i-g, d-o-g, s-u-n, sounding each one and then blending. Then the teacher holds up real objects or pictures (apple, ball, orange, egg, cup) and children call out "a" or "an" and put them in two baskets.',
    check:
      'Say three sounds, "b-u-s", and ask the class to blend the word. Hold up an umbrella picture and ask "a umbrella or an umbrella?"',
    support:
      'Focus on one vowel at a time (only short "a" words) and let the child move each letter cap while saying its sound.',
    homeActivity:
      'Play "I spy a sound": "I spy something that starts with a-a-a" (an apple, an almirah). Make 3-letter words with chalk or letter cards on the floor and let your child read them.',
    materials: ['Bottle caps or card squares with letters', 'Pictures or real objects', 'Two baskets labelled "a" and "an"'],
  },
  'cls1-eng-grammar-opposites': {
    objectives: [
      'The child can give the opposite of simple words like hot, big, up and happy.',
      'The child can act out and name an action word.',
      'The child can change one to many by adding -s or -es for common words.',
    ],
    warmUp:
      'Play "Opposite Actions": the teacher says "Big!" and children stretch tall; "Small!" and they curl up. Repeat with fast/slow, up/down and happy/sad faces.',
    activity:
      'Play action charades: a child picks a picture card (running, eating, sleeping, swimming) and acts it while others guess the action word. Then show one and many real objects (1 book and 3 books, 1 box and 2 boxes, 1 mango and 4 mangoes) and children say the plural aloud, sorting cards into "-s" and "-es" piles.',
    check:
      'Say "Hot!" and ask for the opposite. Hold up 3 pencils and ask "One pencil, three…?"',
    support:
      'Use real objects and gestures for every opposite (a cold water bottle and warm tea) and practise only 3 pairs at a time.',
    homeActivity:
      'While doing chores, play opposites: open/close the door, switch the light on/off, fill a glass full/empty. Ask your child to say what everyone in the family is doing ("Mummy is cooking").',
    materials: ['Picture cards of actions', 'Real objects in ones and many', 'Two trays for sorting'],
  },
  'cls1-eng-mridang-stories': {
    objectives: [
      'The child can recite a short action rhyme with actions.',
      'The child can use the right greeting for morning, afternoon, evening and night.',
      'The child can retell a simple story in their own words using pictures.',
    ],
    warmUp:
      'Do an action rhyme about hands, legs and eyes with clapping, tapping and blinking. Children greet each other with "Good morning" and a namaste.',
    activity:
      'Tell the folk tale of the cap-seller and the monkeys with paper caps and children acting as monkeys who copy every action, then ask why throwing the cap down worked. In pairs, children role-play greetings for different times of the day using a paper sun and moon to show the time.',
    check:
      'Show the moon picture and ask what we say before sleeping. Ask a child to tell what the monkeys did when the cap-seller threw his cap.',
    support:
      'Let the child retell using 3 picture cards in order (sleeping, monkeys take caps, caps thrown down) and join in only the repeated parts of the rhyme.',
    homeActivity:
      'At bedtime, ask your child to tell you the cap-seller story or any story they heard at school. Practise greeting grandparents and neighbours at the right time of day.',
    materials: ['Paper caps', 'Picture cards for story sequence', 'Paper sun and moon cut-outs'],
  },
  'cls1-eng-nouns-this-that': {
    objectives: [
      'The child can name and sort words into person, place, animal and thing.',
      'The child can use "this" and "these" for things near and "that" and "those" for things far.',
    ],
    warmUp:
      'Play "Name It Fast": the teacher points to things and people around the room and children call out their names. Ask for one animal, one place and one person they know.',
    activity:
      'Place four baskets labelled Person, Place, Animal and Thing and let children sort picture cards (teacher, school, cow, ball, doctor, market, parrot, bag) into them. Then play pointing games: hold a pencil and say "This is a pencil", point at the door and say "That is a door", and repeat with many objects for "these" and "those".',
    check:
      'Hold up a picture of a temple or park and ask "Person, place, animal or thing?" Point to the far window and ask a child to make a sentence with "that".',
    support:
      'Start with only two baskets (animal and thing), and let the child hold an object for "this" and walk away from it for "that".',
    homeActivity:
      'Play "Kitchen Nouns": name 5 things in the kitchen, 2 people in the family and 1 place you visited this week. Hold a spoon and say "This is a spoon", then point to the fan and ask your child to say "That is a fan".',
    materials: ['Four baskets or boxes with labels', 'Picture cards of nouns', 'Classroom objects'],
  },
  'cls1-eng-pronouns-adjectives': {
    objectives: [
      'The child can use he, she, it, we and they in place of a name.',
      'The child can describe a thing using a colour, size or feeling word.',
    ],
    warmUp:
      'Point at children and objects as the class calls out the right word: Rohan is "he", Meera is "she", the ball is "it", all of us are "we". Then describe the weather with one word (hot, cloudy, sunny).',
    activity:
      'Pass a "mystery bag" with fruits and objects (a red apple, a long stick, a soft cloth, a round ball); each child pulls one out and describes it with a describing word. Then pairs make sentences about classmates, replacing names with he, she or they ("Anu is singing. She is happy.").',
    check:
      'Say "Arjun is tall." and ask what word can replace Arjun. Hold up a banana and ask for one describing word.',
    support:
      'Give the child a choice of two words ("Is it big or small?") and practise pronouns using family photos or dolls.',
    homeActivity:
      'Play "Describe and Guess": describe something at home ("It is yellow, sweet and long") and let your child guess (a banana), then swap. Ask them to talk about family members using he, she and they.',
    materials: ['Cloth bag', 'Fruits and everyday objects', 'Pictures of people and animals'],
  },
  'cls1-eng-digraphs-sentences': {
    objectives: [
      'The child can hear and say the sounds ch, sh, th and wh in common words.',
      'The child can arrange 3–4 word cards into a sentence starting with a capital letter.',
      'The child can say whether a sentence is telling (.) or asking (?).',
    ],
    warmUp:
      'Make sound actions: "ch-ch-ch" like a train, "sh" with a finger on lips, "th" with the tongue peeping out, "wh" like blowing a candle. Children say a word for each sound.',
    activity:
      'Groups get picture cards (chair, ship, thumb, whale, shoe, cheese) and sort them into ch, sh, th and wh boxes, saying each word aloud. Then give jumbled word cards ("is / sky / The / blue") and groups arrange them, check the capital letter is first, and place a full stop or question mark card at the end.',
    check:
      'Say "ship" and ask which sound it starts with. Read "What is your name" and ask if it needs a full stop or a question mark.',
    support:
      'Work with one digraph at a time using a mirror to see mouth shape, and give only 3 word cards to arrange.',
    homeActivity:
      'Hunt for things at home that start with sh (shelf, shirt, shoe) and ch (chair, chappal, chai). Ask your child one question and one telling sentence about dinner, and let them say which is which.',
    materials: ['Picture cards', 'Four sound boxes', 'Jumbled sentence word cards', 'Full stop and question mark cards'],
  },

  // ---------------------------------------------------------------------------
  // Hindi
  // ---------------------------------------------------------------------------
  'cls1-hindi-varnamala': {
    objectives: [
      'The child can say the स्वर (अ to अः) in order.',
      'The child can recognise and say common व्यंजन like क, ख, ग, घ with a picture word.',
      'The child can read simple 2-letter words without मात्रा like जल and घर.',
    ],
    warmUp:
      'Sing the स्वर with actions: अ से अनार (hold a fruit), आ से आम (pretend to eat), उ से उल्लू (owl eyes with hands). Children repeat each sound loudly and softly.',
    activity:
      'Lay out letter cards and real objects or pictures (अनार, आम, इमली, कबूतर, खरगोश, गमला, घड़ी) and children match each letter to its picture word. Then children trace big letters on the floor with chalk or in a tray of sand and join two cards to read जल, घर and कमल.',
    check:
      'Show क and ask for a word starting with it. Show the card घर and ask the child to read it.',
    support:
      'Teach 3–4 letters per day with one strong picture each, and let the child trace the letter with a finger before saying it.',
    homeActivity:
      'Play "अक्षर खोज": find something at home that starts with a given letter (आ से आलू, क से कटोरी, ग से गिलास). Write a letter in flour or rice on a plate and let your child trace it.',
    materials: ['Hindi letter cards', 'Picture cards or real objects', 'Sand or rice tray', 'Chalk'],
  },
  'cls1-hindi-shabd-train': {
    objectives: [
      'The child can join 2, 3 or 4 letters to read words without मात्रा.',
      'The child can read a short Hindi phrase made of such words.',
    ],
    warmUp:
      'Children make a "रेलगाड़ी" line, each holding a letter card; the engine calls "छुक-छुक" and the class reads the word the train makes, like घ + र = घर.',
    activity:
      'Give groups letter cards to build words as "train coaches": 2-letter (घर, जल, फल, बस), 3-letter (कमल, मटर, बतख) and 4-letter (अजगर, शरबत, बरगद). Groups read their words aloud and then join two or three words into a short phrase like "घर चल" or "कमल जल".',
    check:
      'Show म, ट, र and ask the group to read the word. Point to बस and ask what it means.',
    support:
      'Begin with 2-letter words only and sound out each letter slowly before blending, clapping once per letter.',
    homeActivity:
      'Write words like फल, घर and बस on paper slips and ask your child to read them and then point to the real thing at home or outside. Play a train game where you say letters and your child joins them into a word.',
    materials: ['Hindi letter cards', 'String or chalk line for the train', 'Picture cards'],
  },
  'cls1-hindi-barahkhadi-vyakaran': {
    objectives: [
      'The child can say the बारहखड़ी for क (क, का, कि… कः).',
      'The child can give the opposite (विलोम) of simple Hindi words like दिन and बड़ा.',
      'The child can change एक to अनेक for common words like तारा and किताब.',
    ],
    warmUp:
      'Chant क, का, कि, की, कु, कू, के, कै, को, कौ, कं, कः with hand movements for each मात्रा. Then play opposites with actions: ऊपर (point up) and नीचे (point down).',
    activity:
      'Make a मात्रा wheel with a paper plate: put क in the centre and turn a strip showing ा, ि, ी, ु, ू so children read का, कि, की and then try ग and म. Then show real objects for एक–अनेक (एक किताब, तीन किताबें; एक केला, चार केले) and act out विलोम pairs like हँसना–रोना and ठंडा–गरम.',
    check:
      'Point to कु and ask the child to read it. Say "दिन" and ask for its opposite.',
    support:
      'Practise only 4 मात्राएँ (ा, ि, ी, ु) first and use real objects for every एक–अनेक example.',
    homeActivity:
      'Play "उल्टा बोलो" during chores: ठंडा पानी and गरम चाय, बड़ा चम्मच and छोटा चम्मच. Count things at home in Hindi and say एक–अनेक (एक रोटी, चार रोटियाँ).',
    materials: ['Paper plates and card strips', 'Hindi letter and मात्रा cards', 'Real objects in ones and many'],
  },

  // ---------------------------------------------------------------------------
  // EVS & Science
  // ---------------------------------------------------------------------------
  'cls1-evs-body-senses': {
    objectives: [
      'The child can name the 5 sense organs and what each one does.',
      'The child can identify sweet, salty and sour tastes.',
      'The child can show 3 healthy hygiene habits.',
    ],
    warmUp:
      'Sing a body parts song touching head, shoulders, knees and toes, then point to eyes, ears, nose, tongue and skin as the teacher names each sense.',
    activity:
      'Set up 5 sense stations: a blindfolded "feel bag" (cotton, stone, leaf), a smell station (tulsi leaf, lemon, flower), a taste station with tiny bits of jaggery, salt and lemon, a sound guessing game with a bell and a whistle, and a colour spotting station. Finish with a hand-washing demonstration with soap and water, counting to 20 while rubbing.',
    check:
      'Ask "Which part helps us smell?" and "What do we use to hear?" Ask a child to show the steps of washing hands.',
    support:
      'Pair each sense with an action (cupping ears, sniffing) and let the child try one station at a time with an adult nearby.',
    homeActivity:
      'Play "Guess with eyes closed": let your child smell elaichi, taste a bit of jaggery or touch a soft towel and guess what it is. Make a brushing chart for morning and night with stickers or tick marks.',
    materials: ['Cloth blindfold', 'Feel bag with objects', 'Lemon, salt, jaggery, tulsi leaves', 'Bell or whistle', 'Soap and water'],
  },
  'cls1-evs-plants-living': {
    objectives: [
      'The child can sort things into living and non-living with a reason.',
      'The child can name root, stem, leaf and flower on a real plant.',
      'The child can say what a seed needs to grow.',
    ],
    warmUp:
      'Ask "Does it grow? Does it eat? Does it breathe?" for a child, a chair, a dog and a pencil, and children answer with thumbs up or down.',
    activity:
      'Take a short walk in the school yard to collect or point to living and non-living things, then sort picture cards on chart paper into two groups. Uproot a small weed or use a potted plant to show roots, stem, leaves and flower, and start a seed jar with moong or chana seeds on wet cotton for the class to watch.',
    check:
      'Show a stone and a plant and ask which is living and why. Ask a child to point to the stem.',
    support:
      'Use 3 simple clues (grows, eats, breathes) and let the child check each clue with a real object.',
    homeActivity:
      'Soak a few moong seeds and keep them on wet cotton in a katori; check each day with your child and watch the roots and shoots come out. Ask which things in the house are living (people, pets, tulsi plant).',
    materials: ['Small potted plant or weed', 'Moong or chana seeds', 'Cotton and a small jar', 'Picture cards', 'Chart paper'],
  },
  'cls1-evs-animals-food-safety': {
    objectives: [
      'The child can sort animals into wild, domestic, pet and water animals.',
      'The child can say what red, yellow and green traffic lights mean.',
      'The child can name 2 safety rules at home and on the road.',
    ],
    warmUp:
      'Play "Animal Sounds": the teacher names an animal and children make its sound and move like it (cow, lion, fish, dog, elephant).',
    activity:
      'Children sort animal picture cards into Forest, Farm, Home and Water areas drawn with chalk on the floor. Then set up a chalk road with a zebra crossing and a paper traffic light: a child holds up red (stop), yellow (get ready) or green (go) while others practise crossing safely, looking both ways.',
    check:
      'Show a cow picture and ask where it lives. Hold up a red card and ask what we should do.',
    support:
      'Start with only 2 groups (wild and pet) and use animals the child sees every day like a cow, dog or cat.',
    homeActivity:
      'On a walk, name the animals you see (dog, cow, crow, pigeon) and talk about where they live. Practise holding hands and looking right, left and right again before crossing a road.',
    materials: ['Animal picture cards', 'Chalk for road and zebra crossing', 'Red, yellow and green paper circles'],
  },
  'cls1-evs-seasons-sky': {
    objectives: [
      'The child can name summer, monsoon and winter and the clothes we wear in each.',
      'The child can say what we see in the sky in the day and at night.',
      'The child can name 2 ways we use water.',
    ],
    warmUp:
      'Act out seasons: fan yourself for summer, open an umbrella for monsoon, shiver and rub hands for winter. Ask "What season is it today?"',
    activity:
      'Groups sort pictures or real clothes (cotton kurta, raincoat, sweater, cap, umbrella) into Summer, Monsoon and Winter baskets. Then children draw a day sky and a night sky on two halves of chart paper (sun and clouds on one side, moon and stars on the other) and share what they see.',
    check:
      'Hold up a sweater and ask which season it is for. Ask "Can we see the sun at night?"',
    support:
      'Talk only about today’s weather first and use the child’s own clothes to connect to the season.',
    homeActivity:
      'Open the cupboard and let your child pick clothes for a hot day, a rainy day and a cold day. Look at the night sky together for a few minutes and talk about the moon’s shape.',
    materials: ['Clothes or clothes pictures', 'Three baskets', 'Chart paper', 'Crayons'],
  },
  'cls1-evs-india-manners': {
    objectives: [
      'The child can describe the colours of the National Flag in order.',
      'The child can name the national bird, animal, flower and fruit.',
      'The child can use please, thank you, sorry and excuse me in role-play.',
    ],
    warmUp:
      'Stand and show the Tiranga colours with hands: saffron (hands up high), white (hands at chest), green (hands low). Then children say "Thank you" to the friend next to them.',
    activity:
      'Groups make a paper Tiranga with saffron, white and green paper strips and draw a blue wheel in the middle, then match picture cards of the peacock, tiger, lotus and mango to their names. Finish with magic words role-play: borrowing a pencil (please), getting it (thank you), bumping into someone (sorry) and passing by (excuse me).',
    check:
      'Ask "Which colour is at the top of our flag?" and "What do you say when someone helps you?"',
    support:
      'Show a real flag or picture and let the child arrange colour strips by matching; practise one magic word at a time with puppets.',
    homeActivity:
      'Make a "magic words jar": each time your child uses please, thank you or sorry, add a bead or a rajma seed. Look for the Tiranga, a peacock or a lotus in books, posters or calendars at home.',
    materials: ['Saffron, white and green paper strips', 'Blue crayon', 'Picture cards of national symbols', 'Glue'],
  },
  'cls1-evs-helpers-transport': {
    objectives: [
      'The child can name 5 community helpers and the work they do.',
      'The child can sort vehicles into land, water and air transport.',
    ],
    warmUp:
      'Play "Who Am I?": the teacher acts out a helper (doctor with a stethoscope, postman delivering letters, farmer ploughing) and children guess.',
    activity:
      'Set up role-play corners: a clinic, a post office with envelopes, a farm and a fire station with a red paper fire engine, and children take turns as helpers. Then groups sort picture cards of a bus, auto-rickshaw, train, boat, ship, aeroplane and helicopter onto Land, Water and Air sheets.',
    check:
      'Ask "Who brings letters to our house?" Show a boat and ask where it moves.',
    support:
      'Start with helpers the child sees every day (teacher, doctor, vegetable seller) and use toy vehicles they can move on a table, in a tub of water or in the air.',
    homeActivity:
      'Talk about the helpers your family meets in a week, like the doodhwala, sabziwala, guard or rickshaw driver, and thank one of them together. Count the vehicles you see from the balcony or on the way to school.',
    materials: ['Simple props (envelopes, toy stethoscope, caps)', 'Transport picture cards', 'Three sorting sheets'],
  },
  'cls1-evs-houses-food': {
    objectives: [
      'The child can tell a kutcha house from a pucca house by its materials.',
      'The child can name rooms in a home and what we do there.',
      'The child can pick healthy foods to make a balanced plate.',
    ],
    warmUp:
      'Ask children to tell what their house is made of and which room they like best. Act out actions for each room: cooking, sleeping, bathing.',
    activity:
      'Groups build small model houses using clay or mud with straw and sticks (kutcha) and small boxes or bricks drawn on paper (pucca), and talk about which is stronger in rain. Then on a paper plate, children stick or draw a healthy meal such as roti, dal, sabzi, curd and fruit, and remove junk food pictures.',
    check:
      'Show a hut picture and ask if it is kutcha or pucca. Ask "Where do we cook food at home?"',
    support:
      'Use photos of houses near the school and let the child sort only two pictures at a time.',
    homeActivity:
      'Take a tour of your home and let your child name each room and what happens there. At lunch, ask them to point to the dal, roti, sabzi and fruit and say why each is good for them.',
    materials: ['Clay or mud, straw, sticks', 'Small cardboard boxes', 'Paper plates', 'Food picture cut-outs'],
  },
  'cls1-evs-water-air-habits': {
    objectives: [
      'The child can name sources of water like rain, rivers, ponds and wells.',
      'The child can show that air is around us even though we cannot see it.',
      'The child can arrange a daily routine from morning to night.',
    ],
    warmUp:
      'Children blow on their palms to feel air, then wave a notebook like a fan. Ask "Can you see the air? How do you know it is there?"',
    activity:
      'Children blow up a balloon or a paper bag and make paper fans and paper windmills to see moving air at work. Then groups arrange picture cards of a daily routine (wake up, brush, bath, breakfast, school, play, dinner, sleep) in order on a string with clothes pegs, and talk about turning off the tap while brushing.',
    check:
      'Ask "Where does pond water come from?" Show the routine cards mixed up and ask which comes first.',
    support:
      'Use 4 routine cards instead of 8 and let the child act each step out before placing it.',
    homeActivity:
      'Make a paper boat and float it in a bucket or a monsoon puddle, then blow on it to see air push it. Make a "save water" rule together, like closing the tap while brushing.',
    materials: ['Balloons or paper bags', 'Paper for fans and windmills', 'Routine picture cards', 'String and clothes pegs'],
  },
  'cls1-evs-clothes-places-games': {
    objectives: [
      'The child can say that cotton comes from a plant and wool comes from sheep.',
      'The child can name places in the neighbourhood and what happens there.',
      'The child can sort games into indoor and outdoor.',
    ],
    warmUp:
      'Feel a cotton handkerchief and a woollen cap and ask which keeps us warm. Children act out games (batting in cricket, rolling dice in Ludo) for others to guess.',
    activity:
      'Groups draw a neighbourhood map on chart paper with chalk roads and paste or draw a school, hospital, post office, bank, park and fire station, then take a pretend "walk" with a toy saying what they do at each place. Next, sort game pictures or real items (carrom striker, ludo board, ball, skipping rope, chess piece) into Indoor and Outdoor.',
    check:
      'Ask "Where do we go when we are sick?" and "Is kho-kho an indoor or outdoor game?"',
    support:
      'Let the child touch real cotton and wool, and talk only about places near their own home first.',
    homeActivity:
      'Check clothes labels together or feel cotton and wool clothes in the cupboard and sort them. Play one indoor game (Ludo, carrom, antakshari) and one outdoor game (pitthu, hopscotch) this week.',
    materials: ['Cotton cloth and wool piece', 'Chart paper and chalk', 'Pictures of places', 'Game items or pictures'],
  },

  // ---------------------------------------------------------------------------
  // Computer Studies
  // ---------------------------------------------------------------------------
  'cls1-comp-smart-machine': {
    objectives: [
      'The child can tell natural things from man-made machines.',
      'The child can name and point to the monitor, CPU, keyboard, mouse, speakers and printer.',
    ],
    warmUp:
      'Call out things like tree, fan, sun, car, bird, mixer and children clap for machines and stamp for natural things.',
    activity:
      'Show a real computer or a big poster and let children take turns pointing to each part as the class says what it does (monitor shows, keyboard types, mouse points, speakers play sound, printer prints, CPU thinks and remembers). Then groups make a computer model from cardboard boxes and paper, labelling each part with picture labels.',
    check:
      'Ask "Which part do we use to type?" Point to the mouse and ask its name.',
    support:
      'Compare each part to a body part (CPU like the brain, speakers like a mouth, monitor like a face) and focus on 3 parts first.',
    homeActivity:
      'Walk around the house and ask your child to find 5 machines (fan, fridge, mixer, TV, phone) and say how each helps the family. Look out the window and name 3 natural things.',
    materials: ['Real computer or poster', 'Cardboard boxes', 'Paper and crayons', 'Picture labels'],
  },
  'cls1-comp-paint-manners': {
    objectives: [
      'The child can name and use the pencil, fill, eraser and shapes tools in a paint program.',
      'The child can follow 3 computer lab rules.',
    ],
    warmUp:
      'Play "Computer Lab Says": sit straight, hands in lap, press keys gently (tap the desk softly), no food near computers. Children show thumbs up or down for good and bad habits.',
    activity:
      'In the lab, children take turns drawing a house or a kite in Tux Paint or MS Paint using the shapes tool, filling it with the fill bucket and fixing a mistake with the eraser. If computers are limited, others draw the same picture on paper and "fill" closed shapes with crayon, noticing why the fill bucket needs a closed shape.',
    check:
      'Ask "Which tool fills colour inside a shape?" and "What should we never do near a computer?"',
    support:
      'Sit beside the child and guide the mouse with your hand over theirs, using only pencil and fill tools first.',
    homeActivity:
      'If you have a phone or computer, let your child draw a rangoli in any drawing app for 10 minutes with you nearby. Make a small "screen rules" poster together (sit back, take breaks, no food).',
    materials: ['Computers with Tux Paint or MS Paint', 'Paper and crayons', 'Rules chart'],
  },

  // ---------------------------------------------------------------------------
  // Arts, Music & Logic
  // ---------------------------------------------------------------------------
  'cls1-arts-colors-music': {
    objectives: [
      'The child can name the 3 primary colours.',
      'The child can mix two primary colours to make orange, green or purple.',
      'The child can sing Sa Re Ga Ma Pa Dha Ni Sa in order.',
    ],
    warmUp:
      'Sing the sargam going up and down with hands rising step by step, then clap a simple rhythm for children to copy.',
    activity:
      'Give groups red, yellow and blue poster paint or crayons on paper plates and let them mix two colours at a time, recording what they made on chart paper (red + yellow = orange, blue + yellow = green, red + blue = purple). Then fill 8 steel glasses with different amounts of water and tap with a spoon to make a jal tarang, putting them in order from low to high notes.',
    check:
      'Ask "What do red and yellow make?" Ask a child to sing the sargam after Ma.',
    support:
      'Let the child mix just one pair of colours with their fingers and sing the sargam together with a partner.',
    homeActivity:
      'Mix turmeric water (yellow) with a few drops of other food colours or paint at home to discover new colours. Tap steel glasses or katoris with different water levels and listen for high and low sounds.',
    materials: ['Red, yellow and blue paint or crayons', 'Paper plates and brushes', 'Steel glasses and water', 'Spoon'],
  },
  'cls1-olympiad-reasoning-gym': {
    objectives: [
      'The child can find the odd one out in a group of 4 pictures and say why.',
      'The child can complete a simple picture analogy (bird : nest :: lion : den).',
      'The child can count shapes of one kind in a picture.',
    ],
    warmUp:
      'Say four words like apple, banana, car, mango and children shout the odd one out with a reason. Repeat with animals, colours and numbers.',
    activity:
      'Groups get sets of 4 real objects or picture cards (3 fruits and a spoon, 3 birds and a fish) to find the odd one out, then play matching pairs like cow–calf, bird–nest, doctor–hospital. End with a shape hunt: count the triangles, circles and squares in a chalk drawing of a house or rocket on the board.',
    check:
      'Show pen, pencil, crayon and banana and ask which is different and why. Ask "Bird is to nest as lion is to…?"',
    support:
      'Use 3 objects instead of 4 and real items from one familiar group (fruits) so the odd one out is easy to see.',
    homeActivity:
      'Play "Odd One Out" with kitchen things (spoon, fork, ladle and a tomato) and let your child make one for you. Count circles you can spot at home, like plates, bangles and clock faces.',
    materials: ['Real objects or picture cards in groups', 'Chalk shape drawing on the board', 'Matching pair cards'],
  },
};
