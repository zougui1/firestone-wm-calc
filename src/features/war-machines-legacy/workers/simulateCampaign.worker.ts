import { simulateCampaign } from '../utils';

self.onmessage = async (event: MessageEvent<Parameters<typeof simulateCampaign>>) => {
  const [warMachines, campaignPower] = event.data;

  const result = await simulateCampaign(warMachines, campaignPower, {
    onChange: data => postMessage({ type: 'onChange', data }),
  });

  postMessage({ type: 'result', data: result });
}
