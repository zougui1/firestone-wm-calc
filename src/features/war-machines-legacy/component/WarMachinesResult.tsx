import { useSelector } from '@xstate/store/react';

import { useBestCampaignFormation, useCampaignSimulation, useTargetCampaignFormation, warMachineStore } from '../warMachine.store';
import { heroBaseData, WarMachineName, warMachinesBaseData } from '../data';
import { Input, Typography } from '@zougui/react.ui';
import { CampaignDifficultySimulationResult, CampaignSimulationResult, getTotalStars } from '../utils/simulateCampaignBattle';
import { Difficulty } from '../enums';
import { useEffect, useMemo, useState } from 'react';
import { Progress } from '~/components/Progress';
import { TargetWarMachinesTable } from './TargetWarMachinesTable';
//import TestWorker from '../workers/test.worker?worker';

const numberFormatter = Intl.NumberFormat('en-US');

const MissionResult = ({ difficulty, mission }: MissionResultProps) => {
  const messageParts = [`Mission ${mission.level} at difficulty ${difficulty}`];
  const isComputing = mission.currentBattleCount < mission.totalBattleCount;

  if (!isComputing) {
    if (mission.status === 'unmet-power-requirement') {
      messageParts.push(`doesn't meet power requirements: ${numberFormatter.format(mission.requiredPower)}`);
    } else {
      messageParts.push(`chance to succeed: ${Number(mission.successChance.toFixed(2))}%`);

      if (mission.successChance === 0 && mission.needsAbilities) {
        messageParts.push('(can still win with abilities)');
      }
    }
  }

  return (
    <div className="flex items-center space-x-2">
      <div>
        {messageParts.join(' ')}
      </div>
      {isComputing && (
        <div className="flex items-center space-x-2">
          <div>simulating battles...</div>

          <div>
            <Progress
              className="w-56 bg-gray-500"
              value={mission.currentBattleCount / mission.totalBattleCount * 100}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export interface MissionResultProps {
  difficulty: Difficulty;
  mission: CampaignSimulationResult;
}

const DifficultyResult = ({ difficulty, data }: DifficultyResultProps) => {
  let startIndex = data.missions.findIndex(mission => {
    return (
      mission.status === 'unmet-power-requirement' ||
      mission.needsAbilities
    );
  });

  if (!data.missions.at(startIndex)?.successChance) {
    startIndex--;
  }

  return (
    <div>
      {data.missions.slice(startIndex).map(mission => (
        <MissionResult
          key={mission.level}
          difficulty={difficulty}
          mission={mission}
        />
      ))}
    </div>
  );
}

export interface DifficultyResultProps {
  difficulty: Difficulty;
  data: CampaignDifficultySimulationResult;
}

export const WarMachinesResult = () => {
  const [partialSimulationData, setPartialSimulationData] = useState<Partial<Record<Difficulty, CampaignDifficultySimulationResult>>>({});

  const targetStar = useSelector(warMachineStore, state => state.context.target.starLevel);

  const { data: result } = useBestCampaignFormation();
  const simulation = useCampaignSimulation({
    onChange: setPartialSimulationData,
  });

  const targetFormation = useTargetCampaignFormation();

  const crewResultJson = useMemo(() => JSON.stringify(result ?? ''), [result]);

  const totalCampaignStarsPossible = useMemo(() => {
    return getTotalStars(simulation.data ?? partialSimulationData);
  }, [simulation.data, partialSimulationData]);

  /*useEffect(() => {
    const worker = new TestWorker();

    worker.onmessage = (event: MessageEvent<{ mission: number }>) => {
      console.log('result:', event.data);
    }

    worker.postMessage(5);

    return () => {
      worker.terminate();
    }
  }, [result]);*/

  return (
    <div className="flex flex-col gap-2">
      <Typography.H4>Likely Best Results</Typography.H4>

      <div className="flex flex-col gap-2">
        {result && Object.values(result.warMachines).map((warMachine) => (
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
        Campaign Power: {numberFormatter.format(result?.campaignPower ?? 0)}
      </div>

      {/**
       * this key is used to prevent the progress bars from having their animation occur
       * when the input data changes which would result in a weird animation
       */}
      <div key={crewResultJson} className="space-y-4">
        <div className="font-bold">
          Total campaign stars possible: {totalCampaignStarsPossible}
        </div>

        {Object.entries(simulation.data ?? partialSimulationData).map(([difficulty, data]) => (
          <DifficultyResult
            key={difficulty}
            difficulty={difficulty as Difficulty}
            data={data}
          />
        ))}
      </div>

      <div className="space-y-4">
        <div>
          <Input
            value={targetStar}
            onChange={e => warMachineStore.trigger.changeTargetStar({ starLevel: Number(e.currentTarget.value) })}
          />
        </div>

        <div>
          {targetFormation && (
            <TargetWarMachinesTable />
          )}
        </div>
      </div>
    </div>
  );
}
