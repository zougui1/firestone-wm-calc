import { simulateDetailedMission } from '../utils/simulateCampaignBattle';

self.onmessage = async (event: MessageEvent<Parameters<typeof simulateDetailedMission>>) => {
  const [difficulty, mission, playerWarMachines] = event.data;

  const result = await simulateDetailedMission(difficulty, mission, playerWarMachines, {
    onChange: data => postMessage({ type: 'onChange', data }),
  });

  postMessage({ type: 'result', data: result });
}
