import { isNumber, sort, sum } from 'radash';
import munkres from 'munkres-js';

import { type WarMachineData, type WarMachine, type CrewHero } from '../schemas';
import { WarMachineName, warMachinesBaseData } from '../data';
import { WarMachineRarity, warMachineRarityLevels } from '../enums';

const getSafeNumber = (value: number | undefined): number => {
  return value ?? 0;
}

const generateHungarianArray = (
  warMachines: WarMachine[],
  heroes: CrewHero[],
  crewCount: number,
  scores: Record<WarMachineName, Record<string, number>>,
  data: WarMachineData['current'],
  engineerLevel: number,
): { hungarianArray: number[][]; warMachineOrder: WarMachine[]; heroOrder: string[]; } => {
  let hungarianArray: number[][] = [];
  let warMachineOrder: WarMachine[] = [];
  let heroOrder: string[] = [];
  const totalColumns = warMachines.length * crewCount;
  const extraColumns = Math.max(heroes.length - totalColumns, 0);
  const extraRows = Math.max(totalColumns - heroes.length, 0);
  let column = 0;
  let row = 0;
  let maxValue = 0;

  for (const warMachine of warMachines) {
    if (column % crewCount === 0) {
      warMachineOrder.push(warMachine);
    }

    for (const hero of heroes) {
      if (!heroOrder.includes(hero.name)) {
        heroOrder.push(hero.name)
      }

      const score = scores[warMachine.name][hero.name];

      // We want to find the max solution, so we need to negate the values and then add the max, which we'll do below
      for (let i = 0; i < crewCount; i++) {
        hungarianArray[row] ??= [];
        hungarianArray[row].push(-1 * score);
      }

      if (score > maxValue) {
        maxValue = score;
      }

      row++;
    }

    for (let j = 0; j < extraRows; j++) {
      heroOrder.push('');
      hungarianArray[row + j] = new Array(totalColumns).fill(0);
    }

    row = 0;
    column += crewCount;
  }

  if (extraColumns > 0) {
    hungarianArray.forEach((rowValue, rowIndex) => {
      for (let i = 0; i < (totalColumns + extraColumns); i++) {
        hungarianArray[rowIndex][i] ??= 0;
      }
    });
  }

  // We want to get the max value, so we need to add the max value to all of the negative values so the best option is found
  hungarianArray.forEach((rowValue, rowIndex) => {
    rowValue.forEach((value, columnIndex) => {
      if (value !== 0) {
        hungarianArray[rowIndex][columnIndex] = value + maxValue;
      }
    });
  });

  const simulationWarMachines = new Set(warMachines);
  let lowestCampaignPower: number | undefined;

  while (simulationWarMachines.size > 5) {
    const weakestWarMachines: Record<string, WarMachine> = {};

    for (const warMachine of simulationWarMachines) {
      if (lowestCampaignPower === undefined) {
        lowestCampaignPower = getWarMachineCampaignStats(warMachine, [], data, engineerLevel).power;
        weakestWarMachines[lowestCampaignPower] = warMachine;
      } else {
        const campaignPower = getWarMachineCampaignStats(warMachine, [], data, engineerLevel).power;
        weakestWarMachines[campaignPower] = warMachine;
      }
    }

    const [[, warMachineToRemove]] = sort(
      Object.entries(weakestWarMachines),
      ([key]) => Number(key),
    );
    simulationWarMachines.delete(warMachineToRemove);

    const results = generateHungarianArray([...simulationWarMachines], heroes, crewCount, scores, data, engineerLevel);
    hungarianArray = results.hungarianArray;
    warMachineOrder = results.warMachineOrder;
    heroOrder = results.heroOrder;
  }

  return {
    hungarianArray,
    warMachineOrder,
    heroOrder,
  };
}

const calculateEngineerLevel = (totalXp: number): number => {
  let level = 1;
  let requiredXp = 600;

  while (totalXp >= requiredXp) {
    totalXp -= requiredXp;
    level++;
    requiredXp += 50;
  }

  return level;
}

export const computeBestCrew = (data: WarMachineData['current']) => {
  const heroes = Object
    .values(data.crewHeroes)
    .filter(hero => getSafeNumber(hero.attributeArmor) || getSafeNumber(hero.attributeDamage) || getSafeNumber(hero.attributeHealth));

  const warMachines = Object
    .values(data.warMachines)
    .filter(warMachine => getSafeNumber(warMachine.level));

  if (!warMachines.length) {
    return {
      campaignPower: 0,
      warMachines: {},
    };
  }

  const totalWarMachineLevels = sum(warMachines, warMachine => getSafeNumber(warMachine.level) - 1);
  const engineerLevel = calculateEngineerLevel(totalWarMachineLevels * 100);
  const crewCount = getCrewCount(engineerLevel ?? 0);
  const scores: Record<WarMachineName, Record<string, number>> = {} as Record<WarMachineName, Record<string, number>>;

  for (const warMachine of warMachines) {
    scores[warMachine.name] = {};

    for (const hero of heroes) {
      scores[warMachine.name][hero.name] = getWarMachineCampaignStats(warMachine, [hero], data, engineerLevel).power;
    }
  }

  const results = generateHungarianArray(warMachines, heroes, crewCount, scores, data, engineerLevel);
  const assignments = munkres(results.hungarianArray) as [number, number][];
  // Convert assignments to a dictionary-like object
  const optimalWarMachines = Object.fromEntries(assignments.map(([row, col]) => [row, col]));

  const crews: Record<WarMachineName, string[]> = {} as Record<WarMachineName, string[]>;

  for (const [heroId, warMachinePosition] of Object.entries(optimalWarMachines)) {
    // If you have more heros than WMs we just need to ignore the extra ones
    if (Math.floor(warMachinePosition / crewCount) >= 5) {
      continue;
    }

    const warMachineName = results.warMachineOrder[Math.floor(warMachinePosition / crewCount)]?.name;
    const hero = heroes[Number(heroId)];

    if (warMachineName && hero) {
      crews[warMachineName] ??= [];
      crews[warMachineName].push(hero.name);
    }
  }

  const orderedCrews: Record<WarMachineName, ComputedWarMachine> = {} as Record<WarMachineName, ComputedWarMachine>;

  let strongestWarMachines = sort(
    warMachines.map(warMachine => ({
      ...warMachine,
      ...getWarMachineCampaignStats(
        warMachine,
        crews[warMachine.name]?.map(heroName => data.crewHeroes[heroName]) ?? [],
        data,
        engineerLevel,
      ),
    })),
    warMachine => warMachine.power,
    true,
  ).slice(0, 5);
  strongestWarMachines = sort(
    strongestWarMachines,
    // favoritize tanks to be on the front and damage dealers on the back
    warMachine => warMachine.health + warMachine.armor * 10 - warMachine.damage * 70,
  );

  for (const warMachine of strongestWarMachines) {
    orderedCrews[warMachine.name] = {
      name: warMachine.name,
      power: warMachine.power,
      damage: warMachine.damage,
      health: warMachine.health,
      armor: warMachine.armor,
      rarity: warMachine.rarity,
      crew: crews[warMachine.name] ?? [],
    };
  }

  const campaignPower = sum(Object.values(orderedCrews), warMachine => warMachine.power);

  return {
    campaignPower,
    warMachines: orderedCrews,
  };
}

const getWarMachineCampaignStats = (warMachine: WarMachine, crew: CrewHero[], data: WarMachineData['current'], engineerLevel: number) => {
  const levelBonus = Math.pow(1.05, (warMachine.level ?? 1) - 1) - 1;
  const engineerBonus = Math.pow(1.05, (engineerLevel ?? 1) - 1) - 1;
  const rarityLevel = warMachineRarityLevels[warMachine.rarity];
  const allRarityLevels = sum(Object.values(data.warMachines), warMachine => warMachineRarityLevels[warMachine.rarity]);
  const rarityBonus = Math.pow(1.05, rarityLevel + allRarityLevels) - 1;
  const sacredCardBonus = Math.pow(1.05, warMachine.sacredCardLevel ?? 0);
  const blueprintDamageBonus = Math.pow(1.05, warMachine.damageBlueprintLevel ?? 0) - 1;
  const blueprintHealthBonus = Math.pow(1.05, warMachine.healthBlueprintLevel ?? 0) - 1;
  const blueprintArmorBonus = Math.pow(1.05, warMachine.armorBlueprintLevel ?? 0) - 1;
  let damageArtifactBonus = 1;
  let healthArtifactBonus = 1;
  let armorArtifactBonus = 1;

  for (const [dirtyPercentage, count] of Object.entries(data.artifactTypes.damage?.percents ?? {})) {
    const percentage = Number(dirtyPercentage);

    if (isNumber(percentage) && isNumber(count) && count) {
      damageArtifactBonus *= Math.pow(1 + percentage / 100, count);
    }
  }
  for (const [dirtyPercentage, count] of Object.entries(data.artifactTypes.health?.percents ?? {})) {
    const percentage = Number(dirtyPercentage);

    if (isNumber(percentage) && isNumber(count) && count) {
      healthArtifactBonus *= Math.pow(1 + percentage / 100, count);
    }
  }
  for (const [dirtyPercentage, count] of Object.entries(data.artifactTypes.armor?.percents ?? {})) {
    const percentage = Number(dirtyPercentage);

    if (isNumber(percentage) && isNumber(count) && count) {
      armorArtifactBonus *= Math.pow(1 + percentage / 100, count);
    }
  }

  damageArtifactBonus--;
  healthArtifactBonus--;
  armorArtifactBonus--;

  const getBaseDamage = (): number => {
    return warMachinesBaseData[warMachine.name].damage * (levelBonus + 1) * (engineerBonus + 1) * (rarityBonus + 1) * (blueprintDamageBonus + 1) * sacredCardBonus * (damageArtifactBonus + 1);
  }

  const getBaseHealth = (): number => {
    return warMachinesBaseData[warMachine.name].health * (levelBonus + 1) * (engineerBonus + 1) * (rarityBonus + 1) * (blueprintHealthBonus + 1) * sacredCardBonus * (healthArtifactBonus + 1);
  }

  const getBaseArmor = (): number => {
    return warMachinesBaseData[warMachine.name].armor * (levelBonus + 1) * (engineerBonus + 1) * (rarityBonus + 1) * (blueprintArmorBonus + 1) * sacredCardBonus * (armorArtifactBonus + 1);
  }

  const getDamage = (): number => {
    const crewBonus = sum(crew, hero => getSafeNumber(hero.attributeDamage) / 100);
    return Math.floor(getBaseDamage() * (crewBonus + 1));
  }

  const getHealth = (): number => {
    const crewBonus = sum(crew, hero => getSafeNumber(hero.attributeHealth) / 100);
    return Math.floor(getBaseHealth() * (crewBonus + 1));
  }

  const getArmor = (): number => {
    const crewBonus = sum(crew, hero => getSafeNumber(hero.attributeArmor) / 100);
    return Math.floor(getBaseArmor() * (crewBonus + 1));
  }

  const damage = getDamage();
  const health = getHealth();
  const armor = getArmor();

  const damagePower = Math.pow(damage * 10, 0.7);
  const healthPower = Math.pow(health, 0.7);
  const armorPower = Math.pow(armor * 10, 0.7);

  const power = Math.floor(damagePower + healthPower + armorPower);
  return {
    damage,
    health,
    armor,
    power,
  };
}

const getCrewCount = (engineerLevel: number): number => {
  if (engineerLevel >= 60) {
    return 6;
  }

  if (engineerLevel >= 30) {
    return 5;
  }

  return 4;
}

export interface ComputedWarMachine {
  name: WarMachineName;
  crew: string[];
  power: number;
  damage: number;
  health: number;
  armor: number;
  rarity: WarMachineRarity;
}
