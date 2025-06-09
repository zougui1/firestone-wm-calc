import { useSelector } from '@xstate/store/react';

import { Input, Typography } from '@zougui/react.ui';

import { TargetWarMachinesTable } from './TargetWarMachinesTable';
import { useTargetCampaignFormation } from '../gameData/store';
import { targetCampaignStore } from '../targetCampaign';
import { Progress } from '~/components/Progress';

export const TargetCampaign = () => {
  const targetStar = useSelector(targetCampaignStore, state => state.context.starLevel);
  const minimumSuccessChance = useSelector(targetCampaignStore, state => state.context.minimumSuccessChance);
  const targetFormation = useTargetCampaignFormation();

  const getSuccessChanceMessage = () => {
    if (!targetFormation.data) {
      return null;
    }

    const { successChance, needsAbilities } = targetFormation.data;
    const parts = [`Success chance: ${Number(successChance.toFixed(2))}%`];

    if (successChance === 0 && needsAbilities) {
      parts.push('(can still win with abilities)');
    }

    return parts.join(' ');
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <div>
          <Typography.H6>Target stars</Typography.H6>
        </div>

        <div>
          <Input
            value={targetStar}
            onChange={e => targetCampaignStore.trigger.changeTargetStar({ starLevel: Number(e.currentTarget.value) })}
          />
        </div>

        <div className="flex items-center space-x-2">
          <Typography.Span>Minimum success chance</Typography.Span>

          <Input
            value={minimumSuccessChance}
            onChange={e => targetCampaignStore.trigger.changeMinimumSuccessChance({ minimumSuccessChance: Number(e.currentTarget.value) })}
            className="max-w-[8ch]"
          />
        </div>

        {targetFormation.data && (
          <div>
            <Typography.Span>{getSuccessChanceMessage()}</Typography.Span>
          </div>
        )}
      </div>

      <div className="flex flex-col space-y-4">
        {targetFormation.isLoading && <Progress />}
        <TargetWarMachinesTable />
      </div>
    </div>
  );
}
