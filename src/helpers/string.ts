export const startsWithAlphabet = (str: string): boolean => {
  return /^[a-zA-Z]/.test(str);
};

export const startsWithCapitalAlphabet = (str: string): boolean => {
  return /^[A-Z]/.test(str);
};

export const startsWithLowerCaseAlphabet = (str: string): boolean => {
  return /^[a-z]/.test(str);
};

export const isString = (value: any): boolean => {
  return typeof value === 'string';
};

export const containsInvalidCharForComponent = (str: string): boolean => {
  return !/^[a-zA-Z0-9_]*$/.test(str);
};
