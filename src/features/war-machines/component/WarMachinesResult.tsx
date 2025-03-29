import { BestCrew } from './BestCrew';
import { CampaignSimulation } from './CampaignSimulation';

export const WarMachinesResult = () => {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <BestCrew />
        <CampaignSimulation />
      </div>
    </div>
  );
}
