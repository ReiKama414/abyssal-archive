export type Rarity = 'N' | 'R' | 'SR' | 'SSR' | 'UR' | 'EX';

export type CardVariant = 
  | 'Normal'
  | 'Silver Foil'
  | 'Holographic'
  | 'Royal Gold'
  | 'Living Card'
  | 'Abyss Edition'
  | 'Prismatic Signature';

export type SeriesId = 
  | 'abyssal-jellyfish'
  | 'nocturne-fantasy'
  | 'neon-district'
  | 'phantom-beasts'
  | 'halloween'
  | 'christmas'
  | 'new-year'
  | 'valentines'
  | 'sakura-festival'
  | 'summer-festival'
  | 'mid-autumn'
  | 'anniversary'
  | 'abyss-eclipse';

export interface CardDefinition {
  id: string;
  name: string;
  nameEn: string;
  series: SeriesId;
  rarity: Rarity;
  description: string;
  flavorText: string;
  element: 'Abyss' | 'Nocturne' | 'Cyber' | 'Spirit' | 'Celestial' | 'Eclipse' | 'Halloween' | 'Christmas' | 'NewYear' | 'Valentines' | 'Sakura' | 'Summer' | 'Moon' | 'Anniversary';
  powerRating: number;
  tags: string[];
  artist: string;
  // Visual generation parameters to produce unique, stunning card illustrations
  visualSeed: string;
  palette: {
    primary: string;
    secondary: string;
    accent: string;
    glow: string;
  };
  customImageUrl?: string;
  livingAnimationType?: 'jellyfish-swim' | 'cyber-rain' | 'gothic-aura' | 'spirit-flame' | 'eclipse-pulse';
}

export interface CardPack {
  id: string;
  name: string;
  nameEn: string;
  seriesId: SeriesId;
  isPermanent: boolean;
  themeColor: string;
  accentColor: string;
  description: string;
  coverImageSeed: string;
  // Festival date constraints (format: MM-DD to MM-DD in Asia/Taipei)
  activeRange?: {
    startMonth: number;
    startDay: number;
    endMonth: number;
    endDay: number;
  };
  featuredCardIds: string[];
}

export interface CollectionItem {
  cardId: string;
  variant: CardVariant;
  count: number;
  firstAcquiredAt: string; // ISO string
  lastAcquiredAt: string;  // ISO string
  isFavorite?: boolean;
}

export interface UserState {
  dailyPullsRemaining: number;
  lastPullDateTaipei: string; // YYYY-MM-DD in Asia/Taipei
  srPity: number;             // Resets to 0 on SR, SSR, UR, EX. Guarantees SR+ at 10.
  urPity: number;             // Resets to 0 on UR, EX. Guarantees UR+ at 50.
  exPity: number;             // Resets to 0 on EX. Guarantees EX at 200.
  totalPulls: number;
  showcaseCardIds: string[];  // Up to 5 cards for the 3D showcase
}

export interface PulledCard {
  card: CardDefinition;
  variant: CardVariant;
  pulledAt: string;
  isNew: boolean;
}

export interface PullRecord {
  id: string;
  timestamp: string;
  packId: string;
  packName: string;
  pullCount: number;
  cards: {
    cardId: string;
    variant: CardVariant;
  }[];
}

export interface AppSettings {
  soundVolume: number;
  isMuted: boolean;
  animationQuality: 'high' | 'medium' | 'low';
  reducedMotion: boolean;
}

export interface CollectionExportData {
  version: string;
  exportedAt: string;
  userState: UserState;
  collection: CollectionItem[];
  pullHistory: PullRecord[];
  settings: AppSettings;
}
