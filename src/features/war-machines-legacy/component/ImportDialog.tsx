import { useState } from 'react';
import { z } from 'zod';

import { Button, Dialog, Form } from '@zougui/react.ui'

import { useAppForm } from '~/hooks';
import { catchError } from '~/utils';

import { ArtifactType, artifactTypeSchema, CrewHero, crewHeroSchema, WarMachine, warMachineSchema } from '../schemas';
import { artifactTypeBaseData, ArtifactTypeName, WarMachineName, warMachinesBaseData } from '../data';
import { warMachineRarityLevelsReverse } from '../enums';
import { warMachineStore } from '../warMachine.store';

function jsonSchema<T extends z.ZodType>(schema: T) {
  return z.string().transform((str, ctx): z.infer<T> => {
    if (!str && schema.isOptional()) {
      return;
    }

    const [jsonError, data] = catchError(() => JSON.parse(str));

    if (jsonError) {
      ctx.addIssue({ code: 'custom', message: 'Invalid data' });
      return z.NEVER
    }

    const result = schema.safeParse(data);

    if (!result.success) {
      ctx.addIssue({ code: 'custom', message: 'Invalid data' });
      return z.NEVER
    }

    return result.data;
  });
}

const externalWarMachinesDataSchema = z.record(z.object({
  name: z.string(),
  league_bonus: z.number().optional(),
  level: z.number(),
  sacred_card_level: z.number(),
  blueprint_damage: z.number(),
  blueprint_health: z.number(),
  blueprint_armor: z.number(),
  rarity: z.coerce.number().transform((rarityLevel, ctx) => {
    if (rarityLevel in warMachineRarityLevelsReverse) {
      return warMachineRarityLevelsReverse[rarityLevel];
    }

    ctx.addIssue({ code: 'custom', message: 'Invalid data' });
    return z.NEVER
  }),
})).transform(data => {
  const warMachines: Record<string, WarMachine> = {};
  const inputWarMachines = Object.values(data);

  for (const warMachine of inputWarMachines) {
    if (warMachine.name in warMachinesBaseData) {
      warMachines[warMachine.name] = {
        name: warMachine.name as WarMachineName,
        level: warMachine.level,
        sacredCardLevel: warMachine.sacred_card_level,
        damageBlueprintLevel: warMachine.blueprint_damage,
        healthBlueprintLevel: warMachine.blueprint_health,
        armorBlueprintLevel: warMachine.blueprint_armor,
        rarity: warMachine.rarity,
      };
    }
  }

  return {
    leagueBonus: inputWarMachines[0]?.league_bonus,
    warMachines,
  };
});
const externalHeroesDataSchema = z.record(z.object({
  name: z.string(),
  damage: z.coerce.number(),
  health: z.coerce.number(),
  armor: z.coerce.number(),
})).transform(data => {
  const heroes: Record<string, CrewHero> = {};

  for (const hero of Object.values(data)) {
    heroes[hero.name] = {
      name: hero.name,
      attributeDamage: hero.damage,
      attributeHealth: hero.health,
      attributeArmor: hero.armor,
    };
  }

  return heroes;
});
const externalArtifactTypesDataSchema = z.object({
  damage_30: z.coerce.number(),
  damage_35: z.coerce.number(),
  damage_40: z.coerce.number(),
  damage_45: z.coerce.number(),
  damage_50: z.coerce.number(),
  damage_55: z.coerce.number(),
  damage_60: z.coerce.number(),
  damage_65: z.coerce.number(),

  health_30: z.coerce.number(),
  health_35: z.coerce.number(),
  health_40: z.coerce.number(),
  health_45: z.coerce.number(),
  health_50: z.coerce.number(),
  health_55: z.coerce.number(),
  health_60: z.coerce.number(),
  health_65: z.coerce.number(),

  armor_30: z.coerce.number(),
  armor_35: z.coerce.number(),
  armor_40: z.coerce.number(),
  armor_45: z.coerce.number(),
  armor_50: z.coerce.number(),
  armor_55: z.coerce.number(),
  armor_60: z.coerce.number(),
  armor_65: z.coerce.number(),
}).transform(data => {
  return {
    damage: {
      name: artifactTypeBaseData.damage.name,
      percents: {
        30: data.damage_30,
        35: data.damage_35,
        40: data.damage_40,
        45: data.damage_45,
        50: data.damage_50,
        55: data.damage_55,
        60: data.damage_60,
        65: data.damage_65,
      },
    },
    health: {
      name: artifactTypeBaseData.health.name,
      percents: {
        30: data.health_30,
        35: data.health_35,
        40: data.health_40,
        45: data.health_45,
        50: data.health_50,
        55: data.health_55,
        60: data.health_60,
        65: data.health_65,
      },
    },
    armor: {
      name: artifactTypeBaseData.armor.name,
      percents: {
        30: data.armor_30,
        35: data.armor_35,
        40: data.armor_40,
        45: data.armor_45,
        50: data.armor_50,
        55: data.armor_55,
        60: data.armor_60,
        65: data.armor_65,
      },
    },
  } satisfies Record<ArtifactTypeName, ArtifactType>;
});

const internalWarMachinesDataSchema = z.object({
  leagueBonus: z.number(),
  warMachines: z.record(warMachineSchema),
});

export const formSchema = z.object({
  warMachines: jsonSchema(externalWarMachinesDataSchema.or(internalWarMachinesDataSchema).optional()),
  heroes: jsonSchema(externalHeroesDataSchema.or(z.record(crewHeroSchema)).optional()),
  artifactTypes: jsonSchema(externalArtifactTypesDataSchema.or(z.record(artifactTypeSchema)).optional()),
});

export const ImportDialog = ({ children }: ImportDialogProps) => {
  const [open, setOpen] = useState(false);
  const form = useAppForm({
    schema: formSchema,
    defaultValues: {
      warMachines: '' as never,
      heroes: '' as never,
      artifactTypes: '' as never,
    },
  });

  const handleSubmit = form.handleSubmit(data => {
    warMachineStore.trigger.import(data);
    handleOpenChange(false);
  });

  const handleOpenChange = (open: boolean) => {
    setOpen(open);

    if (!open) {
      form.reset();
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Trigger asChild>
        {children}
      </Dialog.Trigger>

      <Dialog.Content>
        <Form.Root {...form}>
          <form onSubmit={handleSubmit}>
            <Dialog.Header>
              <Dialog.Title>Import data</Dialog.Title>
              <Dialog.Description>You may import data from https://crius.feralhosting.com/gragatrim/firestone_wm_calc/index.php</Dialog.Description>
            </Dialog.Header>

            <Dialog.Body className="space-y-4">
              <Form.Textarea
                control={form.control}
                name="warMachines"
                label="War Machines"
              />

              <Form.Textarea
                control={form.control}
                name="heroes"
                label="Heroes"
              />

              <Form.Textarea
                control={form.control}
                name="artifactTypes"
                label="Artifacts"
              />
            </Dialog.Body>

            <Dialog.Footer>
              <Dialog.Close asChild>
                <Button variant="outline">Cancel</Button>
              </Dialog.Close>

              <Button type="submit">Import</Button>
            </Dialog.Footer>
          </form>
        </Form.Root>
      </Dialog.Content>
    </Dialog.Root>
  );
}

export interface ImportDialogProps {
  children: React.ReactNode;
}
