import { create } from "zustand";
import {
    assoc,
    modify,
    append,
    mergeLeft,
    mergeRight,
    map,
    pick,
    filter,
    where,
    always,
} from "ramda";
import * as uuid from "uuid";

import { useDeepCompareMemo } from "../hooks";
import { todayWholeDayIntvl, startOfDay, endOfDay, now } from "../utils/dates";
import {
    updateStartWithAdjust,
    updateEndWithAdjust,
    updateStartAdjustFns,
    updateEndAdjustFns,
    incStartWithAdjust,
    decStartWithAdjust,
    incEndWithAdjust,
    decEndWithAdjust,
    incStartAdjustFns,
    decStartAdjustFns,
    incEndAdjustFns,
    decEndAdjustFns,
} from "../models";
import { CalEvent, CalInterval } from "../types";

export interface Store {
    viewDate: Date;
    evtIntvl: CalInterval;
    isEvtIntvlVisible: boolean;
    isEvtIntvlResizable: { start: boolean; end: boolean };
    evts: CalEvent[];
    evtFilter: { [P in keyof CalEvent]: (arg: CalEvent[P]) => boolean };
    setViewDate: (date: Date) => void;
    updateViewDate: (update: (arg: Date) => Date) => void;
    setEvtIntvl: (intvl: CalInterval) => void;
    updateEvtIntvl: (update: (arg: CalInterval) => CalInterval) => void;
    setIsEvtIntvlVisible: (active: boolean) => void;
    setIsEvtIntvlResizable: ({
        start,
        end,
    }: {
        start?: boolean;
        end?: boolean;
    }) => void;
    addEvt: (
        title: CalEvent["title"],
        description: CalEvent["description"],
        intvl: CalInterval
    ) => void;
    editEvt: (
        uuid: CalEvent["uuid"],
        title: CalEvent["title"],
        description: CalEvent["description"],
        intvl: CalInterval
    ) => void;
    deleteEvt: (uuid: string) => void;
    setEvtFilter: (filter: Partial<Store["evtFilter"]>) => void;
    resetEvtFilter: () => void;
    updateStore: (update: (arg: Store) => Partial<Store>) => void;
}

const evtsSample = [
    {
        start: new Date(2023, 1, 15, 10),
        end: new Date(2023, 1, 15, 19),
        title: "Neighbor",
        description: "Help my neighbor bake a cake",
        uuid: uuid.v4(),
    },
    {
        start: new Date(2023, 1, 14, 16),
        end: new Date(2023, 1, 14, 17),
        title: "Fishing",
        description: "Go Fly Fishing",
        uuid: uuid.v4(),
    },
    {
        start: new Date(2023, 1, 14, 22),
        end: new Date(2023, 1, 15, 2),
        title: "Singing",
        description: "Sing along contest",
        uuid: uuid.v4(),
    },
    {
        start: new Date(2023, 1, 1),
        end: new Date(2023, 1, 1),
        title: "Marathon",
        description: "Run marathon which will take all day",
        uuid: uuid.v4(),
    },
];

const evtFilterInitial = {
    start: always(true),
    end: always(true),
    title: always(true),
    description: always(true),
    uuid: always(true),
};

export const useStore = create<Store>((set) => ({
    viewDate: now(),
    evtIntvl: todayWholeDayIntvl(),
    isEvtIntvlVisible: false,
    isEvtIntvlResizable: { start: false, end: false },
    evts: evtsSample,
    evtFilter: evtFilterInitial,
    setViewDate: (date) => set(() => ({ viewDate: date })),
    updateViewDate: (update) =>
        set((state) => ({ viewDate: update(state.viewDate) })),
    setEvtIntvl: (intvl) => set(() => ({ evtIntvl: intvl })),
    updateEvtIntvl: (update) =>
        set((state) => ({ evtIntvl: update(state.evtIntvl) })),
    setIsEvtIntvlVisible: (active) =>
        set(() => ({ isEvtIntvlVisible: active })),
    setIsEvtIntvlResizable: (isEvtIntvlResizable) =>
        set((state) =>
            modify("isEvtIntvlResizable", mergeLeft(isEvtIntvlResizable), state)
        ),
    addEvt: (title, description, intvl) =>
        set((state) =>
            modify(
                "evts",
                append({ title, description, uuid: uuid.v4(), ...intvl }),
                state
            )
        ),
    editEvt: (uuid, title, description, intvl) =>
        set((state) =>
            modify(
                "evts",
                map((e) =>
                    e.uuid === uuid
                        ? mergeRight(e, { title, description, ...intvl })
                        : e
                ),
                state
            )
        ),
    deleteEvt: (uuid) =>
        set((state) => ({ evts: state.evts.filter((e) => e.uuid !== uuid) })),
    setEvtFilter: (evtFilter) =>
        set((state) => modify("evtFilter", mergeLeft(evtFilter), state)),
    resetEvtFilter: () =>
        set(() => ({
            evtFilter: evtFilterInitial,
        })),
    updateStore: (update) => set((state) => update(state)),
}));

export function useStorePick<T extends keyof Store>(...keys: T[]) {
    return useStore((state) => pick(keys, state));
}

export const useIsEvtIntvlStartResizable = () =>
    useStore((state) => [
        state.isEvtIntvlResizable.start,
        (isStartResizable) =>
            state.setIsEvtIntvlResizable({ start: isStartResizable }),
    ]) as [boolean, (resize: boolean) => void];

export const useIsEvtIntvlEndResizable = () =>
    useStore((state) => [
        state.isEvtIntvlResizable.end,
        (isEndResizable) =>
            state.setIsEvtIntvlResizable({ end: isEndResizable }),
    ]) as [boolean, (resize: boolean) => void];

export function useEvts() {
    const { evts, evtFilter } = useStorePick("evts", "evtFilter");
    return filter(where(evtFilter), evts);
}

export function useEvtsForDay(date: Date) {
    const evts = useEvts();
    const evtsForDay = useDeepCompareMemo(() => {
        return evts.filter(
            (e) => e.end >= startOfDay(date) && e.start <= endOfDay(date)
        );
    }, [evts, date]);
    return evtsForDay;
}

export function useEvtIntvlUpdateStart(restrictGap: number, evts: CalEvent[]) {
    const { adjustIntvlGap, adjustNoEvtOverlap } = updateStartAdjustFns;
    const { updateStore } = useStorePick("updateStore");

    const updateStart = updateStartWithAdjust([
        adjustIntvlGap(restrictGap),
        adjustNoEvtOverlap(evts),
    ]);

    return function (update: (start: Date) => Date) {
        function updateStoreFn({ evtIntvl }: { evtIntvl: CalInterval }) {
            const [newEvtIntvl] = updateStart(evtIntvl, update);
            return { evtIntvl: newEvtIntvl };
        }
        updateStore(updateStoreFn);
    };
}

export function useEvtIntvlUpdateEnd(restrictGap: number, evts: CalEvent[]) {
    const { adjustIntvlGap, adjustNoEvtOverlap } = updateEndAdjustFns;
    const { updateStore } = useStorePick("updateStore");

    const updateEnd = updateEndWithAdjust([
        adjustIntvlGap(restrictGap),
        adjustNoEvtOverlap(evts),
    ]);

    return function (update: (start: Date) => Date) {
        function updateStoreFn({ evtIntvl }: { evtIntvl: CalInterval }) {
            const [newEvtIntvl] = updateEnd(evtIntvl, update);
            return { evtIntvl: newEvtIntvl };
        }
        updateStore(updateStoreFn);
    };
}

export function useEvtIntvlIncStart(
    restrictGap: number,
    restrictIntvl: CalInterval
) {
    const { adjustIntvlGap, adjustToIntvl } = incStartAdjustFns;
    const { updateStore } = useStorePick("updateStore");

    const incStart = incStartWithAdjust([
        adjustIntvlGap(restrictGap),
        adjustToIntvl(restrictIntvl),
    ]);

    // TODO: wrap in useCallback
    return function (minutes: number) {
        function updateStoreFn({
            evtIntvl,
            isEvtIntvlResizable,
        }: Pick<Store, "evtIntvl" | "isEvtIntvlResizable">) {
            const [newEvtIntvl, isAdjusted] = incStart(evtIntvl, minutes);
            if (isAdjusted) {
                return {
                    evtIntvl: newEvtIntvl,
                    isEvtIntvlResizable: assoc(
                        "start",
                        false,
                        isEvtIntvlResizable
                    ),
                };
            }
            return { evtIntvl: newEvtIntvl };
        }
        updateStore(updateStoreFn);
    };
}

export function useEvtIntvlDecStart(
    restrictIntvl: CalInterval,
    evts: CalEvent[]
) {
    const { adjustToIntvl, adjustNoEvtOverlap } = decStartAdjustFns;
    const { updateStore } = useStorePick("updateStore");

    const decStart = decStartWithAdjust([
        adjustToIntvl(restrictIntvl),
        adjustNoEvtOverlap(evts),
    ]);

    return function (minutes: number) {
        function updateStoreFn({
            evtIntvl,
            isEvtIntvlResizable,
        }: Pick<Store, "evtIntvl" | "isEvtIntvlResizable">) {
            const [newEvtIntvl, isAdjusted] = decStart(evtIntvl, minutes);
            if (isAdjusted) {
                return {
                    evtIntvl: newEvtIntvl,
                    isEvtIntvlResizable: assoc(
                        "start",
                        false,
                        isEvtIntvlResizable
                    ),
                };
            }
            return { evtIntvl: newEvtIntvl };
        }
        updateStore(updateStoreFn);
    };
}

export function useEvtIntvlIncEnd(
    restrictIntvl: CalInterval,
    evts: CalEvent[]
) {
    const { adjustToIntvl, adjustNoEvtOverlap } = incEndAdjustFns;
    const { updateStore } = useStorePick("updateStore");

    const incEnd = incEndWithAdjust([
        adjustToIntvl(restrictIntvl),
        adjustNoEvtOverlap(evts),
    ]);

    return function (minutes: number) {
        function updateStoreFn({
            evtIntvl,
            isEvtIntvlResizable,
        }: Pick<Store, "evtIntvl" | "isEvtIntvlResizable">) {
            const [newEvtIntvl, isAdjusted] = incEnd(evtIntvl, minutes);
            if (isAdjusted) {
                return {
                    evtIntvl: newEvtIntvl,
                    isEvtIntvlResizable: assoc(
                        "end",
                        false,
                        isEvtIntvlResizable
                    ),
                };
            }
            return { evtIntvl: newEvtIntvl };
        }
        updateStore(updateStoreFn);
    };
}

export function useEvtIntvlDecEnd(
    restrictGap: number,
    restrictIntvl: CalInterval
) {
    const { adjustIntvlGap, adjustToIntvl } = decEndAdjustFns;
    const { updateStore } = useStorePick("updateStore");

    const decEnd = decEndWithAdjust([
        adjustIntvlGap(restrictGap),
        adjustToIntvl(restrictIntvl),
    ]);

    return function (minutes: number) {
        function updateStoreFn({
            evtIntvl,
            isEvtIntvlResizable,
        }: Pick<Store, "evtIntvl" | "isEvtIntvlResizable">) {
            const [newEvtIntvl, isAdjusted] = decEnd(evtIntvl, minutes);
            if (isAdjusted) {
                return {
                    evtIntvl: newEvtIntvl,
                    isEvtIntvlResizable: assoc(
                        "end",
                        false,
                        isEvtIntvlResizable
                    ),
                };
            }
            return { evtIntvl: newEvtIntvl };
        }
        updateStore(updateStoreFn);
    };
}
