import { StateCreator } from "zustand";

import { now } from "../services/dates";

export interface ViewDateSlice {
    viewDate: Date;
    setViewDate: (date: Date) => void;
    updateViewDate: (update: (arg: Date) => Date) => void;
}

export const createViewDateSlice: StateCreator<ViewDateSlice> = (set) => ({
    viewDate: now(),
    setViewDate(date) {
        set({ viewDate: date });
    },
    updateViewDate(update) {
        set((state) => ({ viewDate: update(state.viewDate) }));
    },
});
