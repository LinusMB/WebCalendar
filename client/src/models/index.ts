import { partial, pick, modify, find } from "ramda";

import {
    addMinutes,
    subMinutes,
    differenceInMinutes,
    areIntervalsOverlapping,
} from "../utils/dates";
import { CalEvent, CalInterval } from "../types";

function incStart(evtIntvl: CalInterval, minutes: number) {
    return modify("start", (start) => addMinutes(start, minutes), evtIntvl);
}

function decStart(evtIntvl: CalInterval, minutes: number) {
    return modify("start", (start) => subMinutes(start, minutes), evtIntvl);
}

function incEnd(evtIntvl: CalInterval, minutes: number) {
    return modify("end", (end) => addMinutes(end, minutes), evtIntvl);
}

function decEnd(evtIntvl: CalInterval, minutes: number) {
    return modify("end", (end) => subMinutes(end, minutes), evtIntvl);
}

type updateFn = (evtIntvl: CalInterval, minutes: number) => CalInterval;
type adjustFn = (evtIntvl: CalInterval) => CalInterval | undefined;

function updateWithAdjust(updateFn: updateFn, adjustFns: adjustFn[]) {
    return function (...args: Parameters<updateFn>): [CalInterval, boolean] {
        const initial = updateFn(...args);
        for (const adjust of adjustFns) {
            const next = adjust(initial);
            if (next) return [next, true];
        }
        return [initial, false];
    };
}

export const incStartWithAdjust = partial(updateWithAdjust, [incStart]);
export const decStartWithAdjust = partial(updateWithAdjust, [decStart]);
export const incEndWithAdjust = partial(updateWithAdjust, [incEnd]);
export const decEndWithAdjust = partial(updateWithAdjust, [decEnd]);

export const incStartAdjustFns = {
    adjustIntvlGap(gapInMinutes: number) {
        return function ({ start, end }: CalInterval): CalInterval | undefined {
            const diff = differenceInMinutes(end, start);
            if (diff < gapInMinutes) {
                return {
                    start: subMinutes(end, gapInMinutes),
                    end: end,
                };
            }
        };
    },
    adjustToIntvl(intvl: CalInterval) {
        return function ({ start, end }: CalInterval): CalInterval | undefined {
            if (start >= intvl.end) {
                return {
                    start: intvl.end,
                    end: end,
                };
            }
        };
    },
};

export const decStartAdjustFns = {
    adjustToIntvl(intvl: CalInterval) {
        return function ({ start, end }: CalInterval): CalInterval | undefined {
            if (start <= intvl.start) {
                return {
                    start: intvl.start,
                    end: end,
                };
            }
        };
    },
    adjustNoEvtOverlap(evts: CalEvent[]) {
        return function ({ start, end }: CalInterval): CalInterval | undefined {
            const evt = find(
                (evt) =>
                    areIntervalsOverlapping(pick(["start", "end"], evt), {
                        start,
                        end,
                    }),
                evts
            );
            if (evt) {
                return {
                    start: evt.end,
                    end: end,
                };
            }
        };
    },
};

export const incEndAdjustFns = {
    adjustToIntvl(intvl: CalInterval) {
        return function ({ start, end }: CalInterval): CalInterval | undefined {
            if (end >= intvl.end) {
                return {
                    start: start,
                    end: intvl.end,
                };
            }
        };
    },
    adjustNoEvtOverlap(evts: CalEvent[]) {
        return function ({ start, end }: CalInterval): CalInterval | undefined {
            const evt = find(
                (evt) =>
                    areIntervalsOverlapping(pick(["start", "end"], evt), {
                        start,
                        end,
                    }),
                evts
            );
            if (evt) {
                return {
                    start: start,
                    end: evt.start,
                };
            }
        };
    },
};

export const decEndAdjustFns = {
    adjustIntvlGap(gapInMinutes: number) {
        return function ({ start, end }: CalInterval): CalInterval | undefined {
            const diff = differenceInMinutes(end, start);
            if (diff < gapInMinutes) {
                return {
                    start: start,
                    end: addMinutes(start, gapInMinutes),
                };
            }
        };
    },
    adjustToIntvl(intvl: CalInterval) {
        return function ({ start, end }: CalInterval): CalInterval | undefined {
            if (end <= intvl.start) {
                return {
                    start: start,
                    end: intvl.start,
                };
            }
        };
    },
};
