export interface Exercise {
  id: string;
  name: string;
  muscle: string;
  target: string;
  sets: number;
  reps: string;
  mediaType: "video" | "gif" | "image";
  mediaSource: { uri: string } | number;
  tip: string;
  setupSteps: string[];
  mistakes: string[];
}

export interface MuscleGroup {
  id: string;
  label: string;
}

export const MUSCLE_GROUPS: MuscleGroup[] = [
  { id: "chest", label: "Chest" },
  { id: "back", label: "Back" },
  { id: "shoulders", label: "Shoulders" },
  { id: "biceps", label: "Biceps" },
  { id: "triceps", label: "Triceps" },
  { id: "abs", label: "Abs" },
  { id: "legs", label: "Legs" },
];

const FREE_EXERCISE_DB =
  "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises";

export const EXERCISE_DATABASE: Record<string, Exercise[]> = {
  chest: [
    {
      id: "c1",
      name: "Barbell Bench Press",
      muscle: "chest",
      target: "Mid Chest & Power",
      sets: 3,
      reps: "8-10",
      mediaType: "gif",
      mediaSource: {
        uri: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Bench_Press/0.gif",
      },
      tip: "Keep your feet flat on the floor. Let your back bend a little.",
      setupSteps: [
        "Lie down flat on the bench. Your eyes should be under the bar.",
        "Hold the bar a little wider than your shoulders.",
        "Lift the bar off the rack. Slowly bring it down to your chest.",
        "Push the bar up fast until your arms are straight.",
      ],
      mistakes: [
        "Do not bounce the bar on your chest",
        "Do not open your elbows out to the side",
      ],
    },
    {
      id: "c6",
      name: "Chest Press Machine",
      muscle: "chest",
      target: "Overall Chest (Guided)",
      sets: 3,
      reps: "10-12",
      mediaType: "gif",
      mediaSource: {
        uri: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Leverage_Chest_Press/0.gif",
      },
      tip: "Set the seat so the handles are level with your chest.",
      setupSteps: [
        "Adjust the seat to the right height.",
        "Hold the handles. Keep your back flat on the pad.",
        "Push forward until your arms are straight.",
      ],
      mistakes: ["Do not lift your shoulders up while pushing"],
    },
    {
      id: "c7",
      name: "Machine Chest Fly (Pec Deck)",
      muscle: "chest",
      target: "Inner & Outer Chest Isolation",
      sets: 3,
      reps: "12-15",
      mediaType: "gif",
      mediaSource: {
        uri: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Butterfly/0.gif",
      },
      tip: "Bring the handles together and hold for 1 second.",
      setupSteps: [
        "Sit back on the pad. Open your arms out wide.",
        "Bring the handles together in front of your chest.",
        "Slowly open your arms back out until you feel a stretch.",
      ],
      mistakes: ["Do not bend your elbows too much during the move"],
    },
  ],

  back: [
    {
      id: "b9",
      name: "Lat Pulldown",
      muscle: "back",
      target: "Upper Back & Lats",
      sets: 3,
      reps: "10-12",
      mediaType: "image",
      mediaSource: {
        uri: `${FREE_EXERCISE_DB}/Cable_Wide-Grip_Lat_Pulldown/0.jpg`,
      },
      tip: "Pull with your elbows driving straight down to your sides.",
      setupSteps: [
        "Sit at machine with thighs snug under pads.",
        "Grip bar wider than shoulder width.",
        "Pull bar down to upper chest while leaning back slightly.",
      ],
      mistakes: ["Do not pull the bar behind your neck"],
    },
    {
      id: "b10",
      name: "Seated Cable Row",
      muscle: "back",
      target: "Middle Back Thickness",
      sets: 3,
      reps: "10-12",
      mediaType: "image",
      mediaSource: {
        uri: `${FREE_EXERCISE_DB}/Cable_Seated_Row/0.jpg`,
      },
      tip: "Avoid leaning back too far as you pull the handles.",
      setupSteps: [
        "Sit with feet on footrests and knees slightly bent.",
        "Grip handles and keep torso erect.",
        "Pull handle toward belly button squeezing shoulder blades together.",
      ],
      mistakes: ["Do not rock your torso backward and forward"],
    },
  ],

  shoulders: [
    {
      id: "s1",
      name: "Barbell Shoulder Press",
      muscle: "shoulders",
      target: "Overall Shoulders",
      sets: 3,
      reps: "8-10",
      mediaType: "image",
      mediaSource: { uri: `${FREE_EXERCISE_DB}/Barbell_Shoulder_Press/0.jpg` },
      tip: "Keep your stomach tight so your back does not bend too much.",
      setupSteps: [
        "Sit or stand. Hold the bar at shoulder level with palms facing forward.",
        "Push the bar straight up until your arms are straight.",
        "Slowly bring the bar back down to your shoulders.",
      ],
      mistakes: [
        "Do not lean back too much to push the weight up",
        "Do not open your elbows out too wide",
      ],
    },
    {
      id: "s2",
      name: "Arnold Dumbbell Press",
      muscle: "shoulders",
      target: "Full Deltoid Range",
      sets: 3,
      reps: "10-12",
      mediaType: "image",
      mediaSource: { uri: `${FREE_EXERCISE_DB}/Arnold_Dumbbell_Press/0.jpg` },
      tip: "Turning your hands during the press works your shoulder from more angles.",
      setupSteps: [
        "Hold dumbbells in front of your shoulders with palms facing you.",
        "Push up while turning palms facing forward.",
        "Turn palms back as you lower weights.",
      ],
      mistakes: ["Do not use weight too heavy to turn properly"],
    },
  ],

  biceps: [
    {
      id: "bi1",
      name: "Dumbbell Bicep Curl",
      muscle: "biceps",
      target: "Biceps Short & Long Head",
      sets: 3,
      reps: "10-12",
      mediaType: "image",
      mediaSource: { uri: `${FREE_EXERCISE_DB}/Dumbbell_Bicep_Curl/0.jpg` },
      tip: "Keep your elbows pinned near your torso.",
      setupSteps: [
        "Stand tall holding dumbbells at arm's length.",
        "Curl weights up while rotating wrists outwards.",
        "Lower back down smoothly.",
      ],
      mistakes: ["Do not swing your lower back"],
    },
  ],

  triceps: [
    {
      id: "t1",
      name: "Triceps Pushdown",
      muscle: "triceps",
      target: "Triceps Lateral & Medial Head",
      sets: 3,
      reps: "12-15",
      mediaType: "image",
      mediaSource: { uri: `${FREE_EXERCISE_DB}/Cable_Pushdown/0.jpg` },
      tip: "Keep upper arms still and bend only at the elbows.",
      setupSteps: [
        "Attach bar or rope to high cable pulley.",
        "Push down until arms are fully extended.",
        "Slowly control back up to chest level.",
      ],
      mistakes: ["Do not let elbows flare forward"],
    },
  ],

  abs: [
    {
      id: "a1",
      name: "Abdominal Crunch",
      muscle: "abs",
      target: "Upper Rectus Abdominis",
      sets: 3,
      reps: "15-20",
      mediaType: "image",
      mediaSource: { uri: `${FREE_EXERCISE_DB}/Crunch/0.jpg` },
      tip: "Focus on curling your ribs down toward your hips.",
      setupSteps: [
        "Lie on back with knees bent and feet flat.",
        "Curl shoulders off ground squeezed abs.",
        "Lower back down slowly.",
      ],
      mistakes: ["Do not pull on your neck"],
    },
    {
      id: "a2",
      name: "Hanging Leg Raise",
      muscle: "abs",
      target: "Lower Abs & Core",
      sets: 3,
      reps: "10-12",
      mediaType: "image",
      mediaSource: { uri: `${FREE_EXERCISE_DB}/Hanging_Leg_Raise/0.jpg` },
      tip: "Control the movement to avoid swinging.",
      setupSteps: [
        "Hang from pull-up bar with straight arms.",
        "Raise legs up until parallel to floor.",
        "Lower under control.",
      ],
      mistakes: ["Do not use momentum to swing legs"],
    },
  ],

  legs: [
    {
      id: "l1",
      name: "Machine Leg Extension",
      muscle: "legs",
      target: "Quadriceps Isolation",
      sets: 3,
      reps: "12-15",
      mediaType: "image",
      mediaSource: { uri: `${FREE_EXERCISE_DB}/Leg_Extensions/0.jpg` },
      tip: "Pause 1 second at the top lock-out.",
      setupSteps: [
        "Adjust seat back pad so your knees line up with pivot.",
        "Extend legs upward until straight.",
        "Lower back down smoothly.",
      ],
      mistakes: ["Do not kick weight up explosively"],
    },
    {
      id: "l6",
      name: "Machine Leg Curl",
      muscle: "legs",
      target: "Hamstrings",
      sets: 3,
      reps: "12-15",
      mediaType: "image",
      mediaSource: { uri: `${FREE_EXERCISE_DB}/Lying_Leg_Curl/0.jpg` },
      tip: "Keep hips pressed firmly into pad throughout movement.",
      setupSteps: [
        "Lie face down on leg curl machine.",
        "Curl legs upward towards glutes.",
        "Lower back down under control.",
      ],
      mistakes: ["Do not lift hips off pad to force weight up"],
    },
  ],
};
