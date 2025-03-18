import { z } from 'zod';

import { warMachineRarityList } from './enums';
import { warMachineNameList } from './data';

export const warMachineSchema = z.object({
  name: z.enum(warMachineNameList),
  level: z.number().optional(),
  sacredCardLevel: z.number().optional(),
  damageBlueprintLevel: z.number().optional(),
  healthBlueprintLevel: z.number().optional(),
  armorBlueprintLevel: z.number().optional(),
  rarity: z.enum(warMachineRarityList),
});

export type WarMachine = z.infer<typeof warMachineSchema>;

export const crewHeroSchema = z.object({
  name: z.string(),
  attributeDamage: z.number().optional(),
  attributeHealth: z.number().optional(),
  attributeArmor: z.number().optional(),
});

export type CrewHero = z.infer<typeof crewHeroSchema>;

export const artifactTypeSchema = z.object({
  name: z.string(),
  percents: z.object({
    30: z.number().optional(),
    35: z.number().optional(),
    40: z.number().optional(),
    45: z.number().optional(),
    50: z.number().optional(),
    55: z.number().optional(),
    60: z.number().optional(),
    65: z.number().optional(),
  }),
});

export type ArtifactType = z.infer<typeof artifactTypeSchema>;

export const warMachineDataSchema = z.object({
  current: z.object({
    leagueBonus: z.number().optional(),
    warMachines: z.record(warMachineSchema),
    crewHeroes: z.record(crewHeroSchema),
    artifactTypes: z.record(artifactTypeSchema),
  }),
  target: z.object({
    starLevel: z.number().default(0),
    warMachines: z.record(warMachineSchema).default({}),
  }).default({}),
});

export type WarMachineData = z.infer<typeof warMachineDataSchema>;
