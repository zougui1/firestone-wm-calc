import { useMemo, useState } from 'react';

import { Progress } from '~/components/Progress';

import { useCampaignSimulation, type Difficulty } from '../gameData';
import { CampaignDifficultySimulationResult, CampaignSimulationResult, getTotalStars } from '../utils/simulateCampaignBattle';

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

export const CampaignSimulation = () => {
  const [partialSimulationData, setPartialSimulationData] = useState<Partial<Record<Difficulty, CampaignDifficultySimulationResult>>>({});

  const { data } = useCampaignSimulation({
    onChange: setPartialSimulationData,
  });

  const dataJson = useMemo(() => JSON.stringify(data ?? ''), [data]);

  const totalCampaignStarsPossible = useMemo(() => {
    return getTotalStars(data ?? partialSimulationData);
  }, [data, partialSimulationData]);

  /**
   * this key is used to prevent the progress bars from having their animation occur
   * when the input data changes which would result in a weird animation
   */
  return (
    <div key={dataJson} className="space-y-4">
      <div className="font-bold">
        Total campaign stars possible: {totalCampaignStarsPossible}
      </div>

      {Object.entries(data ?? partialSimulationData).map(([difficulty, data]) => (
        <DifficultyResult
          key={difficulty}
          difficulty={difficulty as Difficulty}
          data={data}
        />
      ))}
    </div>
  );
}
