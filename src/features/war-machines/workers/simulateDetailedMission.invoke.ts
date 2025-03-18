import Worker from './simulateDetailedMission.worker?worker';
import { type simulateDetailedMission } from '../utils';

type SimulateDetailedMissionAsync = (...args: Parameters<typeof simulateDetailedMission>) => Promise<typeof simulateDetailedMission>;

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
      const handlers = {
        onChange: options?.onChange,
        result: resolve,
      };

      handlers[event.data.type]?.(event.data.data);
    }

    worker.postMessage([difficulty, mission, playerWarMachines]);
  });
}
