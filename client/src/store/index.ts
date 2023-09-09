import { create } from "zustand";
import { modify, mergeLeft, pick, always, __ } from "ramda";

import { now } from "../services/dates";
import {
    constraints,
    checkConstraints,
    zeroInterval,
    incStart,
    decStart,
    incEnd,
    decEnd,
    updateStart,
    updateEnd,
} from "../services/intervals";
import { CalEvent, CalInterval } from "../types";

export interface Store {
    viewDate: Date;
    eventInterval: CalInterval;
    isEventIntervalVisible: boolean;
    isEventIntervalStartResizable: boolean;
    isEventIntervalEndResizable: boolean;
    setEventInterval: (interval: CalInterval) => void;
    updateEventInterval: (update: (arg: CalInterval) => CalInterval) => void;
    setIsEventIntervalVisible: (active: boolean) => void;
    setIsEventIntervalStartResizable: (resizable: boolean) => void;
    setIsEventIntervalEndResizable: (resizable: boolean) => void;
    eventFilter: { [P in keyof CalEvent]: (arg: CalEvent[P]) => boolean };
    setViewDate: (date: Date) => void;
    updateViewDate: (update: (arg: Date) => Date) => void;
    setEventFilter: (filter: Partial<Store["eventFilter"]>) => void;
    resetEventFilter: () => void;
    updateStore: (update: (arg: Store) => Partial<Store>) => void;
}

const eventFilterInitial = {
    start: always(true),
    end: always(true),
    title: always(true),
    description: always(true),
    uuid: always(true),
};

export const useStore = create<Store>((set) => ({
    viewDate: now(),
    eventInterval: zeroInterval,
    isEventIntervalVisible: false,
    isEventIntervalStartResizable: false,
    isEventIntervalEndResizable: false,
    setEventInterval: (interval) => set({ eventInterval: interval }),
    updateEventInterval: (update) =>
        set((state) => ({ eventInterval: update(state.eventInterval) })),
    setIsEventIntervalVisible: (active) =>
        set({ isEventIntervalVisible: active }),
    setIsEventIntervalStartResizable: (isResizable) =>
        set({ isEventIntervalStartResizable: isResizable }),
    setIsEventIntervalEndResizable: (isResizable) =>
        set({ isEventIntervalEndResizable: isResizable }),
    eventFilter: eventFilterInitial,
    setViewDate: (date) => set({ viewDate: date }),
    updateViewDate: (update) =>
        set((state) => ({ viewDate: update(state.viewDate) })),
    setEventFilter: (eventFilter) =>
        set((state) => modify("eventFilter", mergeLeft(eventFilter), state)),
    resetEventFilter: () => set({ eventFilter: eventFilterInitial }),
    updateStore: (update) => set((state) => update(state)),
}));

export function useStorePick<T extends keyof Store>(...keys: T[]) {
    return useStore((state) => pick(keys, state));
}

export const useIsEventIntervalStartResizable = () =>
    useStore<[boolean, (resizable: boolean) => void]>((state) => [
        state.isEventIntervalStartResizable,
        state.setIsEventIntervalStartResizable,
    ]);

export const useIsEventIntervalEndResizable = () =>
    useStore<[boolean, (resizable: boolean) => void]>((state) => [
        state.isEventIntervalEndResizable,
        state.setIsEventIntervalEndResizable,
    ]);

export function useEventIntervalIncStart(
    restrictInterval: CalInterval,
    minTimeSpan: number
) {
    const { updateStore } = useStorePick("updateStore");
    const check = checkConstraints(__, [
        constraints.ensureMinTimeSpan(minTimeSpan, false),
        constraints.withinInterval(restrictInterval),
    ]);

    return function (minutes: number) {
        updateStore((state) => {
            const [newEventInterval, checkFailed] = check(
                incStart(state.eventInterval, minutes)
            );
            if (checkFailed) {
                return {
                    eventInterval: newEventInterval,
                    isEventIntervalStartResizable: false,
                };
            }
            return { eventInterval: newEventInterval };
        });
    };
}

export function useEventIntervalDecStart(
    restrictInterval: CalInterval,
    events: CalEvent[]
) {
    const { updateStore } = useStorePick("updateStore");
    const check = checkConstraints(__, [
        constraints.withinInterval(restrictInterval),
        constraints.noEventOverlap(events, false),
    ]);

    return function (minutes: number) {
        updateStore((state) => {
            const [newEventInterval, checkFailed] = check(
                decStart(state.eventInterval, minutes)
            );
            if (checkFailed) {
                return {
                    eventInterval: newEventInterval,
                    isEventIntervalStartResizable: false,
                };
            }
            return { eventInterval: newEventInterval };
        });
    };
}

export function useEventIntervalIncEnd(
    restrictInterval: CalInterval,
    events: CalEvent[]
) {
    const { updateStore } = useStorePick("updateStore");
    const check = checkConstraints(__, [
        constraints.withinInterval(restrictInterval),
        constraints.noEventOverlap(events, true),
    ]);

    return function (minutes: number) {
        updateStore((state) => {
            const [newEventInterval, checkFailed] = check(
                incEnd(state.eventInterval, minutes)
            );
            if (checkFailed) {
                return {
                    eventInterval: newEventInterval,
                    isEventIntervalEndResizable: false,
                };
            }
            return { eventInterval: newEventInterval };
        });
    };
}

export function useEventIntervalDecEnd(
    restrictInterval: CalInterval,
    minTimeSpan: number
) {
    const { updateStore } = useStorePick("updateStore");
    const check = checkConstraints(__, [
        constraints.ensureMinTimeSpan(minTimeSpan, true),
        constraints.withinInterval(restrictInterval),
    ]);

    return function (minutes: number) {
        updateStore((state) => {
            const [newEventInterval, checkFailed] = check(
                decEnd(state.eventInterval, minutes)
            );
            if (checkFailed) {
                return {
                    eventInterval: newEventInterval,
                    isEventIntervalEndResizable: false,
                };
            }
            return { eventInterval: newEventInterval };
        });
    };
}

export function useEventIntervalUpdateStart(
    minTimeSpan: number,
    events: CalEvent[]
) {
    const { updateStore } = useStorePick("updateStore");
    const check = checkConstraints(__, [
        constraints.ensureMinTimeSpan(minTimeSpan, false),
        constraints.noEventOverlap(events, false),
    ]);

    return function (update: (newDate: Date) => Date) {
        updateStore((state) => {
            const [newEventInterval] = check(
                updateStart(state.eventInterval, update)
            );
            return { eventInterval: newEventInterval };
        });
    };
}

export function useEventIntervalUpdateEnd(
    minTimeSpan: number,
    events: CalEvent[]
) {
    const { updateStore } = useStorePick("updateStore");
    let check = checkConstraints(__, [
        constraints.ensureMinTimeSpan(minTimeSpan, true),
        constraints.noEventOverlap(events, true),
    ]);

    return function (update: (newDate: Date) => Date) {
        updateStore((state) => {
            const [newEventInterval] = check(
                updateEnd(state.eventInterval, update)
            );
            return { eventInterval: newEventInterval };
        });
    };
}
