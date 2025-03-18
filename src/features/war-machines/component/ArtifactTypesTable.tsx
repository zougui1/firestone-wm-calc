import { useSelector } from '@xstate/store/react';
import { type ColumnDef } from '@tanstack/react-table';
import { isEqual, isNumber } from 'radash';

import { DataTable, Input } from '@zougui/react.ui';

import { warMachineStore } from '../warMachine.store';
import { type ArtifactType } from '../schemas';

const handleChange = (name: string, field: keyof ArtifactType['percents']) => {
  return (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(event.currentTarget.value);

    if (!event.currentTarget.value) {
      warMachineStore.trigger.updateArtifactTypes({
        name,
        data: { [field]: undefined },
      });
    } else if (isNumber(value)) {
      warMachineStore.trigger.updateArtifactTypes({
        name,
        data: { [field]: value },
      });
    }
  }
}

const getPercentColumn = (percentage: keyof ArtifactType['percents']): ColumnDef<string> => {
  return {
    id: `${percentage}%`,
    header: () => (
      <div className="text-center"># of {percentage}%</div>
    ),
    cell: function Level({ row }) {
      const name = row.original;
      const value = useSelector(warMachineStore, state => state.context.current.artifactTypes[name].percents[percentage]);

      return (
        <Input
          value={value ?? ''}
          onChange={handleChange(name, percentage)}
        />
      );
    },
  };
}

const columns: ColumnDef<string>[] = [
  {
    id: 'name',
    header: 'Artifact Type',
    cell: ({ row }) => row.original,
  },
  getPercentColumn(30),
  getPercentColumn(35),
  getPercentColumn(40),
  getPercentColumn(45),
  getPercentColumn(50),
  getPercentColumn(55),
  getPercentColumn(60),
  getPercentColumn(65),
];

export const ArtifactTypesTable = () => {
  const artifactTypes = useSelector(
    warMachineStore,
    state => Object.keys(state.context.current.artifactTypes),
    isEqual,
  );

  return (
    <DataTable.Root
      data={artifactTypes}
      columns={columns}
      pageSize={100}
    >
      <DataTable.Content>
        <DataTable.Header />
        <DataTable.Body />
      </DataTable.Content>
    </DataTable.Root>
  );
}
