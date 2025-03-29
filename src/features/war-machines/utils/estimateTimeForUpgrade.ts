export type JewelChest = (
  | 'wooden'
  | 'iron'
  | 'golden'
  | 'diamond'
  | 'opal'
  | 'emerald'
  | 'platinum'
);

const chestComponentsMap: Record<JewelChest, number> = {
  wooden: 11,
  iron: 22,
  golden: 33,
  diamond: 44,
  opal: 55,
  emerald: 132,
  platinum: 264,
};

const liberationMissions: Record<number, Partial<Record<JewelChest, number>>> = {
  5: {
    wooden: 1,
    iron: 1,
  },
  10: {
    wooden: 2,
    iron: 1,
  },
  20: {
    wooden: 2,
    iron: 2,
  },
  40: {
    iron: 2,
    golden: 1,
  },
  60: {
    iron: 2,
    golden: 1,
  },
  80: {
    iron: 2,
    golden: 1,
  },
  110: {
    golden: 1,
    diamond: 1,
  },
  155: {
    golden: 1,
    opal: 1,
  },
  190: {
    golden: 1,
    emerald: 1,
  },
  319: {
    opal: 1,
    platinum: 1,
  },
};

const calculateCampaignLevel = (stars: number) => {
  return Math.floor(stars / 5) + 1;
}

const calculateCampaignEmblemLoots = (stars: number) => {
  if (stars < 1) {
    return 0;
  }

  const campaignLevel = calculateCampaignLevel(stars);
  const startEmblems = 400;
  const emblemsPerLevel = 8;

  return startEmblems + emblemsPerLevel * (campaignLevel - 1);
}

const getLiberationMissionChests = (stars: number) => {
  const chests: Partial<Record<JewelChest, number>> = {};

  for (const [requiredStars, chestRewards] of Object.entries(liberationMissions)) {
    if (Number(requiredStars) > stars) {
      continue;
    }

    for (const [name, number] of Object.entries(chestRewards) as [JewelChest, number][]) {
      chests[name] ??= 0;
      chests[name] += number;
    }
  }

  return chests;
}

const getWeeklyQuestChests = (stars: number) => {
  const chests: Partial<Record<JewelChest, number>> = {};

  const getLiberatorRewards = () => {
    if (stars < 1) {
      return {};

    }
    if (stars <= 99) {
      return { golden: 1 };
    }

    if (stars <= 144) {
      return { diamond: 1 };
    }

    if (stars <= 189) {
      return { opal: 1 };
    }

    if (stars <= 318) {
      return { emerald: 1 };
    }

    return { platinum: 1 };
  }

  const getMinerRewards = () => {
    if (stars < 1) {
      return {};

    }
    if (stars <= 99) {
      return { iron: 2 };
    }

    if (stars <= 144) {
      return { golden: 2 };
    }

    if (stars <= 189) {
      return { diamond: 2 };
    }

    if (stars <= 318) {
      return { opal: 2 };
    }

    return { emerald: 2 };
  }

  const missionRewards = [
    getLiberatorRewards(),
    getMinerRewards(),
  ];

  for (const rewards of missionRewards) {
    for (const [name, number] of Object.entries(rewards) as [JewelChest, number][]) {
      chests[name] ??= 0;
      chests[name] += number;
    }
  }

  return chests;
}

const getMerchantChests = () => {
  return{ golden: 5 };
  //return stars < 100 ? { golden: 5 } : { diamond: 3 };
}

export const estimateTimeForUpgrade = (data: EstimateTimeForChestsData) => {
  const { stars, emblems, requiredResources, ownedResources } = data;

  const today = new Date();
  const todayDate = today.getDate();
  const simulatedCurrentDay = today;

  const merchantTradeEmblemCost = 5000;
  let simulatedOwnedEmblems = emblems;
  let day = 0;

  const totalComponentsRequired = (
    requiredResources.screws +
    requiredResources.cogs +
    requiredResources.metal
  );
  const totalComponentsOwned = (
    ownedResources.screws +
    ownedResources.cogs +
    ownedResources.metal
  );
  // multiply by 0.8: 80% of the components go into favorited war machines
  // divide by 5: components are spread more or less evenly across all 5 favorite war machines
  const woodenChestsNeeded = Math.ceil((totalComponentsRequired - totalComponentsOwned) / (chestComponentsMap.wooden * 0.8 / 5));
  const totalComponentsNeeded = woodenChestsNeeded * chestComponentsMap.wooden;

  const chests: Partial<Record<JewelChest, number>> = {};

  const getChestComponents = () => {
    let totalComponents = 0;

    for (const [name, number] of Object.entries(chests) as [JewelChest, number][]) {
      totalComponents += number * chestComponentsMap[name];
    }

    return totalComponents;
  }

  while (getChestComponents() < totalComponentsNeeded) {
    day++;
    simulatedCurrentDay.setDate(todayDate + day);

    // can claim emblems 4 times a day
    simulatedOwnedEmblems += calculateCampaignEmblemLoots(stars) * 4;

    const rewards = [
      getLiberationMissionChests(stars),
    ];

    // sunday
    if (simulatedCurrentDay.getDay() === 0) {
      rewards.push(getWeeklyQuestChests(stars));
    }

    for (; simulatedOwnedEmblems >= merchantTradeEmblemCost; simulatedOwnedEmblems -= merchantTradeEmblemCost) {
      rewards.push(getMerchantChests());
    }

    for (const reward of rewards) {
      for (const [name, number] of Object.entries(reward) as [JewelChest, number][]) {
        chests[name] ??= 0;
        chests[name] += number;
      }
    }
  }

  if (
    day <= 0 &&
    requiredResources.screws > 0 &&
    requiredResources.cogs > 0 &&
    requiredResources.metal > 0 && (
      ownedResources.screws >= requiredResources.screws ||
      ownedResources.cogs >= requiredResources.cogs ||
      ownedResources.metal >= requiredResources.metal
    )
  ) {
    return 1;
  }

  return day;
}

export interface EstimateTimeForChestsData {
  stars: number;
  emblems: number;
  requiredResources: { screws: number; cogs: number; metal: number; expeditionTokens: number; };
  ownedResources: { screws: number; cogs: number; metal: number; expeditionTokens: number; };
}
