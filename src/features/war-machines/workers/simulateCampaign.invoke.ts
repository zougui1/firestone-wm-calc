import Worker from './simulateCampaign.worker?worker';
import { type simulateCampaign } from '../utils';

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

      handlers[event.data.type]?.(event.data.data);
    }

    worker.postMessage([warMachines, campaignPower]);
  });
}
