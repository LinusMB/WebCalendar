import { useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";

import {
    format,
    formatRFC3339,
    parseJSON,
    getYear,
    getMonth,
    getWeek,
    isEqual,
} from "../utils/dates";
import { api } from "../constants";
import { queryKeys } from "../react-query";
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

export function useEvtsForDay<TData, TError>(viewDate: Date) {
    const isoDate = format(viewDate, "yyyy-MM-dd");
    const queryFn = async () => {
        const res = await fetch(api.ROUTES.GET_BY_DAY(isoDate));
        const evts = await res.json();
        return evts?.map(adaptor.event);
    };
    const queryKey = queryKeys.events.getByDay(isoDate);
    return useQuery<TData, TError>(queryKey, queryFn);
}

export function useEvtsForWeek<TData, TError>(viewDate: Date) {
    const year = getYear(viewDate);
    const week = getWeek(viewDate, {
        weekStartsOn: 1,
        firstWeekContainsDate: 7,
    });
    const queryFn = async () => {
        const res = await fetch(api.ROUTES.GET_BY_WEEK(year, week));
        const evts = await res.json();
        return evts?.map(adaptor.event);
    };

    const queryKey = queryKeys.events.getByWeek(year, week);
    return useQuery<TData, TError>(queryKey, queryFn);
}

export function useEvtsForMonth<TData, TError>(viewDate: Date) {
    const year = getYear(viewDate);
    const month = getMonth(viewDate);
    const queryFn = async () => {
        const res = await fetch(api.ROUTES.GET_BY_MONTH(year, month));
        const evts = await res.json();
        return evts?.map(adaptor.event);
    };
    const queryKey = queryKeys.events.getByMonth(year, month);
    return useQuery<TData, TError>(queryKey, queryFn);
}

export function useGetClosestPreviousEvt<TData, TError>(intvl: CalInterval) {
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
        return evt?.map(adaptor.event);
    };
    const queryKey = queryKeys.events.getClosestPrevious(date);
    return useQuery<TData, TError>(queryKey, queryFn);
}

export function useGetClosestNextEvt<TData, TError>(intvl: CalInterval) {
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
        return evt?.map(adaptor.event);
    };
    const queryKey = queryKeys.events.getClosestNext(date);
    return useQuery<TData, TError>(queryKey, queryFn);
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
