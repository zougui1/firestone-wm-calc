export const average = (numbers: number[]): number => {
  if (!numbers.length) {
    return 0;
  }

  const sum = numbers.reduce((acc, val) => acc + val, 0);
  return sum / numbers.length;
}
