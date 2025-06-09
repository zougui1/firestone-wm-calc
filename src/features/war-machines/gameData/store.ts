import { createStore, SnapshotFromStore } from '@xstate/store';
import { produce } from 'immer';
import { createSelector } from 'reselect';
import { useQuery } from '@tanstack/react-query';

import { catchError } from '~/utils';

import { defaultGameData } from './defaultData';
import {
  type ArtifactType,
  type CrewHero,
  type WarMachine,
  type GameData,
  gameDataSchema,
} from './schemas';
import { Difficulty, warMachineAbilityActivationChance, WarMachineRarity } from './enums';
import { computeBestCrew, findTargetStarFormation } from '../utils';
import { CampaignDifficultySimulationResult, CampaignSimulationResult, formatResults, simulateCampaignPrimary, simulateDetailedCampaign } from '../utils/simulateCampaignBattle';
import { useSelector } from '@xstate/store/react';
import { WarMachineName } from './data';
import { invokeComputeBestCrew } from '../workers/computeBestCrew.invoke';
import { targetCampaignStore } from '../targetCampaign';

const storageKey = 'data';

const parseStorageData = (value: string): GameData | undefined => {
  const [jsonError, rawData] = catchError(() => JSON.parse(value));

  if (jsonError || !rawData || typeof rawData !== 'object') {
    return;
  }

  const result = gameDataSchema.safeParse(rawData);

  if (result.success) {
    return result.data;
  }
}

const removeZeroValues = <T extends Record<string, unknown>>(obj: T): T => {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, value]) => value !== 0)
  ) as T;
}

export const gameDataStore = createStore({
  context: parseStorageData(window.localStorage.getItem(storageKey) ?? '') ?? defaultGameData,

  on: {
    updateWarMachine: (context, event: { name: string; data: Partial<Omit<WarMachine, 'name'>> }) => {
      return produce(context, draft => {
        if (!draft.warMachines[event.name]) {
          return;
        }

        Object.assign(draft.warMachines[event.name], event.data);
      });
    },

    updateWarMachineRarity: (context, event: { name: string; rarity: WarMachineRarity }) => {
      return produce(context, draft => {
        if (!draft.warMachines[event.name]) {
          return;
        }

        draft.warMachines[event.name].rarity = event.rarity;
      });
    },

    updateCrewHero: (context, event: { name: string; data: Partial<Omit<CrewHero, 'name'>> }) => {
      return produce(context, draft => {
        if (!draft.crewHeroes[event.name]) {
          return;
        }

        Object.assign(draft.crewHeroes[event.name], event.data);
      });
    },

    updateArtifactTypes: (context, event: { name: string; data: Partial<ArtifactType['percents']> }) => {
      return produce(context, draft => {
        if (!draft.artifactTypes[event.name]) {
          return;
        }

        Object.assign(draft.artifactTypes[event.name].percents, event.data);
      });
    },

    import: (
      context,
      event: {
        warMachines?: Record<WarMachineName, WarMachine>;
        heroes?: Record<string, CrewHero>;
        artifactTypes?: Record<string, ArtifactType>;
      }
    ) => {
      return produce(context, draft => {
        if (event.warMachines) {
          draft.warMachines = defaultGameData.warMachines;

          for (const warMachine of Object.values(event.warMachines)) {
            console.log('warMachine:', event.warMachines)
            Object.assign(draft.warMachines[warMachine.name], removeZeroValues(warMachine));
          }
        }

        if (event.heroes) {
          draft.crewHeroes = defaultGameData.crewHeroes;

          for (const hero of Object.values(event.heroes)) {
            Object.assign(draft.crewHeroes[hero.name], removeZeroValues(hero));
          }
        }

        if (event.artifactTypes) {
          draft.artifactTypes = defaultGameData.artifactTypes;

          for (const artifactType of Object.values(event.artifactTypes)) {
            Object.assign(draft.artifactTypes[artifactType.name].percents, removeZeroValues(artifactType.percents));
          }
        }
      });
    },
  },
});

gameDataStore.subscribe(snapshot => {
  const result = gameDataSchema.safeParse(snapshot.context);

  if (result.success) {
    window.localStorage.setItem(storageKey, JSON.stringify(result.data));
  }
});

export const selectBestCampaignFormation = createSelector(
  (state: SnapshotFromStore<typeof gameDataStore>) => state.context,
  state => {
    console.time('computeBestCrew')
    const res = computeBestCrew(state);
    console.timeEnd('computeBestCrew')
    return res;
  },
);

export const useBestCampaignFormation = () => {
  const data = useSelector(gameDataStore, state => state.context);

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
    queryFn: async ({ signal }) => {
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

      const handleChange = (data: CampaignSimulationResult & { difficulty: Difficulty; }) => {
        if (signal.aborted) {
          console.log('simulation aborted');
        }

        const difficulty = results[data.difficulty];
        const missionIndex = difficulty?.missions.findIndex(m => m.level === data.level);

        if (difficulty && missionIndex !== undefined) {
          difficulty.missions[missionIndex] = data;
          options?.onChange?.(structuredClone(results));
        }
      }

      try {
        await simulateDetailedCampaign(primaryResult, warMachines, {
          ...options,
          onChange: handleChange,
          signal,
        });
      } catch (error) {
        console.error('campaign simulation error:', error)
        throw error;
      }

      return results;
    },
    refetchOnWindowFocus: false,
  });
}

export const useTargetCampaignFormation = (options?: UseCampaignSimulationOptions) => {
  const data = useSelector(gameDataStore, state => state.context);
  const targetStarLevel = useSelector(targetCampaignStore, state => state.context.starLevel);
  const minimumSuccessChance = useSelector(targetCampaignStore, state => state.context.minimumSuccessChance);

  return useQuery({
    queryKey: ['findTargetStarFormation', data, targetStarLevel, minimumSuccessChance],
    queryFn: async ({ signal }) => {
      try {
        //throw new Error('aborted');
        //console.time('findTargetStarFormation')
        const result = await findTargetStarFormation(
          data,
          { starLevel: targetStarLevel, minimumSuccessChance },
          { signal },
        );
        //console.timeEnd('findTargetStarFormation')
        targetCampaignStore.trigger.changeTargetFormation({
          warMachines: result.warMachines,
        });

        return result;
      } catch (error) {
        console.error('target campaign error:', error)
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
