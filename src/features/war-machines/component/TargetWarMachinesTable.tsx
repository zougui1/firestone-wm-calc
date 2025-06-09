import { useSelector } from '@xstate/store/react';
import { type ColumnDef } from '@tanstack/react-table';
import { isEqual } from 'radash';

import { DataTable } from '@zougui/react.ui';

import { gameDataStore, useCampaignSimulation } from '../gameData/store';
import { targetCampaignStore } from '../targetCampaign';
import { calculateBlueprintCost, calculateResources, estimateTimeForUpgrade, getTotalStars } from '../utils';
import { useMemo } from 'react';

const numberFormatter = new Intl.NumberFormat('en-US');

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
      const warMachine = useSelector(targetCampaignStore, state => state.context.warMachines[name]);

      return (
        <div className="h-10 flex justify-center items-center">
          {warMachine.level}
        </div>
      );
    },
  },
  {
    accessorKey: 'sacredCardLevel',
    header: () => <div className="text-center">Sacred Card Level</div>,
    cell: function SacredCardLevel({ row }) {
      const name = row.original;
      const warMachine = useSelector(targetCampaignStore, state => state.context.warMachines[name]);

      return (
        <div className="h-10 flex justify-center items-center">
          {warMachine.sacredCardLevel}
        </div>
      );
    },
  },
  {
    accessorKey: 'damageBlueprintLevel',
    header: () => <div className="text-center">Damage Blueprint Level</div>,
    cell: function DamageBlueprintLevel({ row }) {
      const name = row.original;
      const warMachine = useSelector(targetCampaignStore, state => state.context.warMachines[name]);

      return (
        <div className="h-10 flex justify-center items-center">
          {warMachine.damageBlueprintLevel}
        </div>
      );
    },
  },
  {
    accessorKey: 'healthBlueprintLevel',
    header: () => <div className="text-center">Health Blueprint Level</div>,
    cell: function HealthBlueprintLevel({ row }) {
      const name = row.original;
      const warMachine = useSelector(targetCampaignStore, state => state.context.warMachines[name]);

      return (
        <div className="h-10 flex justify-center items-center">
          {warMachine.healthBlueprintLevel}
        </div>
      );
    },
  },
  {
    accessorKey: 'armorBlueprintLevel',
    header: () => <div className="text-center">Armor Blueprint Level</div>,
    cell: function ArmorBlueprintLevel({ row }) {
      const name = row.original;
      const warMachine = useSelector(targetCampaignStore, state => state.context.warMachines[name]);

      return (
        <div className="h-10 flex justify-center items-center">
          {warMachine.armorBlueprintLevel}
        </div>
      );
    },
  },
  {
    accessorKey: 'rarityLevel',
    header: () => <div className="text-center">Rarity Level</div>,
    cell: function RarityLevel({ row }) {
      const name = row.original;
      const warMachine = useSelector(targetCampaignStore, state => state.context.warMachines[name]);

      return (
        <div className="h-10 flex justify-center items-center">
          {warMachine.rarity}
        </div>
      );
    },
  },
  {
    id: 'screws',
    header: () => <div className="text-center">Screws</div>,
    cell: function Level({ row }) {
      const name = row.original;
      const currentLevel = useSelector(gameDataStore, state => state.context.warMachines[name].level);
      const targetLevel = useSelector(targetCampaignStore, state => state.context.warMachines[name].level);

      const { screws } = calculateResources(currentLevel ?? 0, targetLevel ?? 0);

      return (
        <div className="h-10 flex justify-center items-center">
          {screws || ''}
        </div>
      );
    },
  },
  {
    id: 'cogs',
    header: () => <div className="text-center">Cogs</div>,
    cell: function Level({ row }) {
      const name = row.original;
      const currentLevel = useSelector(gameDataStore, state => state.context.warMachines[name].level);
      const targetLevel = useSelector(targetCampaignStore, state => state.context.warMachines[name].level);

      const { cogs } = calculateResources(currentLevel ?? 0, targetLevel ?? 0);

      return (
        <div className="h-10 flex justify-center items-center">
          {cogs || ''}
        </div>
      );
    },
  },
  {
    id: 'metal',
    header: () => <div className="text-center">Metal</div>,
    cell: function Level({ row }) {
      const name = row.original;
      const currentLevel = useSelector(gameDataStore, state => state.context.warMachines[name].level);
      const targetLevel = useSelector(targetCampaignStore, state => state.context.warMachines[name].level);

      const { metal } = calculateResources(currentLevel ?? 0, targetLevel ?? 0);

      return (
        <div className="h-10 flex justify-center items-center">
          {metal || ''}
        </div>
      );
    },
  },
  {
    id: 'expeditionTokens',
    header: function ExpeditionTokenHeader() {
      const currentWarMachines = useSelector(gameDataStore, state => state.context.warMachines);
      const targetWarMachines = useSelector(targetCampaignStore, state => state.context.warMachines);

      let totalexpeditionTokens = 0;

      for (const [name, targetWarMachine] of Object.entries(targetWarMachines)) {
        const currentWarMachine = currentWarMachines[name] ?? {};
        const { expeditionTokens } = calculateResources(currentWarMachine.level ?? 0, targetWarMachine.level ?? 0);

        totalexpeditionTokens += expeditionTokens;
      }

      return (
        <div className="flex flex-col items-center text-center">
          <div>Expedition Tokens</div>
          <div>({numberFormatter.format(totalexpeditionTokens)})</div>
        </div>
      );
    },
    cell: function Level({ row }) {
      const name = row.original;
      const currentLevel = useSelector(gameDataStore, state => state.context.warMachines[name].level);
      const targetLevel = useSelector(targetCampaignStore, state => state.context.warMachines[name].level);

      const { expeditionTokens } = calculateResources(currentLevel ?? 0, targetLevel ?? 0);

      return (
        <div className="h-10 flex justify-center items-center">
          {expeditionTokens || ''}
        </div>
      );
    },
  },
  {
    id: 'blueprints',
    header: function ExpeditionTokenHeader() {
      const currentWarMachines = useSelector(gameDataStore, state => state.context.warMachines);
      const targetWarMachines = useSelector(targetCampaignStore, state => state.context.warMachines);

      let totalBlueprints = 0;

      for (const [name, targetWarMachine] of Object.entries(targetWarMachines)) {
        const currentWarMachine = currentWarMachines[name] ?? {};

        const damageBlueprints = calculateBlueprintCost(currentWarMachine.damageBlueprintLevel ?? 0, targetWarMachine.damageBlueprintLevel ?? 0);
        const healthBlueprints = calculateBlueprintCost(currentWarMachine.healthBlueprintLevel ?? 0, targetWarMachine.healthBlueprintLevel ?? 0);
        const armorBlueprints = calculateBlueprintCost(currentWarMachine.armorBlueprintLevel ?? 0, targetWarMachine.armorBlueprintLevel ?? 0);

        totalBlueprints += damageBlueprints + healthBlueprints + armorBlueprints;
      }

      return (
        <div className="flex flex-col items-center text-center">
          <div>Blueprints</div>
          <div>({numberFormatter.format(totalBlueprints)})</div>
        </div>
      );
    },
    cell: function DamageBlueprintLevel({ row }) {
      const name = row.original;
      const currentWarMachine = useSelector(gameDataStore, state => state.context.warMachines[name]);
      const targetWarMachine = useSelector(targetCampaignStore, state => state.context.warMachines[name]);

      const damageBlueprints = calculateBlueprintCost(currentWarMachine.damageBlueprintLevel ?? 0, targetWarMachine.damageBlueprintLevel ?? 0);
      const healthBlueprints = calculateBlueprintCost(currentWarMachine.healthBlueprintLevel ?? 0, targetWarMachine.healthBlueprintLevel ?? 0);
      const armorBlueprints = calculateBlueprintCost(currentWarMachine.armorBlueprintLevel ?? 0, targetWarMachine.armorBlueprintLevel ?? 0);

      const totalBlueprints = damageBlueprints + healthBlueprints + armorBlueprints;

      return (
        <div className="h-10 flex justify-center items-center">
          {totalBlueprints || ''}
        </div>
      );
    },
  },
  {
    id: 'delay',
    header: () => <div className="text-center">Delay</div>,
    cell: function DamageBlueprintLevel({ row }) {
      const name = row.original;
      const currentLevel = useSelector(gameDataStore, state => state.context.warMachines[name].level);
      const targetLevel = useSelector(targetCampaignStore, state => state.context.warMachines[name].level);
      const { data, isLoading } = useCampaignSimulation();

      const totalCampaignStarsPossible = useMemo(() => {
        return (data && !isLoading) ? getTotalStars(data) : 0;
      }, [data, isLoading]);

      const delay = useMemo(() => {
        if (totalCampaignStarsPossible <= 0) {
          return 0;
        }

        const requiredResources = calculateResources(currentLevel ?? 0, targetLevel ?? 0);

        return estimateTimeForUpgrade({
          stars: totalCampaignStarsPossible,
          emblems: 0,
          ownedResources:{
            screws: 0,
            cogs: 0,
            metal: 0,
            expeditionTokens: 0,
          },
          requiredResources: {
            ...requiredResources,
            expeditionTokens: 0,
          },
        });
      }, [totalCampaignStarsPossible, currentLevel, targetLevel]);

      const getDelay = () => {
        if (delay <= 0) {
          return;
        }

        return delay === 1 ? `~${delay} day` : `~${delay} days`;
      }

      return (
        <div className="h-10 flex justify-center items-center">
          {getDelay()}
        </div>
      );
    },
  },
];

export const TargetWarMachinesTable = () => {
  const warMachines = useSelector(
    gameDataStore,
    state => Object.keys(state.context.warMachines).filter(name => state.context.warMachines[name]?.level),
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
