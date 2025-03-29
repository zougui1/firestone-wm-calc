export const warMachineRarities = {
  common: 'common',
  uncommon: 'uncommon',
  rare: 'rare',
  epic: 'epic',
  legendary: 'legendary',
  mythic: 'mythic',
  titan: 'titan',
  angel: 'angel',
} as const;

export const warMachineRarityList = Object.values(warMachineRarities) as [WarMachineRarity, ...WarMachineRarity[]];
export type WarMachineRarity = typeof warMachineRarities[keyof typeof warMachineRarities];

export const warMachineAbilityActivationChance: Record<WarMachineRarity, number> = {
  common: 25,
  uncommon: 28,
  rare: 31,
  epic: 34,
  legendary: 37,
  mythic: 40,
  titan: 43,
  angel: 46,
};

export const warMachineRarityLevelAvailabilities = {
  common: 1,
  uncommon: 10,
  rare: 50,
  epic: 100,
  legendary: 150,
  mythic: 200,
  titan: 250,
  angel: 300,
} as Record<WarMachineRarity, number>;

export const warMachineRarityLevels = {
  common: 0,
  uncommon: 1,
  rare: 2,
  epic: 3,
  legendary: 4,
  mythic: 5,
  titan: 6,
  angel: 7,
} as Record<WarMachineRarity, number>;
export const warMachineRarityLevelsReverse = {
  0: 'common',
  1: 'uncommon',
  2: 'rare',
  3: 'epic',
  4: 'legendary',
  5: 'mythic',
  6: 'titan',
  7: 'angel',
} as Record<number, WarMachineRarity>;

export const specializationTypes = {
  damage: 'damage',
  tank: 'tank',
  healer: 'healer',
} as const;

export const difficulties = {
  easy: 'easy',
  normal: 'normal',
  hard: 'hard',
  insane: 'insane',
  nightmare: 'nightmare',
} as const;

export const difficultyList = Object.values(difficulties) as [Difficulty, ...Difficulty[]];
export type Difficulty = typeof difficulties[keyof typeof difficulties];
