import create from 'zustand';

/**
 * Zustand Store
 *
 * You can add global state to the app using this useGlobalState, to get & set
 * values from anywhere in the app.
 *
 * Think about it as a global useState.
 */

type TGlobalState = {
  accountAddress: string;
  category: string;
  companyName: string;
  setAccountAddress: (address: string) => void;
  setCategory: (category: string) => void;
  setCompanyName: (companyName: string) => void;
};

export const useGlobalState = create<TGlobalState>(set => ({
  accountAddress: "",
  category: "📺 Misc",
  companyName: "Unknown",
  setAccountAddress: (address: string): void => set(() => ({ accountAddress: address })),
  setCategory: (category: string): void => set(() => ({ category: category })),
  setCompanyName: (companyName: string): void => set(() => ({ companyName: companyName}))
}));
