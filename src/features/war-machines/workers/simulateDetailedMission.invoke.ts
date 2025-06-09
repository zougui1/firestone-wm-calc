import { z } from 'zod';

import Worker from './simulateDetailedMission.worker?worker';
import { CampaignSimulationResult, type simulateDetailedMission } from '../utils';
import { Difficulty, difficultyList } from '../gameData';

const eventSchema = z.object({
  type: z.enum(['onChange', 'result']),
  data: z.object({
    difficulty: z.enum(difficultyList),
    status: z.enum(['win', 'lose', 'unmet-power-requirement']),
    needsAbilities: z.boolean(),
    successChance: z.number(),
    level: z.number(),
    requiredPower: z.number(),
    totalBattleCount: z.number(),
    currentBattleCount: z.number(),
  }).optional(),
});

type SimulateDetailedMissionAsync = (...args: Parameters<typeof simulateDetailedMission>) => ReturnType<typeof simulateDetailedMission>;

export const invokeSimulateDetailedMission: SimulateDetailedMissionAsync = (difficulty, mission, playerWarMachines, options) => {
  const worker = new Worker();

  return new Promise((resolve, reject) => {
    options?.signal?.addEventListener('abort', () => {
      const message = options?.signal?.reason
        ? `Aborted: ${options.signal.reason}`
        : 'Aborted';

      worker.terminate();
      reject(message);
    });

    worker.onmessage = (event) => {

      const { data, error } = eventSchema.safeParse(event.data);

      const handlers = {
        onChange: (data?: CampaignSimulationResult & { difficulty: Difficulty; }) => {
          if (data) {
            options?.onChange?.(data);
          }
        },
        result: resolve,
      };

      if (error) {
        console.log(error)
      }
      if (data) {
        handlers[data.type]?.(data.data);
      }
    }

    worker.postMessage([difficulty, mission, playerWarMachines]);
  });
}
