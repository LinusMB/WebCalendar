import { useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { pick, uniqBy, prop } from "ramda";

import {
    format,
    formatRFC3339,
    parseJSON,
    getYear,
    getMonth,
    getWeek,
    isEqual,
    eachDayInWeek,
    eachDayInMonth,
    eachWeekOfInterval,
    areIntervalsOverlapping,
    getDayIntvl,
    getWeekIntvl,
    getMonthIntvl,
} from "../utils/dates";
import { api } from "../constants";
import { queryKeys } from "../react-query";
import { filterEvents } from "../models/event";
import { CalEvent, CalInterval } from "../types";

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
    week(viewDate: Date): [number, number] {
        const year = getYear(viewDate);
        const week = getWeek(viewDate, {
            weekStartsOn: 1,
            firstWeekContainsDate: 7,
        });
        return [year, week];
    },
    month(viewDate: Date): [number, number] {
        const year = getYear(viewDate);
        const month = getMonth(viewDate);
        return [year, month];
    },
};

export function useEvtsForDay(viewDate: Date) {
    const [isoDate] = viewDateToArgs.day(viewDate);
    const queryClient = useQueryClient();
    const queryFn = async () => {
        const res = await fetch(api.ROUTES.GET_BY_DAY(isoDate));
        const evts = await res.json();
        return evts?.map(adaptor.event) || [];
    };
    const queryKey = queryKeys.events.getByDay(isoDate);
    return useQuery(queryKey, queryFn, {
        placeholderData: () => {
            const dayIntvl = getDayIntvl(viewDate);
            {
                const [year, week] = viewDateToArgs.week(viewDate);
                const queryKey = queryKeys.events.getByWeek(year, week);
                const evtsForWeek =
                    queryClient.getQueryData<CalEvent[]>(queryKey);
                const evts = filterEvents(evtsForWeek || [], (e) =>
                    areIntervalsOverlapping(pick(["start", "end"], e), dayIntvl)
                );
                if (evts) {
                    return evts;
                }
            }
            {
                const [year, month] = viewDateToArgs.month(viewDate);
                const queryKey = queryKeys.events.getByMonth(year, month);
                const evtsForMonth =
                    queryClient.getQueryData<CalEvent[]>(queryKey);
                const evts = filterEvents(evtsForMonth || [], (e) =>
                    areIntervalsOverlapping(pick(["start", "end"], e), dayIntvl)
                );
                if (evts) {
                    return evts;
                }
            }
            return [];
        },
    });
}

export function useEvtsForWeek(viewDate: Date) {
    const [year, week] = viewDateToArgs.week(viewDate);
    const queryClient = useQueryClient();
    const queryFn = async () => {
        const res = await fetch(api.ROUTES.GET_BY_WEEK(year, week));
        const evts = await res.json();
        return evts?.map(adaptor.event) || [];
    };

    const queryKey = queryKeys.events.getByWeek(year, week);
    return useQuery(queryKey, queryFn, {
        placeholderData: () => {
            {
                const [year, month] = viewDateToArgs.month(viewDate);
                const queryKey = queryKeys.events.getByMonth(year, month);
                const evtsForMonth =
                    queryClient.getQueryData<CalEvent[]>(queryKey);
                const weekIntvl = getWeekIntvl(viewDate);
                const evts = filterEvents(evtsForMonth || [], (e) =>
                    areIntervalsOverlapping(
                        pick(["start", "end"], e),
                        weekIntvl
                    )
                );
                if (evts) {
                    return evts;
                }
            }
            {
                const eachDay = eachDayInWeek(viewDate);
                const evts = eachDay.flatMap((d) => {
                    const [isoDate] = viewDateToArgs.day(d);
                    const queryKey = queryKeys.events.getByDay(isoDate);
                    return queryClient.getQueryData<CalEvent[]>(queryKey) || [];
                });
                return uniqBy(prop("uuid"), evts);
            }
        },
    });
}

export function useEvtsForMonth(viewDate: Date) {
    const [year, month] = viewDateToArgs.month(viewDate);
    const queryClient = useQueryClient();
    const queryFn = async () => {
        const res = await fetch(api.ROUTES.GET_BY_MONTH(year, month));
        const evts = await res.json();
        return evts?.map(adaptor.event) || [];
    };
    const queryKey = queryKeys.events.getByMonth(year, month);
    return useQuery(queryKey, queryFn, {
        placeholderData: () => {
            {
                const eachWeek = eachWeekOfInterval(getMonthIntvl(viewDate), {
                    weekStartsOn: 1,
                });
                let evts = eachWeek.flatMap((w) => {
                    const [year, week] = viewDateToArgs.week(w);
                    const queryKey = queryKeys.events.getByWeek(year, week);
                    return queryClient.getQueryData<CalEvent[]>(queryKey) || [];
                });
                evts = uniqBy(prop("uuid"), evts);
                if (evts) {
                    return evts;
                }
            }
            {
                const eachDay = eachDayInMonth(viewDate);
                const evts = eachDay.flatMap((d) => {
                    const [isoDate] = viewDateToArgs.day(d);
                    const queryKey = queryKeys.events.getByDay(isoDate);
                    return queryClient.getQueryData<CalEvent[]>(queryKey) || [];
                });
                return uniqBy(prop("uuid"), evts);
            }
        },
    });
}

export function useGetClosestPreviousEvt(intvl: CalInterval) {
    const ref = useRef<CalInterval | null>(null);
    if (
        !ref.current ||
        (!isEqual(ref.current.start, intvl.start) &&
            !isEqual(ref.current.end, intvl.end))
    ) {
        ref.current = intvl;
    }
    const date = formatRFC3339(ref.current.start);
    const queryFn = async () => {
        const res = await fetch(api.ROUTES.GET_CLOSEST_PREVIOUS(date));
        const evt = await res.json();
        return evt?.map(adaptor.event) || [];
    };
    const queryKey = queryKeys.events.getClosestPrevious(date);
    return useQuery(queryKey, queryFn);
}

export function useGetClosestNextEvt(intvl: CalInterval) {
    const ref = useRef<CalInterval | null>(null);
    if (
        !ref.current ||
        (!isEqual(ref.current.start, intvl.start) &&
            !isEqual(ref.current.end, intvl.end))
    ) {
        ref.current = intvl;
    }
    const date = formatRFC3339(ref.current.end);
    const queryFn = async () => {
        const res = await fetch(api.ROUTES.GET_CLOSEST_NEXT(date));
        const evt = await res.json();
        return evt?.map(adaptor.event) || [];
    };
    const queryKey = queryKeys.events.getClosestNext(date);
    return useQuery(queryKey, queryFn);
}

export function useAddEvt() {
    const mutationFn = async ({
        title,
        description,
        evtIntvl,
    }: {
        title: string;
        description: string;
        evtIntvl: CalInterval;
    }) => {
        const res = await fetch(api.ROUTES.CREATE, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                title: title,
                description: description,
                date_from: formatRFC3339(evtIntvl.start),
                date_to: formatRFC3339(evtIntvl.end),
            }),
        });
        return res.json();
    };
    return useMutation(mutationFn);
}

export function useEditEvt() {
    const mutationFn = async ({
        uuid,
        title,
        description,
        evtIntvl,
    }: {
        uuid: string;
        title: string;
        description: string;
        evtIntvl: CalInterval;
    }) => {
        const res = await fetch(api.ROUTES.UPDATE(uuid), {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                title: title,
                description: description,
                date_from: formatRFC3339(evtIntvl.start),
                date_to: formatRFC3339(evtIntvl.end),
            }),
        });
        return res.json();
    };
    return useMutation(mutationFn);
}

export function useDeleteEvt() {
    const mutationFn = async ({ uuid }: { uuid: string }) => {
        const res = await fetch(api.ROUTES.DELETE(uuid), {
            method: "DELETE",
        });
        return res.json();
    };
    return useMutation(mutationFn);
}
