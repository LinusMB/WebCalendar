import { create } from "zustand";
import { assoc, assocPath, modify, append, mergeRight } from "ramda";
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

type updateFn<
    T extends Store[
        | "viewDate"
        | "evtIntvl"
        | "evtIntvlActive"
        | "evtIntvlResize"
        | "evts"]
> = (arg: T) => T;

export interface Store {
    viewDate: Date;
    evtIntvl: CalInterval;
    evtIntvlActive: boolean;
    evtIntvlResize: { start: boolean; end: boolean };
    evts: CalEvent[];
    setViewDate: (date: Date) => void;
    updateViewDate: (update: updateFn<Date>) => void;
    setEvtIntvl: (intvl: CalInterval) => void;
    updateEvtIntvl: (update: updateFn<CalInterval>) => void;
    setEvtIntvlResizeStart: (resize: boolean) => void;
    setEvtIntvlResizeEnd: (resize: boolean) => void;
    addEvt: (
        title: CalEvent["title"],
        description: CalEvent["description"]
    ) => void;
    deleteEvt: (uuid: string) => void;
    setEvtIntvlActive: (active: boolean) => void;
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

export const useStore = create<Store>((set) => ({
    viewDate: now(),
    evtIntvl: todayWholeDayIntvl(),
    evtIntvlActive: false,
    evtIntvlResize: { start: false, end: false },
    evts: evtsSample,
    setViewDate: (date) => set(() => ({ viewDate: date })),
    updateViewDate: (update) =>
        set((state) => ({ viewDate: update(state.viewDate) })),
    setEvtIntvl: (intvl) => set(() => ({ evtIntvl: intvl })),
    updateEvtIntvl: (update) =>
        set((state) => ({ evtIntvl: update(state.evtIntvl) })),
    setEvtIntvlResizeStart: (resize) =>
        set((state) => assocPath(["evtIntvlResize", "start"], resize, state)),
    setEvtIntvlResizeEnd: (resize) =>
        set((state) => assocPath(["evtIntvlResize", "end"], resize, state)),
    addEvt: (title, description) =>
        set((state) =>
            modify(
                "evts",
                append(
                    mergeRight(
                        { title, description, uuid: uuid.v4() },
                        state.evtIntvl
                    )
                ),
                state
            )
        ),
    deleteEvt: (uuid: string) =>
        set((state) => ({ evts: state.evts.filter((e) => e.uuid !== uuid) })),
    setEvtIntvlActive: (active) => set(() => ({ evtIntvlActive: active })),
    updateStore: (update) => set((state) => update(state)),
}));

export const useIsResizeStartActive = () =>
    useStore((state) => [
        state.evtIntvlResize.start,
        state.setEvtIntvlResizeStart,
    ]) as [boolean, (resize: boolean) => void];

export const useIsResizeEndActive = () =>
    useStore((state) => [
        state.evtIntvlResize.end,
        state.setEvtIntvlResizeEnd,
    ]) as [boolean, (resize: boolean) => void];

export function useEvtsForDay(date: Date) {
    const { evts } = useStore();
    const evtsForDay = useDeepCompareMemo(() => {
        return evts.filter(
            (e) => e.end >= startOfDay(date) && e.start <= endOfDay(date)
        );
    }, [evts, date]);
    return evtsForDay;
}

export function useEvtIntvlUpdateStart(restrictGap: number, evts: CalEvent[]) {
    const { adjustIntvlGap, adjustNoEvtOverlap } = updateStartAdjustFns;
    const { updateStore } = useStore();

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
    const { updateStore } = useStore();

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
    const { updateStore } = useStore();

    const incStart = incStartWithAdjust([
        adjustIntvlGap(restrictGap),
        adjustToIntvl(restrictIntvl),
    ]);

    // TODO: wrap in useCallback
    return function (minutes: number) {
        function updateStoreFn({
            evtIntvl,
            evtIntvlResize,
        }: Pick<Store, "evtIntvl" | "evtIntvlResize">) {
            const [newEvtIntvl, isAdjusted] = incStart(evtIntvl, minutes);
            if (isAdjusted) {
                return {
                    evtIntvl: newEvtIntvl,
                    evtIntvlResize: assoc("start", false, evtIntvlResize),
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
    const { updateStore } = useStore();

    const decStart = decStartWithAdjust([
        adjustToIntvl(restrictIntvl),
        adjustNoEvtOverlap(evts),
    ]);

    return function (minutes: number) {
        function updateStoreFn({
            evtIntvl,
            evtIntvlResize,
        }: Pick<Store, "evtIntvl" | "evtIntvlResize">) {
            const [newEvtIntvl, isAdjusted] = decStart(evtIntvl, minutes);
            if (isAdjusted) {
                return {
                    evtIntvl: newEvtIntvl,
                    evtIntvlResize: assoc("start", false, evtIntvlResize),
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
    const { updateStore } = useStore();

    const incEnd = incEndWithAdjust([
        adjustToIntvl(restrictIntvl),
        adjustNoEvtOverlap(evts),
    ]);

    return function (minutes: number) {
        function updateStoreFn({
            evtIntvl,
            evtIntvlResize,
        }: Pick<Store, "evtIntvl" | "evtIntvlResize">) {
            const [newEvtIntvl, isAdjusted] = incEnd(evtIntvl, minutes);
            if (isAdjusted) {
                return {
                    evtIntvl: newEvtIntvl,
                    evtIntvlResize: assoc("end", false, evtIntvlResize),
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
    const { updateStore } = useStore();

    const decEnd = decEndWithAdjust([
        adjustIntvlGap(restrictGap),
        adjustToIntvl(restrictIntvl),
    ]);

    return function (minutes: number) {
        function updateStoreFn({
            evtIntvl,
            evtIntvlResize,
        }: Pick<Store, "evtIntvl" | "evtIntvlResize">) {
            const [newEvtIntvl, isAdjusted] = decEnd(evtIntvl, minutes);
            if (isAdjusted) {
                return {
                    evtIntvl: newEvtIntvl,
                    evtIntvlResize: assoc("end", false, evtIntvlResize),
                };
            }
            return { evtIntvl: newEvtIntvl };
        }
        updateStore(updateStoreFn);
    };
}
