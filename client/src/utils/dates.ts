import * as df from "date-fns";
import { CalInterval } from "../types";

export * from "date-fns";

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
    const start = df.startOfWeek(date, { weekStartsOn: 1 });
    const end = df.endOfWeek(date, { weekStartsOn: 1 });
    return df.eachDayOfInterval({ start, end });
}

export function eachWeekInMonth(date: Date) {
    const start = df.startOfMonth(date);
    const end = df.endOfMonth(date);
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

export function intvlBelongsToDayBlock(intvl: CalInterval, date: Date) {
    return df.areIntervalsOverlapping(intvl, getDayIntvl(date));
}

export const monthMap = [
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
] as const;

export const weekdayMap = [
    "Sun",
    "Mon",
    "Tue",
    "Wed",
    "Thu",
    "Fri",
    "Sat",
] as const;
