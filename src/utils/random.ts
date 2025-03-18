export const randomInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export const randomItem = <T>(items: T[]): T | undefined => {
  if (items.length === 0) {
    return undefined;
  }

  return items[Math.floor(Math.random() * items.length)];
}
