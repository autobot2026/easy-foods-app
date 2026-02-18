# easy-foods — Screen-by-screen user flow

## 1) Welcome / Today’s Meal
- Header: “What do you want to eat today?”
- Primary action: **Pick protein**
- Secondary: “Surprise me” (optional future feature)

## 2) Protein Picker (required)
- Group proteins by category (Poultry, Beef, Pork, Seafood, Plant-Based)
- Tap one protein card
- Inline helper text: “You’ll pick 1–3 sides next.”

## 3) Side Picker (required: 1 to 3)
- Multi-select side cards (limit enforced)
- Smart row at top: “Pairs well with your protein” suggestions
- If user hasn’t picked sides yet, show top recommended defaults

## 4) Optional Preferences
- Servings (default 2)
- Skill level: beginner / intermediate
- Cooking method: stovetop / oven / air fryer / grill
- Time limit (minutes)
- Flavor style: quick / healthy / comfort / spicy

## 5) Pairing Check (advisory, non-blocking)
- If combo is weak, show warning:
  - “This combo may feel heavy / clash in texture / miss acidity.”
- Offer 2–3 better side alternatives
- Buttons:
  - **Keep my combo**
  - **Swap sides**

## 6) Recipe Output Screen
Render from output JSON:
- Recipe title + summary
- Ingredients with exact measurements
- Step-by-step instructions
- Per-step time + total cook time
- In-line technique tips
- Substitutions
- Common mistakes
- Shopping list grouped by category

## 7) Save / Regenerate
- Save meal plan
- Regenerate with same protein + different side suggestions
- Scale servings up/down and re-render measurements
