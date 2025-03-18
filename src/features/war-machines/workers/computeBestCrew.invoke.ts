import Worker from './computeBestCrew.worker?worker';
import { type computeBestCrew } from '../utils';
import { type WarMachineData } from '../schemas';

export const invokeComputeBestCrew = (
  data: WarMachineData['current'],
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

      handlers[event.data.type]?.(event.data.data);
    }

    worker.postMessage([data]);
  });
}

export interface InvokeComputeBestCrewOptions {
  signal?: AbortSignal;
}
