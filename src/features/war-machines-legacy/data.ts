import { specializationTypes } from './enums';

export const warMachinesBaseData = {
  cloudfist: {
    name: 'cloudfist',
    damage: 880,
    health: 6500,
    armor: 125,
    specializationType: specializationTypes.damage,
    img: '/war-machines/Cloudfist.webp',
  },
  fortress: {
    name: 'fortress',
    damage: 460,
    health: 11000,
    armor: 300,
    specializationType: specializationTypes.tank,
    img: '/war-machines/Fortress.webp',
  },
  aegis: {
    name: 'aegis',
    damage: 890,
    health: 5100,
    armor: 115,
    specializationType: specializationTypes.damage,
    img: '/war-machines/Aegis.webp',
  },
  firecracker: {
    name: 'firecracker',
    damage: 910,
    health: 4900,
    armor: 110,
    specializationType: specializationTypes.damage,
    img: '/war-machines/Firecracker.webp',
  },
  talos: {
    name: 'talos',
    damage: 860,
    health: 6000,
    armor: 130,
    specializationType: specializationTypes.damage,
    img: '/war-machines/Talos.webp',
  },
  harvester: {
    name: 'harvester',
    damage: 960,
    health: 5500,
    armor: 125,
    specializationType: specializationTypes.damage,
    img: '/war-machines/Harvester.webp',
  },
  judgement: {
    name: 'judgement',
    damage: 1080,
    health: 4700,
    armor: 90,
    specializationType: specializationTypes.damage,
    img: '/war-machines/Judgement.webp',
  },
  thunderclap: {
    name: 'thunderclap',
    damage: 1050,
    health: 5200,
    armor: 100,
    specializationType: specializationTypes.damage,
    img: '/war-machines/Thunderclap.webp',
  },
  curator: {
    name: 'curator',
    damage: 380,
    health: 4100,
    armor: 150,
    specializationType: specializationTypes.healer,
    img: '/war-machines/Curator.webp',
  },
  hunter: {
    name: 'hunter',
    damage: 400,
    health: 4900,
    armor: 130,
    specializationType: specializationTypes.healer,
    img: '/war-machines/Hunter.webp',
  },
  sentinel: {
    name: 'sentinel',
    damage: 390,
    health: 4400,
    armor: 170,
    specializationType: specializationTypes.healer,
    img: '/war-machines/Sentinel.webp',
  },
  earthshatterer: {
    name: 'earthshatterer',
    damage: 510,
    health: 10500,
    armor: 270,
    specializationType: specializationTypes.tank,
    img: '/war-machines/Earthshatterer.webp',
  },
  goliath: {
    name: 'goliath',
    damage: 430,
    health: 12000,
    armor: 280,
    specializationType: specializationTypes.tank,
    img: '/war-machines/Goliath.webp',
  },
} as const;

export type WarMachineName = keyof typeof warMachinesBaseData;
export const warMachineNameList = Object.keys(warMachinesBaseData) as [WarMachineName, ...WarMachineName[]];

export const heroBaseData = {
  talia: {
    name: 'talia',
    img: '/heroes/Talia_Avatar.webp',
  },
  burt: {
    name: 'burt',
    img: '/heroes/Burt_Avatar.webp',
  },
  solaine: {
    name: 'solaine',
    img: '/heroes/Solaine_Avatar.webp',
  },
  boris: {
    name: 'boris',
    img: '/heroes/Boris_Avatar.webp',
  },
  benedictus: {
    name: 'benedictus',
    img: '/heroes/Benedictus_Avatar.webp',
  },
  leo: {
    name: 'leo',
    img: '/heroes/Leo_Avatar.webp',
  },
  muriel: {
    name: 'muriel',
    img: '/heroes/Muriel_Avatar.webp',
  },
  blaze: {
    name: 'blaze',
    img: '/heroes/Blaze_Avatar.webp',
  },
  luana: {
    name: 'luana',
    img: '/heroes/Luana_Avatar.webp',
  },
  valerius: {
    name: 'valerius',
    img: '/heroes/Valerius_Avatar.webp',
  },
  astrid: {
    name: 'astrid',
    img: '/heroes/Astrid_Avatar.webp',
  },
  ina: {
    name: 'ina',
    img: '/heroes/Ina_Avatar.webp',
  },
  fini: {
    name: 'fini',
    img: '/heroes/Fini_Avatar.webp',
  },
  asmondai: {
    name: 'asmondai',
    img: '/heroes/Asmondai_Avatar.webp',
  },
  danysa: {
    name: 'danysa',
    img: '/heroes/Danysa_Avatar.webp',
  },
  iseris: {
    name: 'iseris',
    img: '/heroes/Iseris_Avatar.webp',
  },
  belien: {
    name: 'belien',
    img: '/heroes/Belien_Avatar.webp',
  },
  sely: {
    name: 'sely',
    img: '/heroes/Sely_Avatar.webp',
  },
  randal: {
    name: 'randal',
    img: '/heroes/Randal_Avatar.webp',
  },
  molly: {
    name: 'molly',
    img: '/heroes/Molly_Avatar.webp',
  },
  layla: {
    name: 'layla',
    img: '/heroes/Layla_Avatar.webp',
  },
  joe: {
    name: 'joe',
    img: '/heroes/Joe_Avatar.webp',
  },
  hongyu: {
    name: 'hongyu',
    img: '/heroes/Hongyu_Avatar.webp',
  },
  amun: {
    name: 'amun',
    img: '/heroes/Amun_Avatar.webp',
  },
  panko: {
    name: 'panko',
    img: '/heroes/Panko_Avatar.webp',
  },
  yavo: {
    name: 'yavo',
    img: '/heroes/Yavo_Avatar.webp',
  },
  cirilo: {
    name: 'cirilo',
    img: '/heroes/Cirilo_Avatar.webp',
  },
  vilon: {
    name: 'vilon',
    img: '/heroes/Vilon_Avatar.webp',
  },
  anzo: {
    name: 'anzo',
    img: '/heroes/Anzo_Avatar.webp',
  },
  zelea: {
    name: 'zelea',
    img: '/heroes/Zelea_Avatar.webp',
  },
  zoruk: {
    name: 'zoruk',
    img: '/heroes/Zoruk_Avatar.webp',
  },
  rickie: {
    name: 'rickie',
    img: '/heroes/Rickie_Avatar.webp',
  },
  jess: {
    name: 'jess',
    img: '/heroes/Jess_Avatar.webp',
  },
  ledra: {
    name: 'ledra',
    img: '/heroes/Ledra_Avatar.webp',
  },
  yamanoth: {
    name: 'yamanoth',
    img: '/heroes/Yamanoth_Avatar.webp',
  },
  kramatak: {
    name: 'kramatak',
    img: '/heroes/Kramatak_Avatar.webp',
  },
} as const;

export type HeroName = keyof typeof heroBaseData;
export const heroNameList = Object.keys(heroBaseData) as [WarMachineName, ...WarMachineName[]];

export const artifactTypeBaseData = {
  damage: { name: 'damage' },
  health: { name: 'health' },
  armor: { name: 'armor' },
} as const;

export type ArtifactTypeName = keyof typeof artifactTypeBaseData;
export const artifactTypeList = Object.keys(artifactTypeBaseData) as [ArtifactTypeName, ...ArtifactTypeName[]];
