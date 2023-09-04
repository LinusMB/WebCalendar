import { sort, find, pick, filter, allPass } from "ramda";

import {
    compareAsc,
    compareDesc,
    areIntervalsOverlapping,
    getDayIntvl,
} from "./dates";
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

export function filterEvents(
    evts: CalEvent[],
    ...filterFns: ((e: CalEvent) => boolean)[]
) {
    return filter(allPass(filterFns), evts);
}

export function viewDateFilter(viewDate: Date) {
    const intvl = getDayIntvl(viewDate);
    return (e: CalEvent) =>
        areIntervalsOverlapping(pick(["start", "end"], e), intvl);
}
