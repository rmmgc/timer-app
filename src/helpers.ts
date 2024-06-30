function calculateTimeSegments(secondsLeft: number) {
  const hours = Math.floor(secondsLeft / 3600);
  const minutes = Math.floor((secondsLeft % 3600) / 60);
  const seconds = secondsLeft % 60;

  return {
    hours, minutes, seconds,
  };
}

function isValidInteger(input: string): boolean {
  return /^\d+$/.test(input);
}

const throttle = <R, A extends unknown[]>(
  callback: (...args: A) => R,
  delay: number
): (...args: A) => R | undefined => {
  let timeout: null | number = null;

  return (...args: A) => {
    if (timeout === null) {
      const result = callback(...args);

      timeout = setTimeout(() => {
        timeout = null;
      }, delay);

      return result;
    }
  };
};

export { calculateTimeSegments, isValidInteger, throttle };
