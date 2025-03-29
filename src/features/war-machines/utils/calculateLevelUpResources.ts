const roundDownToStep = (num: number, step: number): number => {
  return Math.round(num / step) * step;
}

const costPerUpgrade = {
  screws: 20,
  cogs: 12,
  metal: 1,
  expeditionTokens: 500,
};

export const calculateResources = (currentLevel: number, targetLevel: number) => {
  if (targetLevel <= currentLevel) {
    return {
      screws: 0,
      cogs: 0,
      metal: 0,
      expeditionTokens: 0
    };
  }

  let totalXP = 0;
  // XP needed to reach level 2
  let requiredXP = 100;

  for (let level = 1; level < targetLevel; level++) {
    if (level >= currentLevel) {
      totalXP += requiredXP;
    }

    requiredXP += 10;
  }

  const calculateLevelUpCost = (upgradeCost: number): number => {
    return roundDownToStep((totalXP / 100) * upgradeCost, upgradeCost);
  }

  const screws = calculateLevelUpCost(costPerUpgrade.screws);
  const cogs = calculateLevelUpCost(costPerUpgrade.cogs);
  const metal = calculateLevelUpCost(costPerUpgrade.metal);
  const expeditionTokens = calculateLevelUpCost(costPerUpgrade.expeditionTokens);

  return {
    screws,
    cogs,
    metal,
    expeditionTokens,
  };
}
