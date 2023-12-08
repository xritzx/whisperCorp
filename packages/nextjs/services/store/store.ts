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
  setAccountAddress: (address: string) => void;
};

export const useGlobalState = create<TGlobalState>(set => ({
  accountAddress: "",
  setAccountAddress: (address: string): void => set(() => ({ accountAddress: address })),
}));
