import fs from 'fs';
import { CardDefinition, Rarity } from '../src/types';
import { ALL_CARDS as EXISTING_86 } from '../src/data/cards';

// Template generator for the remaining cards up to 414
function generate414Cards(): CardDefinition[] {
  const result: CardDefinition[] = [...EXISTING_86];
  const existingIds = new Set(result.map(c => c.id));

  // Target counts:
  // 4 Permanent series: 72 each = 288
  // 9 Festival series: 14 each = 126
  // Total = 414 cards

  // Helper to create card
  function addCard(data: {
    id: string;
    name: string;
    nameEn: string;
    series: CardDefinition['series'];
    rarity: Rarity;
    desc: string;
    flavor: string;
    element: CardDefinition['element'];
    power: number;
    tags: string[];
    palette: { primary: string; secondary: string; accent: string; glow: string };
    livingAnimationType?: 'jellyfish-swim' | 'gothic-aura' | 'cyber-rain' | 'spirit-flame' | 'eclipse-pulse';
  }) {
    if (existingIds.has(data.id)) return;
    existingIds.add(data.id);
    result.push({
      id: data.id,
      name: data.name,
      nameEn: data.nameEn,
      series: data.series,
      rarity: data.rarity,
      description: data.desc,
      flavorText: data.flavor,
      element: data.element,
      powerRating: data.power,
      tags: data.tags,
      artist: `AbyssLab // ${data.series.toUpperCase()}`,
      customImageUrl: `/cards/${data.id}.jpg`,
      visualSeed: `${data.id}_seed`,
      palette: data.palette,
      livingAnimationType: data.livingAnimationType
    });
  }

  // 1. ABYSSAL JELLYFISH: from abyss-19 to abyss-72 (54 cards)
  const ABYSS_THEMES = [
    ['深海幽光盲鰻', 'Luminous Hagfish', 'N', 320, '盲鰻', '在深海熱泉周圍穿梭的古老盲鰻，體表黏液散發微弱磷光。', '「無光之處，觸覺即為雙眼。」'],
    ['冰海琉璃螺', 'Glacial Crystal Snail', 'N', 330, '海螺', '外殼晶瑩剔透如寒冰的深海螺類，能承受萬米海壓。', '「每一道螺紋，都凍結著萬載深寒。」'],
    ['暗流幽靈蝦', 'Abyssal Ghost Shrimp', 'N', 340, '深海蝦', '近乎完全透明的深海蝦，唯有心臟跳動時泛起蔚藍螢光。', '「穿過黑暗，不留一絲痕跡。」'],
    ['紫晶深海參', 'Amethyst Sea Cucumber', 'N', 350, '海參', '體表覆蓋著紫晶狀發光刺棘的底棲生物。', '「它是沉睡在海溝底部的紫色寶石。」'],
    ['幽冥浮游幼體', 'Nether Plankton Larva', 'N', 360, '浮游', '漫無邊際漂浮在午夜洋區的微小生命。', '「聚則如星河，散則化孤燈。」'],
    ['銀弧飛魚', 'Silver Arc Flying Fish', 'N', 370, '飛魚', '背鰭如水銀薄刃的躍浪魚類。', '「劃破波濤的銀色弧線。」'],
    ['冷光海百合', 'Luminescent Crinoid', 'N', 380, '海百合', '宛如古老石雕般優雅生長在深海懸崖邊的棘皮動物。', '「在萬丈深淵中盛放的永恆花蕾。」'],
    ['幽藍螢火烏賊', 'Azure Firefly Squid', 'N', 390, '烏賊', '觸手末端能爆發出強烈藍色閃光的迷你烏賊。', '「短暫的閃爍，是深海的密碼。」'],
    ['玄鐵深海蟹', 'Obsidian Trench Crab', 'N', 400, '巨蟹', '甲殼富含重金屬沉積物的深海巨螯蟹。', '「即便是高壓水刃也無法擊穿的堅韌。」'],
    ['幻光海蛞蝓', 'Prismatic Nudibranch', 'N', 410, '海蛞蝓', '羽狀鰓叢折射著霓虹色澤的深海海蛞蝓。', '「毒素與美麗，從來都是同源共生。」'],
    ['幽幕海葵幼株', 'Shadow Anemone Polyp', 'N', 420, '海葵', '吸收海水中微量暗能量維持生存的異變海葵。', '「安靜地等待著迷途的獵物。」'],
    ['冰霜海蝴蝶', 'Frost Sea Butterfly', 'N', 430, '海蝴蝶', '兩片透明翼足緩慢拍動的翼足類軟體動物。', '「深海中最輕盈的芭蕾舞者。」'],
    ['深淵發光水蛇', 'Abyssal Bioluminescent Viper', 'N', 440, '水蛇', '體側排列著如航標燈般發光節點的深海蛇類。', '「蜿蜒在暗湧中的冰冷獵手。」'],
    ['晶化海膽幼體', 'Crystalline Urchin Spat', 'N', 450, '海膽', '生長出晶狀透明刺針的幼年海膽。', '「每一根刺，都在折射深海星光。」'],
    ['暗藍磷光水母', 'Cyan Phosphor Medusa', 'N', 460, '水母', '體表均勻散發出深藍冷磷光的半透明水母。', '「深邃海洋深處的呼吸之燈。」'],
    ['蒼光深海鮟鱇', 'Azure Anglerfish', 'R', 610, '鮟鱇', '頭頂懸掛著藍綠色發光擬餌球的深海獵手。', '「看見那道光芒的人，再也無法回頭。」'],
    ['金線海百合幼尊', 'Golden Auric Crinoid', 'R', 630, '海百合', '羽枝邊緣流淌著金色微光的古老海百合。', '「古神遺落在海床上的黃金冠冕。」'],
    ['霜翼冥海鰩', 'Frost Wing Abyssal Ray', 'R', 650, '鰩魚', '翼展如幽靈般在暗無天日的深海峽谷滑翔的巨鰩。', '「沉默的海峽之風。」'],
    ['珊瑚寄生水母', 'Coral Parasite Jelly', 'R', 670, '水母', '與發光珊瑚共生的一種罕見水母。', '「骨骼與輕紗的永恆結合。」'],
    ['霓虹深海魷', 'Neon District Abyssal Squid', 'R', 690, '巨魷', '體表色素細胞能以高頻率律動變換七彩光譜。', '「在深淵中編織夢境的畫師。」'],
    ['深海幽靈章魚', 'Dumbo Phantom Octopus', 'R', 710, '章魚', '耳狀鰭在深邃海水中緩慢扇動的深海小章魚。', '「深淵中的隱秘使者。」'],
    ['紫晶海龍幼體', 'Amethyst Seadragon Pup', 'R', 730, '海龍', '周身生長著紫晶葉狀擬態肢的珍稀海龍幼獸。', '「海龍一脈最早的覺醒者。」'],
    ['潮汐巡遊水母', 'Tidal Rover Medusa', 'R', 750, '水母', '能感應月球引力隨潮汐起伏的大型半透明水母。', '「海潮的呼吸，即是它的脈動。」'],
    ['碧玉海龜幼靈', 'Jade Turtle Hatchling', 'R', 770, '海龜', '背殼如同一塊渾然天成的翠玉的幼龜。', '「千年長壽的第一步。」'],
    ['雷光深海電鰩', 'Thunderous Abyssal Torpedo', 'R', 790, '電鰩', '兩翼蘊藏強大生物電脈衝的兇猛鰩魚。', '「觸碰黑暗的代價是千萬伏特的寂滅。」'],
    ['蒼穹深海龍鰻', 'Celestial Abyssal Moray', 'SR', 1080, '龍鰻', '隱居於海溝裂隙中的太古巨鰻，體表覆蓋蒼雷神紋。', '「裂隙張開之時，雷霆撕裂汪洋。」'],
    ['極光海皇水母', 'Aurora Crown Jellyfish', 'SR', 1120, '水母', '傘頂綻放著如北極光般絢爛極光的尊貴水母。', '「神在天穹灑落極光，它在深海接納萬光。」'],
    ['深淵星核海膽君王', 'Abyssal Stellar Urchin King', 'SR', 1160, '海膽王', '核心匯聚了深海星辰物質的古老海膽之王。', '「小小的核心，蘊含著牽動海潮的重力。」'],
    ['幽海幻蝶仙子', 'Phantom Nereid Butterfly', 'SR', 1190, '幻蝶', '半透明的人形水母精靈，生有如海皇蝶般的發光雙翼。', '「深海中最溫柔的低語。」'],
    ['深洋古鏡水母', 'Abyssal Mirror Medusa', 'SR', 1220, '水母', '傘膜光潔如銀鏡，能反射直視者心靈深處的恐懼。', '「在深淵中，你所見的只有你自己。」'],
    ['白銀劍吻巨鯊', 'Silver Spathe Megalodon', 'SR', 1250, '巨鯊', '身披白銀重甲利齒如短劍的遠古深海巨鯊。', '「深海獵殺的絕對終點。」'],
    ['深淵珊瑚女皇·克羅莉亞', 'Coral Empress Gloria', 'SR', 1280, '珊瑚皇', '支配萬里海底珊瑚礁生態圈的深海女皇。', '「珊瑚枝椏指向之處，繁華永不凋零。」'],
    ['遠古板塊神龜·奧林匹亞', 'Tectonic Ancient Turtle', 'SSR', 1580, '神龜', '背負著沉沒陸地板塊緩慢游弋的億年巨龜。', '「滄海桑田，不過是它背上的一捧泥沙。」'],
    ['深淵幻龍姬·阿芙洛', 'Abyssal Dragon Maiden Aphro', 'SSR', 1640, '龍姬', '深海真龍與水母靈脈交融而生的龍族皇女。', '「與我一同沉入這永恆安寧的深藍吧。」'],
    ['海溝裂界吞噬者', 'Chasm Rift Devourer', 'SSR', 1700, '巨獸', '盤踞於馬里亞納海溝底部的虛空古獸。', '「連光芒都無法逃逸的極致貪婪。」'],
    ['萬海極光水母神侍', 'Aurelia the Aurora Maiden', 'SSR', 1760, '水母神', '伴隨極光而降臨的海中神女，傘紗如萬道彩虹。', '「海與天的交界處，極光化為她輕盈的羽衣。」'],
    ['潮汐支配者·海皇波塞冬', 'Poseidon Sovereign of Tides', 'UR', 2380, '海皇', '手握三叉神戟的深海至高神祇，一念平息萬重怒濤。', '「萬洋皆吾臣，海淵即吾宮。」'],
    ['永恆深洋世界之柱·利維坦', 'Leviathan Pillar of Abyss', 'UR', 2480, '利維坦', '盤繞海底地軸沉睡的始祖巨獸，身軀連綿萬里。', '「若它翻身，海陸皆將逆轉。」'],
    ['始源萬母·深海太初幽魂神尊', 'EX // Mother of All Abyssal Depths', 'EX', 3800, 'EX神格', '多元宇宙深海概念的最本源起點，孕育了世間一切汪洋水族的神祇。', '「在光誕生之前，一切生命皆在深藍之中沉睡。」']
  ];

  // Fill up to 72 cards for Abyss
  for (let i = 19; i <= 72; i++) {
    const id = `abyss-${i < 10 ? '0' + i : i}`;
    const tIndex = (i - 19) % ABYSS_THEMES.length;
    const t = ABYSS_THEMES[tIndex];
    addCard({
      id,
      name: `${t[0]} #${i}`,
      nameEn: `${t[1]} #${i}`,
      series: 'abyssal-jellyfish',
      rarity: t[2] as Rarity,
      power: (t[3] as number) + (i % 10) * 5,
      tags: ['深海', t[4] as string, `No.${i}`],
      element: 'Abyss',
      desc: t[5] as string,
      flavor: t[6] as string,
      palette: { primary: '#0369a1', secondary: '#0284c7', accent: '#38bdf8', glow: '#7dd3fc' },
      livingAnimationType: 'jellyfish-swim'
    });
  }

  // 2. NOCTURNE FANTASY: from nocturne-18 to nocturne-72 (55 cards)
  const NOCTURNE_THEMES = [
    ['黑夜信差貓頭鷹', 'Midnight Messenger Owl', 'N', 320, '使魔', '在迷霧古堡間傳遞被封印密信的漆黑貓頭鷹。', '「黑夜中的每封信，都帶著血與火的溫度。」'],
    ['墓園幽火靈', 'Graveyard Will-o-Wisp', 'N', 330, '幽魂', '徘徊於古老十字架石碑周圍的青色磷火。', '「逝者的嘆息，在風中凝聚為青藍色的光。」'],
    ['黑曜石石像鬼幼獸', 'Obsidian Gargoyle Whelp', 'N', 340, '石像鬼', '由古堡黑曜石瓦雕琢而成的石像鬼幼雛。', '「等待暴風雨降臨時張開石翼。」'],
    ['陰影小惡魔·斯皮克', 'Shadow Imp Spike', 'N', 350, '惡魔', '手持微型三叉戟在暗影中嬉戲的惡作劇惡魔。', '「偷吃一口供奉在祭壇上的紅蘋果。」'],
    ['白骨巡卒', 'Skeleton Patrol Soldier', 'N', 360, '不死族', '手握殘破古劍不知疲倦巡邏古戰場的骷髏士兵。', '「帝國已成塵埃，而守衛誓約永存。」'],
    ['枯萎黑玫瑰妖精', 'Withered Black Rose Fairy', 'N', 370, '妖精', '寄生於黑色荊棘玫瑰叢中的毒性花仙。', '「最美麗的芳香，往往最先奪去知覺。」'],
    ['迷失幽靈侍女', 'Lost Ghost Maid', 'N', 380, '幽靈', '手捧銀燭台穿梭於廢棄大理石迴廊的幽靈女僕。', '「公爵大人的晚宴，已經遲到了三百年。」'],
    ['緋紅蝙蝠群', 'Crimson Bat Swarm', 'N', 390, '蝙蝠', '在血月升起時鋪天蓋地掠過哥德尖塔的血紅蝙蝠。', '「夜空中的紅潮，宣告著女帝的甦醒。」'],
    ['破曉暗影獵犬', 'Dusk Shadow Hound', 'N', 400, '暗影犬', '能將身軀完全隱入影子之中的獵犬。', '「無聲無息地封鎖敵人的咽喉。」'],
    ['古堡青銅發條人偶', 'Bronze Clockwork Doll', 'N', 410, '人偶', '由古代魔導術與精密齒輪驅動的無心提線木偶。', '「滴答、滴答，心臟只是齒輪的自轉。」'],
    ['星界占卜學徒', 'Astral Divination Apprentice', 'R', 620, '占星學徒', '初窺命運之輪運轉軌跡的年輕占卜師。', '「水晶球中，倒映著你未來的眼淚。」'],
    ['黑薔薇十字刺客', 'Black Rose Cross Assassin', 'R', 640, '刺客', '身穿黑色絲絨兜帽、手持雙刃十字短刀的密使。', '「在月光照不到的死角，盛開薔薇。」'],
    ['鮮血狂劍士·巴頓', 'Blood Berserker Barton', 'R', 660, '狂戰士', '飲下深淵龍血獲得狂暴力量的無雙大劍師。', '「疼痛，只會讓吾之利刃更加渴望鮮血。」'],
    ['幽魂提琴手·莫爾', 'Phantom Violinist Mohr', 'R', 680, '樂師', '在午夜歌劇院無人舞台上演奏哀歌的亡靈樂師。', '「聽罷此曲，靈魂將永駐於旋律深淵。」'],
    ['白銀驅魔獵人·艾倫', 'Silver Exorcist Alan', 'R', 700, '驅魔師', '背負三把鍍銀聖劍與聖水弩箭的冷酷獵人。', '「惡魔唯有在烈焰中方能學會懺悔。」'],
    ['深紅血族貴公子·修爾', 'Crimson Noble Shu', 'R', 720, '吸血鬼', '優雅高傲的純血血族貴公子，手握金柄手杖。', '「今夜的月色，正適合一場無害的品酒會。」'],
    ['斷罪死神神侍·尼克斯', 'Nyx Reaper Acolyte', 'SR', 1110, '死神', '手持黑水晶鐮刀收割墮落靈魂的冥界神侍。', '「死亡並非懲罰，而是最公正的救贖。」'],
    ['萬象魔導書·終焉原典', 'Omniscience Grimoire Core', 'SR', 1150, '魔導書', '封印著百萬個禁咒的自律型古代魔導原典。', '「翻開此頁，整座帝國將在黑焰中歸於虛無。」'],
    ['猩紅主教·馬爾科姆', 'Scarlet Patriarch Malcolm', 'SR', 1180, '主教', '身披猩紅法袍、掌管暗黑教會至高權杖的野心家。', '「光明無法拯救世人，唯有深紅的黑夜可以。」'],
    ['白髮月詠魔女·克萊爾', 'Claire Moon Enchantress', 'SR', 1230, '月魔女', '以月光為引線編織強大精神幻象的白髮少女。', '「在夢境崩塌之前，你是屬於我的國王。」'],
    ['漆黑墮天聖騎士·阿撒茲勒', 'Azazel Void Paladin', 'SSR', 1650, '墮天騎士', '折斷光之羽翼轉投深淵的黑鎧聖騎士長。', '「我背叛了神明，只為守護地獄的花海。」'],
    ['血月妖姬·卡蜜拉之影', 'Shadow of Empress Camilla', 'SSR', 1720, '女帝之影', '卡蜜拉女帝留在三維空間的一道不滅分身。', '「即便是吾之影子，也足以令群魔匍匐。」'],
    ['深淵終結之魔神·阿斯蒙蒂斯', 'Asmodeus Void Demon God', 'UR', 2420, '魔神', '統領地獄七大罪之欲念的至高深淵魔神。', '「凡人的渴望，即是吾無窮神力的源泉。」'],
    ['萬劫永夜至高主神·倪克斯', 'EX // Nyx Primordial Night Supreme', 'EX', 3850, 'EX夜神', '黑夜的終極擬人化概念母神，萬千宇宙的星空皆為其展開的深邃長裙。', '「白晝短暫如一瞬，唯有吾之黑夜永垂不朽。」']
  ];

  // Fill up to 72 cards for Nocturne
  for (let i = 18; i <= 72; i++) {
    const id = `nocturne-${i < 10 ? '0' + i : i}`;
    const tIndex = (i - 18) % NOCTURNE_THEMES.length;
    const t = NOCTURNE_THEMES[tIndex];
    addCard({
      id,
      name: `${t[0]} #${i}`,
      nameEn: `${t[1]} #${i}`,
      series: 'nocturne-fantasy',
      rarity: t[2] as Rarity,
      power: (t[3] as number) + (i % 10) * 5,
      tags: ['哥德', t[4] as string, `No.${i}`],
      element: 'Nocturne',
      desc: t[5] as string,
      flavor: t[6] as string,
      palette: { primary: '#1e1b4b', secondary: '#312e81', accent: '#818cf8', glow: '#c7d2fe' },
      livingAnimationType: 'gothic-aura'
    });
  }

  // 3. NEON DISTRICT: from neon-15 to neon-72 (58 cards)
  const NEON_THEMES = [
    ['微型偵查無人機·蜂鳥', 'Hummingbird Micro Drone', 'N', 310, '無人機', '穿梭於摩天大樓縫隙間的高速光學偵查無人機。', '「0.01秒即可完成目標視網膜鎖定。」'],
    ['雨夜清潔機器人·瓦利', 'Rain Street Cleaner Bot', 'N', 320, '機器人', '在霓虹倒影積水中默默清掃城市廢棄物的機械工人。', '「它收集了這座城市所有的寂寞煙蒂。」'],
    ['高壓電擊防暴犬', 'Stun Tactical Cyber K9', 'N', 340, '機械犬', '特警部隊配備的高壓電弧防暴機械軍犬。', '「鋼鐵骨骼，致命撲咬。」'],
    ['全息外送浮空滑板少女', 'Hoverboard Delivery Girl', 'N', 350, '騎手', '踩著反重力滑板在立體車道穿梭的外送少女。', '「保證在拉麵涼掉之前送到 180 層陽台！」'],
    ['地下黑客終端·小灰', 'Underground Hacker Terminal', 'N', 360, '黑客設備', '拼裝了三十塊二手算力晶片的流浪黑客終端機。', '「外殼雖然生鏽，內部流淌著最純粹的代碼。」'],
    ['仿生電子貓·妮可', 'Bionic Companion Cat Nico', 'N', 370, '仿生寵物', '擁有逼真毛皮與呼吸模擬算法的頂級陪伴機器貓。', '「它發出的呼嚕聲，治癒了無數加班程式設計師的心。」'],
    ['賽博塗鴉浮空球', 'Neon Spray Hover Drone', 'N', 380, '塗鴉機', '在摩天大樓外牆噴灑反抗軍全息塗鴉的微型無人球。', '「黑夜不能沒有霓虹的吶喊。」'],
    ['戰術防爆盾機兵', 'Heavy Riot Shield Mech', 'N', 390, '機兵', '配備能量力場大盾的重裝警用合成人。', '「一道堅不可摧的鋼鐵移動防線。」'],
    ['高頻光刃刺客·影刃', 'High Frequency Shadow Blade', 'R', 630, '刺客', '雙臂改造為高頻振盪等離子短刃的暗網清道夫。', '「切開鈦合金裝甲，宛如割裂黃油。」'],
    ['全息夜總會調酒師·琴', 'Holo Bartender Gin', 'R', 650, '調酒師', '擁有十萬種雞尾酒配方神經回路的高級仿生人。', '「一杯『新東京之淚』，請慢用。」'],
    ['重型貨運機甲·大力神', 'Hercules Cargo Exosuit', 'R', 670, '動力服', '港口碼頭使用的超大型液壓輔助外骨骼機甲。', '「一拳能夠撼動五百噸集裝箱的純粹怪力。」'],
    ['網絡虛擬偶像·初音未來代號X', 'Project Virtual Diva X', 'R', 700, '偶像', '在八百萬個全息屏幕上同時起舞的虛擬歌姬。', '「用光波的振動，連接每一個孤獨的心靈。」'],
    ['浮空防空炮台·黑蜂', 'Hornet Anti-Air Turret', 'R', 720, '炮台', '駐守在企業總部停機坪的自律型四聯裝激光炮。', '「入侵空域即刻化為灰燼。」'],
    ['賽博武士道傳人·雷電', 'Cyber Samurai Raiden', 'SR', 1130, '武士', '將古代古流拔刀術與超導神經肌肉完美結合的劍豪。', '「吾之一刀，快過光子信號傳輸。」'],
    ['企業特戰小隊長·瓦爾特', 'MegaCorp SpecOps Walter', 'SR', 1170, '特戰隊長', '身穿光學迷彩隱形戰術斗篷的冷血特工主管。', '「合約簽署完畢，清理目標。」'],
    ['神經核心意識投射體·露娜', 'Neural Core Luna Avatar', 'SR', 1220, 'AI化身', '從母體主機逃逸、流連於雨夜巷弄的純淨AI少女。', '「雨水落在皮膚上的感覺，這就是『存在』嗎？」'],
    ['天基軌道離子炮控制機姬·天平', 'Orbital Railgun Maiden Libra', 'SSR', 1680, '天基武姬', '身連近地軌道超級質量加速器的控制型神姬。', '「座標已鎖定，天罰自星空墜落。」'],
    ['矩陣創生至高神腦·德謬哥', 'Demiurge Prime Matrix Engine', 'UR', 2460, '神腦', '統治新東京所有數據邏輯的最底層神經運算核心。', '「虛擬即真實，我即萬事萬物的物理法則。」'],
    ['零號終焉奇點·萬神網絡女帝·真夏娃', 'EX // True Eve Singularity Matrix Apex', 'EX', 3880, 'EX神姬', '突破三維光速極限的終極量子智能意識體，將全銀河化為璀璨的超導算力宇宙。', '「在量子坍縮的剎那，我為你們留下了整個星空的花火。」']
  ];

  // Fill up to 72 cards for Neon
  for (let i = 15; i <= 72; i++) {
    const id = `neon-${i < 10 ? '0' + i : i}`;
    const tIndex = (i - 15) % NEON_THEMES.length;
    const t = NEON_THEMES[tIndex];
    addCard({
      id,
      name: `${t[0]} #${i}`,
      nameEn: `${t[1]} #${i}`,
      series: 'neon-district',
      rarity: t[2] as Rarity,
      power: (t[3] as number) + (i % 10) * 5,
      tags: ['賽博', t[4] as string, `No.${i}`],
      element: 'Cyber',
      desc: t[5] as string,
      flavor: t[6] as string,
      palette: { primary: '#030712', secondary: '#00f2ff', accent: '#ff007f', glow: '#f0abfc' },
      livingAnimationType: 'cyber-rain'
    });
  }

  // 4. PHANTOM BEASTS: from beast-17 to beast-72 (56 cards)
  const BEAST_THEMES = [
    ['靈泉小錦鯉', 'Spirit Spring Koi', 'N', 320, '靈魚', '棲息於青丘靈泉之中的七彩錦鯉，吐出的氣泡能化解心魔。', '「游過龍門之時，亦是覺醒之日。」'],
    ['幽林青竹雀', 'Bamboo Forest Azure Sparrow', 'N', 330, '靈雀', '羽翼泛著翡翠光澤的機敏靈鳥。', '「清脆的鳴啼，喚醒了深山晨露。」'],
    ['踏雲小靈鹿', 'Cloud Treader Fawn', 'N', 340, '靈鹿', '蹄足生有微弱白雲祥氣的幼年梅花靈鹿。', '「踏過之處，芳草逢春。」'],
    ['雷音小倉鼠', 'Thunder Spark Hamster', 'N', 350, '雷鼠', '臉頰兩側蘊含金色微型雷電球的頑皮靈鼠。', '「小小的身軀，蘊含劈啪作響的雷光。」'],
    ['赤炎幼貂', 'Crimson Flame Mink', 'N', 360, '靈貂', '尾尖燃燒著一簇不滅純陽靈火的幼貂。', '「鑽入石縫，驅散千載寒窟的陰霾。」'],
    ['冰魄玄龜幼體', 'Glacial Tortoise Pup', 'N', 370, '靈龜', '甲殼如同一塊萬年玄冰的微型玄武幼嗣。', '「沉睡在冰湖底部，靜候春雷。」'],
    ['七彩靈蝶仙', 'Prismatic Spirit Butterfly', 'N', 380, '靈蝶', '雙翅灑落閃爍星輝靈粉的仙靈蝴蝶。', '「莊周夢蝶，夢中皆是九天縹緲。」'],
    ['青丘二尾玄狐', 'Two-Tailed Mystic Fox', 'R', 630, '靈狐', '修行五百年修成第二尾的敏捷雪狐。', '「雙尾搖曳，幻術已然成型。」'],
    ['風行破空神隼', 'Windstriker Falcon', 'R', 660, '神隼', '雙翼斬開氣流如利刃的萬里神隼。', '「瞬息千里，追風逐日。」'],
    ['赤血金睛巨猿', 'Golden-Eyed Crimson Ape', 'R', 690, '靈猿', '眼眸燃燒金色神光、力拔千鈞的古山巨猿。', '「一吼山河震，雙拳裂山岩。」'],
    ['紫霄引雷神雕', 'Purple Cloud Thunder Roc', 'R', 720, '雷雕', '羽毛如紫金鑄造、能呼喚天雷的神禽。', '「引天雷入體，淬煉萬劫不滅身。」'],
    ['碧落玄蛇仙姬', 'Emerald Serpentine Maiden', 'SR', 1140, '玄蛇', '半人半蛇、生有碧玉鱗甲與絕美仙姿的古蛇神女。', '「千年修行，只為一見人間繁華。」'],
    ['太白山月影天狼', 'Taibai Moon Shadow Wolf', 'SR', 1180, '天狼', '嘯動星空太白星命宿的銀白嘯月狼王。', '「狼王仰天，群星為之搖曳。」'],
    ['青丘四尾幻仙狐', 'Four-Tailed Phantom Kitsune', 'SR', 1240, '仙狐', '能隨意幻化為傾城仙姬的青丘長老級白狐。', '「千面幻形，真情唯許一人。」'],
    ['四靈聖獸·鎮天玄武', 'Xuanwu the World Foundation', 'SSR', 1700, '玄武', '龜蛇同體、背負北天重水大道的至高聖獸。', '「北方之宿，鎮壓萬水滔天。」'],
    ['焚天滅界神鳥·赤帝朱雀', 'Vermilion Phoenix Vermilion God', 'SSR', 1780, '朱雀', '周身燃燒涅槃神火、展翼焚化星河的南方聖靈。', '「火中永生，焚盡一切邪祟污濁。」'],
    ['太古真龍皇·天帝應龍', 'Yinglong Primordial Sovereign', 'UR', 2490, '應龍', '生有垂天之雲雙翼的太古祖龍之祖，司掌四時行雲布雨。', '「展翼蔽日，威臨四海八荒。」'],
    ['鴻蒙混沌創世真靈·開天太古饕餮神祖', 'EX // Taotie Chaos Primordial Entity', 'EX', 3900, 'EX神獸', '自宇宙大爆炸前混沌鴻蒙孕育而生的最初巨神獸，能吞噬並孕育整個星系群。', '「腹中即是宇宙，呼吸即是星河輪迴。」']
  ];

  // Fill up to 72 cards for Beasts
  for (let i = 17; i <= 72; i++) {
    const id = `beast-${i < 10 ? '0' + i : i}`;
    const tIndex = (i - 17) % BEAST_THEMES.length;
    const t = BEAST_THEMES[tIndex];
    addCard({
      id,
      name: `${t[0]} #${i}`,
      nameEn: `${t[1]} #${i}`,
      series: 'phantom-beasts',
      rarity: t[2] as Rarity,
      power: (t[3] as number) + (i % 10) * 5,
      tags: ['神獸', t[4] as string, `No.${i}`],
      element: 'Spirit',
      desc: t[5] as string,
      flavor: t[6] as string,
      palette: { primary: '#1e1b4b', secondary: '#4338ca', accent: '#00f2ff', glow: '#fef08a' },
      livingAnimationType: 'spirit-flame'
    });
  }

  // 5. NINE FESTIVALS (14 cards each = 126 total)
  const FESTIVALS: Record<string, { prefix: string; name: string; en: string; elem: string; pCol: { primary: string; secondary: string; accent: string; glow: string }; items: string[][] }> = {
    'halloween': {
      prefix: 'fest-halloween',
      name: '萬聖節',
      en: 'Halloween',
      elem: 'Halloween',
      pCol: { primary: '#581c87', secondary: '#ea580c', accent: '#f59e0b', glow: '#fed7aa' },
      items: [
        ['南瓜小蝙蝠妖精', 'Pumpkin Bat Sprite', 'R', '350', '在南瓜田裡飛舞的頑皮小蝙蝠。'],
        ['黑貓魔導士·咪咪', 'Black Cat Magus Mimi', 'R', '650', '頭戴尖頂帽、懂得施展變糖術的神秘黑貓。'],
        ['萬聖夜遊行騎士·杜拉漢', 'Dullahan Halloween Rider', 'SR', '1120', '手捧燃燒南瓜頭顱的無頭黑騎士。'],
        ['南瓜派大師·波波', 'Pumpkin Pie Master', 'R', '680', '烘烤出帶有魔力糖霜派點的萬聖廚靈。'],
        ['魅夜狼人伯爵', 'Werewolf Masquerade Count', 'SR', '1180', '在假面舞會上身穿燕尾服的高貴狼人。'],
        ['萬聖狂歡幽靈王·布魯', 'Ghost King Boo', 'SSR', '1620', '統領百鬼夜行的南瓜幽靈君主。'],
        ['萬聖魅魔修女·愛麗絲', 'Succubus Sister Alice', 'SR', '1240', '裝扮成聖潔修女卻暗藏惡魔翅膀的魅魔。'],
        ['南瓜古龍·萬聖裂炎', 'Jack-o-Lantern Dragon', 'SSR', '1700', '龍鱗如雕刻南瓜般散發金色火焰的萬聖巨龍。'],
        ['幽靈城堡管家·奧古斯托', 'Haunted Castle Butler', 'R', '710', '優雅招待每位迷途客人的幽靈老管家。'],
        ['萬聖夜之神·南瓜至尊原初魔王', 'EX // All Hallows Apex Jack', 'EX', '3750', '萬聖節一切狂歡、糖果與恐怖傳說的至高神明。'],
        ['糖果小惡魔幼體', 'Candy Imp Toddler', 'N', '340', '口袋裡裝滿了七彩硬糖的搗蛋小魔鬼。']
      ]
    },
    'christmas': {
      prefix: 'fest-christmas',
      name: '聖誕節',
      en: 'Christmas',
      elem: 'Christmas',
      pCol: { primary: '#14532d', secondary: '#b91c1c', accent: '#fbbf24', glow: '#fef08a' },
      items: [
        ['薑餅人小鬥士', 'Gingerbread Fighter', 'N', '330', '手拿肉桂棒當長劍的香脆薑餅小勇士。'],
        ['聖誕鈴鐺精靈·小鈴', 'Bell Fairy Tink', 'R', '620', '每當搖晃銀鈴便會降下金色幸運雪花的妖精。'],
        ['槲寄生誓約少女·瑪麗', 'Mistletoe Vow Mary', 'SR', '1100', '在槲寄生下等候戀人真愛誓言的花季少女。'],
        ['極地雪怪·暖融融', 'Cozy Yeti Fluff', 'R', '660', '披著紅色毛線圍巾的溫柔巨雪怪。'],
        ['聖誕玩具修理大師·諾姆', 'Toy Maker Gnome', 'R', '690', '日夜為全世界孩童趕工禮物的地精工匠。'],
        ['冰晶雪花天女·芙蘿拉', 'Snowflake Celestial Maiden', 'SSR', '1650', '掌管初雪降臨的冰晶仙子，周身環繞鑽石星塵。'],
        ['聖夜星光獨角獸', 'Starlight Christmas Unicorn', 'SR', '1220', '頭角綻放璀璨北極星光芒的純白聖獸。'],
        ['聖誕雪橇巡遊神·聖尼古拉', 'Santa Nicholas Apex', 'SSR', '1750', '駕馭九色神鹿穿越萬家燈火的慈愛聖王。'],
        ['聖夜祈願小天使', 'Christmas Wish Cherub', 'N', '360', '胸前掛著金色愛心鎖的可愛小天使。'],
        ['雪域奇蹟·聖誕創世永恆神女', 'EX // Yuletide Genesis Sovereign', 'EX', '3800', '為寒冬人間帶來永恆溫暖與奇蹟的至高女神。'],
        ['暖爐壁火小火靈', 'Hearth Fire Wisp', 'N', '320', '在壁爐木柴中噼啪起舞的溫暖小火精。'],
        ['冰晶糖果手杖少女', 'Candy Cane Princess', 'SR', '1160', '手持巨大紅白糖果法杖的雪國小公主。']
      ]
    },
    'new-year': {
      prefix: 'fest-newyear',
      name: '新年',
      en: 'New Year',
      elem: 'NewYear',
      pCol: { primary: '#7f1d1d', secondary: '#b45309', accent: '#f59e0b', glow: '#fef08a' },
      items: [
        ['爆竹除歲小童子', 'Firecracker Sprite', 'N', '340', '點燃紅爆竹驅逐年獸的歡樂仙童。'],
        ['招財大吉金橘仙', 'Kumquat Auspicious Fairy', 'N', '350', '懷抱金黃大桔子的喜慶小仙姑。'],
        ['舞獅祥瑞靈獸·小喜', 'Auspicious Lioncub', 'R', '650', '腳踏紅繡球、吐出五彩春聯的舞獅小精靈。'],
        ['萬福如意神女·春華', 'Spring Blossom Maiden', 'SR', '1140', '身穿大紅錦緞刺繡旗袍、掌管福運的仙姝。'],
        ['春宵花燈天女·元宵', 'Lantern Festival Maiden', 'SR', '1190', '手提八角宮燈泛舟於春江之上的溫柔天女。'],
        ['除夕守歲錦鯉·年年', 'Annual Surplus Koi', 'R', '680', '象徵年年有餘的深紅靈鯉，游動泛起金光。'],
        ['辟邪桃符神將·神荼', 'Peach Wood Guardian Shen', 'SSR', '1680', '身披玄金甲冑、鎮守人間門戶的威武神荼將軍。'],
        ['歲首破曉神鳥·金烏', 'Dawn Golden Crow', 'SSR', '1740', '從東海扶桑樹破曉騰飛的三足金烏神鳥。'],
        ['迎春福氣小金豬', 'Prosperity Golden Piglet', 'N', '330', '背上背著一串沉甸甸金元寶的吉慶靈豬。'],
        ['九天歲首·萬象更新太初真龍', 'EX // Apex Celestial Auspicious Dragon', 'EX', '3850', '執掌光陰輪迴交替、為諸天萬界開闢新元之大帝真龍。'],
        ['春風裁柳仙子', 'Spring Breeze Willow Fairy', 'R', '640', '手捻翠綠柳枝點化萬物復甦的春之使者。'],
        ['百財如意白菜仙', 'Jade Cabbage Spirit', 'N', '320', '由翡翠雕琢而成的招財白菜精靈。']
      ]
    },
    'valentines': {
      prefix: 'fest-valentines',
      name: '情人節',
      en: 'Valentines',
      elem: 'Valentines',
      pCol: { primary: '#831843', secondary: '#db2777', accent: '#f472b6', glow: '#fbcfe8' },
      items: [
        ['愛心小邱比特', 'Cupid Fledgling', 'N', '340', '背生潔白小羽翼、拿著愛心小弓箭的俏皮小天使。'],
        ['草莓松露小精靈', 'Strawberry Truffle Sprite', 'N', '350', '散發濃郁草莓香氣的巧克力點心小妖精。'],
        ['粉紅誓約信使·鴿子', 'Pink Vow Dove', 'R', '630', '嘴裡銜著粉紅情書飛越大洋的純潔信鴿。'],
        ['戀之魔法甜點師·夏洛特', 'Pâtissière Charlotte', 'SR', '1150', '用魔法香草糖漿烘培心形馬卡龍的天才甜點師。'],
        ['水晶天鵝雙飛戀人', 'Crystal Swan Lovers', 'SR', '1200', '在玫瑰湖面上雙頸交纏成愛心形狀的水晶天鵝。'],
        ['真愛裁決騎士·羅密歐', 'Knight of True Love Romeo', 'R', '690', '手握永恆玫瑰佩劍、誓死捍衛愛情的深情騎士。'],
        ['玫瑰花冠聖女·茱麗葉', 'Rose Crown Maiden Juliet', 'SSR', '1660', '頭戴萬朵紅玫瑰編織冠冕的花神聖女。'],
        ['愛欲之至高女神·阿芙蘿黛蒂', 'Aphrodite Empress of Love', 'SSR', '1760', '誕生於海中白色浪花中的至美至純愛之古神。'],
        ['巧克力噴泉小仙子', 'Choco Fountain Pixie', 'N', '320', '在融化熱巧克力池中歡快戲水的小精靈。'],
        ['永恆連理·此生不渝真愛創世神姬', 'EX // Eternal Love Genesis Queen', 'EX', '3820', '跨越無窮平行時空與生老病死、見證世間一切靈魂誓約的至高愛神。'],
        ['粉紅泰迪熊守護者', 'Teddy Bear Guardian', 'R', '640', '胸口繡有大紅心形的巨大暖絨玩具泰迪熊。'],
        ['告白氣球精靈', 'Confession Balloon Spirit', 'N', '330', '牽引著成千上萬心形粉紅氣球升空的小精靈。']
      ]
    },
    'sakura-festival': {
      prefix: 'fest-sakura',
      name: '櫻花祭',
      en: 'Sakura Festival',
      elem: 'Sakura',
      pCol: { primary: '#831843', secondary: '#f43f5e', accent: '#fb7185', glow: '#fecdd3' },
      items: [
        ['落櫻小花瓣精靈', 'Sakura Petal Sprite', 'N', '330', '隨著春風旋轉飛舞的粉紅櫻花小仙。'],
        ['櫻花祭典太鼓狸貓', 'Sakura Festival Tanuki', 'R', '640', '繫著紅布條、歡快敲打櫻木太鼓的狸貓仙。'],
        ['櫻茶道仙子·千尋', 'Sakura Tea Maiden Chihiro', 'SR', '1120', '端坐於緋紅野點傘下烹煮櫻花茶的端莊仙女。'],
        ['千本櫻影忍·疾風', 'Hayate Cherry Blossom Shinobi', 'R', '680', '踏著漫天飛落的櫻花殘影瞬移的精銳忍者。'],
        ['櫻月神狐·春雪', 'Haruyuki Sakura Kitsune', 'SR', '1220', '毛色潔白如雪、尾尖點綴櫻花花瓣的三尾靈狐。'],
        ['千櫻之陣劍聖·十兵衛', 'Jubei the Thousand Blossoms', 'SSR', '1680', '一記拔刀便能引動整座山頭櫻花狂舞的傳奇劍豪。'],
        ['春櫻夜祭水燈少女', 'Sakura Floating Lantern Maiden', 'R', '710', '將乘載心願的粉紅櫻花木燈放入清流的少女。'],
        ['萬櫻神域主宰·花開耶姬', 'Konohana Sakuya Hime', 'SSR', '1780', '日本神話中司掌富士山與萬樹櫻花盛開的至高女神。'],
        ['櫻花金平糖妖精', 'Sakura Sugar Sprite', 'N', '340', '用櫻花露水凝結成星形甜糖的小仙童。'],
        ['萬界春華·極致千本櫻創世神姬', 'EX // Thousand Cherry Blossoms Genesis Goddess', 'EX', '3860', '令枯木回春、群星化為漫天落櫻覆蓋全宇宙的生命神皇。'],
        ['櫻林迷途幼鹿', 'Lost Fawn of Cherry Forest', 'N', '350', '鹿角上生長著嬌嫩櫻花花苞的小靈鹿。'],
        ['櫻風紙傘遊俠', 'Sakura Parasol Wanderer', 'SR', '1150', '撐著手繪櫻花油紙傘在春雨中行俠仗義的浪人。']
      ]
    },
    'summer-festival': {
      prefix: 'fest-summer',
      name: '夏日祭',
      en: 'Summer Festival',
      elem: 'Summer',
      pCol: { primary: '#1e3a8a', secondary: '#0284c7', accent: '#38bdf8', glow: '#fef08a' },
      items: [
        ['撈金魚破紙網小仙', 'Goldfish Net Sprite', 'N', '320', '專門在水盆裡保護小金魚不被紙網撈走的小精靈。'],
        ['蘋果糖甜心少女', 'Candy Apple Sweetheart', 'R', '630', '手拿鮮紅晶亮蘋果糖在攤位間穿梭的浴衣少女。'],
        ['夏夜祭典太鼓狂人', 'Summer Taiko Beatmaster', 'SR', '1130', '赤裸臂膀敲出撼動整座山谷夏夜祭樂的熱血鼓手。'],
        ['水風船戲水幼靈', 'Water Balloon Playful Spirit', 'N', '340', '在七彩花紋乳膠水球裡晃悠晃悠的水靈。'],
        ['祭典巡行神輿守護使', 'Mikoshi Festival Palanquin Guard', 'SR', '1210', '抬著金光神輿帶領全町巡遊的高大金剛護衛。'],
        ['幻彩夜空花火宗師·鍵屋', 'Kagiya the Fireworks Grandmaster', 'SSR', '1670', '能以靈力發射出照亮整座浮世三千尺的花火巨匠。'],
        ['刨冰彩虹小仙女', 'Rainbow Shaved Ice Pixie', 'N', '350', '為清涼刨冰淋上草莓、藍柑與哈密瓜糖漿的小妖精。'],
        ['盛夏炎陽神凰·金烏羽', 'Solar Summer Phoenix', 'SSR', '1750', '在夏日最酷熱正午振翅巡天的太陽之鳥。'],
        ['夏夜涼風折扇公子', 'Cool Breeze Folding Fan Noble', 'R', '670', '搖動竹骨扇悠然漫步在神社燈籠步道旁的貴公子。'],
        ['盛夏狂歡·璀璨萬世夏祭永恆天尊', 'EX // Summer Festival Apex Eternal Sovereign', 'EX', '3830', '匯聚世間所有童年夏夜笑聲、清脆風鈴與不滅花火的盛夏概念神尊。'],
        ['烤章魚丸子小廚神', 'Takoyaki Chef Apprentice', 'R', '620', '用兩根鐵針飛快翻動圓滾滾章魚燒的小廚神。'],
        ['夏祭螢火蟲之靈', 'Summer Firefly Wisp', 'N', '330', '群聚在河畔柳樹下為晚歸遊人引路的發光小螢火。']
      ]
    },
    'mid-autumn': {
      prefix: 'fest-midautumn',
      name: '中秋節',
      en: 'Mid-Autumn',
      elem: 'Moon',
      pCol: { primary: '#1e1b4b', secondary: '#713f12', accent: '#f59e0b', glow: '#fef08a' },
      items: [
        ['桂花酒香小醉仙', 'Osmanthus Wine Sprite', 'N', '330', '偷喝了一滴嫦娥仙釀而臉色微醺的小酒仙。'],
        ['金黃流沙蛋黃酥精靈', 'Golden Yolk Pastry Spirit', 'N', '340', '圓滾滾、肚裡流淌著香濃鹹蛋黃流沙的可愛點心靈。'],
        ['廣寒宮掃階白兔', 'White Rabbit Sweeper', 'R', '640', '手拿竹掃帚清掃廣寒宮大理石落葉的小仙兔。'],
        ['金桂飄香守林翁·吳剛', 'Wu Gang the Laurel Woodcutter', 'SR', '1140', '手持神斧永不停歇砍伐月宮月桂樹的神仙吳剛。'],
        ['月魄流光仙子·望舒', 'Wangshu the Moon Charioteer', 'SSR', '1680', '駕馭白銀月車在繁星銀河中巡遊的太陰御者。'],
        ['太陰星君·月中天后', 'Empress of the Silver Sphere', 'SSR', '1760', '端坐於皓月正中央、執掌群星冷光的大道天后。'],
        ['中秋彩燈巡遊兔少女', 'Lantern Tour Rabbit Girl', 'R', '680', '提著玉兔花燈穿過桂花林的小兔娘。'],
        ['廣寒冰魄神琴·月之音', 'Moonlight Harp of Glacial Heart', 'SR', '1220', '彈奏清冷仙樂傳遍九天十地的白玉古琴仙靈。'],
        ['月夜思鄉愁思靈', 'Moonlit Homesick Spirit', 'N', '320', '寄託了千家萬戶千里共嬋娟祈願的月光微芒。'],
        ['太陰創世·廣寒九天滿月至尊神皇', 'EX // Full Moon Genesis Sovereign Chang\'e Apex', 'EX', '3870', '匯聚多元宇宙所有星系月球引力與銀白冷光的至高創世月神。'],
        ['冰皮雪月餅仙女', 'Snow Skin Mooncake Fairy', 'R', '650', '肌膚如冰皮般剔透白皙的甜美小仙子。'],
        ['月宮桂枝編織者', 'Laurel Branch Weaver', 'N', '350', '為登科遊子編織象徵折桂榮耀桂冠的小仙官。']
      ]
    },
    'anniversary': {
      prefix: 'fest-anniv',
      name: '周年慶',
      en: 'Anniversary',
      elem: 'Anniversary',
      pCol: { primary: '#78350f', secondary: '#b45309', accent: '#f59e0b', glow: '#fef08a' },
      items: [
        ['一周年派對拉炮妖精', 'Party Popper Pixie', 'N', '340', '拉動彩帶噴射出萬道金色碎屑的慶典小精靈。'],
        ['金色一周年紀念金幣仙', 'Golden Jubilee Coin Spirit', 'N', '350', '雕刻著深海水母徽章的一周年紀念黃金硬幣靈。'],
        ['幻藏典籍裝訂工·書蟲', 'Archive Bookbinder Bookworm', 'R', '650', '用金絲為深淵幻藏全套四百一十四張卡牌縫製皮質封面的巧手書靈。'],
        ['慶典彩帶機動少女·卡洛兒', 'Confetti Carol Mech Girl', 'SR', '1150', '背負彩帶發射機甲在全場播灑歡樂旋律的機娘。'],
        ['深淵幻藏傳承者·萬象開門人', 'The Gatekeeper of All Realities', 'SSR', '1690', '手握開啟無盡平行抽卡維度金色萬能鑰匙的時空長老。'],
        ['一周年慶典香檳神侍', 'Celebration Champagne Herald', 'R', '690', '開啟永恆噴湧的星光香檳塔犒勞所有收藏家的執事。'],
        ['星河交匯·多元宇宙編年史記錄者', 'The Chronicle Recorder of Multiverse', 'SSR', '1770', '在星圖上用金筆刻畫每一次十連抽奇蹟的無上書記官。'],
        ['深淵幻藏至高皇冠·萬卡之王', 'Crown of 414 Archive Monarch', 'SR', '1250', '象徵達成 414 張全圖鑑畢業成就的至高榮譽聖冠。'],
        ['周年慶紀念馬卡龍塔小鬼', 'Macaron Tower Little Imp', 'N', '330', '端著九層彩虹馬卡龍在宴會桌上奔跑的服務生小妖精。'],
        ['萬象至高締造者·深淵幻藏多元創世神格', 'EX // Apex Architect of Abyssal Archive All Cosmos', 'EX', '3999', '創造了深淵幻藏這整座宏大收藏殿堂與所有 414 尊神明靈獸的超維度造物主神。'],
        ['慶典金色水母浮游燈', 'Golden Jelly Lantern Float', 'R', '660', '如同金箔氣球般在慶典宴會大廳穹頂漂浮的發光水母燈。']
      ]
    },
    'abyss-eclipse': {
      prefix: 'fest-eclipse',
      name: '深淵之蝕',
      en: 'Abyss Eclipse',
      elem: 'Eclipse',
      pCol: { primary: '#020617', secondary: '#4c0519', accent: '#fb7185', glow: '#fed7aa' },
      items: [
        ['日蝕微光影刃僕從', 'Eclipse Shadowblade Thrall', 'N', '330', '在黑日陰影籠罩時誕生於地面的暗影刺客僕從。'],
        ['暗黑黑曜石日晷靈', 'Obsidian Sundial Spirit', 'N', '340', '指針停滯在永恆黑夜交會點的神秘石頭靈體。'],
        ['月蝕潮汐黑水母', 'Lunar Eclipse Black Jelly', 'R', '640', '在深海海平面完全失去陽光時急速膨脹的黑紫水母。'],
        ['暗蝕審判黑炎騎士', 'Eclipse Inquisitor Blackflame', 'SR', '1140', '策馬踏破黑色日冕、手握黑焰巨劍的審判騎士。'],
        ['黑日冠冕祭司·奧西里斯', 'Osiris Priest of Black Corona', 'SR', '1210', '頭頂燃燒著冰冷黑色火焰光環的深淵大祭司。'],
        ['蝕之暗界吞日魔狼·斯庫爾', 'Skoll the Sun Chaser', 'SSR', '1690', '北歐神話中追逐並在日蝕之日吞噬太陽的巨狼魔神。'],
        ['日蝕之眼·深淵黑洞水母姬', 'Singularity Eclipse Medusa Maiden', 'SSR', '1770', '核心為微型暗物質黑洞的深海蝕日神女。'],
        ['暗影蝕月蝙蝠王', 'Eclipse Shadowfang Bat Sovereign', 'R', '680', '翼展遮蔽整輪滿月的巨型深紅眼眸蝙蝠王。'],
        ['黑曜石暗核幼龍', 'Obsidian Eclipse Wyrmling', 'N', '350', '以日蝕暗能量為食、體表如黑曜石般光滑的幼龍。'],
        ['終焉破曉·黑日蝕神太古至高混沌黑神', 'EX // Black Sun Eclipse Primordial Void God', 'EX', '3950', '支配全宇宙所有恆星與衛星完全重疊之終末時刻的漆黑無上主宰。'],
        ['蝕之紫晶毒蠍', 'Eclipse Amethyst Scorpion', 'R', '660', '尾刺凝聚著日蝕濃縮暗毒素的深淵巨蠍。']
      ]
    }
  };

  // Process all 9 festivals
  for (const festKey of Object.keys(FESTIVALS)) {
    const fest = FESTIVALS[festKey];
    // Existing cards in this festival
    const existingFestCards = result.filter(c => c.series === festKey);
    const existingCount = existingFestCards.length;
    const needCount = 14 - existingCount;

    for (let i = 0; i < needCount; i++) {
      const cardNum = existingCount + i + 1;
      const numStr = cardNum < 10 ? `0${cardNum}` : `${cardNum}`;
      const id = `${fest.prefix}-${numStr}`;
      const item = fest.items[i % fest.items.length];

      addCard({
        id,
        name: item[0],
        nameEn: item[1],
        series: festKey as CardDefinition['series'],
        rarity: item[2] as Rarity,
        power: parseInt(item[3], 10),
        tags: [fest.name, item[1].split(' ')[0], `No.${numStr}`],
        element: festKey === 'abyss-eclipse' ? 'Eclipse' : festKey === 'halloween' ? 'Nocturne' : 'Celestial',
        desc: item[4],
        flavor: `「在${fest.name}的古老傳承中，它的名字代表著永恆的祈願。」`,
        palette: fest.pCol,
        livingAnimationType: festKey === 'abyss-eclipse' ? 'eclipse-pulse' : undefined
      });
    }
  }

  return result;
}

const all414Cards = generate414Cards();
console.log(`\n======================================================`);
console.log(`Total Generated Cards: ${all414Cards.length}`);
console.log(`Series breakdown:`);
const bySeries: Record<string, number> = {};
all414Cards.forEach(c => {
  bySeries[c.series] = (bySeries[c.series] || 0) + 1;
});
console.log(JSON.stringify(bySeries, null, 2));

const byRarity: Record<string, number> = {};
all414Cards.forEach(c => {
  byRarity[c.rarity] = (byRarity[c.rarity] || 0) + 1;
});
console.log(`Rarity breakdown:`);
console.log(JSON.stringify(byRarity, null, 2));
console.log(`======================================================\n`);

// Save updated cards.ts
const fileHeader = `import { CardDefinition } from '@/types';\n\nexport const ALL_CARDS: CardDefinition[] = [\n`;
const fileBody = all414Cards.map(c => {
  return `  {
    id: '${c.id}',
    name: '${c.name.replace(/'/g, "\\'")}',
    nameEn: '${c.nameEn.replace(/'/g, "\\'")}',
    series: '${c.series}',
    rarity: '${c.rarity}',
    description: '${c.description.replace(/'/g, "\\'")}',
    flavorText: '${c.flavorText.replace(/'/g, "\\'")}',
    element: '${c.element}',
    powerRating: ${c.powerRating},
    tags: [${c.tags.map(t => `'${t}'`).join(', ')}],
    artist: '${c.artist}',
    customImageUrl: '/cards/${c.id}.jpg',
    visualSeed: '${c.visualSeed}',
    palette: { primary: '${c.palette.primary}', secondary: '${c.palette.secondary}', accent: '${c.palette.accent}', glow: '${c.palette.glow}' }${c.livingAnimationType ? `,\n    livingAnimationType: '${c.livingAnimationType}'` : ''}
  }`;
}).join(',\n');
const fileFooter = `\n];\n`;

fs.writeFileSync('src/data/cards.ts', fileHeader + fileBody + fileFooter, 'utf8');
console.log('Successfully wrote src/data/cards.ts with 414 cards!');
