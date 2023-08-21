import { always, sort, find, pick, filter, where, whereAny } from "ramda";

import {
    compareAsc,
    compareDesc,
    areIntervalsOverlapping,
    getDayIntvl,
} from "../utils/dates";
import { CalEvent, CalInterval } from "../types";

export function sortEventsAsc(evts: CalEvent[]): CalEvent[] {
    return sort((e1, e2) => compareAsc(e1.start, e2.start), evts);
}

export function sortEventsDesc(evts: CalEvent[]): CalEvent[] {
    return sort((e1, e2) => compareDesc(e1.start, e2.start), evts);
}

export function findLatestEventOverlap(
    evts: CalEvent[],
    intvl: CalInterval
): CalEvent | undefined {
    const evtsDesc = sortEventsDesc(evts);
    return find(
        (evt) => areIntervalsOverlapping(pick(["start", "end"], evt), intvl),
        evtsDesc
    );
}

export function findEarliestEventOverlap(
    evts: CalEvent[],
    intvl: CalInterval
): CalEvent | undefined {
    const evtsAsc = sortEventsAsc(evts);
    return find(
        (evt) => areIntervalsOverlapping(pick(["start", "end"], evt), intvl),
        evtsAsc
    );
}
export function orFilterEvents(
    evts: CalEvent[],
    evtFilter: { [P in keyof CalEvent]: (arg: CalEvent[P]) => boolean }
): CalEvent[] {
    return filter<CalEvent, CalEvent[]>(whereAny(evtFilter), evts);
}

export function andFilterEvents(
    evts: CalEvent[],
    evtFilter: { [P in keyof CalEvent]: (arg: CalEvent[P]) => boolean }
): CalEvent[] {
    return filter<CalEvent, CalEvent[]>(where(evtFilter), evts);
}

export function viewDateFilter(viewDate: Date): {
    [P in keyof CalEvent]: (arg: CalEvent[P]) => boolean;
} {
    const intvl = getDayIntvl(viewDate);
    return {
        start: (start) => start >= intvl.start && start <= intvl.end,
        end: (end) => end >= intvl.start && end <= intvl.end,
        title: always(false),
        description: always(false),
        uuid: always(false),
    };
}
