export const calculateBlueprintCost = (currentLevel: number, targetLevel: number): number => {
  if (targetLevel <= currentLevel) {
    return 0;
  }

  let totalBlueprints = 0;

  for (let level = currentLevel; level < targetLevel; level++) {
    totalBlueprints += 100 + (level * 5);
  }

  return totalBlueprints;
}
