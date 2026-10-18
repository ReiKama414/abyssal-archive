// Test script to verify gacha pity and probability distributions

const RARITY_RATES = [
  { rarity: 'EX', rate: 0.005 },
  { rarity: 'UR', rate: 0.025 },
  { rarity: 'SSR', rate: 0.06 },
  { rarity: 'SR', rate: 0.14 },
  { rarity: 'R', rate: 0.27 },
  { rarity: 'N', rate: 0.50 },
];

function rollRarityWithPity(state, rng = Math.random) {
  const nextSrPity = state.srPity + 1;
  const nextUrPity = state.urPity + 1;
  const nextExPity = state.exPity + 1;

  if (nextExPity >= 200) {
    return {
      rarity: 'EX',
      pityTriggered: 'EX',
      updatedPity: { srPity: 0, urPity: 0, exPity: 0 },
    };
  }

  if (nextUrPity >= 50) {
    const exChance = 0.005 / (0.025 + 0.005);
    const isEx = rng() < exChance;
    const finalRarity = isEx ? 'EX' : 'UR';
    return {
      rarity: finalRarity,
      pityTriggered: 'UR',
      updatedPity: { srPity: 0, urPity: 0, exPity: isEx ? 0 : nextExPity },
    };
  }

  if (nextSrPity >= 10) {
    const srPlusTotal = 0.14 + 0.06 + 0.025 + 0.005;
    const srPlusRoll = rng() * srPlusTotal;
    let finalRarity = 'SR';
    if (srPlusRoll < 0.005) {
      finalRarity = 'EX';
    } else if (srPlusRoll < 0.005 + 0.025) {
      finalRarity = 'UR';
    } else if (srPlusRoll < 0.005 + 0.025 + 0.06) {
      finalRarity = 'SSR';
    } else {
      finalRarity = 'SR';
    }

    return {
      rarity: finalRarity,
      pityTriggered: 'SR',
      updatedPity: {
        srPity: 0,
        urPity: finalRarity === 'UR' || finalRarity === 'EX' ? 0 : nextUrPity,
        exPity: finalRarity === 'EX' ? 0 : nextExPity,
      },
    };
  }

  const roll = rng();
  let cumulative = 0;
  let rolledRarity = 'N';

  for (const item of RARITY_RATES) {
    cumulative += item.rate;
    if (roll < cumulative) {
      rolledRarity = item.rarity;
      break;
    }
  }

  let newSr = nextSrPity;
  let newUr = nextUrPity;
  let newEx = nextExPity;

  if (rolledRarity === 'EX') {
    newSr = 0;
    newUr = 0;
    newEx = 0;
  } else if (rolledRarity === 'UR') {
    newSr = 0;
    newUr = 0;
  } else if (rolledRarity === 'SSR' || rolledRarity === 'SR') {
    newSr = 0;
  }

  return {
    rarity: rolledRarity,
    pityTriggered: null,
    updatedPity: { srPity: newSr, urPity: newUr, exPity: newEx },
  };
}

console.log('--- Running Gacha Pity & Rate 100,000 Pull Simulation ---');
let state = { srPity: 0, urPity: 0, exPity: 0 };
const counts = { N: 0, R: 0, SR: 0, SSR: 0, UR: 0, EX: 0 };
let maxSrPityObserved = 0;
let maxUrPityObserved = 0;
let maxExPityObserved = 0;

const TOTAL_PULLS = 100000;

for (let i = 0; i < TOTAL_PULLS; i++) {
  if (state.srPity > maxSrPityObserved) maxSrPityObserved = state.srPity;
  if (state.urPity > maxUrPityObserved) maxUrPityObserved = state.urPity;
  if (state.exPity > maxExPityObserved) maxExPityObserved = state.exPity;

  const res = rollRarityWithPity(state);
  counts[res.rarity]++;
  state = res.updatedPity;
}

console.log('Results:');
for (const [r, count] of Object.entries(counts)) {
  console.log(`  ${r}: ${count} (${((count / TOTAL_PULLS) * 100).toFixed(2)}%)`);
}

console.log(`Max SR Pity Counter Before Pull: ${maxSrPityObserved} (Limit <= 9 -> Guaranteed at 10: ${maxSrPityObserved <= 9 ? 'PASSED' : 'FAILED'})`);
console.log(`Max UR Pity Counter Before Pull: ${maxUrPityObserved} (Limit <= 49 -> Guaranteed at 50: ${maxUrPityObserved <= 49 ? 'PASSED' : 'FAILED'})`);
console.log(`Max EX Pity Counter Before Pull: ${maxExPityObserved} (Limit <= 199 -> Guaranteed at 200: ${maxExPityObserved <= 199 ? 'PASSED' : 'FAILED'})`);

if (maxSrPityObserved <= 9 && maxUrPityObserved <= 49 && maxExPityObserved <= 199) {
  console.log('>>> ALL PITY AND GUARANTEE TESTS PASSED SUCCESSFULLY! <<<');
} else {
  console.error('>>> TEST FAILED! <<<');
  process.exit(1);
}
