import React, { createContext, useContext } from "react";

import { CalEvent, View } from "../types";
import {
    useEventsForDay,
    useEventsForWeek,
    useEventsForMonth,
} from "../hooks/events";

interface EventsContextType {
    events: CalEvent[];
    isLoading: boolean;
    isError: boolean;
    error: unknown;
}

const EventsContext = createContext<EventsContextType | null>(null);

export function useEvents() {
    const context = useContext(EventsContext);
    if (!context) {
        throw new Error("useEvents was used outside of EventsProvider");
    }
    return context;
}

export function EventsProvider({
    children,
    view,
    viewDate,
}: {
    children: React.ReactNode;
    view: View;
    viewDate: Date;
}) {
    let useEvents = {
        day: useEventsForDay,
        week: useEventsForWeek,
        month: useEventsForMonth,
    }[view];

    const { data: events = [], isLoading, isError, error } = useEvents(viewDate);

    return (
        <EventsContext.Provider
            value={{
                events,
                isLoading,
                isError,
                error,
            }}
        >
            {children}
        </EventsContext.Provider>
    );
}
