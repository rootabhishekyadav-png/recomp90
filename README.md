# ⚡ 90-Day Body Recomposition Master System (MERN Stack + Excel OS)

Professional personal fitness management system built specifically for a **90-Day Body Recomposition Transformation** (13 Nov 2026 to 10 Feb 2027), optimized for Indian PG/Mess environment with a ₹50–₹100 daily extra budget.

---

## 🚀 Quick Access (App is Live!)

- **Live URL:** [http://localhost:5000](http://localhost:5000)
- **Master Password:** `Abhilx@Yadavji`
- **Target Calories:** `2,000 kcal` (130g Protein Target)
- **Downloadable Excel File:** [90_Day_Body_Recomposition_Tracker.xlsx](file:///c:/Users/Abhishek%20%20Yadav/OneDrive/Desktop/recreate/90_Day_Body_Recomposition_Tracker.xlsx)

---

## 🌟 Key Features

### 1. Minimalist Master Lock (Frictionless Security)
- Simple, high-contrast dark lock screen.
- Enter master password (`gym2026`) -> instantly unlocks the entire Fitness OS.
- Session is automatically remembered in browser localStorage.

### 2. Executive Dashboard (Dark + Electric Lime Aesthetic)
- **90-Day Challenge Countdown**: Day 1 of 90, days remaining, start & end date.
- **Top KPI Cards**: Current Weight (vs 80kg baseline), Waist (vs 101cm baseline), Calories consumed today, Protein consumed today.
- **Graph Box 1 (Daily Nutrition & Macros)**:
  - Interactive bar/line chart tracking daily Calories, Protein, and Fat.
  - Dashed benchmark reference lines for **Target 2,300 kcal** and **130g Protein**.
  - One-click `[+ Quick Update]` button to log daily calories directly.
- **Graph Box 2 (Body Measurements & Circumference - Zero Restrictions)**:
  - Multi-line trend graph tracking Weight (kg), Waist (cm), Chest (cm), and Biceps (cm).
  - Flexible logging: enter measurements anytime (weekly, daily, or whenever measured).
  - Real-time delta display (+/- cm and kg compared to Day 1 baseline).

### 3. 6-Day Progressive Overload Workout Split
- **Weekly Split**:
  - **Monday**: Chest + Triceps
  - **Tuesday**: Back + Biceps
  - **Wednesday**: Legs
  - **Thursday**: Shoulders + Abs
  - **Friday**: Chest + Back
  - **Saturday**: Legs + Arms
  - **Sunday**: Active Rest / Recovery
- **Exercise Cards**: Target muscle badge, prescribed sets, repetitions, key form instructions, alternative exercises.
- **Set Logger**: Log actual weight lifted and reps completed per set for progressive overload tracking.
- **15-Minute Cardio Timer**: Interactive countdown timer with start, pause, reset, and completion toggle.
- **`[+ Add Custom Exercise]`**: Add any new gym machine or exercise on the fly.

### 4. PG / Mess Smart Nutrition & Macro Tracker
- **Pre-Configured Foods**: Whole Boiled Eggs, Egg Whites, Soya Chunks (dry vs cooked), Mess Dal, Roti, White Rice, Curd, Milk, Paneer, Kala Chana, Bananas.
- **1-Tap Quick Presets**:
  - `[ Standard Mess Lunch ]`: 3 Roti + 1.5 Dal + 1 Plate Rice (660 kcal • 22.5g Protein)
  - `[ Post-Workout Soya Bowl ]`: 50g Soya + 100g Curd + 1 Banana (322 kcal • 30.6g Protein • ₹25)
  - `[ Daily Egg Quota ]`: 2 Whole Eggs + 3 Boiled Whites (191 kcal • 22.8g Protein • ₹29)
- **Daily Extra Budget Tracker**: Real-time counter for ₹50–₹100 daily extra food budget.
- **`[+ Create Custom Food]`**: Add any custom food (Name, Portion, Calories, Protein, Carbs, Fat, Cost) which saves permanently in MongoDB!
- **Quick Direct Entry**: Directly enter calories and protein for street food or cheat meals.

### 5. ⭐ General Gym Photo Feed (Automatic Date & Time Stamp)
- Upload casual gym selfies, post-workout pump pictures, healthy meals, or PR moments.
- **Automatic Metadata**: Attaches exact Date (e.g. `13 Nov 2026`), Time (e.g. `07:45 PM`), and Challenge Day (e.g. `DAY 1`) automatically from system clock.
- Caption and hashtag support.
- Fullscreen zoom viewer and gallery view.

### 6. Standardized Transformation Studio
- Scheduled Check-ins on **Days 1, 15, 30, 45, 60, 75, and 90**.
- 3 Angle upload slots per milestone: **Front Relaxed**, **Side Relaxed**, and **Back Relaxed**.
- **Before vs After Side-by-Side Visualizer**: Select any two days and compare front, side, or back progress side-by-side.

### 7. Body Measurements Log
- Interactive history table showing all measurement entries.
- Automated difference (+/- kg or cm) from Day 1 baseline (Weight: 80kg, Waist: 101cm, Chest: 95cm, Biceps: 30cm).

### 8. Downloadable Excel Workbook (`.xlsx`)
- Fully functional, professionally formatted 10-sheet Excel workbook generated with openpyxl.
- Includes Dashboard, 90-Day Tracker, Workout Planner, Exercise Library, Diet Planner, Food Database, Measurements, Photos, Weekly Reports, and Instructions.
- Accessible via one-click download button in the app navbar or directly from the workspace.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS v4, Lucide React, Recharts
- **Backend**: Node.js, Express 5, Mongoose, Multer (Local & Cloud Photo uploads), JWT, Bcrypt
- **Database**: MongoDB (Local `mongodb://127.0.0.1:27017/fitness_recomp_db` or Atlas URI)
- **Excel Engine**: Python openpyxl

---

## 💻 Commands

```bash
# Start the full-stack app (Frontend + Backend on http://localhost:5000)
node server/server.js

# Or run client in dev mode with hot reload
cd client && npm run dev

# Re-generate Excel workbook
python scripts/generate_excel.py
```

