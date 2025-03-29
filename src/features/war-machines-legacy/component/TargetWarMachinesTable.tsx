import { useSelector } from '@xstate/store/react';
import { type ColumnDef } from '@tanstack/react-table';
import { isEqual } from 'radash';

import { DataTable, Form, Input, Select } from '@zougui/react.ui';

import { warMachineRarityList } from '../enums';
import { warMachineStore } from '../warMachine.store';

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
    accessorKey: 'level',
    header: 'Level',
    cell: function Level({ row }) {
      const name = row.original;
      const warMachine = useSelector(warMachineStore, state => state.context.target.warMachines[name]);

      return (
        <Input
          value={warMachine.level ?? ''}
          readOnly
        />
      );
    },
  },
  {
    accessorKey: 'sacredCardLevel',
    header: () => <div className="text-center">Sacred Card Level</div>,
    cell: function SacredCardLevel({ row }) {
      const name = row.original;
      const warMachine = useSelector(warMachineStore, state => state.context.target.warMachines[name]);

      return (
        <Input
          value={warMachine.sacredCardLevel ?? ''}
          readOnly
        />
      );
    },
  },
  {
    accessorKey: 'damageBlueprintLevel',
    header: () => <div className="text-center">Damage Blueprint Level</div>,
    cell: function DamageBlueprintLevel({ row }) {
      const name = row.original;
      const warMachine = useSelector(warMachineStore, state => state.context.target.warMachines[name]);

      return (
        <Input
          value={warMachine.damageBlueprintLevel ?? ''}
          readOnly
        />
      );
    },
  },
  {
    accessorKey: 'healthBlueprintLevel',
    header: () => <div className="text-center">Health Blueprint Level</div>,
    cell: function HealthBlueprintLevel({ row }) {
      const name = row.original;
      const warMachine = useSelector(warMachineStore, state => state.context.target.warMachines[name]);

      return (
        <Input
          value={warMachine.healthBlueprintLevel ?? ''}
          readOnly
        />
      );
    },
  },
  {
    accessorKey: 'armorBlueprintLevel',
    header: () => <div className="text-center">Armor Blueprint Level</div>,
    cell: function ArmorBlueprintLevel({ row }) {
      const name = row.original;
      const warMachine = useSelector(warMachineStore, state => state.context.target.warMachines[name]);

      return (
        <Input
          value={warMachine.armorBlueprintLevel ?? ''}
          readOnly
        />
      );
    },
  },
  {
    accessorKey: 'rarityLevel',
    header: 'Rarity Level',
    cell: function RarityLevel({ row }) {
      const name = row.original;
      const warMachine = useSelector(warMachineStore, state => state.context.target.warMachines[name]);

      return (
        <Select.Root
          value={warMachine.rarity}
          open={false}
        >
          <Select.Trigger className="w-[20ch]">
            <Select.Value />
          </Select.Trigger>

          <Select.Content>
            {warMachineRarityList.map(rarity => (
              <Form.Select.Item key={rarity} value={rarity} className="capitalize">{rarity}</Form.Select.Item>
            ))}
          </Select.Content>
        </Select.Root>
      );
    },
  },
];

export const TargetWarMachinesTable = () => {
  const warMachines = useSelector(
    warMachineStore,
    state => Object.keys(state.context.target.warMachines).filter(name => state.context.target.warMachines[name]?.level),
    isEqual,
  );

  return (
    <DataTable.Root
      data={warMachines}
      columns={columns}
      pageSize={50}
    >
      <DataTable.Content>
        <DataTable.Header />
        <DataTable.Body />
      </DataTable.Content>
    </DataTable.Root>
  );
}
