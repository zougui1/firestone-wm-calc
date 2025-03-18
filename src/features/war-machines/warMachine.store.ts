import { createStore, SnapshotFromStore } from '@xstate/store';
import { produce } from 'immer';
import { createSelector } from 'reselect';
import { useQuery } from '@tanstack/react-query';

import { catchError } from '~/utils';

import { defaultData } from './defaultData';
import {
  type ArtifactType,
  type CrewHero,
  type WarMachine,
  type WarMachineData,
  warMachineDataSchema,
} from './schemas';
import { Difficulty, warMachineAbilityActivationChance, WarMachineRarity } from './enums';
import { computeBestCrew, findTargetStarFormation } from './utils';
import { CampaignDifficultySimulationResult, CampaignSimulationResult, formatResults, simulateCampaign, simulateCampaignPrimary, simulateDetailedCampaign } from './utils/simulateCampaignBattle';
import { useSelector } from '@xstate/store/react';
import { WarMachineName } from './data';
import { useRef } from 'react';
import { proxy, wrap } from 'comlink';
import { invokeSimulateCampaign } from './workers/simulateCampaign.invoke';
import { invokeComputeBestCrew } from './workers/computeBestCrew.invoke';

const storageKey = 'data';

const parseStorageData = (value: string): WarMachineData | undefined => {
  const [jsonError, rawData] = catchError(() => JSON.parse(value));

  if (jsonError || !rawData || typeof rawData !== 'object') {
    return;
  }

  const result = warMachineDataSchema.safeParse(rawData);

  if (result.success) {
    return result.data;
  }
}

const removeZeroValues = <T extends Record<string, unknown>>(obj: T): T => {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, value]) => value !== 0)
  ) as T;
}

export const warMachineStore = createStore({
  context: parseStorageData(window.localStorage.getItem(storageKey) ?? '') ?? defaultData,

  on: {
    updateLeagueBonus: (context, event: { leagueBonus: number | undefined }) => {
      return produce(context, draft => {
        draft.current.leagueBonus = event.leagueBonus;
      });
    },

    updateWarMachine: (context, event: { name: string; data: Partial<Omit<WarMachine, 'name'>> }) => {
      return produce(context, draft => {
        if (!draft.current.warMachines[event.name]) {
          return;
        }

        Object.assign(draft.current.warMachines[event.name], event.data);
      });
    },

    updateWarMachineRarity: (context, event: { name: string; rarity: WarMachineRarity }) => {
      return produce(context, draft => {
        if (!draft.current.warMachines[event.name]) {
          return;
        }

        draft.current.warMachines[event.name].rarity = event.rarity;
      });
    },

    updateCrewHero: (context, event: { name: string; data: Partial<Omit<CrewHero, 'name'>> }) => {
      return produce(context, draft => {
        if (!draft.current.crewHeroes[event.name]) {
          return;
        }

        Object.assign(draft.current.crewHeroes[event.name], event.data);
      });
    },

    updateArtifactTypes: (context, event: { name: string; data: Partial<ArtifactType['percents']> }) => {
      return produce(context, draft => {
        if (!draft.current.artifactTypes[event.name]) {
          return;
        }

        Object.assign(draft.current.artifactTypes[event.name].percents, event.data);
      });
    },

    import: (
      context,
      event: {
        warMachines?: {
          leagueBonus?: number;
          warMachines: Record<WarMachineName, WarMachine>;
        };
        heroes?: Record<string, CrewHero>;
        artifactTypes?: Record<string, ArtifactType>;
      }
    ) => {
      return produce(context, draft => {
        if (event.warMachines) {
          draft.current.leagueBonus = defaultData.current.leagueBonus;
          draft.current.warMachines = defaultData.current.warMachines;

          if (event.warMachines.leagueBonus) {
            draft.current.leagueBonus = event.warMachines.leagueBonus;
          }

          for (const warMachine of Object.values(event.warMachines.warMachines)) {
            Object.assign(draft.current.warMachines[warMachine.name], removeZeroValues(warMachine));
          }
        }

        if (event.heroes) {
          draft.current.crewHeroes = defaultData.current.crewHeroes;

          for (const hero of Object.values(event.heroes)) {
            Object.assign(draft.current.crewHeroes[hero.name], removeZeroValues(hero));
          }
        }

        if (event.artifactTypes) {
          draft.current.artifactTypes = defaultData.current.artifactTypes;

          for (const artifactType of Object.values(event.artifactTypes)) {
            Object.assign(draft.current.artifactTypes[artifactType.name].percents, removeZeroValues(artifactType.percents));
          }
        }
      });
    },

    changeTargetStar: (context, event: { starLevel: number; }) => {
      return produce(context, draft => {
        draft.target.starLevel = event.starLevel;
      });
    },

    changeTargetFormation: (context, event: Pick<WarMachineData['target'], 'warMachines'>) => {
      return produce(context, draft => {
        draft.target.warMachines = event.warMachines;
      });
    },
  },
});

warMachineStore.subscribe(snapshot => {
  window.localStorage.setItem(storageKey, JSON.stringify(snapshot.context));
});

export const selectBestCampaignFormation = createSelector(
  (state: SnapshotFromStore<typeof warMachineStore>) => state.context.current,
  state => {
    console.time('computeBestCrew')
    const res = computeBestCrew(state);
    console.timeEnd('computeBestCrew')
    return res;
  },
);

export const useBestCampaignFormation = () => {
  const data = useSelector(warMachineStore, state => state.context.current);

  return useQuery({
    queryKey: ['computeBestCrew', data],
    queryFn: ({ signal }) => {
      return invokeComputeBestCrew(data, { signal });
    },
    refetchOnWindowFocus: false,
  });
}

export const useCampaignSimulation = (options?: UseCampaignSimulationOptions) => {
  const { data } = useBestCampaignFormation();

  return useQuery({
    queryKey: ['simulateCampaign', data],
    queryFn: ({ signal }) => {
      if (!data) {
        return null;
      }

      const warMachines = Object.values(data.warMachines).map(wm => ({
        ...wm,
        maxHealth: wm.health,
        abilityActivationChance: warMachineAbilityActivationChance[wm.rarity],
      }));

      const primaryResult = simulateCampaignPrimary(warMachines, data.campaignPower, {
        ...options,
        signal,
      });
      const results = formatResults(primaryResult);
      console.log('primaryResult:', primaryResult)
      console.log('results:', results)

      const handleChange = (data: CampaignSimulationResult & { difficulty: Difficulty; }) => {
        const difficulty = results[data.difficulty];
        const missionIndex = difficulty?.missions.findIndex(m => m.level === data.level)

        if (difficulty && missionIndex !== undefined) {
          difficulty.missions[missionIndex] = data;
          options?.onChange?.(structuredClone(results));
        }
      }

      simulateDetailedCampaign(primaryResult, warMachines, {
        ...options,
        onChange: handleChange,
        signal,
      });

      return null;
    },
    refetchOnWindowFocus: false,
  });
}

export const useTargetCampaignFormation = (options?: UseCampaignSimulationOptions) => {
  const data = useSelector(warMachineStore, state => state.context.current);
  const targhetStarLevel = useSelector(warMachineStore, state => state.context.target.starLevel);

  return useQuery({
    queryKey: ['findTargetStarFormation', data, targhetStarLevel],
    queryFn: async ({ signal }) => {
      try {
        //throw new Error('aborted');
        //console.time('findTargetStarFormation')
        const result = await findTargetStarFormation(data, targhetStarLevel, { signal });
        //console.timeEnd('findTargetStarFormation')
        warMachineStore.trigger.changeTargetFormation({
          warMachines: result.warMachines,
        });

        return result;
      } catch (error) {
        console.error('error:', error)
        throw error;
      }
    },
    refetchOnWindowFocus: false,
    retry: false,
  });
}

export interface UseCampaignSimulationOptions {
  onChange?: (data: Partial<Record<Difficulty, CampaignDifficultySimulationResult>>) => void;
}
