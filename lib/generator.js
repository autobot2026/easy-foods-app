export function evaluatePairing({ protein, selectedSides, flavorStyle, pairingRules }) {
  if (!selectedSides?.length) {
    return { status: 'weak', message: 'Pick at least one side.', suggestedSwaps: ['Garden Salad', 'Roasted Broccoli'] };
  }

  const heavy = ['Mac and Cheese', 'Loaded Mashed Potatoes', 'Scalloped Potatoes', 'Creamed Corn'];
  const heavyCount = selectedSides.filter(s => heavy.includes(s)).length;

  if (heavyCount >= 2) {
    return {
      status: 'weak',
      message: 'This combo may feel too heavy and one-note.',
      suggestedSwaps: ['Garlic Asparagus', 'Lemon Arugula Salad', 'Cabbage Slaw']
    };
  }

  const seafood = ['Salmon', 'Cod', 'Tilapia', 'Shrimp', 'Scallops', 'Tuna Steak', 'Trout'];
  if (seafood.includes(protein) && heavyCount >= 1 && selectedSides.length >= 2) {
    return {
      status: 'weak',
      message: 'Seafood usually tastes better with one lighter, brighter side.',
      suggestedSwaps: ['Cucumber Tomato Salad', 'Roasted Broccoli', 'Quinoa']
    };
  }

  if (flavorStyle === 'spicy' && !selectedSides.some(s => ['Cucumber Tomato Salad', 'Herbed Yogurt Slaw', 'Tzatziki'].includes(s))) {
    return {
      status: 'good',
      message: 'Consider one cooling side to balance heat.',
      suggestedSwaps: ['Herbed Yogurt Slaw', 'Cucumber Tomato Salad', 'Tzatziki']
    };
  }

  return { status: 'great', message: 'Strong, balanced pairing.', suggestedSwaps: [] };
}

export function generateDisguisePlan({ selectedSides, servings, skillLevel }) {
  const strategyMap = [
    {
      test: /broccoli|cauliflower|carrots|zucchini|spinach|kale|bok choy|cabbage|peas|green beans/i,
      method: 'Blend into sauce',
      visibility: 'Low',
      tasteImpact: 'Mild',
      steps: [
        'Steam or sauté until very soft.',
        'Blend with 2–4 tbsp broth or milk until smooth.',
        'Fold into pasta sauce, rice, or mashed sides in small additions.'
      ],
      fallback: 'If noticed, add a little cheese, garlic butter, or lemon to rebalance flavor.'
    },
    {
      test: /salad|slaw|tomato|cucumber|arugula/i,
      method: 'Finely chop + creamy binder',
      visibility: 'Medium',
      tasteImpact: 'Mild',
      steps: [
        'Chop very fine (confetti size).',
        'Mix into yogurt dressing, mayo, or mashed avocado.',
        'Use as filling/topping in wraps, bowls, or sandwiches.'
      ],
      fallback: 'Serve some plain topping on the side and call this a “special sauce.”'
    },
    {
      test: /rice|quinoa|couscous|pilaf/i,
      method: 'Flavor masking + texture blend',
      visibility: 'Low',
      tasteImpact: 'Low',
      steps: [
        'Cook with flavorful stock instead of water.',
        'Mix in finely grated veggies while hot.',
        'Finish with butter/olive oil and seasoning for uniform taste.'
      ],
      fallback: 'If texture is questioned, add crispy topping (breadcrumbs/onions) for distraction.'
    }
  ];

  const perSide = selectedSides.map((side) => {
    const picked = strategyMap.find(s => s.test.test(side)) || {
      method: 'Mash + season',
      visibility: 'Medium',
      tasteImpact: 'Mild',
      steps: [
        'Cook until tender.',
        'Mash or pulse briefly to reduce recognizable texture.',
        'Season well and combine with a familiar base.'
      ],
      fallback: 'Reduce hidden amount by 25% and retry next round.'
    };

    const grams = Math.max(40, servings * 35);
    return {
      side,
      disguiseMethod: picked.method,
      hiddenAmountGuide: `${grams}g total (~${Math.round(grams / servings)}g per serving)` ,
      visibilityScore: picked.visibility,
      tasteImpact: picked.tasteImpact,
      instructions: picked.steps,
      fallbackIfNoticed: picked.fallback,
      skillNote: skillLevel === 'beginner'
        ? 'Start with half the hidden amount on first attempt.'
        : 'Layer in stages and taste between additions for better control.'
    };
  });

  return {
    title: 'Disguise Mode Plan',
    summary: 'Techniques to hide or soften side flavors/textures while keeping the meal balanced.',
    plans: perSide
  };
}

export function generateRecipe(input) {
  const { protein, selectedSides, servings, skillLevel, method, timeLimitMin, flavorStyle, pairing } = input;
  const sideText = selectedSides.join(' + ');

  const baseIngredients = [
    { item: protein, amount: `${Math.max(1, servings)} servings worth`, notes: null },
    { item: 'Olive oil', amount: `${Math.max(1, servings)} tbsp`, notes: null },
    { item: 'Salt', amount: `${(0.5 * servings).toFixed(1)} tsp`, notes: null },
    { item: 'Black pepper', amount: `${(0.25 * servings).toFixed(1)} tsp`, notes: null },
    ...selectedSides.map(s => ({ item: s, amount: `for ${servings} servings`, notes: 'from built-in side database' }))
  ];

  const steps = [
    {
      stepNumber: 1,
      instruction: `Prep ${protein} and preheat for ${method}.`,
      timeMin: 6,
      techniqueTip: skillLevel === 'beginner' ? 'Pat protein dry before seasoning for better browning.' : 'Season early for deeper flavor.'
    },
    {
      stepNumber: 2,
      instruction: `Cook ${protein} via ${method} until safely done.`,
      timeMin: 12,
      techniqueTip: 'Use a thermometer for doneness instead of guesswork.'
    },
    {
      stepNumber: 3,
      instruction: `Cook sides: ${sideText}.`,
      timeMin: 10,
      techniqueTip: 'Stagger start times so all components finish together.'
    },
    {
      stepNumber: 4,
      instruction: 'Plate, taste, and adjust salt/acid/spice before serving.',
      timeMin: 3,
      techniqueTip: 'A final squeeze of lemon or splash of vinegar brightens the dish.'
    }
  ];

  const total = steps.reduce((a, s) => a + s.timeMin, 0);
  const boundedTotal = timeLimitMin ? Math.min(total, timeLimitMin) : total;

  return {
    version: '1.0',
    type: 'easy-foods.recipe-output',
    request: {
      protein,
      sides: selectedSides,
      servings,
      skillLevel,
      method,
      timeLimitMin,
      flavorStyle
    },
    pairingFeedback: pairing,
    recipe: {
      title: `${flavorStyle[0].toUpperCase() + flavorStyle.slice(1)} ${protein} with ${sideText}`,
      summary: `A ${skillLevel}-friendly ${method} meal built from your picks.`,
      totalCookTimeMin: boundedTotal,
      ingredients: baseIngredients,
      steps,
      substitutions: [
        { original: 'Olive oil', swap: 'Avocado oil', impact: 'Higher smoke-point for high-heat methods.' },
        { original: protein, swap: 'Another protein in same category', impact: 'Timing changes slightly by thickness.' }
      ],
      commonMistakes: [
        { mistake: 'Overcrowding pan/tray', fix: 'Cook in batches for better browning.' },
        { mistake: 'Not tasting before serving', fix: 'Adjust salt + acid at the end.' }
      ]
    },
    shoppingList: {
      produce: ['Garlic', 'Lemon', ...selectedSides.filter(s => /salad|asparagus|broccoli|beans|carrots|bok choy|spinach|zucchini/i.test(s))],
      protein: [protein],
      dairy: selectedSides.some(s => /mac|creamed|cheesy|mashed/i.test(s)) ? ['Butter', 'Milk', 'Cheese'] : [],
      dryGoods: selectedSides.some(s => /rice|quinoa|couscous|pasta|noodles|polenta/i.test(s)) ? ['Selected grain/starch'] : [],
      spicesAndSauces: ['Salt', 'Black pepper', 'Olive oil'],
      other: []
    }
  };
}
