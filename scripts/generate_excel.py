import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter
from datetime import datetime, timedelta

def create_recomp_workbook():
    wb = openpyxl.Workbook()
    wb.remove(wb.active)

    # Styles
    dark_bg = "18181B"       # Zinc 900
    card_bg = "27272A"       # Zinc 800
    table_hdr = "09090B"     # Zinc 950
    lime_accent = "A3E635"   # Electric Lime
    white_txt = "FFFFFF"
    muted_txt = "A1A1AA"     # Zinc 400

    font_title = Font(name="Segoe UI", size=16, bold=True, color=lime_accent)
    font_header = Font(name="Segoe UI", size=10, bold=True, color=lime_accent)
    font_data = Font(name="Segoe UI", size=10, color="000000")
    font_data_bold = Font(name="Segoe UI", size=10, bold=True, color="000000")
    font_kpi_num = Font(name="Segoe UI", size=18, bold=True, color=lime_accent)
    font_kpi_label = Font(name="Segoe UI", size=9, bold=True, color=muted_txt)

    fill_dark = PatternFill(start_color=dark_bg, end_color=dark_bg, fill_type="solid")
    fill_card = PatternFill(start_color=card_bg, end_color=card_bg, fill_type="solid")
    fill_header = PatternFill(start_color=table_hdr, end_color=table_hdr, fill_type="solid")
    fill_accent = PatternFill(start_color=lime_accent, end_color=lime_accent, fill_type="solid")
    fill_zebra = PatternFill(start_color="F9FAFB", end_color="F9FAFB", fill_type="solid")

    thin_border_side = Side(border_style="thin", color="D4D4D8")
    thin_border = Border(left=thin_border_side, right=thin_border_side, top=thin_border_side, bottom=thin_border_side)

    align_center = Alignment(horizontal="center", vertical="center")
    align_left = Alignment(horizontal="left", vertical="center")

    # ==========================================
    # SHEET 1: DASHBOARD
    # ==========================================
    ws_dash = wb.create_sheet("Dashboard")
    ws_dash.views.sheetView[0].showGridLines = True

    # Title block
    ws_dash.merge_cells("B2:K3")
    title_cell = ws_dash["B2"]
    title_cell.value = "⚡ 90-DAY BODY RECOMPOSITION MASTER DASHBOARD"
    title_cell.font = Font(name="Segoe UI", size=18, bold=True, color=lime_accent)
    title_cell.fill = fill_dark
    title_cell.alignment = align_center

    ws_dash.merge_cells("B4:K4")
    sub_cell = ws_dash["B4"]
    sub_cell.value = "Profile: Male, 21y | 168 cm | Baseline: 80 kg | Start: 13-Nov-2026 -> End: 10-Feb-2027 | Target: 2,000 kcal & 130g Protein"
    sub_cell.font = Font(name="Segoe UI", size=10, italic=True, color=muted_txt)
    sub_cell.fill = fill_dark
    sub_cell.alignment = align_center

    # KPI Cards
    kpis = [
        ("B6", "C7", "STARTING WEIGHT", "80.0 kg", "Day 1 Baseline"),
        ("D6", "E7", "LATEST WEIGHT", "='90-Day Daily Tracker'!C5", "Updated from Daily Log"),
        ("F6", "G7", "STARTING WAIST", "101.0 cm", "Day 1 Relaxed"),
        ("H6", "I7", "LATEST WAIST", "='Body Measurements'!C5", "Updated from Tracker"),
        ("J6", "K7", "DAILY TARGET", "2,000 kcal", "130g Protein Target")
    ]

    for top_left, bot_right, label, val, sub in kpis:
        c1, r1 = top_left[0], int(top_left[1])
        c2, r2 = bot_right[0], int(bot_right[1])
        ws_dash.merge_cells(f"{top_left}:{c2}{r1}")
        ws_dash[f"{c1}{r1}"].value = label
        ws_dash[f"{c1}{r1}"].font = font_kpi_label
        ws_dash[f"{c1}{r1}"].fill = fill_dark
        ws_dash[f"{c1}{r1}"].alignment = align_center

        ws_dash.merge_cells(f"{c1}{r2}:{bot_right}")
        ws_dash[f"{c1}{r2}"].value = val
        ws_dash[f"{c1}{r2}"].font = font_kpi_num
        ws_dash[f"{c1}{r2}"].fill = fill_card
        ws_dash[f"{c1}{r2}"].alignment = align_center

    # Quick Navigation / Status summary
    ws_dash.cell(row=9, column=2, value="TRANSFORMATION TIMELINE & PROGRESS SUMMARY").font = Font(name="Segoe UI", size=12, bold=True, color=table_hdr)
    headers_summary = ["Metric", "Baseline (Day 1)", "Current Progress", "Target (Day 90)", "Status"]
    for col_idx, h in enumerate(headers_summary, start=2):
        cell = ws_dash.cell(row=10, column=col_idx, value=h)
        cell.font = font_header
        cell.fill = fill_header
        cell.alignment = align_center

    dash_rows = [
        ("Body Weight", "80.0 kg", "='90-Day Daily Tracker'!C5", "~73.0 - 75.0 kg", "Active Recomp"),
        ("Belly / Waist Circumference", "101.0 cm", "='Body Measurements'!C5", "< 90.0 cm", "Fat Loss Priority"),
        ("Chest Circumference", "95.0 cm", "='Body Measurements'!D5", "98.0+ cm", "Hypertrophy"),
        ("Biceps Circumference", "30.0 cm", "='Body Measurements'!E5", "33.0+ cm", "Arm Growth"),
        ("Daily Calorie Average", "2,000 kcal", "=AVERAGE('90-Day Daily Tracker'!E5:E94)", "1,900 - 2,000 kcal", "Controlled Deficit"),
        ("Daily Protein Average", "130 g", "=AVERAGE('90-Day Daily Tracker'!G5:G94)", "130.0 g", "High Protein"),
        ("Workout Completion Rate", "6 Days / Week", '=COUNTIF(\'90-Day Daily Tracker\'!K5:K94,"Y")/90', "85%+", "Progressive Overload")
    ]

    for r_idx, row_data in enumerate(dash_rows, start=11):
        for c_idx, val in enumerate(row_data, start=2):
            cell = ws_dash.cell(row=r_idx, column=c_idx, value=val)
            cell.font = font_data
            cell.border = thin_border
            cell.alignment = align_center if c_idx != 2 else align_left
            if r_idx % 2 == 0:
                cell.fill = fill_zebra

    ws_dash.cell(row=17, column=4).number_format = '0.0%'

    # YOUR 6-DAY GYM SPLIT (Updated to user's exact specification)
    ws_dash.cell(row=19, column=2, value="YOUR 6-DAY GYM SPLIT 💪").font = Font(name="Segoe UI", size=12, bold=True, color=table_hdr)
    split_headers = ["Day", "Focus Area", "Category / Split Type", "Cardio", "Intensity & Protocol"]
    for col_idx, h in enumerate(split_headers, start=2):
        cell = ws_dash.cell(row=20, column=col_idx, value=h)
        cell.font = font_header
        cell.fill = fill_header
        cell.alignment = align_center

    split_data = [
        ("Monday", "Chest + Triceps", "Push day", "15 min Incline Walk", "Heavy Compound + RPE 8"),
        ("Tuesday", "Back + Biceps", "Pull day", "15 min Moderate Cardio", "Pull Focus + Lat Width"),
        ("Wednesday", "Shoulders + Abs", "Deltoids & Core", "15 min Incline Walk", "Lateral Delts & Core Bracing"),
        ("Thursday", "Chest + Back", "Upper Body Thickness", "15 min Moderate Cardio", "Antagonist Super-sets"),
        ("Friday", "Biceps + Triceps", "Arms Hypertrophy", "15 min Moderate Cardio", "Arm Thickness & Peak Squeeze"),
        ("Saturday", "Legs + Abs", "Leg Day", "15 min Light Cardio", "Squats + Quads + Hamstrings + Core"),
        ("Sunday", "Active Rest / Recovery", "Rest Day", "Optional 20 min Walk", "Mobility & Sleep 8+ hrs")
    ]

    for r_idx, s in enumerate(split_data, start=21):
        for c_idx, val in enumerate(s, start=2):
            cell = ws_dash.cell(row=r_idx, column=c_idx, value=val)
            cell.font = font_data
            cell.border = thin_border
            cell.alignment = align_center if c_idx in [2, 4, 5] else align_left
            if r_idx % 2 == 0:
                cell.fill = fill_zebra

    # ==========================================
    # SHEET 2: 90-DAY DAILY TRACKER
    # ==========================================
    ws_tracker = wb.create_sheet("90-Day Daily Tracker")
    ws_tracker.views.sheetView[0].showGridLines = True

    tracker_headers = [
        "Day #", "Date", "Weight (kg)", "Calorie Target", "Calories Consumed",
        "Protein Target (g)", "Protein (g)", "Carbs (g)", "Fat (g)", "Water (L)",
        "Workout (Y/N)", "Cardio (min)", "Steps", "Sleep (hrs)", "Gym Performance (1-5)",
        "Diet Adherence %", "Notes"
    ]

    for c_idx, h in enumerate(tracker_headers, start=1):
        cell = ws_tracker.cell(row=4, column=c_idx, value=h)
        cell.font = font_header
        cell.fill = fill_header
        cell.alignment = align_center

    start_date = datetime(2026, 11, 13)
    for i in range(90):
        current_date = start_date + timedelta(days=i)
        r_num = 5 + i
        ws_tracker.cell(row=r_num, column=1, value=i + 1).alignment = align_center
        date_cell = ws_tracker.cell(row=r_num, column=2, value=current_date.strftime("%d-%b-%Y"))
        date_cell.alignment = align_center

        if i == 0:
            ws_tracker.cell(row=r_num, column=3, value=80.0).alignment = align_center
        else:
            ws_tracker.cell(row=r_num, column=3).alignment = align_center

        ws_tracker.cell(row=r_num, column=4, value=2000).alignment = align_center
        ws_tracker.cell(row=r_num, column=6, value=130).alignment = align_center

        adherence_cell = ws_tracker.cell(row=r_num, column=16, value=f'=IF(E{r_num}="","",ROUND(G{r_num}/F{r_num},2))')
        adherence_cell.number_format = '0%'
        adherence_cell.alignment = align_center

        for c in range(1, len(tracker_headers) + 1):
            cell = ws_tracker.cell(row=r_num, column=c)
            cell.border = thin_border
            cell.font = font_data
            if i % 2 == 1:
                cell.fill = fill_zebra

    # ==========================================
    # SHEET 3: WORKOUT PLANNER (UPDATED SPLIT)
    # ==========================================
    ws_workout = wb.create_sheet("Workout Planner")
    ws_workout.views.sheetView[0].showGridLines = True

    ws_workout.cell(row=2, column=2, value="YOUR 6-DAY GYM SPLIT 💪 (PROGRESSIVE OVERLOAD SYSTEM)").font = font_title
    ws_workout.cell(row=3, column=2, value="Mon: Chest+Tris | Tue: Back+Bis | Wed: Shoulders+Abs | Thu: Chest+Back | Fri: Biceps+Triceps | Sat: Legs+Abs | Sun: Rest").font = Font(name="Segoe UI", size=10, italic=True)

    workout_cols = ["Day", "Exercise Name", "Target Muscle", "Sets", "Reps", "Rest (sec)", "Key Technique & Form", "Alternative Exercise"]
    for c_idx, h in enumerate(workout_cols, start=2):
        cell = ws_workout.cell(row=5, column=c_idx, value=h)
        cell.font = font_header
        cell.fill = fill_header
        cell.alignment = align_center

    exercises = [
        # Monday – Chest + Triceps (Push day)
        ("Monday (Push)", "Incline Dumbbell Press", "Upper Chest", 4, "8-10", 90, "Bench at 30 deg, control eccentric (3s down)", "Incline Smith Machine Press"),
        ("Monday (Push)", "Flat Barbell / DB Bench Press", "Middle Chest", 3, "8-10", 90, "Retract scapula, arch slightly, drive feet", "Pec Deck Fly"),
        ("Monday (Push)", "Cable / DB Chest Flyes", "Chest Stretch", 3, "12-15", 60, "Squeeze pecs at peak contraction", "Dumbbell Fly on Flat Bench"),
        ("Monday (Push)", "Triceps Rope Pushdowns", "Triceps Lateral Head", 3, "10-12", 60, "Lock elbows at sides, spread rope at bottom", "Straight Bar Pushdown"),
        ("Monday (Push)", "Overhead Dumbbell Triceps Ext", "Triceps Long Head", 3, "10-12", 60, "Full tricep stretch behind head", "EZ-Bar Skullcrushers"),
        ("Monday (Push)", "15-Min Incline Treadmill Walk", "Cardio / Conditioning", 1, "15 min", 0, "Speed 4.5-5.0 km/h, Incline 6-8%", "Stationary Cycle"),

        # Tuesday – Back + Biceps (Pull day)
        ("Tuesday (Pull)", "Lat Pulldown (Wide Grip)", "Lats (Upper Back Width)", 4, "8-10", 90, "Drive elbows down and back, chest up", "Assisted Pull-ups"),
        ("Tuesday (Pull)", "Seated Cable Row / Chest Row", "Mid Back & Rhomboids", 3, "10-12", 90, "Pull to navel, 1s pause at contraction", "One-Arm Dumbbell Row"),
        ("Tuesday (Pull)", "Chest-Supported T-Bar / DB Row", "Back Thickness", 3, "10-12", 60, "Focus on back, avoid lower back strain", "Barbell Bent-Over Row"),
        ("Tuesday (Pull)", "Standing EZ-Bar / DB Biceps Curl", "Biceps Brachii", 3, "10-12", 60, "No swinging, squeeze at top", "Dumbbell Hammer Curl"),
        ("Tuesday (Pull)", "Incline Dumbbell Curl", "Biceps Long Head", 3, "10-12", 60, "Deep stretch at bottom position", "Cable Preacher Curl"),
        ("Tuesday (Pull)", "15-Min Moderate Cardio", "Cardio", 1, "15 min", 0, "Elliptical or brisk treadmill walking", "Stair Climbing"),

        # Wednesday – Shoulders + Abs
        ("Wednesday", "Seated Dumbbell Shoulder Press", "Front & Lateral Delts", 4, "8-10", 90, "Lower dumbbells to ear level, press up in arc", "Overhead Military Press"),
        ("Wednesday", "Dumbbell Lateral Raises", "Side Delts (V-Taper Width)", 4, "12-15", 60, "Slight forward lean, raise elbows to shoulder line", "Cable Lateral Raise"),
        ("Wednesday", "Face Pulls with Rope", "Rear Delts & Rotators", 3, "12-15", 60, "Pull towards forehead, rotate hands back externally", "Reverse Pec Deck Fly"),
        ("Wednesday", "Hanging Leg / Knee Raises", "Lower Abs & Core", 3, "12-15", 45, "Curl pelvis up, don't just swing legs", "Captain's Chair Knee Raise"),
        ("Wednesday", "Cable / Floor Woodchoppers", "Obliques & Core Stability", 3, "15/side", 45, "Control rotational movement, brace abs", "Side Plank Holds (40s)"),
        ("Wednesday", "15-Min Incline Walking", "Cardio", 1, "15 min", 0, "Moderate incline, steady heart rate", "Cross Trainer"),

        # Thursday – Chest + Back
        ("Thursday", "Incline Dumbbell Bench Press", "Upper Chest", 3, "8-10", 90, "Keep shoulder blades locked back, controlled descent", "Incline Smith Press"),
        ("Thursday", "Weighted / Neutral Grip Pull-ups", "Lats & Upper Back", 3, "6-8", 90, "Full range of motion, chin over bar", "Lat Pulldown Close Grip"),
        ("Thursday", "Flat Dumbbell Press", "Mid Chest", 3, "10-12", 75, "Controlled descent, deep press", "Push-ups with Elevation"),
        ("Thursday", "Seated Cable Row (Close Grip)", "Mid Back Thickness", 3, "10-12", 75, "Squeeze lats and rhomboids for 1 second", "Single Arm DB Row"),
        ("Thursday", "Cable Crossover / Pec Fly", "Inner Chest Squeeze", 2, "15", 45, "Hands meet in front of belly, squeeze pecs", "Dumbbell Pullover"),
        ("Thursday", "15-Min Cardio", "Cardio", 1, "15 min", 0, "Steady state cardio", "Incline Walk"),

        # Friday – Biceps + Triceps (Arms Day)
        ("Friday (Arms)", "Standing EZ-Bar / DB Biceps Curl", "Biceps Brachii", 3, "10-12", 60, "Strict form, pin elbows, full peak squeeze", "Straight Bar Curl"),
        ("Friday (Arms)", "Triceps Rope Pushdowns", "Triceps Lateral Head", 3, "10-12", 60, "Spread rope at bottom for peak lockout", "Straight Bar Pushdown"),
        ("Friday (Arms)", "Incline Dumbbell Curl", "Biceps Long Head (Peak)", 3, "10-12", 60, "Deep stretch at bottom, curl without swaying", "Cable Preacher Curl"),
        ("Friday (Arms)", "Overhead DB / Cable Tricep Ext", "Triceps Long Head", 3, "10-12", 60, "Full stretch behind head, elbows pointing up", "EZ-Bar Skullcrushers"),
        ("Friday (Arms)", "Dumbbell Hammer Curls", "Brachialis & Forearms", 3, "10-12", 60, "Palms inward neutral grip for dense arm width", "Rope Hammer Curls"),
        ("Friday (Arms)", "Close-Grip Push-ups / Dips", "Triceps Pump Finisher", 2, "Failure", 45, "Bodyweight tricep burnout pump", "Bench Dips"),
        ("Friday (Arms)", "15-Min Moderate Cardio", "Cardio", 1, "15 min", 0, "Cycling or incline walking", "Treadmill Walk"),

        # Saturday – Legs + Abs (Leg Day)
        ("Saturday (Legs)", "Barbell / Smith Machine Squats", "Quads & Glutes", 4, "8-10", 120, "Break at hips and knees, parallel depth", "Leg Press"),
        ("Saturday (Legs)", "Leg Press", "Quads & Hamstrings", 3, "10-12", 90, "Feet shoulder-width on platform, controlled descent", "Goblet Squats"),
        ("Saturday (Legs)", "Romanian Deadlift (RDL)", "Hamstrings & Glutes", 3, "8-10", 90, "Hinge at hips, dumbbells close to shins", "Lying Leg Curls"),
        ("Saturday (Legs)", "Leg Extensions", "Quads Isolation", 3, "12-15", 60, "Pause 1s at top extension, slow lowering", "Walking Lunges"),
        ("Saturday (Legs)", "Standing / Seated Calf Raises", "Calves", 4, "15-20", 45, "2s stretch at bottom, peak squeeze on toes", "Single-Leg Calf Raise"),
        ("Saturday (Legs)", "Decline Bench / Cable Crunches", "Upper & Mid Abs", 3, "15", 45, "Round spine and curl ribs toward pelvis", "Hanging Knee Raises"),
        ("Saturday (Legs)", "15-Min Light Cardio", "Cooldown", 1, "15 min", 0, "Flush lactic acid with light walking", "Light Cycle"),

        # Sunday – Rest & Recovery
        ("Sunday (Rest)", "Active Rest & Recovery Walk", "Mobility & Restoration", 1, "20-30 min", 0, "Gentle outdoor walk, full-body foam rolling/stretching", "Complete Rest")
    ]

    for r_idx, ex in enumerate(exercises, start=6):
        for c_idx, val in enumerate(ex, start=2):
            cell = ws_workout.cell(row=r_idx, column=c_idx, value=val)
            cell.font = font_data
            cell.border = thin_border
            cell.alignment = align_center if c_idx in [2, 5, 6, 7] else align_left
            if r_idx % 2 == 1:
                cell.fill = fill_zebra

    # ==========================================
    # SHEET 4: EXERCISE LIBRARY
    # ==========================================
    ws_lib = wb.create_sheet("Exercise Library")
    ws_lib.views.sheetView[0].showGridLines = True
    ws_lib.cell(row=2, column=2, value="EXERCISE LIBRARY & MUSCLE MAPPING").font = font_title

    lib_headers = ["Muscle Group", "Primary Exercise", "Secondary / Alternative", "Equipment Needed", "Target Region", "Progression Method"]
    for c_idx, h in enumerate(lib_headers, start=2):
        cell = ws_lib.cell(row=4, column=c_idx, value=h)
        cell.font = font_header
        cell.fill = fill_header
        cell.alignment = align_center

    lib_data = [
        ("Chest", "Barbell Bench Press", "Dumbbell Bench Press", "Barbell / Dumbbell", "Middle & Lower Pectorals", "Add 2.5 kg every 1-2 weeks"),
        ("Chest", "Incline Dumbbell Press", "Incline Smith Machine", "Dumbbells / Incline Bench", "Clavicular (Upper) Chest", "Add reps until 12, then increase weight"),
        ("Chest", "Cable Chest Fly", "Pec Deck Fly", "Cable Machine", "Sternal Chest Squeeze", "Focus on 2s contraction pause"),
        ("Back", "Lat Pulldown", "Assisted Pull-ups", "Cable Machine", "Latissimus Dorsi (Width)", "Increase weight when 10 strict reps achieved"),
        ("Back", "Seated Cable Row", "Chest-Supported Row", "Cable / Dumbbells", "Rhomboids, Mid Traps (Thickness)", "Slow eccentric tempo (3 seconds down)"),
        ("Back", "Romanian Deadlift", "Hyperextensions", "Barbell / Dumbbells", "Lower Back, Erector Spinae", "Master hip hinge form before increasing weight"),
        ("Shoulders", "Seated Dumbbell Press", "Overhead Military Press", "Dumbbells / Barbell", "Anterior & Lateral Deltoid", "Micro-load 1-2 kg increases"),
        ("Shoulders", "Dumbbell Lateral Raise", "Cable Lateral Raise", "Dumbbells / Cable", "Lateral Deltoid (Width)", "High volume: 12-15 reps with strict form"),
        ("Shoulders", "Face Pulls", "Reverse Pec Deck", "Cable Rope Attachment", "Posterior (Rear) Deltoid", "Pull with external shoulder rotation"),
        ("Arms (Biceps)", "Standing Dumbbell Curl", "Barbell Curl", "Dumbbells", "Biceps Brachii", "Strict elbow positioning"),
        ("Arms (Biceps)", "Incline Dumbbell Curl", "Cable Preacher Curl", "Incline Bench, Dumbbells", "Biceps Long Head (Peak)", "Maximum stretch at bottom"),
        ("Arms (Biceps)", "Hammer Curl", "Cable Rope Curl", "Dumbbells", "Brachialis & Forearm", "Heavy loads with neutral grip"),
        ("Arms (Triceps)", "Rope Pushdown", "Straight Bar Pushdown", "Cable Machine", "Triceps Lateral Head", "Spread handles at full extension"),
        ("Arms (Triceps)", "Overhead DB Extension", "Skullcrushers", "Dumbbells / EZ Bar", "Triceps Long Head", "Full overhead elbow flexion"),
        ("Legs (Quads)", "Barbell Back Squat", "Leg Press", "Squat Rack / Barbell", "Quadriceps & Glute Max", "Linear load progression"),
        ("Legs (Quads)", "Leg Extension", "Goblet Squats", "Leg Extension Machine", "Rectus Femoris Isolation", "Terminal knee extension pause"),
        ("Legs (Hamstrings)", "Lying Leg Curl", "Seated Leg Curl", "Leg Curl Machine", "Biceps Femoris", "Controlled eccentric, avoid hip lift"),
        ("Legs (Calves)", "Standing Calf Raise", "Seated Calf Raise", "Calf Machine / Dumbbells", "Gastrocnemius & Soleus", "Hold stretch for 2 full seconds"),
        ("Core", "Hanging Knee Raise", "Captain's Chair Knee Raise", "Pull-up Bar", "Lower Abdominals & Hip Flexors", "Posterior pelvic tilt focus"),
        ("Core", "Cable Woodchoppers", "Plank with Shoulder Taps", "Cable / Mat", "Internal & External Obliques", "Rotational core stability")
    ]

    for r_idx, row in enumerate(lib_data, start=5):
        for c_idx, val in enumerate(row, start=2):
            cell = ws_lib.cell(row=r_idx, column=c_idx, value=val)
            cell.font = font_data
            cell.border = thin_border
            cell.alignment = align_center if c_idx in [2, 5] else align_left
            if r_idx % 2 == 1:
                cell.fill = fill_zebra

    # ==========================================
    # SHEET 5: DIET PLANNER
    # ==========================================
    ws_diet = wb.create_sheet("Diet Planner")
    ws_diet.views.sheetView[0].showGridLines = True
    ws_diet.cell(row=2, column=2, value="INDIAN PG / MESS VEGETARIAN + EGGS MEAL PLAN").font = font_title
    ws_diet.cell(row=3, column=2, value="Target: ~2,000 kcal | 130g Protein | 65g Fat | 225g Carbs | Extra Budget: ₹50 - ₹100/day").font = Font(name="Segoe UI", size=10, italic=True)

    diet_headers = ["Meal Timing", "Suggested Food Items", "Portion / Weight", "Calories (kcal)", "Protein (g)", "Carbs (g)", "Fat (g)", "Approx Cost (₹)", "Food Source"]
    for c_idx, h in enumerate(diet_headers, start=2):
        cell = ws_diet.cell(row=5, column=c_idx, value=h)
        cell.font = font_header
        cell.fill = fill_header
        cell.alignment = align_center

    meals = [
        ("Morning (07:30 AM)", "Toned Milk (Warm) + 1 Banana", "250 ml milk + 1 medium banana", 240, 9.0, 36.0, 7.5, 20, "Self (Budget)"),
        ("Breakfast (09:00 AM)", "Mess Poha/Upma/Paratha + 2 Whole Boiled Eggs", "1 plate mess breakfast + 2 eggs", 420, 18.0, 52.0, 15.0, 14, "Mess + Self Eggs"),
        ("Lunch (01:30 PM)", "Mess Dal + 3 Wheat Roti + Sabzi + Curd", "1 bowl dal (150ml), 3 roti, 100g curd", 560, 20.5, 82.0, 14.5, 10, "Mess Food (Included)"),
        ("Pre-Workout (05:00 PM)", "Boiled Kala Chana / Roasted Chana + 1 Banana", "60g boiled chana + 1 banana", 210, 8.5, 40.0, 2.5, 12, "Self (Budget)"),
        ("Post-Workout (07:30 PM)", "Soya Chunks Bowl (Boiled with spices/veggies)", "50g dry soya chunks (makes 150g cooked)", 175, 26.0, 16.5, 0.5, 10, "Self (High Protein)"),
        ("Dinner (09:00 PM)", "Mess Dal + 3 Roti + Cooked Rice (1 katori) + 2 Boiled Eggs", "3 roti, 1 bowl dal, 100g rice, 2 eggs", 680, 26.0, 105.0, 16.0, 14, "Mess + Self Eggs"),
        ("Before Bed (10:30 PM)", "Remaining Milk or Water + Multivitamin", "100 ml warm milk or water", 65, 3.2, 5.0, 3.0, 8, "Self (Recovery)")
    ]

    for r_idx, m in enumerate(meals, start=6):
        for c_idx, val in enumerate(m, start=2):
            cell = ws_diet.cell(row=r_idx, column=c_idx, value=val)
            cell.font = font_data
            cell.border = thin_border
            cell.alignment = align_center if c_idx in [2, 4, 5, 6, 7, 8, 9, 10] else align_left
            if r_idx % 2 == 1:
                cell.fill = fill_zebra

    r_tot = 6 + len(meals)
    ws_diet.cell(row=r_tot, column=2, value="TOTAL DAILY INTAKE").font = font_data_bold
    ws_diet.cell(row=r_tot, column=5, value=f"=SUM(E6:E{r_tot-1})").font = font_data_bold
    ws_diet.cell(row=r_tot, column=6, value=f"=SUM(F6:F{r_tot-1})").font = font_data_bold
    ws_diet.cell(row=r_tot, column=7, value=f"=SUM(G6:G{r_tot-1})").font = font_data_bold
    ws_diet.cell(row=r_tot, column=8, value=f"=SUM(H6:H{r_tot-1})").font = font_data_bold
    ws_diet.cell(row=r_tot, column=9, value=f"=SUM(I6:I{r_tot-1})").font = font_data_bold

    for c in range(2, 11):
        cell = ws_diet.cell(row=r_tot, column=c)
        cell.border = thin_border
        cell.fill = fill_accent
        if c >= 5 and c <= 9:
            cell.alignment = align_center

    # ==========================================
    # SHEET 6: FOOD NUTRITION DATABASE
    # ==========================================
    ws_food = wb.create_sheet("Food Nutrition Database")
    ws_food.views.sheetView[0].showGridLines = True
    ws_food.cell(row=2, column=2, value="NUTRITION REFERENCE DATABASE (PER STANDARD SERVING)").font = font_title

    food_headers = ["Item Name", "State (Dry/Cooked)", "Portion Size", "Calories (kcal)", "Protein (g)", "Carbs (g)", "Fat (g)", "Fiber (g)", "Approx Cost (₹)", "Notes"]
    for c_idx, h in enumerate(food_headers, start=2):
        cell = ws_food.cell(row=4, column=c_idx, value=h)
        cell.font = font_header
        cell.fill = fill_header
        cell.alignment = align_center

    foods = [
        ("Whole Egg (Large)", "Boiled", "1 egg (50g)", 70, 6.0, 0.5, 5.0, 0.0, 7, "High bioavailability, essential vitamins"),
        ("Egg White", "Boiled", "1 egg white (33g)", 17, 3.6, 0.2, 0.0, 0.0, 5, "Pure lean protein, zero fat"),
        ("Soya Chunks (Fortune/Nutrela)", "Dry Raw", "50 g", 172, 26.0, 16.5, 0.2, 6.5, 10, "Expands to ~150g when boiled. Best budget protein"),
        ("Toned Cow/Buffalo Milk", "Liquid", "250 ml (1 glass)", 150, 8.0, 12.0, 7.5, 0.0, 15, "Good calcium & slow digesting casein"),
        ("Curd / Dahi (Plain)", "Ready to eat", "100 g", 60, 3.5, 4.5, 3.0, 0.0, 10, "Gut probiotics & protein"),
        ("Paneer (Cottage Cheese)", "Raw/Cooked", "50 g", 145, 9.0, 2.0, 10.0, 0.0, 20, "Satiating healthy fats + protein"),
        ("Kala Chana (Black Chickpeas)", "Raw Dry", "50 g", 185, 10.5, 30.0, 2.5, 8.5, 6, "Soak overnight & boil. High complex carbs"),
        ("Kala Chana (Black Chickpeas)", "Cooked/Boiled", "100 g", 160, 9.0, 27.0, 2.5, 7.5, 8, "Great pre-workout sustained energy"),
        ("Mess Dal (Toor/Moong/Masoor)", "Cooked", "1 bowl (150 ml)", 130, 6.5, 18.0, 3.0, 4.0, 8, "Standard Indian mess watery preparation"),
        ("Roti / Chapati (Whole Wheat)", "Cooked", "1 medium roti (35g)", 90, 3.0, 19.0, 0.5, 2.5, 3, "No extra ghee. Complex carbohydrate"),
        ("White Rice (Cooked)", "Cooked", "1 bowl (150 g)", 195, 4.0, 42.0, 0.5, 0.5, 5, "Easy digesting post-workout glycogen fuel"),
        ("Banana", "Fresh", "1 medium (100g)", 90, 1.1, 23.0, 0.3, 2.6, 5, "Potassium & quick natural energy"),
        ("Oats (Rolled/Instant)", "Dry Raw", "40 g", 155, 5.0, 27.0, 2.8, 4.0, 12, "Beta-glucan fiber, low glycemic index"),
        ("Peanut Butter (Natural)", "Paste", "1 tbsp (16g)", 95, 4.0, 3.0, 8.0, 1.0, 10, "Calorie dense, healthy monounsaturated fats"),
        ("Mixed Seasonal Green Sabzi", "Cooked", "1 bowl (100g)", 80, 2.0, 8.0, 4.0, 3.0, 6, "Micronutrients & fiber (Bhindi, Gobhi, Lauki)")
    ]

    for r_idx, f in enumerate(foods, start=5):
        for c_idx, val in enumerate(f, start=2):
            cell = ws_food.cell(row=r_idx, column=c_idx, value=val)
            cell.font = font_data
            cell.border = thin_border
            cell.alignment = align_center if c_idx in [3, 4, 5, 6, 7, 8, 9, 10] else align_left
            if r_idx % 2 == 1:
                cell.fill = fill_zebra

    # ==========================================
    # SHEET 7: BODY MEASUREMENTS
    # ==========================================
    ws_measure = wb.create_sheet("Body Measurements")
    ws_measure.views.sheetView[0].showGridLines = True
    ws_measure.cell(row=2, column=2, value="SCHEDULED BODY MEASUREMENTS & PROGRESS TRACKER").font = font_title
    ws_measure.cell(row=3, column=2, value="Measurement Guidelines: Morning, empty stomach, after washroom, relaxed muscles, identical posture.").font = Font(name="Segoe UI", size=10, italic=True)

    measure_headers = ["Day #", "Date", "Weight (kg)", "Waist / Belly (cm)", "Chest (cm)", "Left Biceps (cm)", "Right Biceps (cm)", "Thighs (cm)", "Hips (cm)", "Waist Change from Day 1", "Weight Change from Day 1"]
    for c_idx, h in enumerate(measure_headers, start=2):
        cell = ws_measure.cell(row=4, column=c_idx, value=h)
        cell.font = font_header
        cell.fill = fill_header
        cell.alignment = align_center

    measure_dates = [
        (1, "13-Nov-2026", 80.0, 101.0, 95.0, 30.0, 30.0, 58.0, 102.0),
        (15, "27-Nov-2026", "", "", "", "", "", "", ""),
        (30, "12-Dec-2026", "", "", "", "", "", "", ""),
        (45, "27-Dec-2026", "", "", "", "", "", "", ""),
        (60, "11-Jan-2027", "", "", "", "", "", "", ""),
        (75, "26-Jan-2027", "", "", "", "", "", "", ""),
        (90, "10-Feb-2027", "", "", "", "", "", "", "")
    ]

    for idx, row in enumerate(measure_dates):
        r_num = 5 + idx
        for c_idx, val in enumerate(row, start=2):
            cell = ws_measure.cell(row=r_num, column=c_idx, value=val)
            cell.font = font_data
            cell.border = thin_border
            cell.alignment = align_center

        cell_waist_diff = ws_measure.cell(row=r_num, column=11, value=f'=IF(E{r_num}="","",E{r_num}-$E$5)')
        cell_waist_diff.font = font_data
        cell_waist_diff.border = thin_border
        cell_waist_diff.alignment = align_center

        cell_wt_diff = ws_measure.cell(row=r_num, column=12, value=f'=IF(D{r_num}="","",D{r_num}-$D$5)')
        cell_wt_diff.font = font_data
        cell_wt_diff.border = thin_border
        cell_wt_diff.alignment = align_center

    # ==========================================
    # SHEET 8: TRANSFORMATION PHOTOS
    # ==========================================
    ws_photo = wb.create_sheet("Transformation Photos")
    ws_photo.views.sheetView[0].showGridLines = True
    ws_photo.cell(row=2, column=2, value="90-DAY TRANSFORMATION PHOTO SCHEDULE & CHECK-INS").font = font_title
    ws_photo.cell(row=3, column=2, value="Rules: Keep identical lighting, distance (2.5 meters), eye-level camera height, morning timing, and relaxed posture.").font = Font(name="Segoe UI", size=10, italic=True)

    photo_headers = ["Milestone", "Scheduled Date", "Front Relaxed", "Side Relaxed", "Back Relaxed", "Photo File Name / Link", "Physical Visual Observations"]
    for c_idx, h in enumerate(photo_headers, start=2):
        cell = ws_photo.cell(row=4, column=c_idx, value=h)
        cell.font = font_header
        cell.fill = fill_header
        cell.alignment = align_center

    photo_schedule = [
        ("Day 1 (Baseline)", "13-Nov-2026", "[Pending / Upload]", "[Pending / Upload]", "[Pending / Upload]", "day1_front.jpg", "Baseline starting condition, high midsection fat"),
        ("Day 15 (Check-in 1)", "27-Nov-2026", "[Pending / Upload]", "[Pending / Upload]", "[Pending / Upload]", "day15_check.jpg", "Water weight reduction, initial muscle activation"),
        ("Day 30 (1st Month)", "12-Dec-2026", "[Pending / Upload]", "[Pending / Upload]", "[Pending / Upload]", "day30_check.jpg", "Noticeable waist slimming, shoulder definition"),
        ("Day 45 (Midway)", "27-Dec-2026", "[Pending / Upload]", "[Pending / Upload]", "[Pending / Upload]", "day45_check.jpg", "Upper back width starting to emerge"),
        ("Day 60 (2nd Month)", "11-Jan-2027", "[Pending / Upload]", "[Pending / Upload]", "[Pending / Upload]", "day60_check.jpg", "Clear separation between chest and deltoids"),
        ("Day 75 (Penultimate)", "26-Jan-2027", "[Pending / Upload]", "[Pending / Upload]", "[Pending / Upload]", "day75_check.jpg", "Substantial belly circumference reduction"),
        ("Day 90 (Final Result)", "10-Feb-2027", "[Pending / Upload]", "[Pending / Upload]", "[Pending / Upload]", "day90_final.jpg", "Complete 90-day recomposition final comparison")
    ]

    for idx, p in enumerate(photo_schedule):
        r_num = 5 + idx
        for c_idx, val in enumerate(p, start=2):
            cell = ws_photo.cell(row=r_num, column=c_idx, value=val)
            cell.font = font_data
            cell.border = thin_border
            cell.alignment = align_center if c_idx in [2, 3, 4, 5, 6] else align_left
            if idx % 2 == 1:
                cell.fill = fill_zebra

    # ==========================================
    # SHEET 9: WEEKLY PROGRESS REPORTS
    # ==========================================
    ws_weekly = wb.create_sheet("Weekly Progress Reports")
    ws_weekly.views.sheetView[0].showGridLines = True
    ws_weekly.cell(row=2, column=2, value="13-WEEK PROGRESSION AUDIT & ADAPTIVE SYSTEM").font = font_title

    weekly_headers = ["Week #", "Date Range", "Avg Weight (kg)", "Weight Change (kg)", "Avg Calories", "Avg Protein (g)", "Workout Days (/6)", "Cardio Total (min)", "Avg Sleep (hrs)", "Weekly Status & Action"]
    for c_idx, h in enumerate(weekly_headers, start=2):
        cell = ws_weekly.cell(row=4, column=c_idx, value=h)
        cell.font = font_header
        cell.fill = fill_header
        cell.alignment = align_center

    for w in range(13):
        r_num = 5 + w
        w_start = start_date + timedelta(days=w*7)
        w_end = w_start + timedelta(days=6 if w < 12 else 5)
        date_str = f"{w_start.strftime('%d-%b')} to {w_end.strftime('%d-%b')}"

        tracker_start_row = 5 + (w * 7)
        tracker_end_row = min(94, tracker_start_row + 6)

        ws_weekly.cell(row=r_num, column=2, value=f"Week {w+1}").alignment = align_center
        ws_weekly.cell(row=r_num, column=3, value=date_str).alignment = align_center
        ws_weekly.cell(row=r_num, column=4, value=f"=AVERAGE('90-Day Daily Tracker'!C{tracker_start_row}:C{tracker_end_row})").alignment = align_center
        ws_weekly.cell(row=r_num, column=5, value=f"=IF(D{r_num}=\"\",\"\",IF({w}==0,D{r_num}-80,D{r_num}-D{r_num-1}))").alignment = align_center
        ws_weekly.cell(row=r_num, column=6, value=f"=AVERAGE('90-Day Daily Tracker'!E{tracker_start_row}:E{tracker_end_row})").alignment = align_center
        ws_weekly.cell(row=r_num, column=7, value=f"=AVERAGE('90-Day Daily Tracker'!G{tracker_start_row}:G{tracker_end_row})").alignment = align_center
        ws_weekly.cell(row=r_num, column=8, value=f'=COUNTIF(\'90-Day Daily Tracker\'!K{tracker_start_row}:K{tracker_end_row},"Y")').alignment = align_center
        ws_weekly.cell(row=r_num, column=9, value=f"=SUM('90-Day Daily Tracker'!L{tracker_start_row}:L{tracker_end_row})").alignment = align_center
        ws_weekly.cell(row=r_num, column=10, value=f"=AVERAGE('90-Day Daily Tracker'!N{tracker_start_row}:N{tracker_end_row})").alignment = align_center

        status_formula = f'=IF(H{r_num}>=5,"On Track - Progressive Overload",IF(H{r_num}>=3,"Moderate - Review Diet/Recovery","Needs Attention"))'
        ws_weekly.cell(row=r_num, column=11, value=status_formula).alignment = align_left

        for c in range(2, 12):
            cell = ws_weekly.cell(row=r_num, column=c)
            cell.font = font_data
            cell.border = thin_border
            if w % 2 == 1:
                cell.fill = fill_zebra

    # ==========================================
    # SHEET 10: INSTRUCTIONS
    # ==========================================
    ws_inst = wb.create_sheet("Instructions")
    ws_inst.views.sheetView[0].showGridLines = True
    ws_inst.cell(row=2, column=2, value="HOW TO USE THIS 90-DAY BODY RECOMPOSITION SYSTEM").font = font_title

    inst_steps = [
        ("Step 1: 6-Day Workout Split Execution", "Follow your custom split: Monday (Chest + Triceps - Push Day), Tuesday (Back + Biceps - Pull Day), Wednesday (Shoulders + Abs), Thursday (Chest + Back), Friday (Biceps + Triceps - Arms Day), Saturday (Legs + Abs - Leg Day), Sunday (Active Rest / Recovery). Log weight lifted & reps every single session."),
        ("Step 2: Daily Tracking Protocol", "Every morning after using the washroom, record your weight in the '90-Day Daily Tracker' sheet. At the end of the day, enter your calories, protein, workout status (Y/N), and cardio minutes."),
        ("Step 3: Nutrition Targets (2,000 kcal & 130g Protein)", "Your calorie target is starting at ~2,000 kcal with 130g protein. Soya chunks (50g raw), boiled eggs (4-5/day), mess dal, and curd will comfortably hit your 130g goal within your ₹50-₹100 extra daily budget."),
        ("Step 4: Bi-Weekly Measurements (Days 1, 15, 30, 45, 60, 75, 90)", "Use a flexible measuring tape. Measure your waist across the belly button in a completely relaxed state (do not suck stomach in). Measure both biceps at the peak point."),
        ("Step 5: Standardized Transformation Photos", "Take photos at eye level from 2.5 meters away with identical lighting on Day 1, 15, 30, 45, 60, 75, and 90. Take 3 angles: Front Relaxed, Side Relaxed, and Back Relaxed."),
        ("Step 6: Weekly Adjustments", "At the end of each week, check the 'Weekly Progress Reports' sheet. If weight is stable but waist is decreasing, body recomposition is working perfectly!")
    ]

    for idx, (title, desc) in enumerate(inst_steps):
        r_num = 4 + (idx * 3)
        ws_inst.cell(row=r_num, column=2, value=title).font = Font(name="Segoe UI", size=11, bold=True, color=table_hdr)
        ws_inst.merge_cells(start_row=r_num+1, start_column=2, end_row=r_num+2, end_column=10)
        desc_cell = ws_inst.cell(row=r_num+1, column=2, value=desc)
        desc_cell.font = font_data
        desc_cell.alignment = Alignment(wrap_text=True, vertical="top")

    for ws in wb.worksheets:
        for col in ws.columns:
            max_len = 0
            col_letter = get_column_letter(col[0].column)
            for cell in col:
                if cell.row in [2, 3, 4] and ws.title == "Dashboard":
                    continue
                if cell.value:
                    val_str = str(cell.value)
                    if not val_str.startswith("="):
                        max_len = max(max_len, len(val_str))
            ws.column_dimensions[col_letter].width = max(max_len + 3, 12)

    wb.save("90_Day_Body_Recomposition_Tracker.xlsx")
    print("Workbook updated successfully: 90_Day_Body_Recomposition_Tracker.xlsx")

if __name__ == "__main__":
    create_recomp_workbook()
