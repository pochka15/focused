export const prepended = <T>(array: T[], item: T): T[] => {
  return [item, ...array.filter((x) => x !== item)];
};

export const withoutItem = <T>(array: T[], item: T): T[] => {
  return array.filter((x) => x !== item);
};
