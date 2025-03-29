import { Typography } from '@zougui/react.ui';

import {
  useBestCampaignFormation,
  heroBaseData,
  warMachinesBaseData,
  type WarMachineName,
  type HeroName,
 } from '../gameData';

const numberFormatter = Intl.NumberFormat('en-US');

export const BestCrew = () => {
  const { data } = useBestCampaignFormation();

  return (
    <div className="flex flex-col gap-2">
      <Typography.H4>Likely Best Results</Typography.H4>

      <div className="flex flex-col gap-2">
        {data && Object.values(data.warMachines).map((warMachine) => (
          <div key={warMachine.name} className="flex gap-2">
            <div>
              <img
                className="size-16"
                src={warMachinesBaseData[warMachine.name as WarMachineName].img}
                alt={warMachine.name}
              />
            </div>

            {warMachine.crew.map(heroName => (
              <div key={heroName}>
                <img
                  className="size-16"
                  src={heroBaseData[heroName as unknown as HeroName]?.img}
                  alt={heroName}
                />
              </div>
            ))}
          </div>
        ))}
      </div>

      <div>
        Campaign Power: {numberFormatter.format(data?.campaignPower ?? 0)}
      </div>
    </div>
  );
}
