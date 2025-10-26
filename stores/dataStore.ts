import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ColumnMeta } from '@/lib/format';

export interface Insight {
  type: 'info' | 'warning' | 'success';
  title: string;
  description: string;
}

export interface DataState {
  rows: number;
  columns: ColumnMeta[];
  data: any[];
  insights: Insight[];
  fileName?: string;
  setData: (partial: Partial<Omit<DataState, 'setData' | 'reset'>>) => void;
  reset: () => void;
}

const initialState = {
  rows: 0,
  columns: [],
  data: [],
  insights: [],
  fileName: undefined,
};

export const useDataStore = create<DataState>()(
  persist(
    (set) => ({
      ...initialState,
      setData: (partial) =>
        set((state) => ({
          ...state,
          ...partial,
        })),
      reset: () => set(initialState),
    }),
    {
      name: 'smart-dashboard-store',
      partialize: (state) => ({
        rows: state.rows,
        columns: state.columns,
        data: state.data,
        insights: state.insights,
        fileName: state.fileName,
      }),
    }
  )
);