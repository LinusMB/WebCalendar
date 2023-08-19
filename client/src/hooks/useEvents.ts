import { useQuery } from "react-query";
import { parseJSON } from "../utils/dates";
import { filter, where } from "ramda";

import { startOfDay, endOfDay } from "../utils/dates";
import { CalEvent } from "../types";

type UseEvents = {
    evts: CalEvent[];
    isLoading: boolean;
    isError: boolean;
    error: Error | null;
};

type View = "Day" | "Week" | "Month";

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

async function fetchEventsByDate(
    paramStart: string,
    paramEnd: string
): Promise<CalEvent[]> {
    const res = await fetch(
        `http://localhost:5000/api/events?start=${paramStart}&end=${paramEnd}`
    );
    const evts = await res.json();
    return evts.map(adaptor.event);
}

async function fetchEvents(): Promise<CalEvent[]> {
    const res = await fetch(`http://localhost:5000/api/events`);
    const evts = await res.json();
    return evts.map(adaptor.event);
}

export function useEvtsForDay(
    viewDate: Date,
    evtFilter?: { [P in keyof CalEvent]: (arg: CalEvent[P]) => boolean },
    view: View = "Day"
): UseEvents {
    const start = startOfDay(viewDate).toISOString();
    const end = endOfDay(viewDate).toISOString();
    let {
        data: evts = [],
        isLoading,
        isError,
        error,
    } = useQuery<CalEvent[], Error>(["events", start, end], () =>
        fetchEventsByDate(start, end)
    );
    if (evtFilter) {
        evts = filter(where(evtFilter), evts);
    }
    return { evts, isLoading, isError, error };
}

export function useEvts(evtFilter?: {
    [P in keyof CalEvent]: (arg: CalEvent[P]) => boolean;
}): UseEvents {
    let {
        data: evts = [],
        isLoading,
        isError,
        error,
    } = useQuery<CalEvent[], Error>(["events"], fetchEvents);
    if (evtFilter) {
        evts = filter(where(evtFilter), evts);
    }
    return { evts, isLoading, isError, error };
}
