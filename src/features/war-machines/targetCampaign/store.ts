import { createStore } from '@xstate/store';
import { produce } from 'immer';
import { defaultGameData, WarMachine } from '../gameData';
import { isNumber } from 'radash';

const storageKey = 'targetLevel';

export interface TargetCampaignState {
  starLevel: number;
  warMachines: Record<string, WarMachine>;
}

const getSafeNumber = (str: string, defaultNumber: number): number => {
  const number = Number(str);
  return isNumber(number) ? number : defaultNumber;
}

const defaultData: TargetCampaignState = {
  starLevel: getSafeNumber(window.localStorage.getItem(storageKey) ?? '0', 0),
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

    changeTargetFormation: (context, event: Pick<TargetCampaignState, 'warMachines'>) => {
      return produce(context, draft => {
        draft.warMachines = event.warMachines;
      });
    },
  },
});

targetCampaignStore.select(state => state.starLevel).subscribe(starLevel => {
  window.localStorage.setItem(storageKey, String(starLevel));
});
