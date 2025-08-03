const SCORING_COMBINATIONS = {
  STRAIGHT: { dice: [1, 2, 3, 4, 5, 6], score: 1500 },
  THREE_PAIRS: { score: 1500 },
  SIX_OF_A_KIND: { score: 3000 },
  FIVE_OF_A_KIND: { multiplier: 2 },
  FOUR_OF_A_KIND: { multiplier: 2 },
  THREE_OF_A_KIND: {
    1: 1000,
    2: 200,
    3: 300,
    4: 400,
    5: 500,
    6: 600
  },
  SINGLE_DICE: {
    1: 100,
    5: 50
  }
};

function validateDiceRoll(dice) {
  if (!Array.isArray(dice) || dice.length !== 6) {
    return { valid: false, error: 'Must roll exactly 6 dice' };
  }
  
  for (let die of dice) {
    if (!Number.isInteger(die) || die < 1 || die > 6) {
      return { valid: false, error: 'All dice must be integers between 1 and 6' };
    }
  }
  
  return { valid: true };
}

function countDice(dice) {
  const counts = {};
  for (let i = 1; i <= 6; i++) {
    counts[i] = 0;
  }
  
  dice.forEach(die => {
    counts[die]++;
  });
  
  return counts;
}

function calculateScore(dice) {
  const validation = validateDiceRoll(dice);
  if (!validation.valid) {
    return { score: 0, error: validation.error, combinations: [] };
  }

  const counts = countDice(dice);
  const sortedDice = [...dice].sort((a, b) => a - b);
  let score = 0;
  let combinations = [];
  let usedDice = new Array(6).fill(false);

  if (JSON.stringify(sortedDice) === JSON.stringify([1, 2, 3, 4, 5, 6])) {
    return {
      score: SCORING_COMBINATIONS.STRAIGHT.score,
      combinations: ['Straight (1-2-3-4-5-6)'],
      usedDice: new Array(6).fill(true)
    };
  }

  const pairs = Object.values(counts).filter(count => count === 2).length;
  if (pairs === 3) {
    return {
      score: SCORING_COMBINATIONS.THREE_PAIRS.score,
      combinations: ['Three Pairs'],
      usedDice: new Array(6).fill(true)
    };
  }

  for (let value = 1; value <= 6; value++) {
    const count = counts[value];
    
    if (count === 6) {
      score += SCORING_COMBINATIONS.SIX_OF_A_KIND.score;
      combinations.push(`Six ${value}s`);
      return { score, combinations, usedDice: new Array(6).fill(true) };
    }
    
    if (count >= 5) {
      const baseScore = value === 1 ? 1000 : value * 100;
      score += baseScore * SCORING_COMBINATIONS.FIVE_OF_A_KIND.multiplier;
      combinations.push(`Five ${value}s`);
      
      const diceIndices = [];
      for (let i = 0; i < dice.length && diceIndices.length < 5; i++) {
        if (dice[i] === value) {
          diceIndices.push(i);
        }
      }
      diceIndices.forEach(index => usedDice[index] = true);
      
      counts[value] -= 5;
    } else if (count >= 4) {
      const baseScore = value === 1 ? 1000 : value * 100;
      score += baseScore * SCORING_COMBINATIONS.FOUR_OF_A_KIND.multiplier;
      combinations.push(`Four ${value}s`);
      
      const diceIndices = [];
      for (let i = 0; i < dice.length && diceIndices.length < 4; i++) {
        if (dice[i] === value) {
          diceIndices.push(i);
        }
      }
      diceIndices.forEach(index => usedDice[index] = true);
      
      counts[value] -= 4;
    } else if (count >= 3) {
      score += SCORING_COMBINATIONS.THREE_OF_A_KIND[value];
      combinations.push(`Three ${value}s`);
      
      const diceIndices = [];
      for (let i = 0; i < dice.length && diceIndices.length < 3; i++) {
        if (dice[i] === value && !usedDice[i]) {
          diceIndices.push(i);
        }
      }
      diceIndices.forEach(index => usedDice[index] = true);
      
      counts[value] -= 3;
    }
  }

  for (let value of [1, 5]) {
    if (counts[value] > 0) {
      const singleScore = SCORING_COMBINATIONS.SINGLE_DICE[value];
      score += singleScore * counts[value];
      combinations.push(`${counts[value]} single ${value}${counts[value] > 1 ? 's' : ''}`);
      
      let found = 0;
      for (let i = 0; i < dice.length && found < counts[value]; i++) {
        if (dice[i] === value && !usedDice[i]) {
          usedDice[i] = true;
          found++;
        }
      }
    }
  }

  const isFarkle = score === 0;
  
  return {
    score,
    combinations: combinations.length > 0 ? combinations : ['Farkle (no scoring dice)'],
    usedDice,
    isFarkle
  };
}

function canContinueRolling(dice, selectedDice) {
  if (!selectedDice || selectedDice.length === 0) {
    return false;
  }
  
  const result = calculateScore(selectedDice);
  return result.score > 0;
}

module.exports = {
  calculateScore,
  validateDiceRoll,
  canContinueRolling,
  SCORING_COMBINATIONS
};