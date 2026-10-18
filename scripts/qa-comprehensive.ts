import fs from 'fs';
import path from 'path';
import { ALL_CARDS } from '../src/data/cards';
import { CARD_PACKS } from '../src/data/packs';
import { rollRarityWithPity, executeBatchPull, simulatePityVerification } from '../src/lib/gacha';
import { getTimeUntilTaipeiMidnight, isFestivalActive, getTaipeiDateString } from '../src/lib/time';
import { Rarity, UserState } from '../src/types';

console.log('====================================================');
console.log('   ABYSSAL ARCHIVE — 全方位自動化 QA 測試驗證');
console.log('====================================================\n');

let totalTests = 0;
let passedTests = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  [PASS] ${testName}`);
  } else {
    console.error(`  [FAIL] ${testName} ${detail ? `(${detail})` : ''}`);
  }
}

// ==========================================
// TEST SUITE 1: 414 CARDS DATA INTEGRITY
// ==========================================
console.log('>>> 1. 卡牌資料庫完整性測試 (414 Cards Data Integrity)');

assert(ALL_CARDS.length === 414, `總卡牌數為 414 張 (實際: ${ALL_CARDS.length})`);

const idSet = new Set<string>();
let duplicateIds = 0;
for (const card of ALL_CARDS) {
  if (idSet.has(card.id)) duplicateIds++;
  idSet.add(card.id);
}
assert(duplicateIds === 0, '卡牌 ID 全數唯一，無重複', `重複數: ${duplicateIds}`);

let missingFields = 0;
for (const card of ALL_CARDS) {
  if (
    !card.id ||
    !card.name ||
    !card.nameEn ||
    !card.series ||
    !card.rarity ||
    !card.description ||
    !card.flavorText ||
    !card.artist ||
    !card.element ||
    typeof card.powerRating !== 'number' ||
    !card.palette?.primary ||
    !card.palette?.glow
  ) {
    missingFields++;
  }
}
assert(missingFields === 0, '卡牌必填欄位 (名稱/描述/系列/稀有度/屬性/評分/配色) 100% 齊全');

// Check Permanent vs Festival card distribution
const seriesCounts: Record<string, number> = {};
for (const card of ALL_CARDS) {
  seriesCounts[card.series] = (seriesCounts[card.series] || 0) + 1;
}
assert(seriesCounts['abyssal-jellyfish'] === 72, '深海水母系列卡牌數為 72 張');
assert(seriesCounts['nocturne-fantasy'] === 72, '夜想魔女系列卡牌數為 72 張');
assert(seriesCounts['neon-district'] === 72, '霓虹特區系列卡牌數為 72 張');
assert(seriesCounts['phantom-beasts'] === 72, '幻獸靈域系列卡牌數為 72 張');

const festivalKeys = [
  'halloween', 'christmas', 'new-year', 'valentines',
  'sakura-festival', 'summer-festival', 'mid-autumn',
  'anniversary', 'abyss-eclipse'
];
let allFestivalsValid = true;
for (const f of festivalKeys) {
  if (seriesCounts[f] !== 14) {
    allFestivalsValid = false;
    console.error(`Festival ${f} count: ${seriesCounts[f]}`);
  }
}
assert(allFestivalsValid, '九大節慶系列各有 14 張限定卡牌 (共 126 張)');

// ==========================================
// TEST SUITE 2: IMAGE ASSETS VERIFICATION
// ==========================================
console.log('\n>>> 2. 圖片素材與路徑檢查 (Images On Disk Verification)');

let missingImageFiles = 0;
let zeroByteFiles = 0;
for (const card of ALL_CARDS) {
  if (!card.customImageUrl) {
    missingImageFiles++;
    continue;
  }
  const fullPath = path.join(process.cwd(), 'public', card.customImageUrl.replace(/^\//, ''));
  if (!fs.existsSync(fullPath)) {
    missingImageFiles++;
  } else {
    const stat = fs.statSync(fullPath);
    if (stat.size === 0) zeroByteFiles++;
  }
}
assert(missingImageFiles === 0, '414 張卡牌圖片檔案皆存在於 public/cards/ (0 缺失)');
assert(zeroByteFiles === 0, '414 張卡牌圖片檔案皆有效且大於 0 bytes (0 空白檔案)');

// ==========================================
// TEST SUITE 3: CARD PACKS DEFINITION
// ==========================================
console.log('\n>>> 3. 卡包設定檢查 (Card Packs Definition)');

assert(CARD_PACKS.length === 13, `共設定 13 款卡包 (4款永久 + 9款節慶) (實際: ${CARD_PACKS.length})`);
const permanentPacks = CARD_PACKS.filter(p => p.isPermanent);
const festivalPacks = CARD_PACKS.filter(p => !p.isPermanent);
assert(permanentPacks.length === 4, '4 款永久卡包定義完整');
assert(festivalPacks.length === 9, '9 款節慶限定卡包定義完整');

let packsWithInvalidFeatured = 0;
for (const pack of CARD_PACKS) {
  for (const cardId of pack.featuredCardIds) {
    if (!idSet.has(cardId)) {
      packsWithInvalidFeatured++;
      console.error(`Pack ${pack.id} has invalid featured card: ${cardId}`);
    }
  }
}
assert(packsWithInvalidFeatured === 0, '所有卡包的代表焦點卡皆對應有效卡牌 ID');

// ==========================================
// TEST SUITE 4: GACHA PITY & ALGORITHM
// ==========================================
console.log('\n>>> 4. 抽卡保底與機率演算法測試 (Gacha Pity & Probabilities)');

// Test 1: SR Guarantee on 10th pull
const stateSRNear = { srPity: 9, urPity: 0, exPity: 0 };
const rollSR = rollRarityWithPity(stateSRNear);
assert(rollSR.pityTriggered === 'SR', '第 10 抽觸發 SR 保底判定');
const srEligible: Rarity[] = ['SR', 'SSR', 'UR', 'EX'];
assert(srEligible.includes(rollSR.rarity), `第 10 抽保底獲得 SR 或以上 (獲得: ${rollSR.rarity})`);
assert(rollSR.updatedPity.srPity === 0, 'SR 保底觸發後計數歸零');

// Test 2: UR Guarantee on 50th pull
const stateURNear = { srPity: 9, urPity: 49, exPity: 0 };
const rollUR = rollRarityWithPity(stateURNear);
assert(rollUR.pityTriggered === 'UR', '第 50 抽觸發 UR 保底判定 (優先於 SR)');
const urEligible: Rarity[] = ['UR', 'EX'];
assert(urEligible.includes(rollUR.rarity), `第 50 抽保底獲得 UR 或 EX (獲得: ${rollUR.rarity})`);
assert(rollUR.updatedPity.urPity === 0, 'UR 保底觸發後計數歸零');

// Test 3: EX Guarantee on 200th pull (Highest Priority)
const stateEXNear = { srPity: 9, urPity: 49, exPity: 199 };
const rollEX = rollRarityWithPity(stateEXNear);
assert(rollEX.pityTriggered === 'EX', '第 200 抽觸發 EX 保底判定 (優先於 UR 與 SR)');
assert(rollEX.rarity === 'EX', `多種保底同時觸發時，EX 具備最高優先順序 (獲得: ${rollEX.rarity})`);
assert(rollEX.updatedPity.exPity === 0, 'EX 保底觸發後計數歸零');

// Test 4: 10-Pull Gacha Execution produces exactly 10 cards and guarantees at least SR
const defaultPack = CARD_PACKS[0];
const sampleState: UserState = {
  dailyPullsRemaining: 10,
  lastPullDateTaipei: '2026-10-16',
  srPity: 0,
  urPity: 0,
  exPity: 0,
  totalPulls: 0,
  showcaseCardIds: [],
};

const gachaResult = executeBatchPull(defaultPack, 10, sampleState, new Set());
assert(gachaResult.pulledCards.length === 10, `十連抽產生恰好 10 張卡片 (實際: ${gachaResult.pulledCards.length})`);
const ranks: Record<Rarity, number> = { N: 1, R: 2, SR: 3, SSR: 4, UR: 5, EX: 6 };
const maxRarity = Math.max(...gachaResult.pulledCards.map((c) => ranks[c.card.rarity]));
assert(maxRarity >= 3, '十連抽至少包含一張 SR 或以上稀有度卡牌 (10抽保底機制)');

// Test 5: 10,000 Pulls Simulation for Long-Run Pity Verification
const sim = simulatePityVerification(10000);
assert(sim.maxConsecutiveWithoutSR < 10, `10,000 抽連續未出 SR 最大次數為 ${sim.maxConsecutiveWithoutSR} (嚴格 < 10)`);
assert(sim.maxConsecutiveWithoutUR < 50, `10,000 抽連續未出 UR 最大次數為 ${sim.maxConsecutiveWithoutUR} (嚴格 < 50)`);
assert(sim.maxConsecutiveWithoutEX < 200, `10,000 抽連續未出 EX 最大次數為 ${sim.maxConsecutiveWithoutEX} (嚴格 < 200)`);
assert(sim.rarityCounts['EX'] > 0, `10,000 抽成功抽中 EX 至高神格: ${sim.rarityCounts['EX']} 張`);
assert(sim.variantCounts['Prismatic Signature'] > 0, `10,000 抽成功產出星芒燙金簽名卡: ${sim.variantCounts['Prismatic Signature']} 款`);

// ==========================================
// TEST SUITE 5: TAIPEI TIME & FESTIVALS
// ==========================================
console.log('\n>>> 5. 台灣時間與節慶開放排程測試 (Time & Festival Schedule)');

const countdown = getTimeUntilTaipeiMidnight();
assert(typeof countdown.hours === 'number' && countdown.hours >= 0 && countdown.hours <= 23, '台灣時間 00:00 重置倒數小時數正確');
assert(typeof countdown.minutes === 'number' && countdown.minutes >= 0 && countdown.minutes <= 59, '倒數分鐘數正確');
assert(typeof countdown.seconds === 'number' && countdown.seconds >= 0 && countdown.seconds <= 59, '倒數秒數正確');
assert(countdown.formatted.includes(':'), `倒數格式正確 (格式: ${countdown.formatted})`);

const todayTaipei = getTaipeiDateString();
assert(/^\d{4}-\d{2}-\d{2}$/.test(todayTaipei), `台北今日日期字串符合 YYYY-MM-DD (今日: ${todayTaipei})`);

// Test festival active check logic with synthetic ranges
const activeNow = isFestivalActive({ startMonth: 1, startDay: 1, endMonth: 12, endDay: 31 });
assert(activeNow === true, '全年區間節慶判定為現正開放');
const inactiveNow = isFestivalActive({ startMonth: 1, startDay: 1, endMonth: 1, endDay: 2 });
assert(inactiveNow === false, '過期區間節慶判定為未開放');

// ==========================================
// SUMMARY
// ==========================================
console.log('\n====================================================');
console.log(`   測試結果: ${passedTests} / ${totalTests} 通過 (${((passedTests / totalTests) * 100).toFixed(1)}%)`);
console.log('====================================================');

if (passedTests === totalTests) {
  console.log('🎉 所有 QA 測試全數無暇通過！系統已達到上線級穩定度！\n');
  process.exit(0);
} else {
  console.error('⚠️ 部分測試失敗，請檢查錯誤資訊。\n');
  process.exit(1);
}
