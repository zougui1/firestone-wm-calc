import { useSelector } from '@xstate/store/react';
import { isNumber } from 'radash';

import { Button, Input, Label } from '@zougui/react.ui';

import { WarMachinesTable } from '../component/WarMachinesTable';
import { CrewHeroesTable } from '../component/CrewHeroesTable';
import { ArtifactTypesTable } from '../component/ArtifactTypesTable';
import { warMachineStore } from '../warMachine.store';
import { WarMachinesResult } from '../component/WarMachinesResult';
import { ImportDialog } from '../component/ImportDialog';
import { ExportDialog } from '../component/ExportDialog';

const getInputNumber = (value: string): number | undefined => {
  const num = Number(value);

  if (value && isNumber(num)) {
    return num;
  }
}

export const WarMachines = () => {
  const leagueBonus = useSelector(warMachineStore, state => state.context.leagueBonus);

  const handleLeagueBonusChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    warMachineStore.trigger.updateLeagueBonus({
      leagueBonus: getInputNumber(event.currentTarget.value),
    });
  }

  return (
    <div className="container py-8 space-y-2">
      <div className="flex justify-end space-x-2">
        <ImportDialog>
          <Button>Import</Button>
        </ImportDialog>

        <ExportDialog>
          <Button>Export</Button>
        </ExportDialog>
      </div>

      <div className="flex items-center space-x-2">
        <Label htmlFor="leagueBonus" className="whitespace-nowrap">
          League Bonus (%)
        </Label>

        <Input
          id="leagueBonus"
          value={leagueBonus ?? ''}
          onChange={handleLeagueBonusChange}
          className="w-[15ch]"
        />
      </div>

      <div className="space-y-8">
        <div className="space-y-8 lg:flex lg:space-x-8">
          <div className="compact-table lg:flex lg:flex-col lg:gap-8 lg:w-2/3">
            <div>
              <WarMachinesTable />
            </div>

            <div className="hidden lg:block">
              <ArtifactTypesTable />
            </div>

            <div className="hidden lg:block">
              <WarMachinesResult />
            </div>
          </div>

          <div className="w-full compact-table lg:w-1/3">
            <CrewHeroesTable />
          </div>
        </div>

        <div className="lg:hidden">
          <ArtifactTypesTable />
        </div>
      </div>

      <div className="lg:hidden">
        <WarMachinesResult />
      </div>
    </div>
  );
}
