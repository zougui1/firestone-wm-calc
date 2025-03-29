import { useSelector } from '@xstate/store/react';

import { Input, Typography } from '@zougui/react.ui';

import { TargetWarMachinesTable } from './TargetWarMachinesTable';
import { useTargetCampaignFormation } from '../gameData/store';
import { targetCampaignStore } from '../targetCampaign';
import { Progress } from '~/components/Progress';

export const TargetCampaign = () => {
  const targetStar = useSelector(targetCampaignStore, state => state.context.starLevel);
  const targetFormation = useTargetCampaignFormation();

  return (
    <div className="space-y-4">
      <div className="flex space-x-4">
        <div>
          <Typography.H6>Target stars</Typography.H6>
        </div>

        <div>
          <Input
            value={targetStar}
            onChange={e => targetCampaignStore.trigger.changeTargetStar({ starLevel: Number(e.currentTarget.value) })}
          />
        </div>
      </div>

      <div className="flex flex-col space-y-4">
        {targetFormation.isLoading && <Progress />}
        <TargetWarMachinesTable />
      </div>
    </div>
  );
}
