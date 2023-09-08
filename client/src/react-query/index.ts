import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5,
        },
    },
});

export const queryKeys = {
    events: {
        getAll: () => ["events"],
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
        getPrevious: () => ["events", "previous"],
        getNext: () => ["events", "next"],
    },
};
