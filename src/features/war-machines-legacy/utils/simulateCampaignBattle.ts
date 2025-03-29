import { sort } from 'radash';

import { randomInt } from '~/utils';

import { difficulties, Difficulty, difficultyList } from '../enums';
import { WarMachineName, warMachinesBaseData } from '../data';
import { invokeSimulateDetailedMission } from '../workers/simulateDetailedMission.invoke';

export interface SimulationWarMachine {
  name: WarMachineName | 'enemy';
  damage: number;
  maxHealth: number;
  health: number;
  armor: number;
  abilityActivationChance: number;
}

interface EnemySquad {
  warMachines: SimulationWarMachine[];
  totalPower: number;
}

interface Mission {
  level: number;
  difficulty: Difficulty;
}

const difficultyMultipliers: Record<Difficulty, number> = {
  easy: 1,
  normal: 360,
  hard: 2478600,
  insane: 5800000000000,
  nightmare: 2920000000000000000,
};

const getEnemyWarMachine = (multiplier: number = 1): SimulationWarMachine => {
  return {
    name: 'enemy',
    damage: 260 * multiplier,
    maxHealth: 1560 * multiplier,
    health: 1560 * multiplier,
    armor: 30 * multiplier,
    abilityActivationChance: 0,
  };
}

const calculateEnemyPower = (warMachine: SimulationWarMachine): number => {
  const damagePower = Math.pow(warMachine.damage * 10, 0.7);
  const healthPower = Math.pow(warMachine.health, 0.7);
  const armorPower = Math.pow(warMachine.armor * 10, 0.7);

  return Math.floor(damagePower + healthPower + armorPower);
}

const getEnemySquad = (mission: Mission): EnemySquad => {
  const difficultyMultiplier = difficultyMultipliers[mission.difficulty];
  const baseMultiplier = difficultyMultiplier * Math.pow(1.2, mission.level - 1);
  const powerMultiplier = Math.pow(2, Math.floor((mission.level - 1) / 10));
  const statMultiplier = Math.pow(3, Math.floor((mission.level - 1) / 10));

  let totalPower = 0;
  const enemySquad: SimulationWarMachine[] = [];

  for (let i = 0; i < 5; i++) {
    const enemyWarMachine = getEnemyWarMachine(baseMultiplier);

    enemySquad.push({
      name: enemyWarMachine.name,
      damage: enemyWarMachine.damage * statMultiplier,
      maxHealth: enemyWarMachine.maxHealth * statMultiplier,
      health: enemyWarMachine.health * statMultiplier,
      armor: enemyWarMachine.armor * statMultiplier,
      abilityActivationChance: enemyWarMachine.abilityActivationChance,
    });

    totalPower += calculateEnemyPower({
      name: enemyWarMachine.name,
      damage: enemyWarMachine.damage * powerMultiplier,
      maxHealth: enemyWarMachine.maxHealth * powerMultiplier,
      health: enemyWarMachine.health * powerMultiplier,
      armor: enemyWarMachine.armor * powerMultiplier,
      abilityActivationChance: enemyWarMachine.abilityActivationChance,
    });
  }

  return { warMachines: enemySquad, totalPower };
}

const getRequiredPower = (mission: Mission, enemySquad: EnemySquad): number => {
  if (mission.difficulty === difficulties.easy && mission.level >= 11 && mission.level <= 30) {
    return enemySquad.totalPower * 0.5;
  }

  if (mission.difficulty !== difficulties.easy || mission.level > 30) {
    return enemySquad.totalPower * 0.8;
  }

  return enemySquad.totalPower * 0.3;
}

const getDamageDealt = (damage: number, armor: number): number => {
  return Math.max(damage - armor, 0);
}

const getRandomTargets = (warMachines: SimulationWarMachine[], targetCount: number): SimulationWarMachine[] => {
  const aliveWarMachines = warMachines.filter(wm => wm.health > 0);
  const selectedTargets: SimulationWarMachine[] = [];

  if (targetCount >= aliveWarMachines.length) {
    return aliveWarMachines;
  }

  // Shuffle method: Swap selected elements to the end and reduce search space
  for (let i = 0; i < targetCount; i++) {
    const randIndex = i + Math.floor(Math.random() * (aliveWarMachines.length - i));
    [aliveWarMachines[i], aliveWarMachines[randIndex]] = [aliveWarMachines[randIndex], aliveWarMachines[i]];
    selectedTargets.push(aliveWarMachines[i]);
  }

  return selectedTargets;
}

export const simulateCampaignBattle = (options: SimulateCampaignBattleOptions): SimulationResult => {
  const { playerWarMachines, enemyWarMachines, abilityActivationChance = -1 } = options;


  const applyAbility = (playerWarMachine: SimulationWarMachine, enemyWarMachine: SimulationWarMachine): number => {
    const activationThreshold = randomInt(1, 100);
    const activationChance = abilityActivationChance < 0
      ? playerWarMachine.abilityActivationChance
      : abilityActivationChance;

    if (activationThreshold > activationChance) {
      return 0;
    }

    switch (playerWarMachine.name) {
      case warMachinesBaseData.cloudfist.name:
      case warMachinesBaseData.talos.name:
        return getDamageDealt(playerWarMachine.damage * 2, enemyWarMachine.armor);
      case warMachinesBaseData.aegis.name:
        return getDamageDealt(playerWarMachine.damage * 1.6, enemyWarMachine.armor);
      case warMachinesBaseData.firecracker.name:
        return getDamageDealt(playerWarMachine.damage * 1.5, enemyWarMachine.armor);
      case warMachinesBaseData.goliath.name: {
        playerWarMachine.health += playerWarMachine.maxHealth * 0.1;
        playerWarMachine.health = Math.min(playerWarMachine.maxHealth, playerWarMachine.health);
        break;
      }
      case warMachinesBaseData.earthshatterer.name: {
        for (const enemyWarMachine of enemyWarMachines) {
          enemyWarMachine.health -= getDamageDealt(playerWarMachine.damage * 0.8, enemyWarMachine.armor);
        }
        break;
      }
      case warMachinesBaseData.judgement.name: {
        for (const enemyWarMachine of enemyWarMachines) {
          enemyWarMachine.health -= getDamageDealt(playerWarMachine.damage * 0.6, enemyWarMachine.armor);
        }
        break;
      }
      case warMachinesBaseData.fortress.name: {
        const targets = getRandomTargets(enemyWarMachines, 2);

        for (const target of targets) {
          target.health -= getDamageDealt(playerWarMachine.damage * 0.6, target.armor);
        }

        break;
      }
      case warMachinesBaseData.sentinel.name: {
        for (const warMachine of playerWarMachines) {
          if (warMachine.health > 0) {
            warMachine.health += playerWarMachine.damage * 1.5;
            warMachine.health = Math.min(warMachine.maxHealth, warMachine.health);
          }
        }

        break;
      }
      case warMachinesBaseData.hunter.name: {
        const targets = getRandomTargets(playerWarMachines, 2);

        for (const target of targets) {
          target.health += playerWarMachine.damage * 1.5;
          target.health = Math.min(target.maxHealth, target.health);
        }

        break;
      }
      case warMachinesBaseData.thunderclap.name: {
        const targets = getRandomTargets(enemyWarMachines, 3);

        for (const target of targets) {
          target.health -= getDamageDealt(playerWarMachine.damage * 1.2, target.armor);
        }

        break;
      }
      case warMachinesBaseData.harvester.name: {
        const enemyCount = enemyWarMachines.length - 1;

        for (let i = enemyCount; i > enemyCount - 1; i--) {
          // don't care if they are already dead as in the campaign enemies
          // will always die in order
          enemyWarMachines[i].health -= getDamageDealt(playerWarMachine.damage * 1.3, enemyWarMachines[i].armor);
        }

        break;
      }
      case warMachinesBaseData.curator.name: {
        let lowestHealth: number | undefined;
        let lowestHealthWarMachine: SimulationWarMachine | undefined;

        for (const warMachine of playerWarMachines) {
          if (warMachine.health > 0) {
            if (lowestHealth === undefined || lowestHealth > ((warMachine.maxHealth - warMachine.health) / warMachine.maxHealth)) {
              lowestHealthWarMachine = warMachine;
              lowestHealth = (warMachine.maxHealth - warMachine.health) / warMachine.maxHealth;
            }
          }
        }

        if(lowestHealthWarMachine) {
          lowestHealthWarMachine.health += playerWarMachine.damage * 1.5;
          lowestHealthWarMachine.health = Math.min(lowestHealthWarMachine.maxHealth, lowestHealthWarMachine.health);
        }

        break;
      }
    }

    return 0;
  }

  const attack = (playerWarMachines: SimulationWarMachine, enemyWarMachine: SimulationWarMachine): { damage: number; extraDamage: number } => {
    const damage = getDamageDealt(playerWarMachines.damage, enemyWarMachine.armor);
    const extraDamage = applyAbility(playerWarMachines, enemyWarMachine);

    return { damage, extraDamage };
  }

  let currentEnemyTargetIndex = 0;
  let currentPlayerTargetIndex = 0;
  let roundsPlayed = 0;
  const totalPlayWarMachines = playerWarMachines.length;

  for (let round = 1; round <= 20; round++) {
    for (const playerWarMachine of playerWarMachines) {
      if (playerWarMachine.health <= 0) {
        continue;
      }

      const attackResult = attack(playerWarMachine, enemyWarMachines[currentEnemyTargetIndex]);
      enemyWarMachines[currentEnemyTargetIndex].health -= attackResult.damage + attackResult.extraDamage;

      if (enemyWarMachines[currentEnemyTargetIndex].health <= 0) {
        currentEnemyTargetIndex++;
      }

      if (currentEnemyTargetIndex > 4) {
        return { status: 'win', roundsPlayed };
      }
    }

    for (const enemyWarMachine of enemyWarMachines) {
      if (enemyWarMachine.health <= 0) {
        continue;
      }

      playerWarMachines[currentPlayerTargetIndex].health -= getDamageDealt(enemyWarMachine.damage, playerWarMachines[currentPlayerTargetIndex].armor);

      if (playerWarMachines[currentPlayerTargetIndex].health <= 0) {
        currentPlayerTargetIndex++;
      }

      if (currentPlayerTargetIndex > (totalPlayWarMachines - 1)) {
        return { status: 'lose', roundsPlayed };
      }
    }

    roundsPlayed = round;
  }

  return { status: 'lose', roundsPlayed };
}

export const simulateCampaignMission = (options: SimulateCampaignMissionOptions): SimulationResult => {
  const enemySquad = getEnemySquad(options.mission);
  return simulateCampaignBattle({
    ...options,
    enemyWarMachines: enemySquad.warMachines,
  });
}

const wait = (milliseconds: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}

export const formatResults = (data: Partial<Record<Difficulty, InternalDifficultySimulationResult>>): Partial<Record<Difficulty, CampaignDifficultySimulationResult>> => {
  const results: Partial<Record<Difficulty, CampaignDifficultySimulationResult>> = {};

  for (const [difficulty, difficultyData] of Object.entries(data)) {
    results[difficulty as Difficulty] = {
      isComputing: difficultyData.isComputing,
      missions: [],
    };

    for (const data of Object.values(difficultyData.missions)) {
      const successChance = (() => {
        if (data.randomSimulationResults?.length) {
          const wins = data.randomSimulationResults.filter(d => d.status === 'win');
          return (wins.length / data.randomSimulationResults.length) * 100;
        }

        if (data.status === 'win') {
          return 100;
        }

        return 0;
      })();

      results[difficulty as Difficulty]?.missions.push({
        level: data.level,
        status: data.status,
        requiredPower: data.requiredPower,
        successChance,
        needsAbilities: Boolean(data.randomSimulationResults?.length),
        totalBattleCount: data.totalBattleCount,
        currentBattleCount: data.currentBattleCount,
      });
    }
  }

  return results;
}

const defaultTotalSimulations = 10_000;

export const simulateCampaign = async (playerWarMachines: SimulationWarMachine[], power: number, options?: SimulateCampaignOptions) => {
  console.log('simulate campaign')
  playerWarMachines = sort(playerWarMachines, warMachine => warMachine.health + warMachine.armor * 10 - warMachine.damage * 10, true);

  const totalSimulations = options?.totalSimulations ?? defaultTotalSimulations;
  const maxCampaignMissions = 90;
  const result: Partial<Record<Difficulty, InternalDifficultySimulationResult>> = {};

  const checkAbort = () => {
    if (options?.signal?.aborted) {
      throw new Error(options?.signal?.reason ? `Aborted: ${options.signal.reason}` : 'Aborted');
    }
  }

  for (const difficulty of difficultyList) {
    result[difficulty] = {
      isComputing: true,
      missions: [],
    };

    for (let level = 1; level <= maxCampaignMissions; level++) {
      checkAbort();
      const enemySquad = getEnemySquad({ difficulty, level });
      const requiredPower = getRequiredPower({ difficulty, level }, enemySquad);
      const missionIndex = level - 1;

      if (requiredPower > power) {
        result[difficulty].missions[missionIndex] = {
          status: 'unmet-power-requirement',
          level,
          roundsPlayed: 0,
          requiredPower,
          totalBattleCount: 1,
          currentBattleCount: 1,
        };
        break;
      }

      const worstBattleResult = simulateCampaignBattle({
        playerWarMachines: structuredClone(playerWarMachines),
        enemyWarMachines: structuredClone(enemySquad.warMachines),
        abilityActivationChance: 0,
      });

      result[difficulty].missions[missionIndex] = {
        ...worstBattleResult,
        level,
        requiredPower,
        totalBattleCount: 1,
        currentBattleCount: 1,
      };

      if (worstBattleResult.status === 'win') {
        continue;
      }

      const perfectBattleResult = simulateCampaignBattle({
        playerWarMachines: structuredClone(playerWarMachines),
        enemyWarMachines: structuredClone(enemySquad.warMachines),
        abilityActivationChance: 100,
      });

      if (perfectBattleResult.status === 'lose') {
        break;
      }

      result[difficulty].missions[missionIndex].randomSimulationResults = [];
      result[difficulty].missions[missionIndex].totalBattleCount = totalSimulations;
    }

    //result[difficulty].isComputing = false;
    options?.onChange?.(formatResults(result));
  }

  await Promise.all((Object.keys(result) as Difficulty[]).map(async difficulty => {
    const difficultyData = result[difficulty];

    if (!difficultyData) {
      return;
    }

    await Promise.all(Object.values(difficultyData.missions).map(async mission => {
      if (mission.status !== 'lose' || !mission.randomSimulationResults) {
        return;
      }

      checkAbort();
      const enemySquad = getEnemySquad({ difficulty, level: mission.level });

      mission.randomSimulationResults = [];
      mission.totalBattleCount = totalSimulations;

      for (let index = 0; index < totalSimulations; index++) {
        checkAbort();

        if (index % 200 === 0) {
          options?.onChange?.(formatResults(result));
        }

        if (index % 200 === 0) {
          await wait(0);
        }

        const simulationResult = simulateCampaignBattle({
          playerWarMachines: structuredClone(playerWarMachines),
          enemyWarMachines: structuredClone(enemySquad.warMachines),
        });

        mission.randomSimulationResults?.push(simulationResult);
        mission.currentBattleCount = index + 1;
      }
    }));

    difficultyData.isComputing = false;
    options?.onChange?.(formatResults(result));
  }));

  return formatResults(result);
}

export const simulateCampaignPrimary = (playerWarMachines: SimulationWarMachine[], power: number, options?: SimulateCampaignOptions) => {
  playerWarMachines = sort(playerWarMachines, warMachine => warMachine.health + warMachine.armor * 10 - warMachine.damage * 10, true);

  const totalSimulations = options?.totalSimulations ?? defaultTotalSimulations;
  const maxCampaignMissions = 90;
  const result: Partial<Record<Difficulty, InternalDifficultySimulationResult>> = {};

  for (const difficulty of difficultyList) {
    result[difficulty] = {
      isComputing: true,
      missions: [],
    };

    for (let level = 1; level <= maxCampaignMissions; level++) {
      const enemySquad = getEnemySquad({ difficulty, level });
      const requiredPower = getRequiredPower({ difficulty, level }, enemySquad);
      const missionIndex = level - 1;

      if (requiredPower > power) {
        result[difficulty].missions[missionIndex] = {
          status: 'unmet-power-requirement',
          level,
          roundsPlayed: 0,
          requiredPower,
          totalBattleCount: 1,
          currentBattleCount: 1,
        };
        break;
      }

      const worstBattleResult = simulateCampaignBattle({
        playerWarMachines: structuredClone(playerWarMachines),
        enemyWarMachines: structuredClone(enemySquad.warMachines),
        abilityActivationChance: 0,
      });

      result[difficulty].missions[missionIndex] = {
        ...worstBattleResult,
        level,
        requiredPower,
        totalBattleCount: 1,
        currentBattleCount: 1,
      };

      if (worstBattleResult.status === 'win') {
        continue;
      }

      const perfectBattleResult = simulateCampaignBattle({
        playerWarMachines: structuredClone(playerWarMachines),
        enemyWarMachines: structuredClone(enemySquad.warMachines),
        abilityActivationChance: 100,
      });

      if (perfectBattleResult.status === 'lose') {
        break;
      }

      result[difficulty].missions[missionIndex].randomSimulationResults = [];
      result[difficulty].missions[missionIndex].totalBattleCount = totalSimulations;
    }
  }

  return result;
}

export const simulateDetailedMission = (
  difficulty: InternalDifficultySimulationResult & { level: Difficulty },
  mission: InternalSimulationResult & { level: number },
  playerWarMachines: SimulationWarMachine[],
  options?: SimulateDetailedMissionOptions,
) => {
  const totalSimulations = options?.totalSimulations ?? defaultTotalSimulations;

  const checkAbort = () => {
    if (options?.signal?.aborted) {
      throw new Error(options?.signal?.reason ? `Aborted: ${options.signal.reason}` : 'Aborted');
    }
  }

  checkAbort();
  const enemySquad = getEnemySquad({ difficulty: difficulty.level, level: mission.level });

  const simulationResults: SimulationResult[] = [];
  let currentBattleCount = 0;

  const handleChange = () => {
    const wins = simulationResults.filter(d => d.status === 'win');
    const successChance = (wins.length / simulationResults.length) * 100;

    options?.onChange?.({
      level: mission.level,
      status: mission.status,
      requiredPower: mission.requiredPower,
      successChance,
      needsAbilities: true,
      totalBattleCount: mission.totalBattleCount,
      currentBattleCount,
      difficulty: difficulty.level,
    });
  }

  for (let index = 0; index <= totalSimulations; index++) {
    checkAbort();

    currentBattleCount = index + 1;

    const simulationResult = simulateCampaignBattle({
      playerWarMachines: structuredClone(playerWarMachines),
      enemyWarMachines: structuredClone(enemySquad.warMachines),
    });

    simulationResults?.push(simulationResult);

    if (index % 200 === 0) {
      handleChange();
    }
  }

  handleChange();
}

export interface SimulateDetailedMissionOptions {
  totalSimulations?: number;
  signal?: AbortSignal;
  onChange?: (data: CampaignSimulationResult & { difficulty: Difficulty; }) => void;
}

export const simulateDetailedCampaign = async (
  data: Partial<Record<Difficulty, InternalDifficultySimulationResult>>,
  playerWarMachines: SimulationWarMachine[],
  options?: SimulateDetailedMissionOptions,
) => {
  playerWarMachines = sort(playerWarMachines, warMachine => warMachine.health + warMachine.armor * 10 - warMachine.damage * 10, true);

  await Promise.all((Object.keys(data) as Difficulty[]).map(async difficulty => {
    const difficultyData = data[difficulty];

    if (!difficultyData) {
      return;
    }

    await Promise.all(difficultyData.missions.map(async mission => {
      if (mission.status !== 'lose' || !mission.randomSimulationResults) {
        return;
      }

      await invokeSimulateDetailedMission(
        {
          ...difficultyData,
          level: difficulty,
        },
        mission,
        playerWarMachines,
        options,
      );
    }));
  }));
}

export const getTotalStars = (data: Partial<Record<Difficulty, CampaignDifficultySimulationResult>>, options?: SimulateCampaignOptions): number => {
  let stars = 0;

  for (const difficultyData of Object.values(data)) {
    for (const mission of difficultyData.missions) {
      if (mission.status === 'win' || mission.needsAbilities) {
        stars++;
      }
    }
  }

  return stars;
}

export interface SimulateCampaignBattleOptions {
  playerWarMachines: SimulationWarMachine[];
  enemyWarMachines: SimulationWarMachine[];
  abilityActivationChance?: number;
}

export interface SimulateCampaignMissionOptions {
  playerWarMachines: SimulationWarMachine[];
  mission: Mission;
  abilityActivationChance?: number;
}

export interface SimulationResult {
  status: 'win' | 'lose';
  roundsPlayed: number;
}

export interface InternalSimulationResult {
  status: 'win' | 'lose' | 'unmet-power-requirement';
  roundsPlayed: number;
  level: number;
  randomSimulationResults?: SimulationResult[];
  requiredPower: number;
  totalBattleCount: number;
  currentBattleCount: number;
}

export interface InternalDifficultySimulationResult {
  isComputing: boolean;
  missions: Record<number, InternalSimulationResult>;
}

export interface CampaignSimulationResult {
  status: 'win' | 'lose' | 'unmet-power-requirement';
  needsAbilities: boolean;
  successChance: number;
  level: number;
  requiredPower: number;
  totalBattleCount: number;
  currentBattleCount: number;
}

export interface CampaignDifficultySimulationResult {
  isComputing: boolean;
  missions: CampaignSimulationResult[];
}

export interface SimulateCampaignOptions {
  totalSimulations?: number;
  signal?: AbortSignal;
  onChange?: (data: Partial<Record<Difficulty, CampaignDifficultySimulationResult>>) => void;
}
