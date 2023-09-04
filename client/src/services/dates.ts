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

export function todayToFmt(fmt: string = "yyyy-MM-dd") {
    return df.format(today(), fmt);
}

export function dateToFmt(date: Date, fmt: string = "yyyy-MM-dd") {
    return df.format(date, fmt);
}

export function eachDayInWeek(date: Date) {
    const { start, end } = getWeekIntvl(date);
    return df.eachDayOfInterval({ start, end });
}

export function eachDayInMonth(date: Date) {
    const { start, end } = getMonthIntvl(date);
    return df.eachDayOfInterval({ start, end });
}

// TODO: rename to eachWeekArrayInMonth
export function eachWeekInMonth(date: Date) {
    const { start, end } = getMonthIntvl(date);
    let weeksInMonth = [];
    for (
        let d = df.startOfWeek(start, { weekStartsOn: 1 });
        df.isBefore(d, end) || df.isEqual(d, end);
        d = incWeek(d)
    ) {
        weeksInMonth.push(eachDayInWeek(d));
    }
    return weeksInMonth;
}

export function dateToHourIntvl(date: Date): CalInterval {
    const start = df.startOfHour(date);
    const end = incHour(start);
    return { start, end };
}

export function wholeDayIntvl(date: Date): CalInterval {
    const d = df.startOfDay(date);
    return { start: d, end: d };
}

export function todayWholeDayIntvl(): CalInterval {
    const d = today();
    return { start: d, end: d };
}

export function isWholeDayIntvl({ start, end }: CalInterval) {
    const s = df.startOfDay(start);
    return df.isEqual(start, end) && df.isEqual(start, s);
}

export function getDayIntvl(date: Date): CalInterval {
    const start = df.startOfDay(date);
    const end = df.startOfDay(incDay(date));
    return { start, end };
}

export function getWeekIntvl(date: Date): CalInterval {
    const start = df.startOfWeek(date, { weekStartsOn: 1 });
    const end = df.endOfWeek(date, { weekStartsOn: 1 });
    return { start, end };
}

export function getMonthIntvl(date: Date): CalInterval {
    const start = df.startOfMonth(date);
    const end = df.endOfMonth(date);
    return { start, end };
}

export function clampToDayIntvl(intvl: CalInterval, date: Date): CalInterval {
    const dayIntvl = getDayIntvl(date);
    return {
        start: intvl.start < dayIntvl.start ? dayIntvl.start : intvl.start,
        end: intvl.end > dayIntvl.end ? dayIntvl.end : intvl.end,
    };
}

export function intvlBelongsToDayIntvl(intvl: CalInterval, date: Date) {
    return df.areIntervalsOverlapping(intvl, getDayIntvl(date));
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
    const arr1 = [df.getYear(date), df.getDayOfYear(date), df.getHours(date)];
    const arr2 = [df.getYear(cur), df.getDayOfYear(cur), df.getHours(cur)];

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
    const arr1 = [df.getYear(date), df.getDayOfYear(date)];
    const arr2 = [df.getYear(cur), df.getDayOfYear(cur)];

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
    const arr1 = [
        df.getYear(date),
        df.getWeek(date, {
            weekStartsOn: 1,
            firstWeekContainsDate: 7,
        }),
    ];
    const arr2 = [
        df.getYear(cur),
        df.getWeek(cur, {
            weekStartsOn: 1,
            firstWeekContainsDate: 7,
        }),
    ];

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
    const arr1 = [df.getYear(date), df.getMonth(date)];
    const arr2 = [df.getYear(cur), df.getMonth(cur)];

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
