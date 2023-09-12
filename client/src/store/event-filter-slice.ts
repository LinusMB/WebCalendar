import { StateCreator } from "zustand";

import { modify, mergeLeft, always, __ } from "ramda";
import { CalEvent } from "../types";

export interface EventFilterSlice {
    eventFilter: { [P in keyof CalEvent]: (arg: CalEvent[P]) => boolean };
    setEventFilter: (filter: Partial<EventFilterSlice["eventFilter"]>) => void;
    resetEventFilter: () => void;
}

const zeroEventFilter = {
    start: always(true),
    end: always(true),
    title: always(true),
    description: always(true),
    uuid: always(true),
};

export const createEventFilterSlice: StateCreator<EventFilterSlice> = (
    set
) => ({
    eventFilter: zeroEventFilter,
    setEventFilter(eventFilter) {
        set((state) => modify("eventFilter", mergeLeft(eventFilter), state));
    },
    resetEventFilter() {
        set({ eventFilter: zeroEventFilter });
    },
});
