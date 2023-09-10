import * as df from "date-fns";
import { zip, range } from "ramda";
import { CalInterval, Moment } from "../types";

export * from "date-fns";

export function getMonth(date: Date) {
    return df.getMonth(date) + 1;
}

export function incHour(date: Date) {
    return df.addHours(date, 1);
}

export function decHour(date: Date) {
    return df.subHours(date, 1);
}

export function incDay(date: Date) {
    return df.addDays(date, 1);
}

export function decDay(date: Date) {
    return df.subDays(date, 1);
}

export function incWeek(date: Date) {
    return df.addWeeks(date, 1);
}

export function decWeek(date: Date) {
    return df.subWeeks(date, 1);
}

export function incMonth(date: Date) {
    return df.addMonths(date, 1);
}

export function decMonth(date: Date) {
    return df.subMonths(date, 1);
}

export function today() {
    const d = new Date();
    return df.startOfDay(d);
}

export function now() {
    return new Date();
}

export function formatDate(date: Date, fmt: string = "yyyy-MM-dd") {
    return df.format(date, fmt);
}

export function eachDayInWeek(date: Date) {
    const { start, end } = getWeekInterval(date, false);
    return df.eachDayOfInterval({ start, end });
}

export function eachDayInMonth(date: Date) {
    const { start, end } = getMonthInterval(date, false);
    return df.eachDayOfInterval({ start, end });
}

export function eachWeekInMonth(date: Date) {
    const monthInterval = getMonthInterval(date, false);
    const startOfWeekArray = df.eachWeekOfInterval(monthInterval, {
        weekStartsOn: 1,
    });
    return startOfWeekArray.map((startOfWeek) => eachDayInWeek(startOfWeek));
}

export function getHourInterval(date: Date, halfOpen = true): CalInterval {
    const start = df.startOfHour(date);
    const end = halfOpen ? df.startOfHour(incHour(date)) : df.endOfHour(date);
    return { start, end };
}

export function getDayInterval(date: Date, halfOpen = true): CalInterval {
    const start = df.startOfDay(date);
    const end = halfOpen ? df.startOfDay(incDay(date)) : df.endOfDay(date);
    return { start, end };
}

export function getWeekInterval(date: Date, halfOpen = true): CalInterval {
    const start = df.startOfISOWeek(date);
    const end = halfOpen
        ? df.startOfISOWeek(incWeek(date))
        : df.endOfISOWeek(date);
    return { start, end };
}

export function getMonthInterval(date: Date, halfOpen = true): CalInterval {
    const start = df.startOfMonth(date);
    const end = halfOpen
        ? df.startOfMonth(incMonth(date))
        : df.endOfMonth(date);
    return { start, end };
}

export function clampToDayInterval(
    interval: CalInterval,
    date: Date
): CalInterval {
    const dayInterval = getDayInterval(date);
    return {
        start: df.clamp(interval.start, dayInterval),
        end: df.clamp(interval.end, dayInterval),
    };
}

export function getHourSpec(date: Date): [number, number, number] {
    return [df.getYear(date), df.getDayOfYear(date), df.getHours(date)];
}

export function getDaySpec(date: Date): [number, number] {
    return [df.getYear(date), df.getDayOfYear(date)];
}

export function getWeekSpec(date: Date): [number, number] {
    return [df.getYear(date), df.getISOWeek(date)];
}

export function getMonthSpec(date: Date): [number, number] {
    return [df.getYear(date), df.getMonth(date)];
}

function compareNumArrays(
    [h1, ...t1]: number[],
    [h2, ...t2]: number[]
): number {
    if (h1 == null || h2 == null) {
        return 0;
    }
    if (h1 < h2) {
        return -1;
    }
    if (h1 > h2) {
        return 1;
    }
    return compareNumArrays(t1, t2);
}

export function momentHour(date: Date): Moment {
    const cur = now();
    const arr1 = getHourSpec(date);
    const arr2 = getHourSpec(cur);

    const diff = compareNumArrays(arr1, arr2);
    if (diff == 0) {
        return "present";
    }
    if (diff < 0) {
        return "past";
    }
    return "future";
}

export function momentDay(date: Date): Moment {
    const cur = now();
    const arr1 = getDaySpec(date);
    const arr2 = getDaySpec(cur);

    const diff = compareNumArrays(arr1, arr2);
    if (diff == 0) {
        return "present";
    }
    if (diff < 0) {
        return "past";
    }
    return "future";
}

export function momentWeek(date: Date): Moment {
    const cur = now();
    const arr1 = getWeekSpec(date);
    const arr2 = getWeekSpec(cur);

    const diff = compareNumArrays(arr1, arr2);
    if (diff == 0) {
        return "present";
    }
    if (diff < 0) {
        return "past";
    }
    return "future";
}

export function momentMonth(date: Date): Moment {
    const cur = now();
    const arr1 = getMonthSpec(date);
    const arr2 = getMonthSpec(cur);

    const diff = compareNumArrays(arr1, arr2);
    if (diff == 0) {
        return "present";
    }
    if (diff < 0) {
        return "past";
    }
    return "future";
}

const monthIds = range(1, 13);
const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
];

export const monthMap: ReadonlyMap<number, string> = new Map(
    zip(monthIds, monthNames)
);

const weekdayIds = range(0, 7);
const weekdayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const weekdayMap: ReadonlyMap<number, string> = new Map(
    zip(weekdayIds, weekdayNames)
);

export const zeroDate = new Date(0);
