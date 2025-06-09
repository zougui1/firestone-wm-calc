import { z } from 'zod';

import Worker from './computeBestCrew.worker?worker';
import { type computeBestCrew } from '../utils';
import { type GameData } from '../gameData/schemas';
import { warMachineNameList, warMachineRarityList } from '../gameData';

const eventSchema = z.object({
  type: z.literal('result'),
  data: z.object({
    campaignPower: z.number(),
    warMachines: z.record(z.enum(warMachineNameList), z.object({
      name: z.enum(warMachineNameList),
      crew: z.array(z.string()),
      power: z.number(),
      damage: z.number(),
      health: z.number(),
      armor: z.number(),
      rarity: z.enum(warMachineRarityList),
    })),
  }),
});

export const invokeComputeBestCrew = (
  data: GameData,
  options?: InvokeComputeBestCrewOptions,
): Promise<ReturnType<typeof computeBestCrew>> => {
  const worker = new Worker();

  const signal = options?.signal
    ? AbortSignal.any([options.signal, AbortSignal.timeout(10_000)])
    : undefined;

  return new Promise((resolve, reject) => {
    signal?.addEventListener('abort', () => {
      const message = signal?.reason
        ? `Aborted: ${signal.reason}`
        : 'Aborted';

      worker.terminate();
      reject(message);
    });

    worker.onmessage = (event) => {
      const handlers = {
        result: resolve,
      };

      const { data } = eventSchema.safeParse(event.data);

      if (data) {
        handlers[data.type]?.(data.data);
      }
    }

    worker.postMessage([data]);
  });
}

export interface InvokeComputeBestCrewOptions {
  signal?: AbortSignal;
}
