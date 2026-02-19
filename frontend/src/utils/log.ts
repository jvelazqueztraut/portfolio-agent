/* eslint-disable @typescript-eslint/no-explicit-any */

export const debugLog = (...args: any[]) => {
  if (process.env.NEXT_PUBLIC_IS_DEV === 'true') {
    console.log(
      '%c  DEBUG  ',
      'color:#E9CB74; background-color: #0E1636;',
      ...args
    );
  }
};

export const analyticsLog = (system: string, ...args: any[]) => {
  if (process.env.NEXT_PUBLIC_IS_DEV === 'true') {
    console.log(
      `%c  ANALYTICS ${system}  `,
      'color:#E9CB74; background-color:rgb(24, 106, 19);',
      ...args
    );
  }
};

export const errorLog = (...args: any[]) => {
  console.error(
    '%c  ERROR  ',
    'color:#E9CB74; background-color: #FF0000;',
    ...args
  );
};
