import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { pick, uniqBy, prop } from "ramda";

import {
    format,
    formatRFC3339,
    parseJSON,
    eachDayInWeek,
    eachDayInMonth,
    eachWeekOfInterval,
    areIntervalsOverlapping,
    getDayInterval,
    getWeekInterval,
    getMonthInterval,
    getWeekSpec,
    getMonthSpec,
} from "../services/dates";
import {
    findClosestPreviousEvent,
    findClosestNextEvent,
} from "../services/events";
import { api } from "../constants";
import { queryClient, queryKeys } from "../react-query";
import { filterEvents } from "../services/events";
import { CalEvent, CalInterval, isArrayOfCalEvents } from "../types";

const adaptor = {
    event(remote: {
        id: number;
        uuid: string;
        title: string;
        description: string;
        date_from: string;
        date_to: string;
        created_at: string;
    }): CalEvent {
        return {
            uuid: remote.uuid,
            title: remote.title,
            description: remote.description,
            start: parseJSON(remote.date_from),
            end: parseJSON(remote.date_to),
        };
    },
};

const viewDateToArgs = {
    day(viewDate: Date): [string] {
        return [format(viewDate, "yyyy-MM-dd")];
    },
    week: getWeekSpec,
    month: getMonthSpec,
};

export function useEventsForDay(viewDate: Date) {
    const [isoDate] = viewDateToArgs.day(viewDate);
    const queryClient = useQueryClient();
    const queryFn = async () => {
        const res = await fetch(api.ROUTES.GET_BY_DAY(isoDate));
        const events = await res.json();
        return events?.map(adaptor.event) || [];
    };
    const queryKey = queryKeys.events.getByDay(isoDate);
    return useQuery(queryKey, queryFn, {
        placeholderData: () => {
            const dayInterval = getDayInterval(viewDate);
            {
                const [year, week] = viewDateToArgs.week(viewDate);
                const queryKey = queryKeys.events.getByWeek(year, week);
                const eventsForWeek =
                    queryClient.getQueryData<CalEvent[]>(queryKey);
                const events = filterEvents(eventsForWeek || [], (e) =>
                    areIntervalsOverlapping(
                        pick(["start", "end"], e),
                        dayInterval
                    )
                );
                if (events) {
                    return events;
                }
            }
            {
                const [year, month] = viewDateToArgs.month(viewDate);
                const queryKey = queryKeys.events.getByMonth(year, month);
                const eventsForMonth =
                    queryClient.getQueryData<CalEvent[]>(queryKey);
                const events = filterEvents(eventsForMonth || [], (e) =>
                    areIntervalsOverlapping(
                        pick(["start", "end"], e),
                        dayInterval
                    )
                );
                if (events) {
                    return events;
                }
            }
            return [];
        },
    });
}

export function useEventsForWeek(viewDate: Date) {
    const [year, week] = viewDateToArgs.week(viewDate);
    const queryClient = useQueryClient();
    const queryFn = async () => {
        const res = await fetch(api.ROUTES.GET_BY_WEEK(year, week));
        const events = await res.json();
        return events?.map(adaptor.event) || [];
    };

    const queryKey = queryKeys.events.getByWeek(year, week);
    return useQuery(queryKey, queryFn, {
        placeholderData: () => {
            {
                const [year, month] = viewDateToArgs.month(viewDate);
                const queryKey = queryKeys.events.getByMonth(year, month);
                const eventsForMonth =
                    queryClient.getQueryData<CalEvent[]>(queryKey);
                const weekInterval = getWeekInterval(viewDate);
                const events = filterEvents(eventsForMonth || [], (e) =>
                    areIntervalsOverlapping(
                        pick(["start", "end"], e),
                        weekInterval
                    )
                );
                if (events) {
                    return events;
                }
            }
            {
                const eachDay = eachDayInWeek(viewDate);
                const events = eachDay.flatMap((d) => {
                    const [isoDate] = viewDateToArgs.day(d);
                    const queryKey = queryKeys.events.getByDay(isoDate);
                    return queryClient.getQueryData<CalEvent[]>(queryKey) || [];
                });
                return uniqBy(prop("uuid"), events);
            }
        },
    });
}

export function useEventsForMonth(viewDate: Date) {
    const [year, month] = viewDateToArgs.month(viewDate);
    const queryClient = useQueryClient();
    const queryFn = async () => {
        const res = await fetch(api.ROUTES.GET_BY_MONTH(year, month));
        const events = await res.json();
        return events?.map(adaptor.event) || [];
    };
    const queryKey = queryKeys.events.getByMonth(year, month);
    return useQuery(queryKey, queryFn, {
        placeholderData: () => {
            {
                const eachWeek = eachWeekOfInterval(
                    getMonthInterval(viewDate),
                    {
                        weekStartsOn: 1,
                    }
                );
                let events = eachWeek.flatMap((w) => {
                    const [year, week] = viewDateToArgs.week(w);
                    const queryKey = queryKeys.events.getByWeek(year, week);
                    return queryClient.getQueryData<CalEvent[]>(queryKey) || [];
                });
                events = uniqBy(prop("uuid"), events);
                if (events) {
                    return events;
                }
            }
            {
                const eachDay = eachDayInMonth(viewDate);
                const events = eachDay.flatMap((d) => {
                    const [isoDate] = viewDateToArgs.day(d);
                    const queryKey = queryKeys.events.getByDay(isoDate);
                    return queryClient.getQueryData<CalEvent[]>(queryKey) || [];
                });
                return uniqBy(prop("uuid"), events);
            }
        },
    });
}

export async function getPreviousEvents(interval: CalInterval) {
    const start = formatRFC3339(interval.start);

    const data = queryClient.getQueriesData({
        queryKey: queryKeys.events.getAll(),
        exact: false,
        stale: false,
    });
    const allEvents = data.flatMap(([_, events]) =>
        isArrayOfCalEvents(events) ? events : []
    );
    const prevEvent = findClosestPreviousEvent(allEvents, interval);
    if (prevEvent != null) {
        return [prevEvent];
    }

    const res = await fetch(
        api.ROUTES.GET_BY_FILTER({
            end: start,
            sort: "date_to",
            ord: "desc",
            limit: 1,
        })
    );
    const events = await res.json();
    return events?.map(adaptor.event) || [];
}

export async function getNextEvents(interval: CalInterval) {
    const end = formatRFC3339(interval.end);

    const data = queryClient.getQueriesData({
        queryKey: queryKeys.events.getAll(),
        exact: false,
        stale: false,
    });
    const allEvents = data.flatMap(([_, events]) =>
        isArrayOfCalEvents(events) ? events : []
    );
    const nextEvent = findClosestNextEvent(allEvents, interval);
    if (nextEvent != null) {
        return [nextEvent];
    }

    const res = await fetch(
        api.ROUTES.GET_BY_FILTER({
            start: end,
            sort: "date_from",
            ord: "asc",
            limit: 1,
        })
    );
    const events = await res.json();
    return events?.map(adaptor.event) || [];
}

export function useGetPreviousEvents(interval: CalInterval) {
    return useQuery(queryKeys.events.getPrevious(), () =>
        getPreviousEvents(interval)
    );
}

export function useGetNextEvents(interval: CalInterval) {
    return useQuery(queryKeys.events.getNext(), () => getNextEvents(interval));
}

// TODO: invalidate in `onSettled`
export function useAddEvent() {
    const mutationFn = async ({
        title,
        description,
        eventInterval,
    }: {
        title: string;
        description: string;
        eventInterval: CalInterval;
    }) => {
        const res = await fetch(api.ROUTES.CREATE, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                title: title,
                description: description,
                date_from: formatRFC3339(eventInterval.start),
                date_to: formatRFC3339(eventInterval.end),
            }),
        });
        return res.json();
    };
    return useMutation(mutationFn);
}

export function useEditEvent() {
    const mutationFn = async ({
        uuid,
        title,
        description,
        eventInterval,
    }: {
        uuid: string;
        title: string;
        description: string;
        eventInterval: CalInterval;
    }) => {
        const res = await fetch(api.ROUTES.UPDATE(uuid), {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                title: title,
                description: description,
                date_from: formatRFC3339(eventInterval.start),
                date_to: formatRFC3339(eventInterval.end),
            }),
        });
        return res.json();
    };
    return useMutation(mutationFn);
}

export function useDeleteEvent() {
    const mutationFn = async ({ uuid }: { uuid: string }) => {
        const res = await fetch(api.ROUTES.DELETE(uuid), {
            method: "DELETE",
        });
        return res.json();
    };
    return useMutation(mutationFn);
}
