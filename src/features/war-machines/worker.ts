import { z } from 'zod';
import {
  computeBestCrew,
  findTargetStarFormation,
} from './utils';
import { simulateCampaign } from './utils/simulateCampaignBattle';

const functions = {
  computeBestCrew,
  simulateCampaign,
  findTargetStarFormation,
};

export type WorkerFunction = keyof typeof functions;
const functionList = Object.keys(functions) as [WorkerFunction, ...WorkerFunction[]];

const schema = z.object({
  type: z.enum(functionList),
  args: z.array(z.any()),
});

export interface WorkerPayload<T extends WorkerFunction> {
  type: T;
  data: Parameters<typeof functions[T]>;
}

export interface WorkerResponseSuccess<T extends WorkerFunction = WorkerFunction> {
  success: true;
  type: T;
  data: ReturnType<typeof functions[T]>;
}

export interface WorkerResponseError<T extends WorkerFunction = WorkerFunction> {
  success: false;
  type: T;
  error: unknown;
}

export type WorkerResponse<T extends WorkerFunction = WorkerFunction> = WorkerResponseSuccess<T> | WorkerResponseError<T>;

self.onmessage = async (event) => {
  console.log('self.onmessage');
  const result = schema.safeParse(event.data);

  if (!result.success) {
    console.log('wrong data')
    return;
  }

  try {
    console.log('try')
    // @ts-expect-error will throw if necessary
    const data = await functions[result.data.type](...result.data.args);

    console.log('worker.data:', data);
    postMessage({
      success: true,
      type: result.data.type,
      data,
    } satisfies WorkerResponse);
  } catch (error) {
    console.log('worker.error', error);
    postMessage({
      success: false,
      type: result.data.type,
      error,
    } satisfies WorkerResponse);
  }
}
