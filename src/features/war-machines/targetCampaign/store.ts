import { createStore } from '@xstate/store';
import { produce } from 'immer';
import { defaultGameData, WarMachine } from '../gameData';
import { isNumber } from 'radash';

const storageKeys = {
  starLevel: 'targetCampaign.starLevel',
  minimumSuccessChance: 'targetCampaign.minimumSuccessChance',
};

export interface TargetCampaignState {
  starLevel: number;
  minimumSuccessChance: number;
  warMachines: Record<string, WarMachine>;
}

const getSafeNumber = (str: string | null, defaultNumber: number): number => {
  const number = Number(str ?? defaultNumber);
  return isNumber(number) ? number : defaultNumber;
}

const defaultData: TargetCampaignState = {
  starLevel: getSafeNumber(window.localStorage.getItem(storageKeys.starLevel), 0),
  minimumSuccessChance: getSafeNumber(window.localStorage.getItem(storageKeys.minimumSuccessChance), 0),
  warMachines: defaultGameData.warMachines,
};

export const targetCampaignStore = createStore({
  context: defaultData,

  on: {
    changeTargetStar: (context, event: { starLevel: number; }) => {
      return produce(context, draft => {
        draft.starLevel = event.starLevel;
      });
    },

    changeMinimumSuccessChance: (context, event: { minimumSuccessChance: number; }) => {
      return produce(context, draft => {
        draft.minimumSuccessChance = event.minimumSuccessChance;
      });
    },

    changeTargetFormation: (context, event: Pick<TargetCampaignState, 'warMachines'>) => {
      return produce(context, draft => {
        draft.warMachines = event.warMachines;
      });
    },
  },
});

targetCampaignStore.select(state => state.starLevel).subscribe(starLevel => {
  window.localStorage.setItem(storageKeys.starLevel, String(starLevel));
});

targetCampaignStore.select(state => state.minimumSuccessChance).subscribe(minimumSuccessChance => {
  window.localStorage.setItem(storageKeys.minimumSuccessChance, String(minimumSuccessChance));
});
