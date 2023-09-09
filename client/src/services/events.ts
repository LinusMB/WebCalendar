import { sort, find, pick, filter, allPass } from "ramda";

import {
    compareAsc,
    compareDesc,
    areIntervalsOverlapping,
    getDayInterval,
} from "./dates";
import { CalEvent, CalInterval } from "../types";

export function sortEventsAsc(events: CalEvent[]): CalEvent[] {
    return sort((e1, e2) => compareAsc(e1.start, e2.start), events);
}

export function sortEventsDesc(events: CalEvent[]): CalEvent[] {
    return sort((e1, e2) => compareDesc(e1.start, e2.start), events);
}

export function findLatestEventOverlap(
    events: CalEvent[],
    interval: CalInterval
): CalEvent | undefined {
    const eventsDesc = sortEventsDesc(events);
    return find(
        (event) => areIntervalsOverlapping(pick(["start", "end"], event), interval),
        eventsDesc
    );
}

export function findEarliestEventOverlap(
    events: CalEvent[],
    interval: CalInterval
): CalEvent | undefined {
    const eventsAsc = sortEventsAsc(events);
    return find(
        (event) => areIntervalsOverlapping(pick(["start", "end"], event), interval),
        eventsAsc
    );
}

export function findClosestNextEvent(
    events: CalEvent[],
    interval: CalInterval
): CalEvent | undefined {
    const eventsAsc = sortEventsAsc(events);
    return find((event) => event.start >= interval.end, eventsAsc);
}

export function findClosestPreviousEvent(
    events: CalEvent[],
    interval: CalInterval
): CalEvent | undefined {
    const eventsDesc = sortEventsDesc(events);
    return find((event) => event.end <= interval.start, eventsDesc);
}

export function filterEvents(
    events: CalEvent[],
    ...filterFns: ((e: CalEvent) => boolean)[]
) {
    return filter(allPass(filterFns), events);
}

export function viewDateFilter(viewDate: Date) {
    const interval = getDayInterval(viewDate);
    return (e: CalEvent) =>
        areIntervalsOverlapping(pick(["start", "end"], e), interval);
}
