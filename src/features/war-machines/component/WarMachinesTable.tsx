import { useSelector } from '@xstate/store/react';
import { type ColumnDef } from '@tanstack/react-table';
import { isEqual, isNumber } from 'radash';

import { DataTable, Form, Input, Select } from '@zougui/react.ui';

import { WarMachineRarity, warMachineRarityList } from '../enums';
import { warMachineStore } from '../warMachine.store';
import { type WarMachine } from '../schemas';

const handleLevelChange = (name: string, field: keyof WarMachine) => {
  return (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(event.currentTarget.value);

    if (!event.currentTarget.value) {
      warMachineStore.trigger.updateWarMachine({
        name,
        data: { [field]: undefined },
      });
    } else if (isNumber(value)) {
      warMachineStore.trigger.updateWarMachine({
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
    accessorKey: 'level',
    header: 'Level',
    cell: function Level({ row }) {
      const name = row.original;
      const warMachine = useSelector(warMachineStore, state => state.context.current.warMachines[name]);

      return (
        <Input
          value={warMachine.level ?? ''}
          onChange={handleLevelChange(name, 'level')}
        />
      );
    },
  },
  {
    accessorKey: 'sacredCardLevel',
    header: () => <div className="text-center">Sacred Card Level</div>,
    cell: function SacredCardLevel({ row }) {
      const name = row.original;
      const warMachine = useSelector(warMachineStore, state => state.context.current.warMachines[name]);

      return (
        <Input
          value={warMachine.sacredCardLevel ?? ''}
          onChange={handleLevelChange(name, 'sacredCardLevel')}
        />
      );
    },
  },
  {
    accessorKey: 'damageBlueprintLevel',
    header: () => <div className="text-center">Damage Blueprint Level</div>,
    cell: function DamageBlueprintLevel({ row }) {
      const name = row.original;
      const warMachine = useSelector(warMachineStore, state => state.context.current.warMachines[name]);

      return (
        <Input
          value={warMachine.damageBlueprintLevel ?? ''}
          onChange={handleLevelChange(name, 'damageBlueprintLevel')}
        />
      );
    },
  },
  {
    accessorKey: 'healthBlueprintLevel',
    header: () => <div className="text-center">Health Blueprint Level</div>,
    cell: function HealthBlueprintLevel({ row }) {
      const name = row.original;
      const warMachine = useSelector(warMachineStore, state => state.context.current.warMachines[name]);

      return (
        <Input
          value={warMachine.healthBlueprintLevel ?? ''}
          onChange={handleLevelChange(name, 'healthBlueprintLevel')}
        />
      );
    },
  },
  {
    accessorKey: 'armorBlueprintLevel',
    header: () => <div className="text-center">Armor Blueprint Level</div>,
    cell: function ArmorBlueprintLevel({ row }) {
      const name = row.original;
      const warMachine = useSelector(warMachineStore, state => state.context.current.warMachines[name]);

      return (
        <Input
          value={warMachine.armorBlueprintLevel ?? ''}
          onChange={handleLevelChange(name, 'armorBlueprintLevel')}
        />
      );
    },
  },
  {
    accessorKey: 'rarityLevel',
    header: 'Rarity Level',
    cell: function RarityLevel({ row }) {
      const name = row.original;
      const warMachine = useSelector(warMachineStore, state => state.context.current.warMachines[name]);

      const handleChange = (value: string) => {
        warMachineStore.trigger.updateWarMachineRarity({
          name,
          rarity: value as WarMachineRarity,
        });
      }

      return (
        <Select.Root
          value={warMachine.rarity}
          onValueChange={handleChange}
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

export const WarMachinesTable = () => {
  const warMachines = useSelector(
    warMachineStore,
    state => Object.keys(state.context.current.warMachines),
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
