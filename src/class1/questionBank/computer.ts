import { BankQuestion } from './types';

export const COMPUTER_QUESTIONS: BankQuestion[] = [
  // c.machines — Natural and man-made things; machines
  { id: 'c.machines-01', skillId: 'c.machines', prompt: 'Which one is natural?', options: ['car', 'tree', 'chair', 'computer'], answer: 1, explain: 'A tree grows in nature. People did not make it.' },
  { id: 'c.machines-02', skillId: 'c.machines', prompt: 'Which one is man-made?', options: ['river', 'mountain', 'bicycle', 'sun'], answer: 2, explain: 'People make bicycles. Rivers, mountains and the sun are natural.' },
  { id: 'c.machines-03', skillId: 'c.machines', prompt: 'Which one is a machine?', options: ['stone', 'leaf', 'flower', 'fan'], answer: 3, explain: 'A fan is a machine that moves air.' },
  { id: 'c.machines-04', skillId: 'c.machines', prompt: 'Which machine keeps food cold?', options: ['fan', 'refrigerator', 'iron', 'mixer'], answer: 1, explain: 'A refrigerator (fridge) keeps food cold and fresh.' },
  { id: 'c.machines-05', skillId: 'c.machines', prompt: 'Which machine washes clothes?', options: ['washing machine', 'fridge', 'television', 'fan'], answer: 0, explain: 'A washing machine washes our clothes.' },
  { id: 'c.machines-06', skillId: 'c.machines', prompt: 'Which machine helps us talk to someone far away?', options: ['iron', 'fan', 'mobile phone', 'mixer'], answer: 2, explain: 'A mobile phone lets us talk to people far away.' },
  { id: 'c.machines-07', skillId: 'c.machines', prompt: 'Which one is natural?', options: ['pen', 'bus', 'television', 'moon'], answer: 3, explain: 'The moon is part of nature. People did not make it.' },
  { id: 'c.machines-08', skillId: 'c.machines', prompt: 'A computer is a ___.', options: ['plant', 'machine', 'animal'], answer: 1, explain: 'A computer is a machine made by people.' },
  { id: 'c.machines-09', skillId: 'c.machines', prompt: 'Which machine do we use to press clothes?', options: ['fan', 'mixer', 'iron', 'television'], answer: 2, explain: 'A hot iron makes clothes smooth.' },
  { id: 'c.machines-10', skillId: 'c.machines', prompt: 'Which machine helps us do sums quickly?', options: ['calculator', 'cooler', 'fan', 'iron'], answer: 0, explain: 'A calculator helps us add and subtract quickly.' },

  // c.parts — Parts of a computer
  { id: 'c.parts-01', skillId: 'c.parts', prompt: 'Which part of a computer looks like a TV screen?', options: ['mouse', 'monitor', 'keyboard', 'CPU'], answer: 1, explain: 'The monitor shows pictures and words.' },
  { id: 'c.parts-02', skillId: 'c.parts', prompt: 'Which part has many keys with letters and numbers?', options: ['monitor', 'mouse', 'keyboard', 'speaker'], answer: 2, explain: 'We type on the keyboard.' },
  { id: 'c.parts-03', skillId: 'c.parts', prompt: 'Which part is called the brain of the computer?', options: ['mouse', 'monitor', 'printer', 'CPU'], answer: 3, explain: 'The CPU does all the thinking work.' },
  { id: 'c.parts-04', skillId: 'c.parts', prompt: 'Which part do we use to point and click?', options: ['mouse', 'printer', 'speaker', 'monitor'], answer: 0, explain: 'We move the mouse to point and click.' },
  { id: 'c.parts-05', skillId: 'c.parts', prompt: 'Which part lets us hear sound?', options: ['keyboard', 'speakers', 'mouse', 'monitor'], answer: 1, explain: 'Speakers play music and sounds.' },
  { id: 'c.parts-06', skillId: 'c.parts', prompt: 'Which part prints our drawing on paper?', options: ['mouse', 'CPU', 'printer', 'keyboard'], answer: 2, explain: 'A printer puts our work on paper.' },
  { id: 'c.parts-07', skillId: 'c.parts', prompt: 'Which is the longest key on the keyboard?', options: ['Enter key', 'Shift key', 'A key', 'Space bar'], answer: 3, explain: 'The space bar is the longest key. It makes gaps between words.' },
  { id: 'c.parts-08', skillId: 'c.parts', prompt: 'Which one is NOT a part of a computer?', options: ['mouse', 'monitor', 'pillow', 'keyboard'], answer: 2, explain: 'A pillow is for sleeping, not a computer part.' },
  { id: 'c.parts-09', skillId: 'c.parts', prompt: 'Which key do we press to go to the next line?', options: ['Space bar', 'Enter', 'Shift', 'Caps Lock'], answer: 1, explain: 'The Enter key takes us to a new line.' },
  { id: 'c.parts-10', skillId: 'c.parts', prompt: 'Which part do we use to type our name?', options: ['speakers', 'printer', 'CPU', 'keyboard'], answer: 3, explain: 'We press keys on the keyboard to type.' },

  // c.paint — Drawing with Paint tools
  { id: 'c.paint-01', skillId: 'c.paint', prompt: 'In Paint, which tool draws thin free lines?', options: ['Eraser', 'Pencil', 'Fill', 'Text'], answer: 1, explain: 'The Pencil tool draws thin lines, just like a real pencil.' },
  { id: 'c.paint-02', skillId: 'c.paint', prompt: 'Which tool fills a closed shape with colour?', options: ['Pencil', 'Eraser', 'Text', 'Fill'], answer: 3, explain: 'The Fill tool pours colour into a shape.' },
  { id: 'c.paint-03', skillId: 'c.paint', prompt: 'Which tool rubs out mistakes?', options: ['Brush', 'Fill', 'Eraser', 'Text'], answer: 2, explain: 'The Eraser rubs out parts of the drawing.' },
  { id: 'c.paint-04', skillId: 'c.paint', prompt: 'Which tool lets us type words on our drawing?', options: ['Text', 'Pencil', 'Eraser', 'Fill'], answer: 0, explain: 'The Text tool (A) lets us type words.' },
  { id: 'c.paint-05', skillId: 'c.paint', prompt: 'Which tool makes thick strokes like a paintbrush?', options: ['Eraser', 'Brush', 'Text', 'Fill'], answer: 1, explain: 'The Brush tool paints thick, soft strokes.' },
  { id: 'c.paint-06', skillId: 'c.paint', prompt: 'Which tool helps us draw a neat circle?', options: ['Eraser', 'Text', 'Shapes', 'Fill'], answer: 2, explain: 'The Shapes tool has an oval to draw neat circles.' },
  { id: 'c.paint-07', skillId: 'c.paint', prompt: 'The Fill tool looks like a ___.', options: ['pencil', 'pair of scissors', 'book', 'paint bucket'], answer: 3, explain: 'The Fill tool looks like a bucket pouring paint.' },
  { id: 'c.paint-08', skillId: 'c.paint', prompt: 'Where do we pick colours in Paint?', options: ['Recycle Bin', 'Colour palette', 'Speaker', 'Printer'], answer: 1, explain: 'The colour palette shows all the colours to pick from.' },
  { id: 'c.paint-09', skillId: 'c.paint', prompt: 'Which tool draws a straight line?', options: ['Line', 'Fill', 'Eraser', 'Text'], answer: 0, explain: 'The Line tool draws straight lines.' },
  { id: 'c.paint-10', skillId: 'c.paint', prompt: 'What should we do to keep our drawing for later?', options: ['Erase it', 'Delete it', 'Save it', 'Close it'], answer: 2, explain: 'Saving keeps our drawing so we can open it again.' },

  // c.labsafety — Computer lab manners and safety
  { id: 'c.labsafety-01', skillId: 'c.labsafety', prompt: 'We should enter the computer lab with ___ hands.', options: ['clean', 'wet', 'sticky', 'muddy'], answer: 0, explain: 'Clean, dry hands keep the computer safe.' },
  { id: 'c.labsafety-02', skillId: 'c.labsafety', prompt: 'Which is NOT allowed in the computer lab?', options: ['sitting straight', 'eating snacks', 'listening quietly', 'waiting our turn'], answer: 1, explain: 'Food and drinks can spill and spoil the computer.' },
  { id: 'c.labsafety-03', skillId: 'c.labsafety', prompt: 'Never touch switches or wires with ___ hands.', options: ['dry', 'clean', 'wet'], answer: 2, explain: 'Wet hands and electricity can give a shock.' },
  { id: 'c.labsafety-04', skillId: 'c.labsafety', prompt: 'How should we sit at the computer?', options: ['lying down', 'sitting straight', 'standing on the chair', 'bending low'], answer: 1, explain: 'Sitting straight keeps our back healthy.' },
  { id: 'c.labsafety-05', skillId: 'c.labsafety', prompt: 'In the computer lab, we should talk ___.', options: ['loudly', 'by shouting', 'softly'], answer: 2, explain: 'Talking softly helps everyone work.' },
  { id: 'c.labsafety-06', skillId: 'c.labsafety', prompt: 'Whom should we ask when the computer has a problem?', options: ['nobody', 'a pet', 'the teacher', 'a younger child'], answer: 2, explain: 'Our teacher knows how to fix computer problems safely.' },
  { id: 'c.labsafety-07', skillId: 'c.labsafety', prompt: 'How far should our eyes be from the screen?', options: ['very close', 'a safe distance', 'touching it'], answer: 1, explain: 'Sitting about an arm’s length away protects our eyes.' },
  { id: 'c.labsafety-08', skillId: 'c.labsafety', prompt: 'Before leaving the lab, we should ___.', options: ['pull wires out', 'bang the keys', 'spill water', 'shut down properly'], answer: 3, explain: 'Shutting down properly keeps the computer safe.' },
  { id: 'c.labsafety-09', skillId: 'c.labsafety', prompt: 'How should we press the keys on the keyboard?', options: ['gently', 'very hard', 'with a pencil', 'with our feet'], answer: 0, explain: 'Pressing keys gently stops them from breaking.' },
  { id: 'c.labsafety-10', skillId: 'c.labsafety', prompt: 'Someone online asks for your home address. What should you do?', options: ['give it', 'tell a grown-up', 'share photos', 'keep chatting'], answer: 1, explain: 'Never share your address online. Tell a grown-up you trust.' },
];
