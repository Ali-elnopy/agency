import { createContext, useContext } from 'react';

export const BrandsContext = createContext(null);

export function useBrands() {
  const context = useContext(BrandsContext);

  if (!context) {
    throw new Error('useBrands must be used inside a BrandsProvider.');
  }

  return context;
}
