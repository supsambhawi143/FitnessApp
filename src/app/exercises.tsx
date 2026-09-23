export interface Exercise {
  id: string;
  name: string;
  muscle: string;
  target: string;
  sets: number;
  reps: string;
  mediaType: "video" | "gif" | "image";
  mediaSource: { uri: string } | number; // Remote object or local require()
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
  { id: "legs", label: "Legs" },
  { id: "shoulders", label: "Shoulders" },
  { id: "arms", label: "Arms" },
  { id: "abs", label: "Abs" },
];

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
      tip: "Keep feet flat on floor and arch lower back slightly.",
      setupSteps: [
        "Lie flat on the bench, eyes directly under the bar.",
        "Grip slightly wider than shoulder-width.",
        "Unrack and lower bar smoothly to mid-chest.",
        "Press up explosively until arms are extended.",
      ],
      mistakes: ["Bouncing the bar off chest", "Flaring elbows to 90 degrees"],
    },
    {
      id: "c2",
      name: "Dumbbell Bench Press",
      muscle: "chest",
      target: "Mid Chest & Balance",
      sets: 3,
      reps: "10-12",
      mediaType: "gif",
      mediaSource: {
        uri: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Bench_Press/0.gif",
      },
      tip: "Tuck elbows to 45 degrees relative to torso.",
      setupSteps: [
        "Sit on bench with dumbbells resting on thighs.",
        "Kick dumbbells back as you lie down.",
        "Press dumbbells straight up above chest.",
        "Lower until dumbbells are aligned with mid-chest.",
      ],
      mistakes: [
        "Colliding dumbbells hard at the top",
        "Dropping weight too fast",
      ],
    },
    {
      id: "c3",
      name: "Incline Barbell Press",
      muscle: "chest",
      target: "Upper Chest",
      sets: 3,
      reps: "8-10",
      mediaType: "gif",
      mediaSource: {
        uri: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Incline_Bench_Press/0.gif",
      },
      tip: "Set bench incline between 30 and 45 degrees.",
      setupSteps: [
        "Set bench to 30-45 degree angle.",
        "Lower bar controlled to upper collarbone area.",
        "Press back up over eyes.",
      ],
      mistakes: [
        "Setting bench angle higher than 45 degrees (turns into shoulders)",
      ],
    },
    {
      id: "c4",
      name: "Incline Dumbbell Press",
      muscle: "chest",
      target: "Upper Chest Focus",
      sets: 3,
      reps: "10-12",
      mediaType: "gif",
      mediaSource: {
        uri: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Incline_Bench_Press/0.gif",
      },
      tip: "Keep chest proud throughout movement.",
      setupSteps: [
        "Lie back on incline bench.",
        "Press weights overhead without locking elbows out rigidly.",
        "Slowly lower back down to chest line.",
      ],
      mistakes: ["Arching lower back off the bench"],
    },
    {
      id: "c5",
      name: "Decline Bench Press",
      muscle: "chest",
      target: "Lower Chest",
      sets: 3,
      reps: "10-12",
      mediaType: "gif",
      mediaSource: {
        uri: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Decline_Bench_Press/0.gif",
      },
      tip: "Secure legs under pad before lifting weight.",
      setupSteps: [
        "Hook legs securely in decline bench.",
        "Unrack bar and lower to lower sternum.",
        "Press straight up.",
      ],
      mistakes: ["Unlocking legs during heavy reps"],
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
      tip: "Adjust seat so handles align with middle chest.",
      setupSteps: [
        "Adjust seat height.",
        "Grip handles and keep upper back flat against pad.",
        "Push forward until arms extend.",
      ],
      mistakes: ["Shrugging shoulders forward during push"],
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
      tip: "Squeeze handles together and hold for 1 second.",
      setupSteps: [
        "Sit back into pad with arms extended out.",
        "Bring handles together in front of chest with slight bend in elbows.",
        "Slowly open arms wide until chest stretches.",
      ],
      mistakes: ["Bending elbows excessively during fly"],
    },
    {
      id: "c8",
      name: "Hammer Strength Chest Press",
      muscle: "chest",
      target: "Mid/Upper Chest Isolation",
      sets: 3,
      reps: "10-12",
      mediaType: "gif",
      mediaSource: {
        uri: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Leverage_Incline_Chest_Press/0.gif",
      },
      tip: "Great for heavy pressing safely without spotter.",
      setupSteps: [
        "Load weight plates onto machine horns.",
        "Sit firmly with back against pad.",
        "Press handles forward smoothly.",
      ],
      mistakes: ["Flaring shoulders up toward ears"],
    },
    {
      id: "c9",
      name: "Chest Dips",
      muscle: "chest",
      target: "Lower Chest & Triceps",
      sets: 3,
      reps: "8-10",
      mediaType: "gif",
      mediaSource: {
        uri: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Chest_Dip/0.gif",
      },
      tip: "Lean torso forward 30 degrees to target chest rather than triceps.",
      setupSteps: [
        "Grip dip bars and elevate body.",
        "Lean chest forward slightly.",
        "Lower body until upper arms are parallel with floor.",
        "Push back up to starting position.",
      ],
      mistakes: ["Staying completely vertical (loads triceps only)"],
    },
    {
      id: "c10",
      name: "Push-ups",
      muscle: "chest",
      target: "Core & Chest Bodyweight",
      sets: 3,
      reps: "12-15",
      mediaType: "gif",
      mediaSource: {
        uri: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Push-up/0.gif",
      },
      tip: "Keep body in rigid straight line from head to heels.",
      setupSteps: [
        "Hands slightly wider than shoulders on floor.",
        "Lower body until chest almost touches floor.",
        "Push floor away back to top position.",
      ],
      mistakes: ["Hips sagging toward floor"],
    },
  ],
  back: [],
  legs: [],
  shoulders: [],
  arms: [],
  abs: [],
};
