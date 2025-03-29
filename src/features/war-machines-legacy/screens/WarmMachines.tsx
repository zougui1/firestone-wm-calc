import { Button } from '@zougui/react.ui';

import { WarMachinesTable } from '../component/WarMachinesTable';
import { CrewHeroesTable } from '../component/CrewHeroesTable';
import { ArtifactTypesTable } from '../component/ArtifactTypesTable';
import { WarMachinesResult } from '../component/WarMachinesResult';
import { ImportDialog } from '../component/ImportDialog';
import { ExportDialog } from '../component/ExportDialog';

export const WarMachines = () => {
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
