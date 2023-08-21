import React, { createContext, useContext } from "react";
import { useQuery, QueryFunctionContext } from "react-query";

import { api } from "../constants";
import { format, parseJSON, getYear, getWeek, getMonth } from "../utils/dates";
import { CalEvent } from "../types";

interface EventsContextType {
    evts: CalEvent[];
    isLoading: boolean;
    isError: boolean;
    error: Error | null;
}

const EventsContext = createContext<EventsContextType | null>(null);

export function useEvts() {
    const context = useContext(EventsContext);
    if (!context) {
        throw new Error("useEvts was used outside of EventsProvider");
    }
    return context;
}

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

export function EventsProvider({
    children,
    view,
    viewDate,
}: {
    children: React.ReactNode;
    view: View;
    viewDate: Date;
}) {
    let queryKey: unknown[],
        queryFn: (context: QueryFunctionContext) => Promise<CalEvent[]>;
    switch (view) {
        case "Day": {
            const isoDate = format(viewDate, "yyyy-MM-dd");
            queryFn = async () => {
                const res = await fetch(api.ROUTES.GET_BY_DAY(isoDate));
                const evts = await res.json();
                return evts?.map(adaptor.event);
            };
            queryKey = ["events", "Day", isoDate];
            break;
        }
        case "Week": {
            const year = getYear(viewDate);
            const week = getWeek(viewDate, {
                weekStartsOn: 1,
                firstWeekContainsDate: 7,
            });
            queryFn = async () => {
                const res = await fetch(api.ROUTES.GET_BY_WEEK(year, week));
                const evts = await res.json();
                return evts?.map(adaptor.event);
            };
            queryKey = ["events", "Week", year, week];
            break;
        }
        case "Month": {
            const year = getYear(viewDate);
            const month = getMonth(viewDate);
            queryFn = async () => {
                const res = await fetch(api.ROUTES.GET_BY_MONTH(year, month));
                const evts = await res.json();
                return evts?.map(adaptor.event);
            };
            queryKey = ["events", "Month", year, month];
            break;
        }
    }

    const {
        data: evts = [],
        isLoading,
        isError,
        error,
    } = useQuery<CalEvent[], Error>(queryKey!, queryFn!);

    return (
        <EventsContext.Provider
            value={{
                evts,
                isLoading,
                isError,
                error,
            }}
        >
            {children}
        </EventsContext.Provider>
    );
}
