import { QueryClient } from "@tanstack/react-query";

import { CalInterval } from "../types";
import { format, getYear, getMonth, getWeek } from "../utils/dates";

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5,
        },
    },
});

export const queryKeys = {
    events: {
        getByDay: (date: string) => ["events", "day", date],
        getByWeek: (year: number, week: number) => [
            "events",
            "week",
            year,
            week,
        ],
        getByMonth: (year: number, month: number) => [
            "events",
            "month",
            year,
            month,
        ],
        getClosestPrevious: (date: string) => ["events", "previous", date],
        getClosestNext: (date: string) => ["events", "next", date],
    },
};

export function invalidateOnEventChange(evtIntvl: CalInterval) {
    const invDay = (d: Date) => {
        const isoDate = format(d, "yyyy-MM-dd");
        const queryKey = queryKeys.events.getByDay(isoDate);
        queryClient.invalidateQueries(queryKey, { refetchType: "all" });
    };

    const invWeek = (d: Date) => {
        const year = getYear(d);
        const week = getWeek(d, {
            weekStartsOn: 1,
            firstWeekContainsDate: 7,
        });
        const queryKey = queryKeys.events.getByWeek(year, week);
        queryClient.invalidateQueries(queryKey, { refetchType: "all" });
    };

    const invMonth = (d: Date) => {
        const year = getYear(d);
        const month = getMonth(d);
        const queryKey = queryKeys.events.getByMonth(year, month);
        queryClient.invalidateQueries(queryKey, { refetchType: "all" });
    };

    invDay(evtIntvl.start);
    invWeek(evtIntvl.start);
    invMonth(evtIntvl.start);

    invDay(evtIntvl.end);
    invWeek(evtIntvl.end);
    invMonth(evtIntvl.end);
}
