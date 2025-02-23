-- Insert sample tongue twisters
INSERT INTO tongue_twisters (text, difficulty, category) VALUES
('Peter Piper picked a peck of pickled peppers', 'Easy', 'P sounds'),
('She sells seashells by the seashore', 'Easy', 'S sounds'),
('How much wood would a woodchuck chuck if a woodchuck could chuck wood?', 'Intermediate', 'W sounds'),
('Fuzzy Wuzzy was a bear. Fuzzy Wuzzy had no hair. Fuzzy Wuzzy wasn''t fuzzy, was he?', 'Intermediate', 'F and Z sounds'),
('The sixth sick sheikh''s sixth sheep''s sick', 'Advanced', 'S and Th sounds'),
('Red lorry, yellow lorry', 'Advanced', 'L and R sounds');

-- Insert sample badges
INSERT INTO user_progress (user_id, badges) VALUES 
(gen_random_uuid(), '[
  {
    "id": "practice-streak-7",
    "name": "Weekly Warrior",
    "description": "Complete practice sessions 7 days in a row",
    "icon": "calendar-check",
    "earned": false
  },
  {
    "id": "clarity-master",
    "name": "Clarity Master",
    "description": "Achieve 90% clarity score on any tongue twister",
    "icon": "star",
    "earned": false
  },
  {
    "id": "time-dedication",
    "name": "Time Dedication",
    "description": "Practice for a total of 1 hour",
    "icon": "clock",
    "earned": false
  }
]'::JSONB);
