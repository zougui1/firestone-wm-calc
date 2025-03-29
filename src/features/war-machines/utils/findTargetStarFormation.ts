import { max, sort } from 'radash';

import { average } from '~/utils';

import { ComputedWarMachine } from './computeBestCrew';
import { formatResults, getTotalStars, simulateCampaignPrimary } from './simulateCampaignBattle'
import { WarMachineName, warMachinesBaseData } from '../gameData/data';
import { warMachineAbilityActivationChance, warMachineRarityLevelAvailabilities, warMachineRarityLevels, warMachineRarityLevelsReverse } from '../gameData/enums';
import { GameData } from '../gameData/schemas';
import { invokeComputeBestCrew } from '../workers/computeBestCrew.invoke';

const totalSimulations = 250;

const orderFromStrongestToWeakeast = (warMachines: ComputedWarMachine[]) => {
  return sort(warMachines, warMachine => warMachine.health + warMachine.armor * 10 + warMachine.damage * 10, true);
}

interface WarMachineMetadata {
  isMain: boolean;
}

export const findTargetStarFormation = async (data: GameData, targetStarLevel: number, options?: FindTargetStarFormationOptions) => {
  data = structuredClone(data);

  const currentBestCrew = await invokeComputeBestCrew(data, options);
  const currentWarMachines = Object.values(data.warMachines).filter(wm => wm.level);
  let team = orderFromStrongestToWeakeast(Object.values(currentBestCrew.warMachines)).map(wm => wm.name);
  const currentWarMachinesInTeam = currentWarMachines.filter(wm => team.includes(wm.name));
  const warMachineInTeamLevels = currentWarMachinesInTeam.map(wm => wm.level ?? 0);

  const highestWarMachineLevelWarMachine = max(currentWarMachinesInTeam, wm => wm.level ?? 0);
  const averageWarMachineLevel = average(warMachineInTeamLevels);

  const rarityUpgrades: WarMachineName[] = [];
  const warMachinesMetadata: Partial<Record<WarMachineName, WarMachineMetadata>> = {};

  for (const warMachine of currentWarMachines) {
    const level = warMachine.level ?? 0;
    const levelDifference = averageWarMachineLevel - level;

    warMachinesMetadata[warMachine.name] = {
      isMain: levelDifference <= 2,
    };
  }

  if (highestWarMachineLevelWarMachine?.level) {
    for (const warMachine of currentWarMachinesInTeam) {
      const metadata = warMachinesMetadata[warMachine.name];

      if (!metadata || !warMachine.level || highestWarMachineLevelWarMachine.level <= warMachine.level) {
        continue;
      }

      const currentRarityLevel = warMachineRarityLevels[warMachine.rarity];
      const nexRarity = warMachineRarityLevelsReverse[currentRarityLevel + 1];

      if (nexRarity) {
        const requiredLevel = warMachineRarityLevelAvailabilities[nexRarity];

        if (warMachine.level >= requiredLevel) {
          rarityUpgrades.push(warMachine.name);
          continue;
        }

        if (warMachine.rarity === 'common') {
          const highestRequiredLevel = warMachineRarityLevelAvailabilities[highestWarMachineLevelWarMachine.rarity];
          const highestRarityLevel = warMachineRarityLevels[highestWarMachineLevelWarMachine.rarity];
          const highestNextRarity = warMachineRarityLevelsReverse[highestRarityLevel + 1];

          if (highestNextRarity) {
            const highestNextRequiredLevel = warMachineRarityLevelAvailabilities[highestNextRarity];
            const difference = highestNextRequiredLevel - highestRequiredLevel;

            if (highestWarMachineLevelWarMachine.level >= (highestRequiredLevel + difference / 2)) {
              rarityUpgrades.push(warMachine.name);
            }
          }
        } else {
          const highestRarityLevel = warMachineRarityLevels[highestWarMachineLevelWarMachine.rarity];
          const highestNextRarity = warMachineRarityLevelsReverse[highestRarityLevel + 1];
          const highestNextNextRarity = warMachineRarityLevelsReverse[highestRarityLevel + 2];

          if (highestNextRarity && highestNextNextRarity) {
            const highestRequiredLevel = warMachineRarityLevelAvailabilities[highestNextRarity];
            const highestNextRequiredLevel = warMachineRarityLevelAvailabilities[highestNextNextRarity];
            const difference = highestNextRequiredLevel - highestRequiredLevel;

            if (highestWarMachineLevelWarMachine.level >= (highestRequiredLevel + difference / 2)) {
              rarityUpgrades.push(warMachine.name);
            }
          }
        }
      }
    }

    for (const warMachine of currentWarMachines) {
      if (team.includes(warMachine.name)) {
        continue;
      }

      const metadata = warMachinesMetadata[warMachine.name];

      if (!metadata || !warMachine.level || highestWarMachineLevelWarMachine.level <= warMachine.level) {
        continue;
      }

      const currentRarityLevel = warMachineRarityLevels[warMachine.rarity];
      const nexRarity = warMachineRarityLevelsReverse[currentRarityLevel + 1];

      if (nexRarity) {
        const requiredLevel = warMachineRarityLevelAvailabilities[nexRarity];

        if (warMachine.level >= requiredLevel) {
          rarityUpgrades.push(warMachine.name);
          continue;
        }

        if (warMachine.rarity === 'common') {
          const highestRequiredLevel = warMachineRarityLevelAvailabilities[highestWarMachineLevelWarMachine.rarity];
          const highestRarityLevel = warMachineRarityLevels[highestWarMachineLevelWarMachine.rarity];
          const highestNextRarity = warMachineRarityLevelsReverse[highestRarityLevel + 1];

          if (highestNextRarity) {
            const highestNextRequiredLevel = warMachineRarityLevelAvailabilities[highestNextRarity];
            const difference = highestNextRequiredLevel - highestRequiredLevel;

            if (highestWarMachineLevelWarMachine.level >= (highestRequiredLevel + difference / 2)) {
              rarityUpgrades.push(warMachine.name);
            }
          }
        } else {
          const highestRarityLevel = warMachineRarityLevels[highestWarMachineLevelWarMachine.rarity];
          const highestNextRarity = warMachineRarityLevelsReverse[highestRarityLevel + 1];
          const highestNextNextRarity = warMachineRarityLevelsReverse[highestRarityLevel + 2];

          if (highestNextRarity && highestNextNextRarity) {
            const highestRequiredLevel = warMachineRarityLevelAvailabilities[highestNextRarity];
            const highestNextRequiredLevel = warMachineRarityLevelAvailabilities[highestNextNextRarity];
            const difference = highestNextRequiredLevel - highestRequiredLevel;

            if (highestWarMachineLevelWarMachine.level >= (highestRequiredLevel + difference / 2)) {
              rarityUpgrades.push(warMachine.name);
            }
          }
        }
      }
    }
  }


  team = team.filter(wm => warMachinesMetadata[wm]?.isMain);

  for (const warMachineName of rarityUpgrades) {
    const warMachine = currentWarMachines.find(wm => wm.name === warMachineName);

    if (!warMachine?.level) {
      continue;
    }

    const currentRarityLevel = warMachineRarityLevels[warMachine.rarity];
    const nexRarity = warMachineRarityLevelsReverse[currentRarityLevel + 1];
    const requiredLevel = warMachineRarityLevelAvailabilities[nexRarity];

    if (requiredLevel && nexRarity) {
      if (warMachine.level < requiredLevel) {
        warMachine.level = requiredLevel;
      }

      warMachine.rarity = nexRarity;
    }
  }

  let stars = 0;
  let upgradeWarMachineIndex = 0;

  while (stars < targetStarLevel) {
    if (options?.signal?.aborted) {
      console.log('aborted');
      return data;
    }

    const computedData = await invokeComputeBestCrew(data, options);
    const simulationWarMachines = Object.values(computedData.warMachines).map(wm => ({
      ...wm,
      maxHealth: wm.health,
      abilityActivationChance: warMachineAbilityActivationChance[wm.rarity],
    }));
    const currentResult = simulateCampaignPrimary(simulationWarMachines, computedData.campaignPower, {
      ...options,
      totalSimulations,
    });
    stars = getTotalStars(formatResults(currentResult));

    if (stars >= targetStarLevel) {
      break;
    }

    if (upgradeWarMachineIndex >= team.length) {
      upgradeWarMachineIndex = 0;
    }

    const upgradeWarMachine = data.warMachines[team[upgradeWarMachineIndex++]];
    const warMachineMetadata = warMachinesMetadata[upgradeWarMachine.name];
    const warMachineBaseData = warMachinesBaseData[upgradeWarMachine.name];

    const currentRarityLevel = warMachineRarityLevels[upgradeWarMachine.rarity];
    const nexRarity = warMachineRarityLevelsReverse[currentRarityLevel + 1];

    if (nexRarity && upgradeWarMachine.level) {
      const requiredLevel = warMachineRarityLevelAvailabilities[nexRarity];

      if (upgradeWarMachine.level >= requiredLevel) {
        upgradeWarMachine.rarity = nexRarity;
        continue;
      }
    }

    upgradeWarMachine.level ??= 0;
    const maxBlueprintLevel = Math.floor(upgradeWarMachine.level / 5) * 5 + 5;

    const isBlueprintLevelMaxed = (blueprintLevel: number | undefined): boolean => {
      return Boolean(blueprintLevel && blueprintLevel >= maxBlueprintLevel);
    }

    if (
      isBlueprintLevelMaxed(upgradeWarMachine.damageBlueprintLevel) ||
      isBlueprintLevelMaxed(upgradeWarMachine.healthBlueprintLevel)
    ) {
      upgradeWarMachine.level++;
      continue;
    }

    if (warMachineBaseData.specializationType === 'damage') {
      upgradeWarMachine.damageBlueprintLevel = (upgradeWarMachine.damageBlueprintLevel ?? 0) + 5;
    } else if (warMachineBaseData.specializationType === 'tank') {
      upgradeWarMachine.damageBlueprintLevel = (upgradeWarMachine.damageBlueprintLevel ?? 0) + 5;
      upgradeWarMachine.healthBlueprintLevel = (upgradeWarMachine.healthBlueprintLevel ?? 0) + 5;
    }
  }

  return data;
}

export interface FindTargetStarFormationOptions {
  signal?: AbortSignal;
  //onChange?: (data: Partial<Record<Difficulty, CampaignDifficultySimulationResult>>) => void;
}
