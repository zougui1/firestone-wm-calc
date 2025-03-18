export const checkAbort = (signal: AbortSignal | undefined) => {
  if (signal?.aborted) {
    throw new Error(signal.reason ? `Aborted: ${signal.reason}` : 'Aborted');
  }
}
