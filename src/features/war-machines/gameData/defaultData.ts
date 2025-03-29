import { warMachinesBaseData, heroBaseData, artifactTypeBaseData } from './data';
import { warMachineRarities } from './enums';
import { type ArtifactType, type CrewHero, type WarMachine, type GameData } from './schemas';

export const defaultWarMachines = {
  [warMachinesBaseData.cloudfist.name]: {
    name: warMachinesBaseData.cloudfist.name,
    rarity: warMachineRarities.common,
  },
  [warMachinesBaseData.earthshatterer.name]: {
    name: warMachinesBaseData.earthshatterer.name,
    rarity: warMachineRarities.common,
  },
  [warMachinesBaseData.sentinel.name]: {
    name: warMachinesBaseData.sentinel.name,
    rarity: warMachineRarities.common,
  },
  [warMachinesBaseData.judgement.name]: {
    name: warMachinesBaseData.judgement.name,
    rarity: warMachineRarities.common,
  },
  [warMachinesBaseData.talos.name]: {
    name: warMachinesBaseData.talos.name,
    rarity: warMachineRarities.common,
  },
  [warMachinesBaseData.hunter.name]: {
    name: warMachinesBaseData.hunter.name,
    rarity: warMachineRarities.common,
  },
  [warMachinesBaseData.fortress.name]: {
    name: warMachinesBaseData.fortress.name,
    rarity: warMachineRarities.common,
  },
  [warMachinesBaseData.goliath.name]: {
    name: warMachinesBaseData.goliath.name,
    rarity: warMachineRarities.common,
  },
  [warMachinesBaseData.thunderclap.name]: {
    name: warMachinesBaseData.thunderclap.name,
    rarity: warMachineRarities.common,
  },
  [warMachinesBaseData.firecracker.name]: {
    name: warMachinesBaseData.firecracker.name,
    rarity: warMachineRarities.common,
  },
  [warMachinesBaseData.aegis.name]: {
    name: warMachinesBaseData.aegis.name,
    rarity: warMachineRarities.common,
  },
  [warMachinesBaseData.curator.name]: {
    name: warMachinesBaseData.curator.name,
    rarity: warMachineRarities.common,
  },
  [warMachinesBaseData.harvester.name]: {
    name: warMachinesBaseData.harvester.name,
    rarity: warMachineRarities.common,
  },
} as Record<string, WarMachine>;

export const defaultCrewHeroes = {
  [heroBaseData.talia.name]: { name: heroBaseData.talia.name },
  [heroBaseData.burt.name]: { name: heroBaseData.burt.name },
  [heroBaseData.solaine.name]: { name: heroBaseData.solaine.name },
  [heroBaseData.boris.name]: { name: heroBaseData.boris.name },
  [heroBaseData.benedictus.name]: { name: heroBaseData.benedictus.name },
  [heroBaseData.leo.name]: { name: heroBaseData.leo.name },
  [heroBaseData.muriel.name]: { name: heroBaseData.muriel.name },
  [heroBaseData.blaze.name]: { name: heroBaseData.blaze.name },
  [heroBaseData.luana.name]: { name: heroBaseData.luana.name },
  [heroBaseData.valerius.name]: { name: heroBaseData.valerius.name },
  [heroBaseData.astrid.name]: { name: heroBaseData.astrid.name },
  [heroBaseData.ina.name]: { name: heroBaseData.ina.name },
  [heroBaseData.fini.name]: { name: heroBaseData.fini.name },
  [heroBaseData.asmondai.name]: { name: heroBaseData.asmondai.name },
  [heroBaseData.danysa.name]: { name: heroBaseData.danysa.name },
  [heroBaseData.iseris.name]: { name: heroBaseData.iseris.name },
  [heroBaseData.belien.name]: { name: heroBaseData.belien.name },
  [heroBaseData.sely.name]: { name: heroBaseData.sely.name },
  [heroBaseData.randal.name]: { name: heroBaseData.randal.name },
  [heroBaseData.molly.name]: { name: heroBaseData.molly.name },
  [heroBaseData.layla.name]: { name: heroBaseData.layla.name },
  [heroBaseData.joe.name]: { name: heroBaseData.joe.name },
  [heroBaseData.hongyu.name]: { name: heroBaseData.hongyu.name },
  [heroBaseData.amun.name]: { name: heroBaseData.amun.name },
  [heroBaseData.panko.name]: { name: heroBaseData.panko.name },
  [heroBaseData.yavo.name]: { name: heroBaseData.yavo.name },
  [heroBaseData.cirilo.name]: { name: heroBaseData.cirilo.name },
  [heroBaseData.vilon.name]: { name: heroBaseData.vilon.name },
  [heroBaseData.anzo.name]: { name: heroBaseData.anzo.name },
  [heroBaseData.zelea.name]: { name: heroBaseData.zelea.name },
  [heroBaseData.zoruk.name]: { name: heroBaseData.zoruk.name },
  [heroBaseData.rickie.name]: { name: heroBaseData.rickie.name },
  [heroBaseData.jess.name]: { name: heroBaseData.jess.name },
  [heroBaseData.ledra.name]: { name: heroBaseData.ledra.name },
  [heroBaseData.yamanoth.name]: { name: heroBaseData.yamanoth.name },
  [heroBaseData.kramatak.name]: { name: heroBaseData.kramatak.name },
} as Record<string, CrewHero>;

export const defaultArtifactTypes = {
  [artifactTypeBaseData.damage.name]: {
    name: artifactTypeBaseData.damage.name,
    percents: {},
  },
  [artifactTypeBaseData.health.name]: {
    name: artifactTypeBaseData.health.name,
    percents: {},
  },
  [artifactTypeBaseData.armor.name]: {
    name: artifactTypeBaseData.armor.name,
    percents: {},
  },
} as Record<string, ArtifactType>;

export const defaultGameData = {
  warMachines: defaultWarMachines,
  crewHeroes: defaultCrewHeroes,
  artifactTypes: defaultArtifactTypes,
} as GameData;
