import { CardDefinition, CardPack, CardVariant, PulledCard, Rarity, UserState } from '@/types';
import { ALL_CARDS } from '@/data/cards';

// Base Rarity Probabilities
export const RARITY_RATES: { rarity: Rarity; rate: number }[] = [
  { rarity: 'EX', rate: 0.005 },  // 0.5%
  { rarity: 'UR', rate: 0.025 },  // 2.5%
  { rarity: 'SSR', rate: 0.06 },  // 6.0%
  { rarity: 'SR', rate: 0.14 },   // 14.0%
  { rarity: 'R', rate: 0.27 },    // 27.0%
  { rarity: 'N', rate: 0.50 },    // 50.0%
];

// Independent Variant Probabilities
export const VARIANT_RATES: { variant: CardVariant; rate: number }[] = [
  { variant: 'Prismatic Signature', rate: 0.002 }, // 0.2%
  { variant: 'Abyss Edition', rate: 0.008 },       // 0.8%
  { variant: 'Living Card', rate: 0.015 },         // 1.5%
  { variant: 'Royal Gold', rate: 0.025 },          // 2.5%
  { variant: 'Holographic', rate: 0.05 },          // 5.0%
  { variant: 'Silver Foil', rate: 0.08 },          // 8.0%
  { variant: 'Normal', rate: 0.82 },               // 82.0%
];

/**
 * Rolls a card variant independently based on rates
 */
export function rollCardVariant(rng: () => number = Math.random): CardVariant {
  const roll = rng();
  let cumulative = 0;
  for (const item of VARIANT_RATES) {
    cumulative += item.rate;
    if (roll < cumulative) {
      return item.variant;
    }
  }
  return 'Normal';
}

/**
 * Deterministic rarity roll with strict pity guarantee priority:
 * Priority order: EX Pity (200) > UR Pity (50) > SR Pity (10)
 */
export function rollRarityWithPity(
  state: Pick<UserState, 'srPity' | 'urPity' | 'exPity'>,
  rng: () => number = Math.random
): {
  rarity: Rarity;
  pityTriggered: 'EX' | 'UR' | 'SR' | null;
  updatedPity: { srPity: number; urPity: number; exPity: number };
} {
  const nextSrPity = state.srPity + 1;
  const nextUrPity = state.urPity + 1;
  const nextExPity = state.exPity + 1;

  // 1. Highest Priority: EX Pity at 200
  if (nextExPity >= 200) {
    return {
      rarity: 'EX',
      pityTriggered: 'EX',
      updatedPity: {
        srPity: 0,
        urPity: 0,
        exPity: 0,
      },
    };
  }

  // 2. Second Priority: UR Pity at 50 (Guarantees UR or EX)
  if (nextUrPity >= 50) {
    // Check if lucky enough to hit EX during UR pity (0.5% / (2.5% + 0.5%))
    const exChance = 0.005 / (0.025 + 0.005);
    const isEx = rng() < exChance;
    const finalRarity: Rarity = isEx ? 'EX' : 'UR';

    return {
      rarity: finalRarity,
      pityTriggered: 'UR',
      updatedPity: {
        srPity: 0,
        urPity: 0,
        exPity: isEx ? 0 : nextExPity,
      },
    };
  }

  // 3. Third Priority: SR Pity at 10 (Guarantees SR, SSR, UR, or EX)
  if (nextSrPity >= 10) {
    // Sum of SR+ probabilities: 0.14 + 0.06 + 0.025 + 0.005 = 0.23
    const srPlusTotal = 0.14 + 0.06 + 0.025 + 0.005;
    const srPlusRoll = rng() * srPlusTotal;

    let finalRarity: Rarity = 'SR';
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

  // 4. Standard Roll without Pity
  const roll = rng();
  let cumulative = 0;
  let rolledRarity: Rarity = 'N';

  for (const item of RARITY_RATES) {
    cumulative += item.rate;
    if (roll < cumulative) {
      rolledRarity = item.rarity;
      break;
    }
  }

  // Calculate new pity counters based on rolled rarity
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
    updatedPity: {
      srPity: newSr,
      urPity: newUr,
      exPity: newEx,
    },
  };
}

/**
 * Selects an appropriate card from the pack given the rolled rarity
 */
export function selectCardForPack(
  pack: CardPack,
  rarity: Rarity,
  rng: () => number = Math.random
): CardDefinition {
  // First, look for cards in the specific pack's series with the target rarity
  let candidateCards = ALL_CARDS.filter(
    (c) => c.series === pack.seriesId && c.rarity === rarity
  );

  // If no card of this rarity in the pack's series (e.g. some festival series don't have N/R),
  // fallback to all cards of that rarity across all series
  if (candidateCards.length === 0) {
    candidateCards = ALL_CARDS.filter((c) => c.rarity === rarity);
  }

  // If still empty (safety guard), fallback to any card in this series or all cards
  if (candidateCards.length === 0) {
    candidateCards = ALL_CARDS;
  }

  const selectedIndex = Math.floor(rng() * candidateCards.length);
  return candidateCards[selectedIndex];
}

/**
 * Executes a single pull
 */
export function executeSinglePull(
  pack: CardPack,
  currentState: UserState,
  ownedCardIds: Set<string>,
  rng: () => number = Math.random
): {
  pulledCard: PulledCard;
  nextState: UserState;
} {
  const { rarity, updatedPity } = rollRarityWithPity(currentState, rng);
  const card = selectCardForPack(pack, rarity, rng);
  const variant = rollCardVariant(rng);
  const isNew = !ownedCardIds.has(card.id);

  const pulledCard: PulledCard = {
    card,
    variant,
    pulledAt: new Date().toISOString(),
    isNew,
  };

  const nextState: UserState = {
    ...currentState,
    dailyPullsRemaining: Math.max(0, currentState.dailyPullsRemaining - 1),
    totalPulls: currentState.totalPulls + 1,
    srPity: updatedPity.srPity,
    urPity: updatedPity.urPity,
    exPity: updatedPity.exPity,
  };

  return { pulledCard, nextState };
}

/**
 * Executes multiple pulls (e.g. 1, 5, or 10 pulls)
 */
export function executeBatchPull(
  pack: CardPack,
  count: number,
  currentState: UserState,
  ownedCardIds: Set<string>,
  rng: () => number = Math.random
): {
  pulledCards: PulledCard[];
  nextState: UserState;
} {
  const pulledCards: PulledCard[] = [];
  let workingState = { ...currentState };
  const workingOwned = new Set(ownedCardIds);

  for (let i = 0; i < count; i++) {
    const { pulledCard, nextState } = executeSinglePull(pack, workingState, workingOwned, rng);
    pulledCards.push(pulledCard);
    workingState = nextState;
    workingOwned.add(pulledCard.card.id);
  }

  return { pulledCards, nextState: workingState };
}

/**
 * Simulation verification for unit testing gacha rate integrity
 */
export function simulatePityVerification(totalPulls = 10000): {
  pulls: number;
  rarityCounts: Record<Rarity, number>;
  variantCounts: Record<CardVariant, number>;
  maxConsecutiveWithoutSR: number;
  maxConsecutiveWithoutUR: number;
  maxConsecutiveWithoutEX: number;
} {
  let state: UserState = {
    dailyPullsRemaining: 999999,
    lastPullDateTaipei: '2026-10-16',
    srPity: 0,
    urPity: 0,
    exPity: 0,
    totalPulls: 0,
    showcaseCardIds: [],
  };

  const rarityCounts: Record<Rarity, number> = { N: 0, R: 0, SR: 0, SSR: 0, UR: 0, EX: 0 };
  const variantCounts: Record<CardVariant, number> = {
    Normal: 0,
    'Silver Foil': 0,
    Holographic: 0,
    'Royal Gold': 0,
    'Living Card': 0,
    'Abyss Edition': 0,
    'Prismatic Signature': 0,
  };

  let maxSrPityObserved = 0;
  let maxUrPityObserved = 0;
  let maxExPityObserved = 0;

  for (let i = 0; i < totalPulls; i++) {
    const srBefore = state.srPity;
    const urBefore = state.urPity;
    const exBefore = state.exPity;

    if (srBefore > maxSrPityObserved) maxSrPityObserved = srBefore;
    if (urBefore > maxUrPityObserved) maxUrPityObserved = urBefore;
    if (exBefore > maxExPityObserved) maxExPityObserved = exBefore;

    const { rarity, updatedPity } = rollRarityWithPity(state);
    const variant = rollCardVariant();

    rarityCounts[rarity]++;
    variantCounts[variant]++;

    state = {
      ...state,
      srPity: updatedPity.srPity,
      urPity: updatedPity.urPity,
      exPity: updatedPity.exPity,
      totalPulls: state.totalPulls + 1,
    };
  }

  return {
    pulls: totalPulls,
    rarityCounts,
    variantCounts,
    maxConsecutiveWithoutSR: maxSrPityObserved,
    maxConsecutiveWithoutUR: maxUrPityObserved,
    maxConsecutiveWithoutEX: maxExPityObserved,
  };
}
