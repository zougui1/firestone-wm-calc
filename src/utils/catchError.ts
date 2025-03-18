export const catchError = <T>(func: () => T): [undefined, T] | [Error, undefined] => {
  try {
    return [undefined, func()];
  } catch (error) {
    return [error as Error, undefined];
  }
}
