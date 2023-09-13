import { pick, modify, assoc, curry } from "ramda";

import {
    addMinutes,
    subMinutes,
    differenceInMinutes,
    areIntervalsOverlapping,
    isWithinInterval,
    zeroDate,
    clamp,
} from "./dates";
import { findLatestEventOverlap, findEarliestEventOverlap } from "./events";
import { CalEvent, CalInterval } from "../types";

export function incStart(eventInterval: CalInterval, minutes: number) {
    return modify(
        "start",
        (start) => addMinutes(start, minutes),
        eventInterval
    );
}

export function decStart(eventInterval: CalInterval, minutes: number) {
    return modify(
        "start",
        (start) => subMinutes(start, minutes),
        eventInterval
    );
}

export function incEnd(eventInterval: CalInterval, minutes: number) {
    return modify("end", (end) => addMinutes(end, minutes), eventInterval);
}

export function decEnd(eventInterval: CalInterval, minutes: number) {
    return modify("end", (end) => subMinutes(end, minutes), eventInterval);
}

export function updateStart(
    eventInterval: CalInterval,
    update: (start: Date) => Date
) {
    return modify("start", update, eventInterval);
}

export function updateEnd(
    eventInterval: CalInterval,
    update: (end: Date) => Date
) {
    return modify("end", update, eventInterval);
}

export interface Constraint {
    check: (newInterval: CalInterval) => boolean;
    correct: (newInterval: CalInterval) => CalInterval;
}

export const constraints = {
    withinInterval: (
        restrictInterval: CalInterval,
        keepStart: boolean
    ): Constraint => ({
        check: (newInterval) =>
            keepStart
                ? isWithinInterval(newInterval.end, restrictInterval)
                : isWithinInterval(newInterval.start, restrictInterval),
        correct: (newInterval) =>
            keepStart
                ? assoc(
                      "end",
                      clamp(newInterval.end, restrictInterval),
                      newInterval
                  )
                : assoc(
                      "start",
                      clamp(newInterval.start, restrictInterval),
                      newInterval
                  ),
    }),
    ensureMinTimeSpan: (minutes: number, keepStart: boolean): Constraint => ({
        check: (newInterval) =>
            differenceInMinutes(newInterval.end, newInterval.start) > minutes,
        correct: (newInterval) =>
            keepStart
                ? assoc(
                      "end",
                      addMinutes(newInterval.start, minutes),
                      newInterval
                  )
                : assoc(
                      "start",
                      subMinutes(newInterval.end, minutes),
                      newInterval
                  ),
    }),
    noEventOverlap: (events: CalEvent[], keepStart: boolean): Constraint => ({
        check: (newInterval) =>
            events.every(
                (e) =>
                    !areIntervalsOverlapping(
                        pick(["start", "end"], e),
                        newInterval
                    )
            ),
        correct: (newInterval) => {
            const findOverlap = keepStart
                ? findEarliestEventOverlap
                : findLatestEventOverlap;
            const event = findOverlap(events, newInterval);
            if (event == null) {
                throw new Error(
                    `${constraints.noEventOverlap.name} Unexpect result: No overlapping event found.`
                );
            }
            return keepStart
                ? assoc("end", event.start, newInterval)
                : assoc("start", event.end, newInterval);
        },
    }),
};

function _checkConstraints(
    newInterval: CalInterval,
    constraints: Constraint[]
): [CalInterval, boolean] {
    for (const constraint of constraints) {
        if (!constraint.check(newInterval)) {
            newInterval = constraint.correct(newInterval);
            return [newInterval, true];
        }
    }
    return [newInterval, false];
}

export const checkConstraints = curry(_checkConstraints);

export const zeroInterval = { start: zeroDate, end: zeroDate };
