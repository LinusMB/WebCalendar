import { sort, find, pick } from "ramda";

import {
    compareAsc,
    compareDesc,
    areIntervalsOverlapping,
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
