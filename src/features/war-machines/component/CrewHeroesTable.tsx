import { useSelector } from '@xstate/store/react';
import { type ColumnDef } from '@tanstack/react-table';
import { isEqual, isNumber } from 'radash';

import { DataTable, Input } from '@zougui/react.ui';

import {  warMachineStore } from '../warMachine.store';
import { type CrewHero } from '../schemas';

const handleAttributeChange = (name: string, field: keyof CrewHero) => {
  return (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(event.currentTarget.value);

    if (!event.currentTarget.value) {
      warMachineStore.trigger.updateCrewHero({
        name,
        data: { [field]: undefined },
      });
    } else if (isNumber(value)) {
      warMachineStore.trigger.updateCrewHero({
        name,
        data: { [field]: value },
      });
    }
  }
}

const columns: ColumnDef<string>[] = [
  {
    id: 'name',
    header: 'Name',
    cell: ({ row }) => {
      return (
        <span className="capitalize">{row.original}</span>
      );
    },
  },
  {
    accessorKey: 'attributeDamage',
    header: () => <div className="text-center">Attribute Damage</div>,
    cell: function Level({ row }) {
      const name = row.original;
      const crewHero = useSelector(warMachineStore, state => state.context.current.crewHeroes[name]);

      return (
        <Input
          className="h-8"
          value={crewHero.attributeDamage ?? ''}
          onChange={handleAttributeChange(name, 'attributeDamage')}
        />
      );
    },
  },
  {
    accessorKey: 'attributeHealth',
    header: () => <div className="text-center">Attribute Health</div>,
    cell: function Level({ row }) {
      const name = row.original;
      const crewHero = useSelector(warMachineStore, state => state.context.current.crewHeroes[name]);

      return (
        <Input
          className="h-8"
          value={crewHero.attributeHealth ?? ''}
          onChange={handleAttributeChange(name, 'attributeHealth')}
        />
      );
    },
  },
  {
    accessorKey: 'attributeArmor',
    header: () => <div className="text-center">Attribute Armor</div>,
    cell: function Level({ row }) {
      const name = row.original;
      const crewHero = useSelector(warMachineStore, state => state.context.current.crewHeroes[name]);

      return (
        <Input
          className="h-8"
          value={crewHero.attributeArmor ?? ''}
          onChange={handleAttributeChange(name, 'attributeArmor')}
        />
      );
    },
  },
];

export const CrewHeroesTable = () => {
  const crewHeroes = useSelector(
    warMachineStore,
    state => Object.keys(state.context.current.crewHeroes),
    isEqual,
  );

  return (
    <DataTable.Root
      data={crewHeroes}
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
