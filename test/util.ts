export function sleep(timeInMs: number = 0) {
  return new Promise(resolve =>
    setTimeout(resolve, timeInMs)
  );
}

export const blockExecution = () => sleep(50);
