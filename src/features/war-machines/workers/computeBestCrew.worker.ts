import { computeBestCrew } from '../utils/computeBestCrew';

self.onmessage = (event: MessageEvent<Parameters<typeof computeBestCrew>>) => {
  const [data] = event.data;

  const result = computeBestCrew(data);

  postMessage({ type: 'result', data: result });
}
