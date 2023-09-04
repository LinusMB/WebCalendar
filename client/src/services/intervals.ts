import { partial, pick, modify, find, assoc } from "ramda";

import {
    addMinutes,
    subMinutes,
    differenceInMinutes,
    areIntervalsOverlapping,
} from "./dates";
import { findLatestEventOverlap, findEarliestEventOverlap } from "./events";
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

function updateStart(evtIntvl: CalInterval, update: (start: Date) => Date) {
    return modify("start", update, evtIntvl);
}

function updateEnd(evtIntvl: CalInterval, update: (end: Date) => Date) {
    return modify("end", update, evtIntvl);
}

function updateWithAdjust<T extends Array<any>>(
    updateFn: (...args: T) => CalInterval,
    adjustFns: ((arg: CalInterval) => CalInterval | undefined)[]
) {
    return function (...args: T): [CalInterval, boolean] {
        const initial = updateFn(...args);
        for (const adjust of adjustFns) {
            const next = adjust(initial);
            if (next) return [next, true];
        }
        return [initial, false];
    };
}

export const updateStartWithAdjust = partial(
    updateWithAdjust<Parameters<typeof updateStart>>,
    [updateStart]
);

export const updateEndWithAdjust = partial(
    updateWithAdjust<Parameters<typeof updateEnd>>,
    [updateEnd]
);

export const incStartWithAdjust = partial(
    updateWithAdjust<Parameters<typeof incStart>>,
    [incStart]
);
export const decStartWithAdjust = partial(
    updateWithAdjust<Parameters<typeof decStart>>,
    [decStart]
);
export const incEndWithAdjust = partial(
    updateWithAdjust<Parameters<typeof incEnd>>,
    [incEnd]
);
export const decEndWithAdjust = partial(
    updateWithAdjust<Parameters<typeof decEnd>>,
    [decEnd]
);

export const updateStartAdjustFns = {
    adjustIntvlGap(gapInMinutes: number) {
        return function (evtIntvl: CalInterval): CalInterval | undefined {
            const diff = differenceInMinutes(evtIntvl.end, evtIntvl.start);
            if (diff < gapInMinutes) {
                return assoc(
                    "start",
                    subMinutes(evtIntvl.end, gapInMinutes),
                    evtIntvl
                );
            }
        };
    },
    adjustNoEvtOverlap(evts: CalEvent[]) {
        return function (evtIntvl: CalInterval): CalInterval | undefined {
            const evt = findLatestEventOverlap(evts, evtIntvl);
            if (evt) {
                return assoc("start", evt.end, evtIntvl);
            }
        };
    },
};

export const updateEndAdjustFns = {
    adjustIntvlGap(gapInMinutes: number) {
        return function (evtIntvl: CalInterval): CalInterval | undefined {
            const diff = differenceInMinutes(evtIntvl.end, evtIntvl.start);
            if (diff < gapInMinutes) {
                return assoc(
                    "end",
                    addMinutes(evtIntvl.start, gapInMinutes),
                    evtIntvl
                );
            }
        };
    },
    adjustNoEvtOverlap(evts: CalEvent[]) {
        return function (evtIntvl: CalInterval): CalInterval | undefined {
            const evt = findEarliestEventOverlap(evts, evtIntvl);
            if (evt) {
                return assoc("end", evt.start, evtIntvl);
            }
        };
    },
};

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
