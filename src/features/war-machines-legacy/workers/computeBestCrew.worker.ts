import { computeBestCrew } from '../utils';

self.onmessage = (event: MessageEvent<Parameters<typeof computeBestCrew>>) => {
  const [data] = event.data;

  const result = computeBestCrew(data);

  postMessage({ type: 'result', data: result });
}
