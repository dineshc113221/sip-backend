
const checkMin = (value: number, rule): boolean => {
  if (rule.min === null) return true;
  return rule.exclusiveMin ? value > rule.min : value >= rule.min;
};

const checkMax = (value: number, rule): boolean => {
  if (rule.max === null) return true;
  return rule.exclusiveMax ? value < rule.max : value <= rule.max;
};

export const matchRange = (value: number, rules) => {
  for (const rule of rules) {
    if (checkMin(value, rule) && checkMax(value, rule)) {
      return { description: rule?.["label"] };
    }
  }
  return null;
};
