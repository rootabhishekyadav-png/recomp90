const express = require('express');
const router = express.Router();
const WorkoutLog = require('../models/WorkoutLog');

// 6-Day Workout Plan Presets - Exactly matching user screenshot:
// Monday – Chest + Triceps (Push day)
// Tuesday – Back + Biceps (Pull day)
// Wednesday – Shoulders + Abs
// Thursday – Chest + Back
// Friday – Biceps + Triceps
// Saturday – Legs + Abs (Leg Day)
// Sunday – Rest & Recovery
const WORKOUT_SPLIT_TEMPLATES = {
  Monday: {
    focusArea: 'Chest + Triceps',
    subtitle: 'Push day',
    tag: 'Push',
    cardioMinutes: 15,
    exercises: [
      { name: 'Incline Dumbbell Press', targetMuscle: 'Upper Chest', prescribedSets: 4, prescribedReps: '8-10', alternative: 'Incline Smith Machine Press', instructions: 'Set bench to 30°, control eccentric for 3s, drive up through pecs.' },
      { name: 'Flat Barbell Bench Press', targetMuscle: 'Middle Chest', prescribedSets: 3, prescribedReps: '8-10', alternative: 'Dumbbell Flat Press / Pec Deck', instructions: 'Retract scapula, maintain light arch, touch mid-chest with control.' },
      { name: 'Cable Chest Flyes', targetMuscle: 'Chest Stretch & Squeeze', prescribedSets: 3, prescribedReps: '12-15', alternative: 'Dumbbell Flyes', instructions: 'Hug a wide barrel, squeeze 1 second at peak contraction.' },
      { name: 'Triceps Rope Pushdowns', targetMuscle: 'Triceps Lateral Head', prescribedSets: 3, prescribedReps: '10-12', alternative: 'Straight Bar Pushdown', instructions: 'Elbows pinned to ribs, spread rope outward at bottom.' },
      { name: 'Overhead DB Triceps Extension', targetMuscle: 'Triceps Long Head', prescribedSets: 3, prescribedReps: '10-12', alternative: 'Skullcrushers', instructions: 'Full stretch behind neck, keep elbows tucked inward.' }
    ]
  },
  Tuesday: {
    focusArea: 'Back + Biceps',
    subtitle: 'Pull day',
    tag: 'Pull',
    cardioMinutes: 15,
    exercises: [
      { name: 'Wide-Grip Lat Pulldown', targetMuscle: 'Lats (Upper Back Width)', prescribedSets: 4, prescribedReps: '8-10', alternative: 'Assisted Pull-ups', instructions: 'Pull with elbows down towards hips, slight lean back, chest up.' },
      { name: 'Seated Cable Row', targetMuscle: 'Mid Back & Rhomboids', prescribedSets: 3, prescribedReps: '10-12', alternative: 'One-Arm Dumbbell Row', instructions: 'Pull to belly button, squeeze shoulder blades together for 1s.' },
      { name: 'Chest-Supported T-Bar / DB Row', targetMuscle: 'Back Thickness', prescribedSets: 3, prescribedReps: '10-12', alternative: 'Barbell Bent-Over Row', instructions: 'Strict movement, eliminate lower back momentum.' },
      { name: 'Standing EZ-Bar / DB Biceps Curl', targetMuscle: 'Biceps Brachii', prescribedSets: 3, prescribedReps: '10-12', alternative: 'Hammer Curls', instructions: 'Pin elbows to sides, full contraction without swaying.' },
      { name: 'Incline Dumbbell Curl', targetMuscle: 'Biceps Long Head', prescribedSets: 3, prescribedReps: '10-12', alternative: 'Cable Preacher Curl', instructions: 'Lean back at 45°, feel deep stretch at bottom position.' }
    ]
  },
  Wednesday: {
    focusArea: 'Shoulders + Abs',
    subtitle: 'Deltoid V-Taper & Core',
    tag: 'Shoulders',
    cardioMinutes: 15,
    exercises: [
      { name: 'Seated Dumbbell Shoulder Press', targetMuscle: 'Front & Side Deltoids', prescribedSets: 4, prescribedReps: '8-10', alternative: 'Overhead Military Barbell Press', instructions: 'Press overhead in an arc, lower slowly to ear level.' },
      { name: 'Dumbbell Lateral Raises', targetMuscle: 'Side Delts (Shoulder Width)', prescribedSets: 4, prescribedReps: '12-15', alternative: 'Cable Lateral Raise', instructions: 'Slight forward lean, raise elbows lead the way to shoulder line.' },
      { name: 'Face Pulls with Rope', targetMuscle: 'Rear Delts & Rotators', prescribedSets: 3, prescribedReps: '12-15', alternative: 'Reverse Pec Deck Fly', instructions: 'Pull towards forehead, rotate hands back externally.' },
      { name: 'Hanging Leg / Knee Raises', targetMuscle: 'Lower Abdominals', prescribedSets: 3, prescribedReps: '12-15', alternative: 'Captain\'s Chair Knee Raise', instructions: 'Curl pelvis upwards, control the swing completely.' },
      { name: 'Plank Holds / Cable Woodchoppers', targetMuscle: 'Core Stability & Obliques', prescribedSets: 3, prescribedReps: '45 sec hold / 15 reps', alternative: 'Bicycle Crunches', instructions: 'Brace core tightly like bracing for impact.' }
    ]
  },
  Thursday: {
    focusArea: 'Chest + Back',
    subtitle: 'Upper Body Thickness & Width',
    tag: 'Upper Body',
    cardioMinutes: 15,
    exercises: [
      { name: 'Incline Dumbbell Bench Press', targetMuscle: 'Upper Chest', prescribedSets: 3, prescribedReps: '8-10', alternative: 'Incline Smith Press', instructions: 'Focus on heavy clavicular head contraction.' },
      { name: 'Weighted / Neutral Grip Pull-ups', targetMuscle: 'Lats & Upper Back', prescribedSets: 3, prescribedReps: '6-8', alternative: 'Close-Grip Lat Pulldown', instructions: 'Chest to bar, pull through elbows, full stretch.' },
      { name: 'Flat Dumbbell Press', targetMuscle: 'Mid Chest', prescribedSets: 3, prescribedReps: '10-12', alternative: 'Push-ups with Elevation', instructions: 'Deep stretch at bottom, strong controlled press.' },
      { name: 'Seated Cable Row (Close Grip)', targetMuscle: 'Mid Back Thickness', prescribedSets: 3, prescribedReps: '10-12', alternative: 'One-Arm Dumbbell Row', instructions: 'Squeeze lats for 1 second at peak.' },
      { name: 'Cable Crossover / Pec Fly', targetMuscle: 'Pectoral Squeeze', prescribedSets: 2, prescribedReps: '15', alternative: 'Dumbbell Pullover', instructions: 'Hands cross at midline, pump pecs.' }
    ]
  },
  Friday: {
    focusArea: 'Biceps + Triceps',
    subtitle: 'Dedicated Arm Hypertrophy',
    tag: 'Arms Day',
    cardioMinutes: 15,
    exercises: [
      { name: 'Standing EZ-Bar / DB Biceps Curl', targetMuscle: 'Biceps Brachii', prescribedSets: 3, prescribedReps: '10-12', alternative: 'Straight Bar Bicep Curl', instructions: 'Strict form, no hip swing, squeeze at top.' },
      { name: 'Triceps Rope Pushdowns', targetMuscle: 'Triceps Lateral Head', prescribedSets: 3, prescribedReps: '10-12', alternative: 'Straight Bar Pushdown', instructions: 'Flare rope outward at the bottom for peak lock.' },
      { name: 'Incline Dumbbell Curl', targetMuscle: 'Biceps Long Head (Peak)', prescribedSets: 3, prescribedReps: '10-12', alternative: 'Preacher Curl', instructions: 'Deep stretch at bottom, curl without lifting elbows.' },
      { name: 'Overhead DB / Cable Tricep Extension', targetMuscle: 'Triceps Long Head', prescribedSets: 3, prescribedReps: '10-12', alternative: 'Skullcrushers', instructions: 'Keep upper arms perpendicular, full stretch behind neck.' },
      { name: 'Dumbbell Hammer Curls', targetMuscle: 'Brachialis & Forearms', prescribedSets: 3, prescribedReps: '10-12', alternative: 'Rope Hammer Curls', instructions: 'Neutral palms-in grip for dense arm thickness.' },
      { name: 'Close-Grip Push-ups / Dips', targetMuscle: 'Triceps Pump Finisher', prescribedSets: 2, prescribedReps: 'To Failure / 15 reps', alternative: 'Bench Dips', instructions: 'Controlled bodyweight finisher.' }
    ]
  },
  Saturday: {
    focusArea: 'Legs + Abs',
    subtitle: 'Leg Day',
    tag: 'Leg Day',
    cardioMinutes: 15,
    exercises: [
      { name: 'Barbell / Smith Machine Squats', targetMuscle: 'Quads & Glutes', prescribedSets: 4, prescribedReps: '8-10', alternative: 'Leg Press', instructions: 'Hips back, knees track over toes, parallel depth.' },
      { name: 'Leg Press', targetMuscle: 'Quads & Hamstrings', prescribedSets: 3, prescribedReps: '10-12', alternative: 'Goblet Squats', instructions: 'Feet shoulder-width on platform, controlled descent.' },
      { name: 'Romanian Deadlift (RDL)', targetMuscle: 'Hamstrings & Glutes', prescribedSets: 3, prescribedReps: '8-10', alternative: 'Lying Leg Curls', instructions: 'Hinge back at hips, keep dumbbells close to shins.' },
      { name: 'Leg Extensions', targetMuscle: 'Quadriceps Isolation', prescribedSets: 3, prescribedReps: '12-15', alternative: 'Walking Lunges', instructions: 'Pause 1s at top extension, slow lowering.' },
      { name: 'Standing / Seated Calf Raises', targetMuscle: 'Calves (Gastrocnemius)', prescribedSets: 4, prescribedReps: '15-20', alternative: 'Single-Leg Calf Raises', instructions: '2s pause at deep bottom stretch, explosive drive on toes.' },
      { name: 'Decline Bench / Cable Crunches', targetMuscle: 'Upper & Middle Abs', prescribedSets: 3, prescribedReps: '15', alternative: 'Hanging Knee Raises', instructions: 'Round upper back and curl ribs toward pelvis.' }
    ]
  },
  Sunday: {
    focusArea: 'Active Rest & Recovery',
    subtitle: 'Mobility & Restoration',
    tag: 'Recovery',
    cardioMinutes: 20,
    exercises: [
      { name: 'Outdoor Leisure Walk / Mobility', targetMuscle: 'Full Body CNS Recovery', prescribedSets: 1, prescribedReps: '20-30 min', alternative: 'Full Body Foam Rolling & Stretching', instructions: 'Promote blood flow, rest joints, hydrate and sleep 8+ hours.' }
    ]
  }
};

// GET /api/workouts/split-overview - Returns the full 6-day split list for UI display
router.get('/split-overview', (req, res) => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const overview = days.map(day => ({
    day,
    focusArea: WORKOUT_SPLIT_TEMPLATES[day].focusArea,
    subtitle: WORKOUT_SPLIT_TEMPLATES[day].subtitle,
    tag: WORKOUT_SPLIT_TEMPLATES[day].tag,
    exerciseCount: WORKOUT_SPLIT_TEMPLATES[day].exercises.length,
    cardioMinutes: WORKOUT_SPLIT_TEMPLATES[day].cardioMinutes
  }));
  res.json({ success: true, overview });
});

// Helper to create initial exercise sets
function buildInitialExercises(template) {
  return template.exercises.map(ex => {
    const sets = [];
    for (let i = 1; i <= ex.prescribedSets; i++) {
      sets.push({ setNumber: i, weight: 0, reps: 0, completed: false });
    }
    return {
      name: ex.name,
      targetMuscle: ex.targetMuscle,
      prescribedSets: ex.prescribedSets,
      prescribedReps: ex.prescribedReps,
      alternative: ex.alternative,
      instructions: ex.instructions,
      sets
    };
  });
}

// GET /api/workouts/today - Get routine for current day of week with any logged sets
router.get('/today', async (req, res) => {
  try {
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayOfWeek = days[today.getDay()];

    let log = await WorkoutLog.findOne({ date: dateStr });
    const template = WORKOUT_SPLIT_TEMPLATES[dayOfWeek] || WORKOUT_SPLIT_TEMPLATES['Monday'];

    if (!log) {
      log = {
        date: dateStr,
        dayOfWeek,
        focusArea: template.focusArea,
        completed: false,
        cardioMinutes: template.cardioMinutes,
        cardioCompleted: false,
        exercises: buildInitialExercises(template),
        rating: 4,
        notes: ''
      };
    }

    res.json({ success: true, dayOfWeek, workout: log, template });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch today workout' });
  }
});

// GET /api/workouts/plan/:day - Get template for a specific day
router.get('/plan/:day', async (req, res) => {
  try {
    const { day } = req.params;
    const template = WORKOUT_SPLIT_TEMPLATES[day];
    if (!template) {
      return res.status(404).json({ success: false, message: 'Day not found' });
    }

    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    
    // Check if there is an existing log for today if today matches requested day
    let log = await WorkoutLog.findOne({ dayOfWeek: day, date: dateStr });
    if (!log) {
      log = {
        date: dateStr,
        dayOfWeek: day,
        focusArea: template.focusArea,
        completed: false,
        cardioMinutes: template.cardioMinutes,
        cardioCompleted: false,
        exercises: buildInitialExercises(template),
        rating: 4,
        notes: ''
      };
    }

    res.json({ success: true, dayOfWeek: day, workout: log, template });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch day workout' });
  }
});

// POST /api/workouts/log - Save or update workout progress
router.post('/log', async (req, res) => {
  try {
    const { date, dayOfWeek, focusArea, completed, cardioMinutes, cardioCompleted, exercises, rating, notes } = req.body;
    if (!date) {
      return res.status(400).json({ success: false, message: 'Date is required' });
    }

    const updated = await WorkoutLog.findOneAndUpdate(
      { date },
      {
        date,
        dayOfWeek: dayOfWeek || 'Monday',
        focusArea: focusArea || 'Workout',
        completed: completed || false,
        cardioMinutes: Number(cardioMinutes || 0),
        cardioCompleted: cardioCompleted || false,
        exercises: exercises || [],
        rating: Number(rating || 4),
        notes: notes || ''
      },
      { upsert: true, new: true }
    );

    res.json({ success: true, message: 'Workout log saved successfully!', workout: updated });
  } catch (error) {
    console.error('Workout log error:', error);
    res.status(500).json({ success: false, message: 'Failed to save workout' });
  }
});

// GET /api/workouts/history
router.get('/history', async (req, res) => {
  try {
    const history = await WorkoutLog.find().sort({ date: -1 }).limit(30);
    res.json({ success: true, history });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to load workout history' });
  }
});

module.exports = router;
