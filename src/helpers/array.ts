import { isString } from './string';

export const isStringArray = (arr: any[]): boolean => {
  return arr.every((item) => isString(item));
};

export const onlyStringArray = (arr: any[]): string[] => {
  return arr.filter((item) => Boolean(item) && isString(item));
};

export const areAllValuesUnique = (arr: any[]): boolean => {
  return arr.length === new Set(arr).size;
};

export const uniquedArray = <T>(arr: T[]): T[] => {
  return [...new Set(arr)];
};
