-- Example premium content. `answer` is the index into `options` (same shape as the app's
-- question bank). Safe to re-run: existing keys are updated in place.

insert into public.premium_content (key, min_plan, payload) values
(
  'olympiad-pack:1',
  'family_plus',
  $json${
    "questions": [
      {
        "prompt": "What comes next? 2, 4, 6, 8, __",
        "options": ["9", "10", "12", "16"],
        "answer": 1,
        "explain": "The numbers go up by 2 each time, and 8 + 2 = 10."
      },
      {
        "prompt": "Riya has 5 pencils. She gets 3 more, then gives 2 to Aman. How many pencils does Riya have now?",
        "options": ["6", "8", "10", "4"],
        "answer": 0,
        "explain": "5 + 3 = 8 pencils, then 8 - 2 = 6 pencils."
      },
      {
        "prompt": "Today is Monday. Which day will it be tomorrow?",
        "options": ["Sunday", "Wednesday", "Tuesday", "Saturday"],
        "answer": 2,
        "explain": "The day after Monday is Tuesday."
      }
    ]
  }$json$::jsonb
),
(
  'icse-test-pack:cls1-math-add-sub-frog',
  'family_plus',
  $json${
    "questions": [
      {
        "prompt": "The frog sits on 7 on the number line. It hops 5 steps forward. Where does it land?",
        "options": ["2", "11", "12", "13"],
        "answer": 2,
        "explain": "Hopping forward means adding: 7 + 5 = 12."
      },
      {
        "prompt": "The frog sits on 15. It hops 6 steps back. Where does it land?",
        "options": ["9", "8", "21", "11"],
        "answer": 0,
        "explain": "Hopping back means taking away: 15 - 6 = 9."
      },
      {
        "prompt": "9 + __ = 16. Which number is missing?",
        "options": ["8", "7", "6", "5"],
        "answer": 1,
        "explain": "Count on from 9: 10, 11, 12, 13, 14, 15, 16. That is 7 hops, so 9 + 7 = 16."
      }
    ]
  }$json$::jsonb
)
on conflict (key) do update
  set min_plan = excluded.min_plan,
      payload  = excluded.payload;
