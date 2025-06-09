import { z } from 'zod';

import Worker from './simulateCampaign.worker?worker';
import { type simulateCampaign } from '../utils';
import { difficultyList } from '../gameData';

const eventSchema = z.object({
  type: z.enum(['onChange', 'result']),
  data: z.record(z.enum(difficultyList), z.object({
    isComputing: z.boolean(),
    missions: z.array(z.object({
      status: z.enum(['win', 'lose', 'unmet-power-requirement']),
      needsAbilities: z.boolean(),
      successChance: z.number(),
      level: z.number(),
      requiredPower: z.number(),
      totalBattleCount: z.number(),
      currentBattleCount: z.number(),
    })),
  })),
});

export const invokeSimulateCampaign: typeof simulateCampaign = (warMachines, campaignPower, options) => {
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
      const handlers = {
        onChange: options?.onChange,
        result: resolve,
      };

      const { data } = eventSchema.safeParse(event.data);

      if (data) {
        handlers[data.type]?.(data.data);
      }
    }

    worker.postMessage([warMachines, campaignPower]);
  });
}
