import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ColumnMeta } from '@/lib/format';

interface DataState {
  data: any[];
  columns: ColumnMeta[];
  fileName: string;
  rows: number;
  originalData: any[];

  // actions
  setData: (update: Partial<Omit<DataState, 'setData' | 'resetData' | 'undoChanges' | 'reset'>>) => void;
  resetData: () => void;  // kept for backward-compat
  undoChanges: () => void;
  reset: () => void;      // new alias to match callers expecting `reset()`
}

export const useDataStore = create<DataState>()(
  persist(
    (set, get) => {
      // DRY reset helper
      const doReset = () =>
        set({
          data: [],
          columns: [],
          fileName: '',
          rows: 0,
          originalData: [],
        });

      return {
        data: [],
        columns: [],
        fileName: '',
        rows: 0,
        originalData: [],

        setData: (update) => {
          const current = get();

          // When updating data, also refresh originalData snapshot (first load / full replace)
          // If `rows` not provided, derive it from incoming data length (if present)
          const next: Partial<DataState> = {
            ...update,
          };

          if (update.data) {
            next.originalData = [...update.data];
            if (typeof update.rows !== 'number') {
              next.rows = update.data.length;
            }
          }

          set(next as DataState);
        },

        resetData: doReset,

        // New alias for callers using `reset()`
        reset: doReset,

        undoChanges: () => {
          const { originalData } = get();
          set({
            data: [...originalData],
            rows: originalData.length,
          });
        },
      };
    },
    {
      name: 'bluvis-data-storage',
      // we intentionally do NOT persist originalData (session-only snapshot)
      partialize: (state) => ({
        data: state.data,
        columns: state.columns,
        fileName: state.fileName,
        rows: state.rows,
      }),
    }
  )
);
